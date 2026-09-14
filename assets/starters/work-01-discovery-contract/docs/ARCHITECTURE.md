# Архитектура

Стартовая версия намеренно простая:

```text
index.html
  ↓
src/app.js
  ↓
src/tickets.js ← src/data.js

server.mjs — только статические файлы
```

По мере курса проект эволюционирует:

```text
Browser → REST API → repository → SQLite
                  ↘ comments/history
                  ↘ optional AI triage provider
```

Архитектура усложняется только тогда, когда появляется соответствующее требование. Не добавляйте framework, ORM или новый сервис «на будущее».
