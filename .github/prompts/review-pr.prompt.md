---
name: review-pr
description: "Perform a risk-first code review focused on bugs, regressions, and missing tests."
---

PR context: {{pr_context}}
Files changed: {{files_changed}}

Review output:
1. Findings ordered by severity.
2. File path and concrete risk for each finding.
3. Missing tests and coverage gaps.
4. Open questions and assumptions.
5. Brief summary only after findings.
