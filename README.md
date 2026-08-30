# DatalytIQs Analytics Lab

**Learn. Analyse. Interpret. Decide.**

A web-based educational programming and data analytics environment for DatalytIQs Academy. The Lab is designed to move learners from real management problems and datasets through reproducible analysis to evidence-based interpretation and decision support.

## MVP objective

Prove one complete learner journey using **Case Study 001 — Secondary School Performance Analytics**:

1. Understand the management problem.
2. Load and inspect an XLSX/CSV dataset.
3. Explore variables and data quality.
4. Write and run Python analysis.
5. View console output, tables and charts.
6. Interpret findings in management language.
7. Save the analytical project.
8. Prepare/export a final analytical report.

## MVP architecture

- **Web application:** learner dashboard, case-study workspace, data explorer and code editor.
- **Execution API:** accepts authenticated execution jobs and returns structured outputs.
- **Sandbox:** isolated Python execution service; learner code must never execute on the HumHub/cPanel production server.
- **Database:** projects, progress, execution metadata and submissions.
- **Object storage:** datasets and generated learner outputs.
- **Community integration:** DatalytIQs HumHub remains the collaboration, discussion, files and instructor-review layer.

## Initial technology direction

- TypeScript/React frontend
- Monaco-style Python editor
- Python analytics runtime with pandas, NumPy, matplotlib, SciPy and statsmodels
- FastAPI-compatible execution service
- PostgreSQL/Supabase for application state
- Purpose-built sandbox infrastructure for untrusted code execution

## Security baseline

Every learner execution must be isolated and subject to CPU, memory, runtime, filesystem, network and output-size limits. Production credentials must never be exposed to learner runtimes. Network access should be disabled by default and sandbox workspaces should be ephemeral unless explicitly persisted.

## Case Study 001

**Secondary School Performance Analytics: Evidence-Based Academic Management**

The first MVP case will validate the complete workflow from management problem → dataset → analysis → evidence → interpretation → decision-oriented report.

## Status

MVP development initiated August 2026.
