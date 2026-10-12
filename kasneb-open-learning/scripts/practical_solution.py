"""Original DD31 cleaning/aggregation solution for synthetic fixtures only."""
import csv
from collections import defaultdict
from decimal import Decimal
from pathlib import Path
import re

AMOUNT_PATTERN = re.compile(r'-?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{1,2})?\Z')

def parse_kes(text):
    text=text.strip()
    if not text:
        raise ValueError('missing_amount')
    if not AMOUNT_PATTERN.fullmatch(text):
        raise ValueError('invalid_amount_format')
    return Decimal(text.replace(',',''))

def clean_and_summarise(transactions, offices):
    lookup={}
    for office in offices:
        code=office['office_code'].strip()
        if not code or code in lookup:
            raise ValueError('Office lookup keys must be unique and non-empty')
        lookup[code]=office['office_name'].strip()
    seen_rows=set();by_id={};unique=[];duplicates=0
    for line_number,row in enumerate(transactions,2):
        normal={key:value.strip() for key,value in row.items()}
        fingerprint=tuple(sorted(normal.items()))
        if fingerprint in seen_rows:
            duplicates+=1;continue
        seen_rows.add(fingerprint)
        identity=normal['transaction_id']
        if not identity or identity in by_id:
            raise ValueError('Conflicting or missing transaction identifier')
        by_id[identity]=normal;unique.append((line_number,normal))
    admitted=[];rejected=[];office_totals=defaultdict(Decimal);categories=defaultdict(Decimal)
    for line,row in unique:
        try:
            value=parse_kes(row['amount_kes'])
            if value<0 and row['category']!='refund':
                raise ValueError('negative_non_refund')
            if row['office_code'] not in lookup:
                raise ValueError('unknown_office')
        except ValueError as error:
            rejected.append({'line':line,'id':row['transaction_id'],'reason':str(error)});continue
        item=dict(row,amount=value,office_name=lookup[row['office_code']])
        admitted.append(item);office_totals[row['office_code']]+=value;categories[row['category']]+=value
    total=sum((row['amount'] for row in admitted),Decimal('0'))
    assert sum(office_totals.values(),Decimal('0'))==total
    assert sum(categories.values(),Decimal('0'))==total
    assert len(transactions)==duplicates+len(admitted)+len(rejected)
    return {'raw_rows':len(transactions),'duplicate_rows':duplicates,'admitted':admitted,
            'rejected':rejected,'office_totals':dict(office_totals),'category_totals':dict(categories),'total':total}

def from_files(transaction_path,office_path):
    with Path(transaction_path).open(newline='',encoding='utf-8') as f:
        transactions=list(csv.DictReader(f))
    with Path(office_path).open(newline='',encoding='utf-8') as f:
        offices=list(csv.DictReader(f))
    return clean_and_summarise(transactions,offices)

if __name__=='__main__':
    data=Path(__file__).resolve().parents[1]/'data'
    result=from_files(data/'synthetic-transactions.csv',data/'synthetic-offices.csv')
    print({key:value for key,value in result.items() if key!='admitted'})
