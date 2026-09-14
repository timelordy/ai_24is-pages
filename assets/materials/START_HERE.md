# Campus ServiceDesk — start here

## One repository for the whole semester

You keep the same personal GitVerse repository from the first stage to the last one. Each stage adds something real to the same application.

```text
starting ticket list
→ search, filters, sorting
→ HTTP API and ticket creation
→ SQLite storage and status rules
→ comments and review workflow
→ AI suggestions and final demonstration
```

## Before every stage

1. Open the course page and check that the stage is **Open**.
2. Read the full instructions and the section **What counts as complete**.
3. Update `main`, then create the branch named in the task.
4. Write down the expected result before asking AI to make changes.
5. Use GigaCode to inspect the project, make a short plan, and implement only the requested change.
6. Check the actual diff, run `npm test`, and reproduce the required scenario yourself.
7. Merge only after every required check passes.

## Backup project download

The course page includes a backup project for the current stage. Use it only if you missed an earlier stage or your local repository is too broken to continue.

The normal path is to keep working in your own repository. Future-stage backups are not published early.

## What is real evidence?

- a command you actually ran;
- a test result you can reproduce;
- a working browser or API scenario;
- a GitVerse branch and automatic check attached to the commit you are submitting;
- your own explanation of what changed and why.

A message from the coding assistant saying “done” is not evidence.

## Keep secrets out of Git

Do not commit `.env`, API keys, passwords, personal data, or files from unrelated work. The final AI stage uses a fake provider in automated tests, so a paid cloud key is not required to prove that the boundary works.
