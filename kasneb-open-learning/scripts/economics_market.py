"""Exact rational calculations for a synthetic linear market, not Kenyan estimates."""
from fractions import Fraction as F

def equilibrium(a=120,b=2,c=20,d=3,tax=0):
    values=(a,b,c,d,tax)
    if any(type(v) not in (int,F) for v in values):
        raise ValueError('Use exact integers or Fractions')
    if b<=0 or d<=0 or tax<0:
        raise ValueError('Positive slopes and non-negative tax required')
    buyer_price=F(a-c+d*tax,b+d)
    seller_price=buyer_price-tax
    quantity=a-b*buyer_price
    if buyer_price<0 or seller_price<0 or quantity<0:
        raise ValueError('No admissible interior equilibrium in this model')
    return {'buyer_price':buyer_price,'seller_price':seller_price,
            'quantity':quantity,'tax_revenue':tax*quantity}

def arc_elasticity(p1,q1,p2,q2):
    if any(type(v) not in (int,F) for v in (p1,q1,p2,q2)):
        raise ValueError('Use exact integers or Fractions')
    if min(p1,p2)<=0 or min(q1,q2)<0 or q1+q2==0 or p1==p2:
        raise ValueError('Invalid midpoint elasticity inputs')
    return F(q2-q1,q1+q2)/F(p2-p1,p1+p2)

def welfare(tax=0):
    r=equilibrium(tax=tax)
    q,pc,ps=r['quantity'],r['buyer_price'],r['seller_price']
    consumer=F(1,2)*(60-pc)*q
    producer=F(1,2)*(ps+F(20,3))*q
    return {'consumer_surplus':consumer,'producer_surplus':producer,
            'tax_revenue':r['tax_revenue'],
            'total':consumer+producer+r['tax_revenue']}
