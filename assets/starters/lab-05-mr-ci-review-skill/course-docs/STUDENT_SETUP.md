# Настройка студента

## Аккаунт и форк

1. Войдите в GitVerse своим аккаунтом.
2. Откройте ссылку задания GitVerse Lab.
3. Дождитесь создания персонального форка.
4. Не работайте в чужом форке и не отправляйте преподавателю пароль.

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
git clone <URL вашего форка>
cd <папка проекта>
npm test
npm run start
```

## Git-процесс

```bash
git switch -c lab/01-environment
git status
git diff
npm test
git add .
git commit -m "lab01: verify AI explanation"
git push -u origin lab/01-environment
```

Никогда не добавляйте в репозиторий токены, `.env`, пароли и реальные персональные данные.
