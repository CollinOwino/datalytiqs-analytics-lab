import copy
import importlib.util
from decimal import Decimal
from pathlib import Path
import csv
from statistics import mean,variance,pvariance,stdev,median
import unittest

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('solution',ROOT/'scripts/practical_solution.py')
solution=importlib.util.module_from_spec(spec);spec.loader.exec_module(solution)

class PracticalTests(unittest.TestCase):
    def setUp(self):
        with (ROOT/'data/synthetic-transactions.csv').open(newline='') as f:
            self.rows=list(csv.DictReader(f))
        with (ROOT/'data/synthetic-offices.csv').open(newline='') as f:
            self.offices=list(csv.DictReader(f))

    def test_original_rows_and_values_reconcile(self):
        result=solution.clean_and_summarise(self.rows,self.offices)
        self.assertEqual(result['raw_rows'],9);self.assertEqual(result['duplicate_rows'],1)
        self.assertEqual(len(result['admitted']),6);self.assertEqual(len(result['rejected']),2)
        self.assertEqual(result['total'],Decimal('7500'))
        self.assertEqual(result['office_totals'],{'A':Decimal('5200'),'B':Decimal('2300')})
        self.assertEqual({r['id'] for r in result['rejected']},{'T005','T008'})

    def test_conflicting_transaction_id_stops(self):
        self.rows[4]['amount_kes']='950'
        with self.assertRaisesRegex(ValueError,'Conflicting'):
            solution.clean_and_summarise(self.rows,self.offices)

    def test_lookup_duplicates_stop_before_join(self):
        self.offices.append({'office_code':'A','office_name':'Another Office'})
        with self.assertRaisesRegex(ValueError,'unique'):
            solution.clean_and_summarise(self.rows,self.offices)

    def test_missing_amount_is_not_zero(self):
        self.rows[5]['amount_kes']='0'
        result=solution.clean_and_summarise(self.rows,self.offices)
        self.assertEqual(len(result['admitted']),7);self.assertEqual(result['total'],7500)
        self.assertEqual(len(result['rejected']),1)

    def test_scenario_solutions(self):
        self.rows[5]['amount_kes']='300'
        result=solution.clean_and_summarise(self.rows,self.offices)
        self.assertEqual(result['total'],7800);self.assertEqual(result['office_totals']['A'],5500)
        self.rows[5]['amount_kes']=''
        self.offices.append({'office_code':'C','office_name':'Fictional Coastal Office'})
        result=solution.clean_and_summarise(self.rows,self.offices)
        self.assertEqual(result['total'],8200);self.assertEqual(len(result['admitted']),7)

    def test_amount_parser_rejects_malformed_values(self):
        for value in ['', '1,5', '12.345', 'NaN', 'KES 100', '1,500,00']:
            with self.assertRaises(ValueError): solution.parse_kes(value)
        self.assertEqual(solution.parse_kes('1,500'),1500)
        self.assertEqual(solution.parse_kes('12.34'),Decimal('12.34'))
        self.assertEqual(solution.parse_kes('-400'),-400)

    def test_negative_non_refund_is_quarantined(self):
        self.rows[6]['category']='stationery'
        result=solution.clean_and_summarise(self.rows,self.offices)
        self.assertEqual(len(result['admitted']),5)
        self.assertIn('negative_non_refund',[r['reason'] for r in result['rejected']])

    def test_stats_derivation_independently_reproduces_library(self):
        values=[4,6,6,8,11];average=sum(values)/len(values)
        squared=sum((x-average)**2 for x in values)
        shortcut=sum(x*x for x in values)-sum(values)**2/len(values)
        self.assertEqual(squared,28);self.assertEqual(shortcut,squared)
        self.assertEqual(pvariance(values),squared/5)
        self.assertEqual(variance(values),squared/4)
        self.assertEqual(mean(values),7);self.assertEqual(median(values),6)
        self.assertAlmostEqual(stdev([4,6,6,8,31]),127**.5)
        values=[2,3,5,5,10]
        self.assertEqual(mean(values),5);self.assertEqual(variance(values),9.5)

if __name__=='__main__': unittest.main()
