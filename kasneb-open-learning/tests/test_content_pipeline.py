import copy
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('pipeline', ROOT/'scripts/content_pipeline.py')
pipeline = importlib.util.module_from_spec(spec)
spec.loader.exec_module(pipeline)

class PipelineTests(unittest.TestCase):
    def setUp(self):
        self.topic = json.loads((ROOT/'content/DD31-python-syntax.json').read_text())

    def test_current_source_gap_blocks_publication(self):
        self.assertFalse(pipeline.validate_structure(self.topic))
        self.assertIn('Full syllabus alignment is not verified',pipeline.review_errors(self.topic))

    def test_changed_content_invalidates_academic_approval(self):
        self.topic['academic_review']={'status':'approved','reviewer':'independent-reviewer',
            'reviewed_at':'2026-10-12','content_sha256':pipeline.canonical_hash(self.topic)}
        self.topic['sections'][0]['blocks'][0]['text']+=' Changed.'
        self.assertIn('Academic approval does not bind current content',pipeline.review_errors(self.topic))

    def test_self_review_rejected(self):
        self.topic['academic_review']={'status':'approved','reviewer':self.topic['author'],
            'reviewed_at':'2026-10-12','content_sha256':pipeline.canonical_hash(self.topic)}
        self.assertIn('Author cannot independently approve their own content',pipeline.review_errors(self.topic))

    def test_all_examples_execute_and_validation_is_deliberate(self):
        namespace={}
        for section in self.topic['sections']:
            for block in section['blocks']:
                if block['type']=='code': exec(block['text'],namespace)
        self.assertEqual(namespace['mean_duration']([2,5,3,4,6,1]),3.5)
        self.assertIsNone(namespace['mean_duration']([]))
        self.assertEqual(namespace['mean_duration']([0]),0)
        for values in ([2,'3'],[2,-1],[True,2],[float('nan'),2],[float('inf'),2]):
            with self.assertRaises(ValueError): namespace['mean_duration'](values)

    def test_objective_marking_and_subjective_boundary(self):
        q1,q2,q3,q4=self.topic['questions']
        self.assertEqual(pipeline.grade_objective(q1,'B')['score'],1)
        self.assertEqual(pipeline.grade_objective(q1,'C')['score'],0)
        self.assertEqual(pipeline.grade_objective(q2,'10')['score'],2)
        self.assertEqual(pipeline.grade_objective(q3,'nan')['score'],0)
        self.assertEqual(pipeline.grade_objective(q4,'answer')['status'],'human_review_required')

    def test_resume_and_asset_corruption_recovery(self):
        with tempfile.TemporaryDirectory() as directory:
            output=Path(directory);source=ROOT/'content/DD31-python-syntax.json'
            first=pipeline.build(source,output);second=pipeline.build(source,output)
            self.assertFalse(first['publication_ready']);self.assertTrue(second['reused'])
            pdf=output/first['assets']['pdf']['filename'];pdf.write_bytes(b'broken')
            third=pipeline.build(source,output)
            self.assertFalse(third['reused'])
            self.assertGreater(third['pdf_checks']['pages'],1)

    def test_missing_section_and_unsafe_id_rejected(self):
        self.topic['sections']=[s for s in self.topic['sections'] if s['kind']!='solutions']
        self.topic['id']='../../escape'
        errors=pipeline.validate_structure(self.topic)
        self.assertIn('Missing section solutions',errors)
        self.assertIn('Unsafe or absent topic id',errors)

    def test_version_traversal_and_duplicate_sections_rejected(self):
        self.topic['version']='../../bad'
        self.topic['sections'].append(copy.deepcopy(self.topic['sections'][0]))
        errors=pipeline.validate_structure(self.topic)
        self.assertIn('Version must be a semantic version without path characters',errors)
        self.assertIn('Duplicate section kind',errors)

    def test_pdf_has_structure_language_outline_and_links(self):
        with tempfile.TemporaryDirectory() as directory:
            result=pipeline.build(ROOT/'content/DD31-python-syntax.json',Path(directory))
            checks=result['pdf_checks']
            self.assertTrue(checks['tagged_structure_present'])
            self.assertEqual(checks['document_language'],'en-KE')
            self.assertTrue(checks['bookmarks_present'])
            self.assertGreater(checks['link_annotations'],9)
            self.assertFalse(checks['pdf_ua_conformance_verified'])

    def test_content_version_is_immutable(self):
        with tempfile.TemporaryDirectory() as directory:
            base=Path(directory);source=base/'topic.json';output=base/'build'
            source.write_text(json.dumps(self.topic))
            pipeline.build(source,output)
            self.topic['sections'][0]['blocks'][0]['text']+=' Revised.'
            source.write_text(json.dumps(self.topic))
            with self.assertRaisesRegex(ValueError,'version increment'):
                pipeline.build(source,output)

    def test_parallel_workers_do_not_duplicate_or_overwrite_job(self):
        with tempfile.TemporaryDirectory() as directory:
            command=[sys.executable,str(ROOT/'scripts/content_pipeline.py'),'build',
                     str(ROOT/'content/DD31-python-syntax.json'),'--output',directory]
            workers=[subprocess.Popen(command,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
                     for _ in range(2)]
            results=[]
            for worker in workers:
                stdout,stderr=worker.communicate(timeout=30)
                self.assertEqual(worker.returncode,0,stderr);results.append(json.loads(stdout))
            self.assertEqual(sorted(result['reused'] for result in results),[False,True])
            self.assertEqual(results[0]['assets'],results[1]['assets'])

if __name__=='__main__': unittest.main()
