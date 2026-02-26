# English Studio Backend

Backend для приложения изучения языков. Стек на основе Epochal Dialog: FastAPI, SQLModel, PostgreSQL, LangChain/OpenRouter, Redis (опционально).

## Структура

```
backend/
├── api/           # REST эндпоинты
│   ├── auth.py    # Регистрация, логин, профиль
│   ├── chat.py    # AI Coach чат
│   └── vocabulary.py  # Словарь
├── config/        # Конфигурация
├── core/          # Auth, DB, security, rate limit, CSRF
├── models/        # SQLModel модели
├── services/      # Бизнес-логика
└── main.py
```

## Запуск

1. Скопировать `.env.example` в `.env` в корне проекта и заполнить:
   ```bash
   cp .env.example .env
   ```

2. Обязательные переменные:
   - `SECRET_KEY` — сгенерировать: `python -c "import secrets; print(secrets.token_urlsafe(64))"`
   - `DATABASE_URL` — PostgreSQL: `postgresql://user:pass@localhost:5432/english_studio`
   - `OPENROUTER_API_KEY` — для AI чата

3. Создать БД и таблицы (при первом запуске создаются автоматически).

4. Запуск:
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

## API

- `POST /auth/register` — регистрация
- `POST /auth/login` — вход (OAuth2 form: username=email, password)
- `GET /auth/me` — текущий пользователь
- `POST /chat/new` — новый чат
- `POST /chat/send` — отправить сообщение AI Coach
- `GET /conversations/` — список чатов
- `GET /conversations/{id}/messages` — сообщения чата
- `GET /vocabulary/words` — список слов
- `POST /vocabulary/words` — добавить слово
- `GET /health` — проверка живости

Документация: http://localhost:8000/docs
