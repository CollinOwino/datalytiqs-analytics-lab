# Young Analysts — Dataset Catalogue and Instructor Keys

All included datasets are synthetic. They are designed to resemble plausible school/club analytical problems without containing real learner records.

## YA-D01 Club Participation
Primary tasks: compute attendance rate = attended/registered; compare activities fairly using rates; inspect change by week.
Checks:
- Week 1 Coding = 20/24 = 83.3%.
- Week 1 Data = 15/18 = 83.3%.
- Week 1 Research = 12/16 = 75.0%.
Teaching trap: ranking clubs by attended count alone ignores unequal denominators.

## YA-D02 Study Time & Quiz Result
Primary tasks: calculate summaries, draw a scatter plot, describe direction, identify limits.
Instructor interpretation: the supplied observations show a positive pattern between study minutes and quiz score, but the tiny synthetic convenience dataset cannot establish that additional study time caused higher scores. Possible omitted factors are intentionally not measured.

## YA-D03 Library Experience Pilot
Primary tasks: inspect questionnaire usefulness, summarise categorical responses, identify missing free text, revise instrument.
Teaching boundary: five synthetic pilot responses are evidence about whether the instrument works, not a basis for estimating the whole school's experience.

## YA-D04 School Resource Use
Useful derived fields: devices per member; completion rate = sessions_completed/sessions_planned.
Checks:
- Coding A completion = 7/8 = 87.5%; devices/member = 14/28 = 0.50.
- Coding B completion = 5/8 = 62.5%; devices/member = 8/24 = 0.333.
- Data A completion = 6/6 = 100%; devices/member = 10/20 = 0.50.
- Research A completion = 4/6 = 66.7%; devices/member = 6/18 = 0.333.
- AI Lab completion = 7/8 = 87.5%; devices/member = 11/22 = 0.50.
Teaching trap: the pattern is compatible with a resource constraint hypothesis but does not prove causality.

## Instructor evidence rules
- Ask learners to preserve original data and document transformations.
- Require denominators beside rates.
- Treat a correct number with an unsupported interpretation as incomplete evidence.
- Reward explicit uncertainty and limitation when warranted.
- Never reward collection of unnecessary personal data.
- For AI tasks, require verification evidence independent of the model output.
