import json,unittest
from pathlib import Path
from fractions import Fraction
class EconomicsTests(unittest.TestCase):
    def setUp(self):
        self.topic=json.loads((Path(__file__).resolve().parents[1]/'content/CA14-scarcity-opportunity-cost.json').read_text())
    def test_frontier_costs(self):
        points=[(0,20),(1,18),(2,15),(3,11),(4,6),(5,0)]
        self.assertEqual([Fraction(a[1]-b[1],b[0]-a[0]) for a,b in zip(points,points[1:])],[2,3,4,5,6])
        self.assertEqual(Fraction(15-6,4-2),Fraction(9,2))
    def test_answers_independent_arithmetic(self):
        answers={q['id']:q['answer'] for q in self.topic['questions'] if q['type']=='numeric'}
        expected=[15-6,(15-6)/(4-2),250000-150000-70000-20000,12000-1000]
        self.assertEqual(list(answers.values()),expected)
    def test_sensitivity_and_sunk_cost(self):
        self.assertEqual([30000-4*v for v in [6000,8000]],[6000,-2000])
        self.assertGreater(12000-1000,14000-4000)
    def test_all_code_blocks_execute(self):
        namespace={}
        for sec in self.topic['sections']:
            for b in sec['blocks']:
                if b['type']=='code':exec(compile(b['text'],'economics-example','exec'),namespace)
