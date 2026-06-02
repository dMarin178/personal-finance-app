---
name: implement-feature
description: "Implement a feature end-to-end with architecture-safe changes and tests."
---

Goal: {{feature_goal}}
Constraints: {{constraints}}

Deliverables:
1. Minimal code changes across the correct layers.
2. Tests for changed behavior.
3. Risk notes and tradeoffs.
4. Follow-up tasks if scope is incomplete.

Execution checklist:
- Identify affected domain entities and use-cases.
- Implement repositories and route wiring only where needed.
- Update UI and store logic only if required by the feature.
- Verify no unrelated refactors are introduced.
