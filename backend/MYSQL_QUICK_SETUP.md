# 🚀 Быстрая настройка MySQL для DarkCase

## ✅ Что уже сделано

- ✅ Backend переведен на MySQL
- ✅ Все SQL запросы адаптированы под MySQL
- ✅ Миграции переписаны для MySQL
- ✅ Зависимости обновлены (mysql2 установлен)

## 📝 Настройка на вашем хостинге

### Шаг 1: Создайте базу данных

На вашем хостинге создайте базу данных MySQL:

```sql
CREATE DATABASE darkcase CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Шаг 2: Создайте файл `.env`

В папке `backend/` создайте файл `.env`:

```env
# Server
PORT=3000
NODE_ENV=production

# Database (MySQL) - ЗАМЕНИТЕ НА ВАШИ ДАННЫЕ!
DB_HOST=your_host.com
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=darkcase

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Admin credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password

# CORS
CORS_ORIGIN=https://your-domain.com,https://your-telegram-miniapp.com
```

### Шаг 3: Запустите миграции

```bash
cd backend
npm run migrate
```

Или миграции запустятся автоматически при старте сервера.

### Шаг 4: Запустите Backend

```bash
npm run dev
```

Должно появиться:
```
✅ MySQL Database connected
📦 Database is available, running migrations...
✅ All migrations completed
🚀 DarkCase API server running on port 3000
```

## 🔍 Типичные данные хостинга

### cPanel / Shared Hosting
```env
DB_HOST=localhost
DB_USER=your_cpanel_username_darkcase
DB_PASSWORD=your_password
DB_NAME=your_cpanel_username_darkcase
```

### VPS / Cloud Hosting
```env
DB_HOST=your-server-ip
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=darkcase
```

### Managed MySQL (AWS RDS, DigitalOcean, etc.)
```env
DB_HOST=your-db-host.rds.amazonaws.com
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=your_password
DB_NAME=darkcase
```

## ✅ Проверка

После настройки проверьте:

1. **Backend запущен:**
   ```bash
   curl http://localhost:3000/health
   ```

2. **База данных подключена:**
   В логах должно быть: `✅ MySQL Database connected`

3. **Таблицы созданы:**
   ```sql
   SHOW TABLES;
   ```
   
   Должны быть: `users`, `cases`, `categories`, `category_cases`, `user_favorites`, `user_history`

## 🎉 Готово!

Теперь Backend работает с MySQL на вашем хостинге!

