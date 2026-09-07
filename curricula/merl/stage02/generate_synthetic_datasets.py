"""Generate privacy-safe MERL teaching datasets deterministically."""
from pathlib import Path
import csv, random, math

SEED=20260907
random.seed(SEED)
OUT=Path(__file__).parent / "generated-data"
OUT.mkdir(parents=True, exist_ok=True)

def write_csv(name, rows):
    if not rows: return
    with (OUT/name).open("w", newline="", encoding="utf-8") as f:
        w=csv.DictWriter(f, fieldnames=list(rows[0]))
        w.writeheader(); w.writerows(rows)

def youth():
    counties=["Kisumu","Homa Bay","Siaya","Migori"]
    rows=[]
    for i in range(1,241):
        enrolled=random.choice([0,1]); completed=enrolled and random.random()<.78
        rows.append({"participant_id":f"Y{i:04d}","county":random.choice(counties),"sex":random.choice(["Female","Male"]),"age":random.randint(18,34),"enrolled":int(enrolled),"completed_training":int(completed),"employed_6m":int(completed and random.random()<.56)})
    write_csv("MERL-DS-001-youth-employment.csv",rows)

def maternal():
    rows=[]
    for facility in range(1,31):
        county=random.choice(["Kisumu","Homa Bay","Siaya"])
        for month in range(1,13):
            anc=random.randint(45,190); skilled=max(0,int(anc*random.uniform(.55,.95)))
            rows.append({"facility_id":f"HF{facility:03d}","county":county,"month":month,"anc1":anc,"skilled_births":skilled,"stockout_days":random.randint(0,12),"reporting_delay_days":random.randint(0,10)})
    write_csv("MERL-DS-002-maternal-health.csv",rows)

def education():
    rows=[]
    for i in range(1,501):
        base=random.gauss(52,12); attendance=random.uniform(.55,.99); end=base+18*(attendance-.7)+random.gauss(3,7)
        rows.append({"learner_id":f"S{i:04d}","sex":random.choice(["Female","Male"]),"school":f"SCH{random.randint(1,20):02d}","baseline_score":round(max(0,min(100,base)),1),"attendance_rate":round(attendance,3),"endline_score":round(max(0,min(100,end)),1)})
    write_csv("MERL-DS-003-education-survey.csv",rows)

def performance():
    rows=[]
    for year in range(2022,2027):
      for county in ["Kisumu","Homa Bay","Siaya","Migori"]:
       for q in range(1,5):
        target=1000+100*(year-2022); achieved=int(target*random.uniform(.68,1.08))
        rows.append({"year":year,"quarter":q,"county":county,"target":target,"achieved":achieved,"female":int(achieved*random.uniform(.48,.58)),"data_quality_score":round(random.uniform(.72,.99),3)})
    write_csv("MERL-DS-004-performance.csv",rows)

def impact():
    rows=[]
    for i in range(1,801):
        treatment=int(i<=400); baseline=random.gauss(50,10); effect=7 if treatment else 0
        endline=baseline+effect+random.gauss(2,8)
        rows.append({"id":i,"treatment":treatment,"baseline":round(baseline,2),"endline":round(endline,2),"age":random.randint(18,60),"female":random.randint(0,1)})
    write_csv("MERL-DS-005-impact-evaluation.csv",rows)

def integrated():
    rows=[]
    for county in ["Kisumu","Homa Bay","Siaya","Migori"]:
      for programme in ["Health","Education","Youth","Water"]:
       for year in range(2022,2027):
        budget=random.randint(20,120)*1_000_000; absorption=random.uniform(.55,.99); target=random.randint(500,5000); achieved=int(target*random.uniform(.55,1.12))
        rows.append({"county":county,"programme":programme,"year":year,"budget":budget,"absorption":round(absorption,3),"target":target,"achieved":achieved,"complaints":random.randint(0,90),"quality_score":round(random.uniform(.65,.99),3)})
    write_csv("MERL-DS-006-integrated-county.csv",rows)

if __name__=="__main__":
    youth(); maternal(); education(); performance(); impact(); integrated()
    print(f"Generated 6 synthetic datasets in {OUT}")
