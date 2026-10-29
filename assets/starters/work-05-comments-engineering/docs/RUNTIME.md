# Локальный запуск основы 04

Это накопительное состояние `base -> after-02 -> after-03 -> after-04`, не отдельный каталог для запуска. Node.js >=22.13.0. Внешних runtime-зависимостей нет.

В собранной папке, Windows PowerShell:

```powershell
npm.cmd test
$env:SERVICEDESK_DB = "$PWD\servicedesk.db"
$env:PORT = '4173'
npm.cmd start
```

Адрес: `http://127.0.0.1:4173`. Без `SERVICEDESK_DB` файл создаётся как `servicedesk.db` в текущей рабочей папке. Для проверки persistence запомните путь, создайте синтетическую заявку, остановите сервер Ctrl+C и запустите с тем же env. Не удаляйте БД при повторном запуске. На чистой БД 12 заявок 101..112, следующая 113.

Основа 04 не подключает runtime AI: нет provider, маршрута triage и AI-кнопок. Workflow `new -> in_progress -> resolved -> closed` и история сохранены как необязательное расширение. Повтор того же статуса не добавляет событие. Комментарии появляются в состоянии 05, тоже как расширение.

## HTTP-граница

Существующие маршруты и формы ответов сохранены. Новая заявка принимает `{title, description?, location?, priority, category}`; сервер назначает id и `status=new`. Title обязателен и непуст после trim. Description/location при отсутствии становятся пустыми строками. Переданные значения этих полей должны быть строками. Enum проверяется независимо от HTML. Лишние поля, включая id/status, не сохраняются.

Невалидный JSON: 400 `{error:"invalid_json"}`. Null, массив, примитив или неверный тип поля: 400 `{error:"validation_error"}`; пустой/нестроковый title дополнительно имеет `field:"title"`. Тело больше **100000 байт**: 400 `{error:"body_too_large"}`. Это общий лимит тела, отдельных новых лимитов title/description/location нет. Неизвестный id: 404 `ticket_not_found`; id должен быть положительным safe integer. Неверный enum status: 400, запрещённый переход: 409 `invalid_transition`. Внутренний отказ store: 500 `{error:"internal_error"}`, без SQL и stack.

Пользовательские значения передаются prepared statements. Seed, create+history, status+history выполняются в транзакциях; rollback проверяется искусственным отказом SQL trigger. Повторное открытие не повторяет seed.

Статика разрешает только `/`, `/index.html`, `/styles.css`, `/src/app.js`, `/src/data.js`, `/src/tickets.js`, `/src/api-client.js` (если файл есть). Остальные пути, включая `.env`, `.git`, БД, backend, конфиги и server, дают 404. Даже разрешённый путь не может вести symlink за корень. Это локальное учебное приложение без авторизации, не сервер для публичного развёртывания.
