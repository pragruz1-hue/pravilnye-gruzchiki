Пакет 3D-калькулятора грузоперевозок

Главные файлы:

1) gruzoperevozki.html
   Основная страница сайта с установленным калькулятором.
   Блок калькулятора находится по якорю:
   gruzoperevozki.html#cargo-visual-calculator

2) css/10-cargo-visual-calculator.css
   Стили нового glassmorphism/3D калькулятора.

3) js/modules/cargo.js
   Логика калькулятора: расчёт, паллеты, перетаскивание по кузову, поворот R, удаление Delete, стоимость.

4) ultra-cargo-calculator-preview.html
   Отдельный preview-файл для быстрого просмотра без запуска Vite.

5) ultra-cargo-calculator-mockup.svg
   Схематичная картинка, как выглядит калькулятор.

Как проверить локально:

Вариант 1 — открыть preview:
ultra-cargo-calculator-preview.html

Вариант 2 — запустить сайт:
npm install
npm run dev

И открыть:
http://localhost:5173/gruzoperevozki.html#cargo-visual-calculator
