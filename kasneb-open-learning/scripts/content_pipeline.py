#!/usr/bin/env python3
"""DatalytIQs canonical-content compiler. Drafts never imply syllabus approval.

Run: python scripts/content_pipeline.py build content/topic.json --output build
No learner data, credentials, remote writes, AI calls or unattended publication.
"""
from __future__ import annotations
import argparse
import hashlib
import html
import json
import os
from pathlib import Path
import re
import sqlite3
import tempfile
from datetime import datetime, timezone

PIPELINE_VERSION = '1.0.1'
REQUIRED_SECTIONS = ('overview', 'foundations', 'worked_examples', 'professional_application',
                     'guided_practice', 'assessment', 'solutions', 'revision', 'references')

def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def canonical_hash(topic: dict) -> str:
    # Review attestations bind the actual educational payload, not themselves.
    payload = {k: v for k, v in topic.items() if k not in ('academic_review', 'technical_review')}
    return digest(json.dumps(payload, sort_keys=True, ensure_ascii=False).encode())

def validate_structure(topic: dict) -> list[str]:
    errors = []
    for key in ('id', 'title', 'paper_code', 'qualification', 'version', 'author', 'outcomes'):
        if not topic.get(key): errors.append(f'Missing {key}')
    if not re.fullmatch(r'[A-Za-z0-9_.-]+', topic.get('id', '')):
        errors.append('Unsafe or absent topic id')
    sections = topic.get('sections', [])
    types = [s.get('kind') for s in sections]
    for kind in REQUIRED_SECTIONS:
        if kind not in types: errors.append(f'Missing section {kind}')
    for section in sections:
        if not section.get('title') or not section.get('blocks'):
            errors.append(f'Empty section {section.get("kind")}')
        for block in section.get('blocks', []):
            if block.get('type') not in ('paragraph', 'code', 'list', 'table'):
                errors.append('Unsupported block type')
            if not block.get('text') and not block.get('items') and not block.get('rows'):
                errors.append('Empty content block')
    if not topic.get('questions'): errors.append('Missing assessment questions')
    seen = set()
    for question in topic.get('questions', []):
        if question.get('id') in seen: errors.append('Duplicate question id')
        seen.add(question.get('id'))
        if not question.get('id') or not question.get('prompt') or not question.get('explanation'):
            errors.append('Incomplete question')
        if question.get('type') == 'single_choice':
            choices = question.get('choices', {})
            if len(choices) < 2 or question.get('answer') not in choices:
                errors.append('Invalid single-choice answer')
        elif question.get('type') == 'numeric':
            try:
                import math
                if not math.isfinite(float(question['answer'])) or float(question.get('tolerance', 0)) < 0:
                    errors.append('Invalid numeric answer')
            except (ValueError, TypeError, KeyError): errors.append('Invalid numeric answer')
        elif question.get('type') == 'rubric':
            if not question.get('rubric'): errors.append('Missing subjective rubric')
        else: errors.append('Unsupported question type')
    return errors

def grade_objective(question: dict, response) -> dict:
    kind = question['type']
    if kind == 'rubric':
        return {'status': 'human_review_required', 'score': None}
    if kind == 'single_choice': correct = response == question['answer']
    elif kind == 'numeric':
        import math
        try:
            value = float(response)
            correct = math.isfinite(value) and abs(value - float(question['answer'])) <= float(question.get('tolerance', 0))
        except (TypeError, ValueError): correct = False
    else: raise ValueError('Unsupported assessment')
    return {'status': 'scored', 'score': question.get('marks', 1) if correct else 0,
            'maximum': question.get('marks', 1), 'explanation': question['explanation']}

def review_errors(topic: dict) -> list[str]:
    errors = []
    source = topic.get('syllabus', {})
    if source.get('status') != 'verified' or not source.get('url') or not source.get('version') or not source.get('reference'):
        errors.append('Full syllabus alignment is not verified')
    review = topic.get('academic_review', {})
    if review.get('status') != 'approved' or not review.get('reviewer') or not review.get('reviewed_at'):
        errors.append('Independent academic approval missing')
    elif review['reviewer'] == topic.get('author'):
        errors.append('Author cannot independently approve their own content')
    if review.get('content_sha256') != canonical_hash(topic):
        errors.append('Academic approval does not bind current content')
    if not topic.get('originality', {}).get('reviewed'):
        errors.append('Originality review missing')
    return errors

