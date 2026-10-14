"""Original synthetic single-period inventory model; no learner data."""
from collections import Counter
from fractions import Fraction
from math import sqrt
from random import Random
from statistics import mean, stdev

DEMAND_WEIGHTS = ((20, 2), (30, 5), (50, 3))

def cost(demand, stock, holding=10, shortage=40):
    for value in (demand, stock, holding, shortage):
        if type(value) is not int or value < 0:
            raise ValueError('Inputs must be non-negative integers')
    return holding * max(stock-demand, 0) + shortage * max(demand-stock, 0)

def demand_from_slot(slot):
    if type(slot) is not int or not 0 <= slot < 10:
        raise ValueError('Slot must be an integer from 0 through 9')
    return 20 if slot < 2 else 30 if slot < 7 else 50

def exact(stock):
    expected = sum(Fraction(w, 10)*cost(d, stock) for d,w in DEMAND_WEIGHTS)
    variance = sum(Fraction(w, 10)*(cost(d, stock)-expected)**2
                   for d,w in DEMAND_WEIGHTS)
    return {'mean': expected, 'variance': variance}

def simulate(n=10000, seed=20261012, stocks=(30,40,50)):
    if type(n) is not int or n < 2:
        raise ValueError('At least two replications required')
    stocks = tuple(stocks)
    if not stocks or len(set(stocks)) != len(stocks):
        raise ValueError('Supply distinct stock policies')
    for stock in stocks:
        cost(0,stock)
    rng = Random(seed)
    demands = [demand_from_slot(rng.randrange(10)) for _ in range(n)]
    results = {}
    for stock in stocks:
        values = [cost(d,stock) for d in demands]
        average = mean(values)
        se = stdev(values)/sqrt(n)
        results[stock] = {'mean': average, 'standard_error': se,
                         'approximate_95_interval': (average-1.96*se,average+1.96*se)}
    return {'n':n,'seed':seed,'demand_counts':dict(Counter(demands)), 'policies':results}

if __name__ == '__main__':
    import json
    print(json.dumps(simulate(),indent=2))
