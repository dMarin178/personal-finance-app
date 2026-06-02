# AI Feature Queue Workflow

This folder contains the feature queue consumed by Copilot Chat.

## Files

- features.json: source of truth for feature planning and execution.

## How to ask the AI to implement features

Use one of these prompts in chat:

1. Single feature by ID
- "Use prompt implement-from-features-json with features_file=ai/features.json feature_id=FEAT-001 mode=single"

2. Next pending feature
- "Use prompt implement-from-features-json with features_file=ai/features.json feature_id= mode=single"

3. Queue mode
- "Use prompt implement-from-features-json with features_file=ai/features.json feature_id= mode=queue"

## Recommended feature object shape

Each feature should include:
- id
- title
- status (todo, in_progress, done, blocked)
- priority
- agent (backend, frontend, reviewer, devops)
- summary
- scope.include
- scope.exclude
- acceptanceCriteria
- definitionOfDone
- notes

## Good practices

- Keep features small and verifiable.
- Include explicit file scope to avoid broad refactors.
- Keep acceptance criteria observable and testable.
- Update status in this file as part of execution.
