# Скачивание шрифтов для self-hosting

## Способ 1: Google Fonts (вручную)

1. Откройте в браузере: https://fonts.google.com/specimen/Inter
2. Нажмите "Download family" → скачайте .zip
3. Распакуйте, найдите woff2-файлы с кириллицей
4. Скопируйте в `assets/fonts/`

## Способ 2: Google Webfonts Helper (рекомендуется)

1. Откройте: https://gwfh.mranftl.com/fonts
2. Выберите Inter (300, 400, 500, 600, 700) + Montserrat (400, 600, 700, 800)
3. Выберите only: cyrillic, latin
4. Скачайте zip-архив
5. Распакуйте woff2-файлы в `assets/fonts/`

## Способ 3: Fontsource CDN (скачать через браузер по ссылкам)

Inter cyrillic:
https://cdn.jsdelivr.net/npm/@fontsource/inter@5.1.0/files/inter-cyrillic-400-normal.woff2
https://cdn.jsdelivr.net/npm/@fontsource/inter@5.1.0/files/inter-cyrillic-500-normal.woff2
https://cdn.jsdelivr.net/npm/@fontsource/inter@5.1.0/files/inter-cyrillic-600-normal.woff2
https://cdn.jsdelivr.net/npm/@fontsource/inter@5.1.0/files/inter-cyrillic-700-normal.woff2
https://cdn.jsdelivr.net/npm/@fontsource/inter@5.1.0/files/inter-latin-400-normal.woff2
https://cdn.jsdelivr.net/npm/@fontsource/inter@5.1.0/files/inter-latin-500-normal.woff2
https://cdn.jsdelivr.net/npm/@fontsource/inter@5.1.0/files/inter-latin-600-normal.woff2
https://cdn.jsdelivr.net/npm/@fontsource/inter@5.1.0/files/inter-latin-700-normal.woff2

Montserrat cyrillic:
https://cdn.jsdelivr.net/npm/@fontsource/montserrat@5.1.0/files/montserrat-cyrillic-400-normal.woff2
https://cdn.jsdelivr.net/npm/@fontsource/montserrat@5.1.0/files/montserrat-cyrillic-600-normal.woff2
https://cdn.jsdelivr.net/npm/@fontsource/montserrat@5.1.0/files/montserrat-cyrillic-700-normal.woff2
https://cdn.jsdelivr.net/npm/@fontsource/montserrat@5.1.0/files/montserrat-cyrillic-800-normal.woff2
https://cdn.jsdelivr.net/npm/@fontsource/montserrat@5.1.0/files/montserrat-latin-400-normal.woff2
https://cdn.jsdelivr.net/npm/@fontsource/montserrat@5.1.0/files/montserrat-latin-600-normal.woff2
https://cdn.jsdelivr.net/npm/@fontsource/montserrat@5.1.0/files/montserrat-latin-700-normal.woff2
https://cdn.jsdelivr.net/npm/@fontsource/montserrat@5.1.0/files/montserrat-latin-800-normal.woff2

## После скачивания

Переименуйте файлы в соответствии с именами из `css/00-fonts.css`:
- `inter-cyrillic-{weight}.woff2` и `inter-latin-{weight}.woff2`
- `montserrat-cyrillic-{weight}.woff2` и `montserrat-latin-{weight}.woff2`

Затем в `css/00-fonts.css` замените `src: url(https://fonts.gstatic.com/...)` на `src: url(\"../assets/fonts/имя-файла.woff2\")` и удалите `unicode-range`.