import json
import sys
import unittest
from pathlib import Path
from fractions import Fraction
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from simulation_solution import cost, exact, demand_from_slot, simulate

class SimulationTests(unittest.TestCase):
    def test_exact_by_independent_replicated_population(self):
        # Independently expand the ten equiprobable demand states.
        demands = [20,20,30,30,30,30,30,50,50,50]
        for stock, expected, variance in ((30,260,126400),(40,210,16900),(50,160,12400)):
            values = [10*(stock-d) if d <= stock else 40*(d-stock) for d in demands]
            average = Fraction(sum(values),10)
            squared = sum((v-average)**2 for v in values)/10
            self.assertEqual((average,squared),(expected,variance))
            self.assertEqual(exact(stock),{'mean':average,'variance':squared})
    def test_mapping_boundaries(self):
        self.assertEqual([demand_from_slot(i) for i in range(10)], [20,20,30,30,30,30,30,50,50,50])
        for invalid in (-1,10,0.5,True):
            with self.assertRaises(ValueError): demand_from_slot(invalid)
    def test_validation_and_zero(self):
        self.assertEqual(cost(0,0),0)
        self.assertEqual(cost(40,40),0)
        for value in (-1,True,'30',float('nan')):
            with self.assertRaises(ValueError):cost(value,30)
        for n in (0,1,2.5,True):
            with self.assertRaises(ValueError):simulate(n)
    def test_reproducibility_and_accounting(self):
        a,b = simulate(),simulate()
        self.assertEqual(a,b)
        self.assertEqual(sum(a['demand_counts'].values()),a['n'])
        for stock,result in a['policies'].items():
            expected = sum(count*cost(d,stock) for d,count in a['demand_counts'].items())/a['n']
            self.assertEqual(result['mean'],expected)
    def test_paired_difference_exact(self):
        differences = [cost(d,50)-cost(d,30) for d in [20]*2+[30]*5+[50]*3]
        self.assertEqual(sum(differences)/10,-100)
        self.assertEqual(sum((v+100)**2 for v in differences)/10,210000)
    def test_all_topic_code_blocks_execute(self):
        topic = json.loads((Path(__file__).resolve().parents[1]/'content/DD24-monte-carlo-inventory.json').read_text())
        namespace = {}
        for section in topic['sections']:
            for block in section['blocks']:
                if block['type']=='code':exec(compile(block['text'],'topic-example','exec'),namespace)

if __name__=='__main__':unittest.main()
