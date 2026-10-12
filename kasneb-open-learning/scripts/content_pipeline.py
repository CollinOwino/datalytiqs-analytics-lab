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

PIPELINE_VERSION = '1.1.5'
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
    if not re.fullmatch(r'\d+\.\d+\.\d+', str(topic.get('version',''))):
        errors.append('Version must be a semantic version without path characters')
    if topic.get('status') != 'draft':
        errors.append('This compiler accepts draft content only')
    sections = topic.get('sections', [])
    types = [s.get('kind') for s in sections]
    if len(types) != len(set(types)):
        errors.append('Duplicate section kind')
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
            if block.get('type') == 'table':
                rows=block.get('rows',[])
                if len(rows)<2 or not rows[0] or any(len(row)!=len(rows[0]) for row in rows):
                    errors.append('Invalid table shape')
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

def linkify(text: str) -> str:
    """Escape authored text and link its explicit HTTPS references."""
    parts = []; position = 0
    for match in re.finditer(r'https://[^\s<>]+', text):
        url = match.group().rstrip('.,)')
        end = match.start() + len(url)
        parts.append(html.escape(text[position:match.start()]))
        parts.append(f'<a href="{html.escape(url, quote=True)}">{html.escape(url)}</a>')
        position = end
    parts.append(html.escape(text[position:]))
    return ''.join(parts)

def render_html(topic: dict) -> str:
    esc = html.escape
    parts = ['<!doctype html><html lang="en-KE"><head><meta charset="utf-8">',
             f'<title>{esc(topic["title"])}</title>',
             '<meta name="author" content="DatalytIQs Academy">',
             f'<meta name="description" content="{esc(topic["paper_code"])} original study notes">',
             '</head><body><article>',
             '<section class="cover"><p class="brand">DATALYTIQS ACADEMY | OPEN LEARNING</p>',
             f'<h1>{esc(topic["title"])}</h1>',
             f'<p>{esc(topic["qualification"])} | {esc(topic["paper_code"])}</p>',
             f'<p>Topic: {esc(topic["id"])} | Version {esc(topic["version"])}</p>',
             f'<p>Publication date: {esc(topic["publication_date"])}</p>',
             '<p class="status">DRAFT - ACADEMIC AND SYLLABUS REVIEW PENDING</p>',
             '<p>Original independent learning resource. This draft does not establish complete '
             'KASNEB syllabus coverage or award a qualification.</p>',
             '<p>Free learning resource. Official registration and examination charges are separate.</p></section>',
             '<section><h2>Learning outcomes</h2><ul>']
    parts.extend(f'<li>{esc(x)}</li>' for x in topic['outcomes'])
    parts.append('</ul></section><nav class="toc" aria-label="Contents"><h2>Contents</h2><ol>')
    parts.extend(f'<li><a href="#section-{esc(s["kind"])}">{esc(s["title"])}</a></li>' for s in topic['sections'])
    parts.append('</ol></nav>')
    for section in topic['sections']:
        parts.append(f'<section id="section-{esc(section["kind"])}"><h2>{esc(section["title"])}</h2>')
        for block in section['blocks']:
            kind = block['type']
            if kind == 'paragraph': parts.append(f'<p>{linkify(block["text"])}</p>')
            elif kind == 'code': parts.append(f'<pre><code>{esc(block["text"])}</code></pre>')
            elif kind == 'list':
                parts.append('<ul>' + ''.join(f'<li>{linkify(x)}</li>' for x in block['items']) + '</ul>')
            elif kind == 'table':
                parts.append('<div class="table-group"><table><caption>'+esc(block.get('caption',section['title']))+'</caption>')
                for i,row in enumerate(block['rows']):
                    if i == 0:
                        parts.append('<thead><tr>'+''.join(f'<th scope="col">{esc(str(x))}</th>' for x in row)+'</tr></thead><tbody>')
                    else:
                        parts.append('<tr>'+''.join(f'<td>{esc(str(x))}</td>' for x in row)+'</tr>')
                parts.append('</tbody></table></div>')
        parts.append('</section>')
    parts.append('<p class="copyright">© 2026 DatalytIQs Academy. Original educational content. '
                 'Independent examination preparation.</p></article></body></html>')
    return '\n'.join(parts)

PDF_CSS = """
@page {
  size: A4;
  margin: 18mm 17mm 19mm;
  @bottom-left { content: "DatalytIQs Academy | Draft study notes"; font-size: 8pt; color: #0B2C4D; }
  @bottom-right { content: counter(page); font-size: 8pt; color: #0B2C4D; }
}
body { font-family: "DejaVu Sans", sans-serif; color: #1F2937; font-size: 10pt; line-height: 1.35; }
.cover { break-after: page; border-top: 5mm solid #0B2C4D; padding-top: 16mm; }
.brand { color: #1565C0; font-weight: bold; font-size: 10pt; letter-spacing: .6pt; }
h1 { color: #0B2C4D; font-size: 25pt; line-height: 1.22; margin: 10mm 0; }
h2 { color: #1565C0; font-size: 14pt; line-height: 1.4; margin: 7mm 0 3mm; break-after: avoid; }
p { margin: 0 0 2.2mm; orphans: 3; widows: 3; }
.status { background: #F6F8FB; border-left: 3mm solid #F4A261; padding: 4mm; font-weight: bold; }
a { color: #1565C0; overflow-wrap: anywhere; }
.toc a { text-decoration: none; }
.toc a::after { content: leader(".") target-counter(attr(href), page); }
pre { font-family: "DejaVu Sans Mono", monospace; font-size: 8.4pt; line-height: 1.4;
      background: #F6F8FB; padding: 3mm; white-space: pre-wrap; overflow-wrap: anywhere;
      break-inside: avoid; }
table { width: 100%; border-collapse: collapse; font-size: 9pt; margin: 4mm 0; break-inside: avoid; }
.table-group { break-inside: avoid; }
#section-references { break-inside: avoid; }
caption { text-align: left; font-weight: bold; color: #0B2C4D; margin-bottom: 2mm; }
th, td { border: .2mm solid #BAC8D8; padding: 2mm; vertical-align: top; }
thead { display: table-header-group; background: #F6F8FB; }
tr { break-inside: avoid; }
li { margin-bottom: 2mm; }
.copyright { margin-top: 6mm; font-size: 8pt; }
"""

