import sys,unittest,json
from pathlib import Path
from fractions import Fraction
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from mapreduce_solution import ROWS,run,validate,merge_stats,partition

class MapReduceTests(unittest.TestCase):
    def test_exact_expected_results(self):
        result=run(ROWS)
        self.assertEqual((result['raw'],result['accepted'],result['rejected']),(10,8,2))
        for key,count,total,squares,average,variance in (
            ('A',3,12,56,Fraction(4),Fraction(8,3)),
            ('B',4,24,218,Fraction(6),Fraction(37,2)),
            ('C',1,0,0,Fraction(0),Fraction(0))):
            self.assertEqual(result['offices'][key],dict(count=count,sum_days=total,sum_squares=squares,mean=average,population_variance=variance))
    def test_partition_chunk_order_invariance(self):
        expected=run(ROWS)
        for chunks in (1,2,4,100):
            for reducers in (1,2,5):
                self.assertEqual(run(list(reversed(ROWS)),chunks,reducers),expected)
    def test_merge_associativity_identity(self):
        a,b,c=(1,2,4),(2,10,52),(1,0,0)
        self.assertEqual(merge_stats(merge_stats(a,b),c),merge_stats(a,merge_stats(b,c)))
        self.assertEqual(merge_stats(a,(0,0,0)),a)
    def test_missing_zero_and_duplicate(self):
        accepted,rejected=validate(ROWS)
        self.assertTrue(any(r['days']==0 for r in accepted))
        self.assertEqual(len(rejected),2)
        with self.assertRaises(ValueError):run(ROWS+[ROWS[0]])
        self.assertEqual(run([])['offices'],{})
    def test_config_and_bool_validation(self):
        for bad in (0,-1,True,1.5):
            with self.assertRaises(ValueError):run(ROWS,chunk_size=bad)
            with self.assertRaises(ValueError):partition('A',bad)
        result=run([{'case_id':'X','office':'A','days':True}])
        self.assertEqual(result['accepted'],0)
    def test_topic_code_executes(self):
        topic=json.loads((Path(__file__).resolve().parents[1]/'content/DD32-mapreduce-aggregation.json').read_text())
        namespace={}
        for section in topic['sections']:
            for block in section['blocks']:
                if block['type']=='code':exec(compile(block['text'],'topic-example','exec'),namespace)
