# Product requirements

Campus ServiceDesk is a small support-request system. The same project is extended through all six stages.

## Ticket fields

Every ticket has:

- a unique integer `id`;
- a non-empty `title`;
- `description`;
- `status`: `new`, `in_progress`, `resolved`, or `closed`;
- `priority`: `low`, `normal`, or `high`;
- `category`: `equipment`, `network`, `software`, `access`, or `other`;
- `location`.

## Rules that must stay true

1. Ticket IDs are unique.
2. Unknown status, priority, or category values are rejected.
3. Query and sorting functions must not mutate the original ticket data.
4. Later API stages must return explicit error responses instead of silently accepting invalid input.
5. When persistence is added, ticket data must survive a server restart.
6. When status workflow is added, only documented transitions are allowed.
7. The final AI feature may suggest values, but the user remains in control and ordinary ticket creation must still work if AI is unavailable.
