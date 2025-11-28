# Архитектура DarkCase

## 📊 Общая схема

```
┌─────────────────┐         ┌──────────────┐         ┌─────────────┐
│  Telegram Mini  │────────▶│   Backend    │────────▶│  Database   │
│      App        │  API    │    (API)     │         │  (PostgreSQL│
│  (Frontend)     │◀────────│              │◀────────│   /MongoDB) │
└─────────────────┘         └──────────────┘         └─────────────┘
                                      ▲
                                      │
                            ┌─────────┴─────────┐
                            │                   │
                    ┌───────▼──────┐   ┌───────▼──────┐
                    │   Admin Web  │   │  File Storage│
                    │    Panel     │   │  (S3/CDN)   │
                    └──────────────┘   └──────────────┘
```

## 🏗 Варианты архитектуры

### Вариант 1: Монолит (рекомендуется для старта)

**Структура:**
- **Backend API** (Node.js + Express/Fastify)
- **Admin Panel** (React веб-приложение)
- **Database** (PostgreSQL или MongoDB)
- **File Storage** (AWS S3 / Cloudflare R2 / локальное хранилище)

**Плюсы:**
- ✅ Простота разработки
- ✅ Быстрый старт
- ✅ Один репозиторий
- ✅ Легче деплой

**Минусы:**
- ⚠️ Масштабирование сложнее
- ⚠️ Все в одном процессе

### Вариант 2: Микросервисы

**Структура:**
- **API Gateway** (Nginx / Kong)
- **Content Service** (управление контентом)
- **User Service** (пользователи)
- **Media Service** (видео/изображения)
- **Admin Panel** (отдельный сервис)

**Плюсы:**
- ✅ Масштабируемость
- ✅ Независимое развертывание
- ✅ Технологическая гибкость

**Минусы:**
- ⚠️ Сложность разработки
- ⚠️ Больше инфраструктуры

## 📦 Рекомендуемый стек

### Backend API
- **Node.js** + **TypeScript**
- **Express** или **Fastify** (REST API)
- **Prisma** или **TypeORM** (ORM)
- **PostgreSQL** (база данных)
- **JWT** (авторизация админов)
- **Multer** (загрузка файлов)

### Admin Panel
- **React** + **TypeScript** (как в Mini App)
- **React Router**
- **React Query** (для API запросов)
- **Tailwind CSS** (стилизация)
- **React Hook Form** (формы)

### Database Schema

```sql
-- Фильмы/Сериалы
movies (
  id, title, description, poster_url, backdrop_url,
  rating, year, duration, video_url,
  genres[], cast[], director,
  created_at, updated_at
)

-- Категории
categories (
  id, name, description, order
)

-- Связь фильмов и категорий
movie_categories (
  movie_id, category_id
)

-- Пользователи (из Telegram)
users (
  telegram_id, first_name, last_name, username,
  photo_url, is_premium, created_at
)

-- История просмотра
watch_history (
  user_id, movie_id, progress, last_watched_at
)

-- Избранное
favorites (
  user_id, movie_id, created_at
)
```

## 🔄 Поток данных

### Загрузка контента в Mini App

1. **Пользователь открывает приложение**
   - Mini App запрашивает `/api/movies/featured`
   - Получает главный фильм для Hero секции

2. **Загрузка каруселей**
   - Запрос `/api/categories` - список категорий
   - Для каждой категории: `/api/movies?category=id`
   - Кэширование в localStorage

3. **Детальная страница**
   - Запрос `/api/movies/:id` - полная информация
   - Запрос `/api/movies/:id/similar` - похожие фильмы

4. **Поиск**
   - Запрос `/api/movies/search?q=query`
   - Debounce для оптимизации

### Админ-панель

1. **Авторизация админа**
   - Логин/пароль или Telegram OAuth
   - JWT токен для сессии

2. **Управление контентом**
   - CRUD операции для фильмов
   - Загрузка постеров/backdrop
   - Загрузка видео файлов
   - Управление категориями

3. **Аналитика**
   - Просмотры фильмов
   - Популярный контент
   - Статистика пользователей

## 🚀 Деплой

### Backend API
- **Vercel** (Serverless Functions)
- **Railway** (простой деплой)
- **DigitalOcean** (VPS)
- **AWS/GCP** (для масштаба)

### Admin Panel
- **Vercel** (отдельный проект)
- **Netlify**
- **Отдельный поддомен**: `admin.darkcase.app`

### Database
- **Supabase** (PostgreSQL + Auth)
- **PlanetScale** (MySQL)
- **MongoDB Atlas**
- **Railway** (PostgreSQL)

### File Storage
- **Cloudflare R2** (S3-совместимый, дешевый)
- **AWS S3**
- **DigitalOcean Spaces**
- **Backblaze B2**

## 📝 Следующие шаги

1. ✅ Создать структуру API сервиса
2. ✅ Создать API клиент для Mini App
3. ✅ Создать структуру админ-панели
4. ✅ Настроить базу данных
5. ✅ Интегрировать загрузку файлов

