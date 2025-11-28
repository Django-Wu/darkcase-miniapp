# Оптимизация Bundle Size

## Реализованные оптимизации

### 1. Code Splitting (Разделение кода)
- ✅ Все страницы загружаются лениво (lazy loading)
- ✅ Каждая страница загружается только при переходе на неё
- ✅ Используется `React.lazy()` и `Suspense` для плавной загрузки

### 2. Chunk Splitting (Разделение chunks)
- ✅ React и React DOM вынесены в отдельный vendor chunk
- ✅ React Router вынесен в vendor chunk
- ✅ React Window вынесен в отдельный UI vendor chunk
- ✅ Store вынесен в отдельный chunk

### 3. Оптимизация Vite конфигурации
- ✅ Минификация через esbuild (быстрее чем terser)
- ✅ CSS минификация включена
- ✅ Sourcemaps отключены в production
- ✅ Оптимизированы имена файлов с хешами

### 4. Lazy Loading данных
- ✅ Mock данные загружаются динамически только при необходимости
- ✅ Видео утилиты загружаются по требованию

### 5. Bundle Analysis
- ✅ Установлен `rollup-plugin-visualizer`
- ✅ После сборки создается `dist/stats.html` с визуализацией bundle

## Как использовать

### Анализ bundle size

После сборки проекта:
```bash
npm run build
```

Откройте `dist/stats.html` в браузере для визуализации размера bundle.

### Проверка размера chunks

```bash
npm run build
ls -lh dist/assets/js/
```

## Ожидаемые результаты

- **Initial bundle**: ~200-300 KB (gzipped)
- **Route chunks**: ~50-100 KB каждый (gzipped)
- **Vendor chunks**: ~150-200 KB (gzipped)

## Дополнительные рекомендации

1. **Используйте динамические импорты** для больших библиотек
2. **Избегайте barrel exports** (index.ts с реэкспортами)
3. **Используйте tree shaking** - импортируйте только нужные функции
4. **Оптимизируйте изображения** - используйте WebP, lazy loading
5. **Минифицируйте CSS** - уже включено в конфигурации

## Мониторинг

Регулярно проверяйте размер bundle после добавления новых зависимостей:
```bash
npm run build
# Откройте dist/stats.html
```

