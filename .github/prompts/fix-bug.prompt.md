---
name: fix-bug
description: "Diagnose and fix a bug with root-cause focus, regression safety, and tests when relevant."
---

Bug report: {{bug_report}}
Expected behavior: {{expected_behavior}}
Known context: {{context}}

Deliverables:
1. Root cause explanation.
2. Minimal fix.
3. Regression test or test rationale.
4. Risk assessment and edge cases.

Execution checklist:
- Reproduce or infer failure path from code.
- Patch only the faulting logic and adjacent contract boundaries.
- Validate auth and ownership behavior for user data.
- Confirm no API response shape regressions.
