# API Структура для DarkCase

## 🔗 Базовый URL

```
Production: https://api.darkcase.app
Development: http://localhost:3001
```

## 📋 Endpoints

### Публичные (без авторизации)

#### Фильмы

```
GET /api/movies
  - Получить список фильмов
  - Query params: ?page=1&limit=20&category=id&genre=name&search=query

GET /api/movies/featured
  - Получить главный фильм для Hero секции

GET /api/movies/:id
  - Получить детальную информацию о фильме

GET /api/movies/:id/similar
  - Получить похожие фильмы
```

#### Категории

```
GET /api/categories
  - Получить все категории

GET /api/categories/:id/movies
  - Получить фильмы категории
```

#### Поиск

```
GET /api/search?q=query
  - Поиск фильмов по названию/описанию
```

### Защищенные (требуют Telegram auth)

#### Пользователь

```
GET /api/users/me
  - Получить текущего пользователя
  - Headers: Authorization: Bearer {telegram_init_data}
```

#### История просмотра

```
GET /api/users/me/history
  - Получить историю просмотра

POST /api/users/me/history
  - Сохранить прогресс просмотра
  - Body: { movieId, progress }
```

#### Избранное

```
GET /api/users/me/favorites
  - Получить избранное

POST /api/users/me/favorites
  - Добавить в избранное
  - Body: { movieId }

DELETE /api/users/me/favorites/:movieId
  - Удалить из избранного
```

### Админ (требуют JWT)

#### Фильмы (CRUD)

```
GET /api/admin/movies
POST /api/admin/movies
GET /api/admin/movies/:id
PUT /api/admin/movies/:id
DELETE /api/admin/movies/:id
```

#### Категории (CRUD)

```
GET /api/admin/categories
POST /api/admin/categories
PUT /api/admin/categories/:id
DELETE /api/admin/categories/:id
```

#### Загрузка файлов

```
POST /api/admin/upload/poster
POST /api/admin/upload/backdrop
POST /api/admin/upload/video
```

## 🔐 Авторизация

### Telegram Mini App
Использует `initData` от Telegram WebApp:
```
Authorization: Bearer {telegram_init_data}
```

### Admin Panel
JWT токен после логина:
```
Authorization: Bearer {jwt_token}
```

## 📦 Примеры запросов

### Получить главный фильм
```javascript
GET /api/movies/featured

Response:
{
  "id": "1",
  "title": "The Dark Knight",
  "description": "...",
  "poster": "https://cdn.darkcase.app/posters/1.jpg",
  "backdrop": "https://cdn.darkcase.app/backdrops/1.jpg",
  "rating": 9.0,
  "year": 2008,
  "duration": "152 min",
  "genres": ["Action", "Crime", "Drama"],
  "cast": ["Christian Bale", "Heath Ledger"],
  "director": "Christopher Nolan",
  "videoUrl": "https://cdn.darkcase.app/videos/1.mp4"
}
```

### Получить категории
```javascript
GET /api/categories

Response:
[
  {
    "id": "trending",
    "name": "Trending Now",
    "movies": [...]
  },
  {
    "id": "action",
    "name": "Action & Adventure",
    "movies": [...]
  }
]
```

### Поиск
```javascript
GET /api/search?q=batman

Response:
{
  "results": [
    {
      "id": "1",
      "title": "The Dark Knight",
      "poster": "...",
      "year": 2008
    }
  ],
  "total": 1
}
```

