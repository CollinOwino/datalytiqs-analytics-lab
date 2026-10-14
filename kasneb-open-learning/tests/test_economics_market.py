import unittest,json,sys
from pathlib import Path
from fractions import Fraction as F
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from economics_market import equilibrium,arc_elasticity,welfare

class MarketTests(unittest.TestCase):
    def test_equilibrium_substitution(self):
        r=equilibrium();self.assertEqual((r['buyer_price'],r['quantity']),(20,80))
        self.assertEqual(120-2*r['buyer_price'],20+3*r['seller_price'])
        r=equilibrium(a=140);self.assertEqual((r['buyer_price'],r['quantity']),(24,92))
    def test_tax_and_incidence(self):
        r=equilibrium(tax=5)
        self.assertEqual((r['buyer_price'],r['seller_price'],r['quantity'],r['tax_revenue']),(23,18,74,370))
        self.assertEqual((r['buyer_price']-20)+(20-r['seller_price']),5)
    def test_midpoint_reversal_and_revenue(self):
        self.assertEqual(arc_elasticity(20,80,25,70),F(-3,5))
        self.assertEqual(arc_elasticity(25,70,20,80),F(-3,5))
        self.assertEqual(25*70-20*80,150)
    def test_welfare_identity(self):
        self.assertEqual(welfare()['consumer_surplus'],1600)
        self.assertEqual(welfare()['producer_surplus'],F(3200,3))
        self.assertEqual(welfare()['total']-welfare(5)['total'],15)
        self.assertEqual(F(1,2)*5*(80-74),15)
    def test_boundaries(self):
        for kwargs in ({'b':0},{'d':-1},{'tax':-1},{'tax':True},{'tax':1000}):
            with self.assertRaises(ValueError):equilibrium(**kwargs)
        with self.assertRaises(ValueError):arc_elasticity(20,80,20,70)
    def test_topic_code_executes(self):
        t=json.loads((Path(__file__).resolve().parents[1]/'content/CA14-demand-supply-elasticity.json').read_text());scope={}
        for sec in t['sections']:
            for b in sec['blocks']:
                if b['type']=='code':exec(compile(b['text'],'market-example','exec'),scope)
