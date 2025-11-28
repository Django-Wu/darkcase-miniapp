# 🗄️ Настройка базы данных PostgreSQL

## Проблема: Database connection error

Если вы видите ошибку `ECONNREFUSED` на порту 5432, это означает, что PostgreSQL не запущен или не настроен.

## Вариант 1: Запуск без базы данных (для тестирования)

Backend теперь может работать **без базы данных** для базовых функций:
- ✅ Авторизация админов (работает без БД)
- ✅ API endpoints (будут возвращать пустые данные)
- ❌ Сохранение кейсов, пользователей и т.д. (требует БД)

**Просто запустите Backend:**
```bash
cd backend
npm run dev
```

Сервер запустится, но будет предупреждение о недоступности БД.

## Вариант 2: Установка и настройка PostgreSQL

### Windows

1. **Скачайте PostgreSQL:**
   - https://www.postgresql.org/download/windows/
   - Или используйте установщик: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads

2. **Установите PostgreSQL:**
   - Запомните пароль для пользователя `postgres`
   - Порт по умолчанию: `5432`

3. **Создайте базу данных:**
   ```sql
   -- Откройте pgAdmin или psql
   CREATE DATABASE darkcase;
   ```

4. **Настройте .env:**
   ```env
   DATABASE_URL=postgresql://postgres:ваш_пароль@localhost:5432/darkcase
   ```

5. **Запустите миграции:**
   ```bash
   cd backend
   npm run migrate
   ```

### macOS

```bash
# Установка через Homebrew
brew install postgresql@14
brew services start postgresql@14

# Создание базы данных
createdb darkcase

# Настройка .env
DATABASE_URL=postgresql://localhost:5432/darkcase
```

### Linux (Ubuntu/Debian)

```bash
# Установка
sudo apt update
sudo apt install postgresql postgresql-contrib

# Запуск сервиса
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Создание базы данных
sudo -u postgres createdb darkcase

# Настройка .env
DATABASE_URL=postgresql://postgres:пароль@localhost:5432/darkcase
```

## Вариант 3: Использование Docker (рекомендуется)

### Быстрый старт с Docker:

```bash
# Запуск PostgreSQL в Docker
docker run --name darkcase-db \
  -e POSTGRES_PASSWORD=darkcase123 \
  -e POSTGRES_DB=darkcase \
  -p 5432:5432 \
  -d postgres:14

# Настройка .env
DATABASE_URL=postgresql://postgres:darkcase123@localhost:5432/darkcase

# Запуск миграций
cd backend
npm run migrate
```

### Остановка Docker контейнера:

```bash
docker stop darkcase-db
docker rm darkcase-db
```

## Проверка подключения

После настройки проверьте:

```bash
# Проверка подключения
cd backend
npm run migrate
```

Должно появиться:
```
✅ Database connected
📦 Database is available, running migrations...
✅ All migrations completed
```

## Настройка .env

Создайте файл `backend/.env`:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/darkcase

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Admin credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:3001
```

## Решение проблем

### Ошибка "password authentication failed"
- Проверьте пароль в `DATABASE_URL`
- Убедитесь, что пользователь существует

### Ошибка "database does not exist"
- Создайте базу данных: `CREATE DATABASE darkcase;`

### Ошибка "connection refused"
- Убедитесь, что PostgreSQL запущен
- Проверьте порт (по умолчанию 5432)
- Проверьте firewall настройки

### Windows: "pg_config executable not found"
```bash
npm install --global windows-build-tools
```

## Полезные команды

```bash
# Проверка статуса PostgreSQL (Linux/Mac)
sudo systemctl status postgresql

# Подключение к БД через psql
psql -U postgres -d darkcase

# Просмотр всех баз данных
psql -U postgres -l

# Остановка PostgreSQL (Linux/Mac)
sudo systemctl stop postgresql
```

