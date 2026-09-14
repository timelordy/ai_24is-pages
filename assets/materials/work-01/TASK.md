# 01. Understand the project and write a clear contract

**Goal:** Set up your workspace, understand the starting application, and turn a vague feature request into exact behaviour that can be tested.

**Branch:** `stage/01-discovery`

## Starting point

Campus ServiceDesk already shows 12 sample support tickets. There is no search, filtering, sorting, API, or database yet.

Your goal today is **not** to implement the next feature. First understand the project and define exactly what Stage 02 must do.

## Task

1. Open your personal GitVerse repository, clone it, and open the project root in VS Code.
2. Run `npm test`, then `npm run start`. Open the address from the terminal and confirm that 12 tickets are visible.
3. Ask GigaCode to explain `src/data.js`, `src/tickets.js`, and `src/app.js`. Pick three claims from its answer and verify each one against the actual file.
4. Read `docs/REQUIREMENTS.md` and explain which rules Stage 02 must preserve.
5. Create a GitVerse issue named `Search, filters and sorting` using the provided issue template.
6. Write the exact Stage 02 contract in the issue: status filter, priority filter, case-insensitive search across title/location, and title sorting.
7. Add concrete examples: `status=new → [101,104,107,108,112]`, `priority=high → [101,102,107,108]`, `search=projector → [101]`, `search=305 → [101]`, `status=new + priority=high → [101,107,108]`.
8. Run `git diff --exit-code -- index.html src tests styles.css` and save the result in `REPORT.md`. Application code must still be unchanged.

## What counts as complete

- `npm test` passes all 5 starting tests;
- the application shows 12 tickets and the browser console has no errors;
- `REPORT.md` contains three GigaCode claims and the file/function used to verify each one;
- the GitVerse issue contains all five concrete examples from Step 7;
- the issue states what is out of scope: no API, database, authentication, or new dependency in Stage 02;
- `git diff --exit-code -- index.html src tests styles.css` returns exit code 0.

## This does not count as complete

- the report only says “GigaCode explained the project” without checking its claims;
- the issue says “search should work correctly” without concrete examples;
- application code was already changed on this stage;
- the only evidence is a screenshot or an AI message saying everything is correct.

## What to submit

- link to your GitVerse issue;
- `REPORT.md` with three verified AI claims;
- real output from `npm test`;
- the clean `git diff --exit-code` result.

## Individual question

What is the difference between a statement from GigaCode, a file change in your working tree, and a Git commit? Which one of them proves that the program behaves correctly?

## What will be checked

- the project runs and 5 tests pass
- three AI claims are checked against real files
- the issue contains exact input → expected output examples
- application code is still unchanged
