# DatalytIQs KASNEB Open Learning - content foundation

This is a working canonical-content compiler and initial requirements register,
not a completed curriculum or a live learner assessment service.

## Current production changes

- Hub: https://datalytiqsacademy.com/kasneb-open-learning/
- Existing courses 1522, 1835, 1848, 1861 and 1874 use Tutor price type `free`.
- Previous price settings retained in WordPress option
  `datalytiqs_kasneb_free_access_snapshot_20261012`.
- Associated WooCommerce products and historical orders preserved.
- Unrelated Excel courses 1651 and 1688 were checked and remain `paid`.
- CA35P mock-practice topic 1808 moved from menu order 0 to 90.
- Fourteen CA35P lessons moved from final topic 1530 to corresponding modules
  1523–1529, preserving lesson IDs and content. Each of those modules has two lessons.
- Eight misleading foundation/consolidation topic labels corrected.
- DD31 lesson 1838 official source link corrected to KASNEB DDMA.

## Run the content compiler

Python 3, WeasyPrint 70, pypdf, Pango and DejaVu fonts are required.
Install the pinned Python dependencies from requirements.txt.

```bash
python scripts/content_pipeline.py build content/DD31-python-syntax.json --output build
python -m unittest discover -s tests -v
```

The same canonical JSON produces lesson HTML and a searchable PDF. Jobs have
content hashes, SQLite checkpoints, bounded asset paths and corruption recovery.
Drafts carry explicit status and cannot pass a publication gate merely because
the compiler succeeds. Academic review must be independent and bind the current
content hash. Official syllabus verification is separate from paper identity.
The compiler serialises workers with a bounded process lock and rejects content
changes that reuse a previously compiled content version. PDFs include a tagged
structure, language metadata, heading bookmarks, contents links and HTTPS links.
Structural checks do not establish full PDF/UA conformance.

Three drafts contain original synthetic cases, worked examples, exercises,
solutions and an original question bank. Objective scoring is tested separately;
subjective questions return `human_review_required`. No official pass threshold
is invented. No learner information or credentials are stored by this compiler.

## Acceptance boundaries

- Current full topic-level syllabuses and effective dates remain unresolved.
- The DD31 document is a draft supplementary resource, not verified coverage.
- PDFs have searchable text and verified structural tags. Independent PDF/UA
  conformance and assistive-technology acceptance remain pending.
- No autonomous authoring model/provider or unattended publication job is enabled.
- No new learner-attempt database, mock timer, enrolment bridge or assessment
  endpoint is introduced by these scripts.
- Tutor REST routes require their own API key/secret; WordPress application
  credentials do not satisfy RestAuth::process_api_request. This explains the
  403 without implying that WordPress administrator capabilities are missing.
- Authenticated enrolment, cross-account isolation and practical persistence
  require full acceptance testing.
- Current CPA page and official April/August 2026 timetables corroborate CA35P;
  the booklet's CA36P discrepancy is retained in audit history.
- DQM and CPFM are listed on the official site and must be included in scope.

## Next executable work

The register now contains 13 qualification listings and 173 requirement identities;
this is a partial inventory, not a complete syllabus denominator. The 143 current
lessons are listed in data/lesson-traceability.csv. The three draft topic records
and PDF hashes are in data/content-production-register.json. Synthetic transactions,
office lookup and a runnable practical solution support the joins topic.

Obtain source editions, import verified topic hierarchies, expand the 143 existing
lessons, compile topic packs, independently review content, add tagged PDF output,
use supported Tutor assessment/import APIs, wire authenticated Lab evidence,
and run synthetic learner acceptance before marking any paper complete.

Content changes must preserve stable identifiers and existing learner records.
The compiler makes no remote writes and does not weaken production safeguards.