def render_pdf(topic: dict, path: Path) -> None:
    from weasyprint import HTML, CSS
    def deny_resources(url, *args, **kwargs):
        # Canonical topics contain text and links only. Never fetch linked pages,
        # external assets, local files or arbitrary URLs during compilation.
        raise ValueError('External render resources are disabled')
    HTML(string=render_html(topic), url_fetcher=deny_resources).write_pdf(
        path, stylesheets=[CSS(string=PDF_CSS)], pdf_variant='pdf/ua-1',
        pdf_tags=True, presentational_hints=False)

def pdf_check(topic: dict,path: Path) -> dict:
    from pypdf import PdfReader
    reader=PdfReader(str(path))
    texts=[page.extract_text() or '' for page in reader.pages]
    text=' '.join(texts)
    missing=[s['title'] for s in topic['sections'] if s['title'] not in text]
    if missing or not text.strip(): raise ValueError(f'PDF text integrity failed: {missing}')
    root=reader.trailer['/Root']
    tagged=bool(root.get('/StructTreeRoot')) and bool(root.get('/MarkInfo',{}).get('/Marked'))
    links=sum(1 for page in reader.pages for ref in page.get('/Annots',[])
              if ref.get_object().get('/Subtype')=='/Link')
    if not tagged or not root.get('/Lang') or not reader.metadata.title:
        raise ValueError('PDF structural accessibility check failed')
    return {'pages':len(reader.pages),'searchable_text':True,'section_titles_present':True,
            'tagged_structure_present':tagged,'document_language':str(root['/Lang']),
            'link_annotations':links,'bookmarks_present':bool(reader.outline),
            'pdf_ua_conformance_verified':False,'visual_review_required':True}

def _build_locked(topic_path: Path,output: Path) -> dict:
    topic=json.loads(topic_path.read_text())
    errors=validate_structure(topic)
    if errors: raise ValueError('; '.join(errors))
    output.mkdir(parents=True,exist_ok=True)
    db=sqlite3.connect(output/'jobs.sqlite3',timeout=30)
    db.execute('CREATE TABLE IF NOT EXISTS jobs (job_key TEXT PRIMARY KEY, status TEXT, result TEXT, error TEXT, updated_at TEXT)')
    db.execute('CREATE TABLE IF NOT EXISTS versions (topic_id TEXT, version TEXT, content_hash TEXT, PRIMARY KEY(topic_id,version))')
    key=digest((canonical_hash(topic)+PIPELINE_VERSION+json.dumps(topic.get('academic_review',{}),sort_keys=True)).encode())
    db.execute('BEGIN IMMEDIATE')
    previous=db.execute('SELECT content_hash FROM versions WHERE topic_id=? AND version=?',
                        (topic['id'],topic['version'])).fetchone()
    if previous and previous[0]!=canonical_hash(topic):
        db.rollback();db.close()
        raise ValueError('Content changed without a version increment')
    db.execute('INSERT OR IGNORE INTO versions VALUES (?,?,?)',
               (topic['id'],topic['version'],canonical_hash(topic)))
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
            gates.extend(['PDF visual review not independently recorded','Full PDF/UA accessibility conformance not independently verified',
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

def build(topic_path: Path,output: Path) -> dict:
    import fcntl
    import time
    # One worker per output directory; bounded wait and automatic crash release.
    output.mkdir(parents=True,exist_ok=True)
    with (output/'.compiler.lock').open('a') as handle:
        deadline=time.monotonic()+30
        while True:
            try:
                fcntl.flock(handle,fcntl.LOCK_EX|fcntl.LOCK_NB);break
            except BlockingIOError:
                if time.monotonic()>=deadline:
                    raise TimeoutError('Another compiler worker holds this output directory')
                time.sleep(.05)
        try: return _build_locked(topic_path,output)
        finally: fcntl.flock(handle,fcntl.LOCK_UN)

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command',choices=['build','check'])
    parser.add_argument('topic',type=Path);parser.add_argument('--output',type=Path,default=Path('build'))
    args=parser.parse_args()
    if args.command=='build': print(json.dumps(build(args.topic,args.output),indent=2))
    else:
        topic=json.loads(args.topic.read_text());print(json.dumps({'structure_errors':validate_structure(topic),'publication_errors':review_errors(topic)},indent=2))
