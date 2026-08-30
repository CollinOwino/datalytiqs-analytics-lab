# DatalytIQs Analytics Lab — MVP Specification

## Product proposition

DatalytIQs Analytics Lab is an applied analytics learning environment. It is not primarily a generic code playground. Every workflow should connect technical analysis to an analytical question, evidence and a decision context.

## MVP user journey

### 1. Learner Dashboard
- Resume active case study.
- View progress through six analytical stages.
- Open recent projects.
- Launch Case Study 001.

### 2. Case Study Workspace
The workspace presents:
- case title and management context;
- analytical objectives;
- staged workflow;
- linked dataset;
- progress status.

### 3. Data Explorer
Learner can:
- upload/select CSV or XLSX;
- preview rows and columns;
- inspect variable names and inferred types;
- view dimensions;
- inspect missing values;
- generate basic descriptive statistics.

### 4. Python Workspace
Layout:
- left: dataset/variables panel;
- centre: code editor;
- right: environment/objects panel;
- bottom: output area with Console, Table and Chart tabs.

MVP runtime libraries:
- pandas
- numpy
- matplotlib
- scipy
- statsmodels

### 5. Analysis execution
`Run Analysis` sends code and approved project files to an execution API. The API delegates execution to an isolated sandbox and returns structured results.

No arbitrary learner code may execute on the DatalytIQs Academy or HumHub production server.

### 6. Interpretation
Learner records:
- key finding;
- statistical evidence;
- interpretation;
- management implication;
- recommended action;
- limitation/caveat.

### 7. Project persistence
Persist:
- project metadata;
- case identifier;
- code;
- learner notes;
- progress;
- execution metadata;
- references to uploaded/generated files.

### 8. Final output
MVP should support a structured analytical report/export containing:
- management problem;
- data and methods;
- findings;
- tables/charts;
- interpretation;
- recommendations;
- limitations.

## Case Study 001 workflow

1. Understand the Management Problem
2. Inspect and Prepare the Dataset
3. Conduct Descriptive Analysis
4. Investigate Performance Drivers
5. Translate Findings into Management Insights
6. Prepare and Submit the Final Analytical Report

## Non-goals for MVP

Defer initially:
- R runtime;
- unrestricted package installation;
- persistent Linux terminals;
- collaborative notebooks;
- real-time multi-user editing;
- automated certificates;
- institutional analytics dashboards;
- arbitrary outbound internet access from sandboxes.

## Sandbox requirements

Each execution must enforce:
- hard runtime timeout;
- CPU limit;
- memory limit;
- disk/workspace quota;
- process limit;
- output-size limit;
- network disabled by default;
- no production secrets;
- isolated temporary filesystem;
- automatic cleanup.

## Integration boundary

HumHub remains responsible for community interaction, discussion, spaces, files and instructor workflow. Analytics Lab owns interactive analytical work. Integration should initially use authenticated links and later evolve toward SSO/API integration.
