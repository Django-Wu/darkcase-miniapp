# Админ-панель DarkCase

## 🎯 Концепция

**Отдельное веб-приложение** для управления контентом.

## 📁 Структура проекта

```
darkcase-admin/
├── src/
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Movies/
│   │   │   ├── List.tsx
│   │   │   ├── Create.tsx
│   │   │   └── Edit.tsx
│   │   ├── Categories/
│   │   │   ├── List.tsx
│   │   │   └── Create.tsx
│   │   └── Analytics.tsx
│   ├── components/
│   │   ├── MovieForm.tsx
│   │   ├── FileUpload.tsx
│   │   └── DataTable.tsx
│   ├── api/
│   │   └── client.ts
│   └── App.tsx
└── package.json
```

## 🎨 Основные экраны

### 1. Dashboard
- Статистика (количество фильмов, просмотры)
- Последние добавленные фильмы
- Популярный контент

### 2. Управление фильмами
- **Список фильмов** (таблица с поиском/фильтрами)
- **Создание фильма** (форма с полями)
- **Редактирование фильма**
- **Удаление фильма**

### 3. Управление категориями
- Список категорий
- Создание/редактирование категорий
- Привязка фильмов к категориям

### 4. Загрузка медиа
- Загрузка постеров
- Загрузка backdrop изображений
- Загрузка видео файлов
- Превью загруженных файлов

### 5. Аналитика
- Графики просмотров
- Популярные фильмы
- Статистика пользователей

## 🔧 Технологии

- **React** + **TypeScript**
- **React Router** (навигация)
- **React Query** (API запросы)
- **React Hook Form** (формы)
- **Tailwind CSS** (стилизация)
- **Recharts** (графики)

## 📝 Форма создания фильма

```typescript
interface MovieForm {
  title: string
  description: string
  year: number
  duration: string
  rating: number
  genres: string[]
  cast: string[]
  director: string
  poster: File | string
  backdrop: File | string
  videoUrl: string
  categories: string[]
}
```

## 🚀 Деплой

- **Отдельный проект** на Vercel
- **URL**: `admin.darkcase.app`
- **Авторизация**: JWT токен
- **Защита**: Только для админов

## 🔐 Безопасность

1. **Авторизация админов**
   - Логин/пароль или Telegram OAuth
   - JWT токен в localStorage

2. **Валидация данных**
   - Проверка на сервере
   - Проверка на клиенте

3. **Загрузка файлов**
   - Ограничение размера
   - Проверка типа файла
   - Сканирование на вирусы (опционально)