def render_html(topic: dict) -> str:
    esc = html.escape
    parts = [f'<article lang="en"><h1>{esc(topic["title"])}</h1>',
             f'<p>{esc(topic["paper_code"])} | Version {esc(topic["version"])} | {esc(topic["status"])}</p>',
             '<h2>Learning outcomes</h2><ul>']
    parts.extend(f'<li>{esc(x)}</li>' for x in topic['outcomes'])
    parts.append('</ul>')
    for section in topic['sections']:
        parts.append(f'<section><h2>{esc(section["title"])}</h2>')
        for block in section['blocks']:
            kind = block['type']
            if kind == 'paragraph': parts.append(f'<p>{esc(block["text"])}</p>')
            elif kind == 'code': parts.append(f'<pre><code>{esc(block["text"])}</code></pre>')
            elif kind == 'list':
                parts.append('<ul>' + ''.join(f'<li>{esc(x)}</li>' for x in block['items']) + '</ul>')
            elif kind == 'table':
                parts.append('<table><caption>'+esc(block.get('caption',section['title']))+'</caption>')
                for i,row in enumerate(block['rows']):
                    tag='th' if i==0 else 'td'
                    parts.append('<tr>'+''.join(f'<{tag}>{esc(str(x))}</{tag}>' for x in row)+'</tr>')
                parts.append('</table>')
        parts.append('</section>')
    parts.append('<p>© 2026 DatalytIQs Academy. Original educational content. Independent examination preparation.</p></article>')
    return '\n'.join(parts)

