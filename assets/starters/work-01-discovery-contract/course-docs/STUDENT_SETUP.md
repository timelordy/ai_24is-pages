# Настройка студента

## Аккаунт и рабочая папка

1. Войдите в GitVerse своим аккаунтом, чтобы подключить GigaCode.
2. Создайте на компьютере обычную папку для учебных проектов.
3. Вся работа выполняется локально в VS Code. Отдельный форк или задача GitVerse не нужны.
4. Не отправляйте преподавателю пароль и не сохраняйте секреты в проекте.

## Локальная среда

Проверьте:

```bash
git --version
node --version
npm --version
```

Требуется Node.js 20+. Установите VS Code и плагин GigaCode по официальной инструкции GitVerse, затем выполните вход.

## Клонирование

```bash
git clone https://gitverse.ru/ultra_turbo_killer/Campus-ServiceDesk.git
cd Campus-ServiceDesk
npm test
npm run start
```

## Git-процесс

```bash
git switch -c stage/01-discovery
git status
git diff
npm test
git add .
git commit -m "docs: complete stage 01 report"
git log -1 --oneline
```

Отправлять ветку в GitVerse на первой работе не нужно. Никогда не добавляйте в файлы токены, `.env`, пароли и реальные персональные данные.
