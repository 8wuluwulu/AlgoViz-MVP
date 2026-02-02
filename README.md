# AlgoViz-MVP
Web-based algorithm visualization platform for educational purposes

# ЗАПУСК
Быстрый запуск (3 шага)
Шаг 1: Клонирование репозитория
bash
git clone https://github.com/ваш-юзер/AlgoViz-MVP.git
cd AlgoViz-MVP

Шаг 2: Запуск Backend API (если через vs code или подобную штуку)
cd src/AlgoViz.Api
dotnet restore
dotnet run
Ожидаемый результат:
info: Microsoft.Hosting.Lifetime
      Now listening on: http://localhost:5233 (или любой порт)
info: Microsoft.Hosting.Lifetime
      Application started. Press Ctrl+C to shut down.
Swagger UI: http://localhost:ПОРТ/swagger - ссылка по которой переходить для проверки API

Шаг 3: Открытие Frontend
После того как запустили API нужно открыть index.html в браузере. 
