# Architecture

The project deliberately starts small and grows in layers.

```text
Browser UI
   ↓
Ticket logic
   ↓
HTTP API          (added later)
   ↓
SQLite storage    (added later)
   ↓
AI suggestion     (final stage)
```

The first version is a static page served by a tiny Node.js server. Later stages add server routes and storage without throwing away the earlier work.

The point is not to build the largest possible stack. The point is to keep each boundary understandable and testable.