def render_pdf(topic: dict, path: Path) -> None:
    from reportlab.lib import colors
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_LEFT
    from reportlab.lib.pagesizes import A4
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Preformatted, Table, TableStyle
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    font_root = Path('/usr/share/fonts/truetype/dejavu')
    if not (font_root/'DejaVuSans.ttf').exists(): raise RuntimeError('DejaVu fonts required for legible PDF text')
    for name,filename in [('DTQ','DejaVuSans.ttf'),('DTQBold','DejaVuSans-Bold.ttf'),('DTQMono','DejaVuSansMono.ttf')]:
        if name not in pdfmetrics.getRegisteredFontNames(): pdfmetrics.registerFont(TTFont(name,str(font_root/filename)))
    styles=getSampleStyleSheet()
    styles.add(ParagraphStyle(name='DTQBody',fontName='DTQ',fontSize=10,leading=15,spaceAfter=9))
    styles.add(ParagraphStyle(name='DTQTitle',fontName='DTQBold',fontSize=25,leading=32,textColor=colors.HexColor('#0B2C4D'),spaceAfter=20))
    styles.add(ParagraphStyle(name='DTQH2',fontName='DTQBold',fontSize=14,leading=19,spaceBefore=16,spaceAfter=9,textColor=colors.HexColor('#1565C0'),keepWithNext=True))
    styles.add(ParagraphStyle(name='DTQCode',fontName='DTQMono',fontSize=8,leading=11,spaceAfter=12,backColor=colors.HexColor('#F6F8FB')))
    body=lambda text: Paragraph(html.escape(text).replace('\n','<br/>'),styles['DTQBody'])
    doc=SimpleDocTemplate(str(path),pagesize=A4,rightMargin=48,leftMargin=48,topMargin=54,bottomMargin=54,
        title=topic['title'],author='DatalytIQs Academy',subject=f'{topic["paper_code"]} independent study notes',lang='en-KE')
    story=[Spacer(1,48),body('DATALYTIQS ACADEMY | OPEN LEARNING'),Paragraph(html.escape(topic['title']),styles['DTQTitle']),
           body(f'{topic["qualification"]} | {topic["paper_code"]}'),body(f'Topic identifier: {topic["id"]}'),
           body(f'Version {topic["version"]} | {topic["publication_date"]}'),body('DRAFT - ACADEMIC AND SYLLABUS REVIEW PENDING'),
           body('Original independent learning resource. This document does not establish complete KASNEB syllabus coverage or award a KASNEB qualification.'),
           body('Free learning resource. Official registration and examination charges are separate.'),PageBreak(),
           Paragraph('Learning outcomes',styles['DTQH2'])]
    story.extend(body(f'{i}. {x}') for i,x in enumerate(topic['outcomes'],1))
    story.append(Paragraph('Contents',styles['DTQH2']))
    story.extend(body(f'{i}. {s["title"]}') for i,s in enumerate(topic['sections'],1))
    for section in topic['sections']:
        story.append(Paragraph(html.escape(section['title']),styles['DTQH2']))
        for block in section['blocks']:
            kind=block['type']
            if kind=='paragraph': story.append(body(block['text']))
            elif kind=='code':
                # Fail rather than silently clipping long code lines.
                if any(len(line)>84 for line in block['text'].splitlines()): raise ValueError('Code line too long for PDF')
                story.append(Preformatted(block['text'],styles['DTQCode']))
            elif kind=='list': story.extend(body(f'• {x}') for x in block['items'])
            elif kind=='table':
                rows=[[body(str(x)) for x in row] for row in block['rows']]
                table=Table(rows,colWidths=[(A4[0]-96)/len(rows[0])]*len(rows[0]),repeatRows=1,hAlign='LEFT')
                table.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#F6F8FB')),
                  ('VALIGN',(0,0),(-1,-1),'TOP'),('GRID',(0,0),(-1,-1),0.4,colors.HexColor('#BAC8D8')),
                  ('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7)]))
                story.extend([table,Spacer(1,10)])
    def footer(canvas,document):
        canvas.saveState();canvas.setFont('DTQ',8);canvas.setFillColor(colors.HexColor('#0B2C4D'))
        canvas.drawString(48,28,'DatalytIQs Academy | Draft study notes | Original content')
        canvas.drawRightString(A4[0]-48,28,str(document.page));canvas.restoreState()
    doc.build(story,onFirstPage=footer,onLaterPages=footer)

def pdf_check(topic: dict,path: Path) -> dict:
    from pypdf import PdfReader
    reader=PdfReader(str(path))
    texts=[page.extract_text() or '' for page in reader.pages]
    text=' '.join(texts)
    missing=[s['title'] for s in topic['sections'] if s['title'] not in text]
    if missing or not text.strip(): raise ValueError(f'PDF text integrity failed: {missing}')
    return {'pages':len(reader.pages),'searchable_text':True,'section_titles_present':True,
            'tagged_accessibility_verified':False,'visual_review_required':True}

def build(topic_path: Path,output: Path) -> dict:
    topic=json.loads(topic_path.read_text())
    errors=validate_structure(topic)
    if errors: raise ValueError('; '.join(errors))
    output.mkdir(parents=True,exist_ok=True)
    db=sqlite3.connect(output/'jobs.sqlite3',timeout=30)
    db.execute('CREATE TABLE IF NOT EXISTS jobs (job_key TEXT PRIMARY KEY, status TEXT, result TEXT, error TEXT, updated_at TEXT)')
    key=digest((canonical_hash(topic)+PIPELINE_VERSION+json.dumps(topic.get('academic_review',{}),sort_keys=True)).encode())
    db.execute('BEGIN IMMEDIATE')
    row=db.execute('SELECT status,result FROM jobs WHERE job_key=?',(key,)).fetchone()
    if row and row[0]=='complete':
        result=json.loads(row[1]);valid=True
        for asset in result['assets'].values():
            path=output/asset['filename']
            valid=valid and path.is_file() and digest(path.read_bytes())==asset['sha256']
        if valid: db.commit();db.close();return dict(result,reused=True)
    db.execute('INSERT OR REPLACE INTO jobs VALUES (?,?,?,?,?)',(key,'running',None,None,datetime.now(timezone.utc).isoformat()))
    db.commit()
    try:
        with tempfile.TemporaryDirectory(dir=output) as tmp:
            tmp=Path(tmp);name=topic['id']+'.v'+topic['version']
            html_path=tmp/(name+'.html');pdf_path=tmp/(name+'.pdf')
            html_path.write_text(render_html(topic),encoding='utf-8');render_pdf(topic,pdf_path)
            check=pdf_check(topic,pdf_path);gates=review_errors(topic)
            gates.extend(['PDF visual review not independently recorded','Tagged PDF accessibility not verified',
                          'LMS import and learner acceptance not verified'])
            assets={}
            for kind,path in [('html',html_path),('pdf',pdf_path)]:
                assets[kind]={'filename':path.name,'sha256':digest(path.read_bytes())}
                os.replace(path,output/path.name)
            result={'id':topic['id'],'version':topic['version'],'content_sha256':canonical_hash(topic),
                    'state':'draft_compiled','publication_ready':False,'blocked_gates':gates,'assets':assets,'pdf_checks':check}
            db.execute('UPDATE jobs SET status=?,result=?,error=NULL WHERE job_key=?',('complete',json.dumps(result),key));db.commit()
            (output/(name+'.manifest.json')).write_text(json.dumps(result,indent=2)+'\n')
            return dict(result,reused=False)
    except Exception as exc:
        db.execute('UPDATE jobs SET status=?,error=? WHERE job_key=?',('failed',str(exc),key));db.commit();raise
    finally: db.close()

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command',choices=['build','check'])
    parser.add_argument('topic',type=Path);parser.add_argument('--output',type=Path,default=Path('build'))
    args=parser.parse_args()
    if args.command=='build': print(json.dumps(build(args.topic,args.output),indent=2))
    else:
        topic=json.loads(args.topic.read_text());print(json.dumps({'structure_errors':validate_structure(topic),'publication_errors':review_errors(topic)},indent=2))
