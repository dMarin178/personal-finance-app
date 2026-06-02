---
name: implement-from-features-json
description: "Read a features JSON file, pick one feature, implement it end-to-end, run checks, and update status."
---

Inputs:
- featuresFile: {{features_file}}
- featureId: {{feature_id}}
- mode: {{mode}}

Execution contract:
1. Read featuresFile.
2. Select target feature:
   - If featureId is provided, use it.
   - If featureId is empty, pick the first feature with status "todo".
3. Set feature status to "in_progress" in the JSON file before coding.
4. Implement only within the feature scope.include files.
5. Follow the feature's acceptanceCriteria and definitionOfDone.
6. Run relevant tests/checks for changed behavior.
7. Update status to "done" when completed, or "blocked" with notes if blocked.
8. Return:
   - Summary of implemented changes
   - Files changed
   - Checks/tests run
   - Any follow-up tasks

Mode behavior:
- mode = "single": implement only one feature.
- mode = "queue": after finishing one feature, continue with next "todo" feature until explicitly stopped.
