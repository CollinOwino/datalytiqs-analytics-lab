"""Local teaching model of MapReduce; not a Hadoop cluster or learner service."""
from collections import defaultdict
from fractions import Fraction
from hashlib import sha256
import json

ROWS = [
    {'case_id':'S001','office':'A','days':2},
    {'case_id':'S002','office':'A','days':4},
    {'case_id':'S003','office':'A','days':6},
    {'case_id':'S004','office':'B','days':1},
    {'case_id':'S005','office':'B','days':3},
    {'case_id':'S006','office':'B','days':8},
    {'case_id':'S007','office':'B','days':12},
    {'case_id':'S008','office':'C','days':0},
    {'case_id':'S009','office':'C','days':None},
    {'case_id':'S010','office':'B','days':-1},
]

def validate(rows):
    accepted, rejected, seen = [], [], set()
    for row in rows:
        identity = row.get('case_id')
        if not isinstance(identity,str) or not identity.strip() or identity in seen:
            raise ValueError('Case IDs must be non-empty and unique; resolve upstream duplicates')
        seen.add(identity)
        office, days = row.get('office'), row.get('days')
        if not isinstance(office,str) or not office.strip():
            rejected.append((row,'missing_office'))
        elif type(days) is not int or days < 0:
            rejected.append((row,'invalid_duration'))
        else:
            accepted.append(dict(row))
    return accepted,rejected

def merge_stats(a,b):
    return tuple(x+y for x,y in zip(a,b,strict=True))

def mapper(row):
    return row['office'], (1,row['days'],row['days']**2)

def partition(key, reducers):
    if type(reducers) is not int or reducers < 1:
        raise ValueError('Positive integer reducer count required')
    return int.from_bytes(sha256(key.encode()).digest()[:8],'big') % reducers

def run(rows, chunk_size=3, reducers=2):
    if type(chunk_size) is not int or chunk_size < 1:
        raise ValueError('Positive integer chunk size required')
    partition('',reducers)
    accepted,rejected = validate(rows)
    shuffled = [defaultdict(list) for _ in range(reducers)]
    for start in range(0,len(accepted),chunk_size):
        combined = {}
        for row in accepted[start:start+chunk_size]:
            key,value = mapper(row)
            combined[key] = merge_stats(combined.get(key,(0,0,0)),value)
        for key,value in combined.items():
            shuffled[partition(key,reducers)][key].append(value)
    results = {}
    for bucket in shuffled:
        for key,values in bucket.items():
            stats = (0,0,0)
            for value in values: stats = merge_stats(stats,value)
            count,total,squares = stats
            mean = Fraction(total,count)
            variance = Fraction(squares,count)-mean**2
            results[key] = {'count':count,'sum_days':total,'sum_squares':squares,
                            'mean':mean,'population_variance':variance}
    assert sum(v['count'] for v in results.values()) == len(accepted)
    assert sum(v['sum_days'] for v in results.values()) == sum(r['days'] for r in accepted)
    return {'raw':len(rows),'accepted':len(accepted),'rejected':len(rejected),'offices':results}

if __name__=='__main__':
    print(json.dumps(run(ROWS),default=str,indent=2))
