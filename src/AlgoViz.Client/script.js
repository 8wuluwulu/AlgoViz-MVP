// ВАЖНО: Тебе нужно заменить порт 5000 на тот, на котором запускается твой ASP.NET Core API!
// Увидеть свой порт можно в терминале после команды dotnet run
const API_BASE_URL = 'http://localhost:5233'; 

const container = document.getElementById('visualization-container');
const startBtn = document.getElementById('start-btn');
const statusText = document.getElementById('status-text');

// Генерируем случайный массив
const arraySize = 5;
let initialArray = Array.from({length: arraySize}, () => Math.floor(Math.random() * 100) + 10);

// Отрисовка массива на экране
function renderArray(array, comparedIndices = [], swappedIndices = []) {
    container.innerHTML = ''; // Очищаем контейнер
    
    // Находим максимальное значение для вычисления процентов высоты столбиков
    const maxVal = Math.max(...array);

    array.forEach((value, index) => {
        const bar = document.createElement('div');
        bar.classList.add('bar');
        
        // Вычисляем высоту в процентах относительно максимального элемента
        const heightPercent = (value / maxVal) * 100;
        bar.style.height = `${heightPercent}%`;

        // Раскрашиваем столбики в зависимости от действия
        if (swappedIndices.includes(index)) {
            bar.classList.add('swapped');
        } else if (comparedIndices.includes(index)) {
            bar.classList.add('compared');
        }

        container.appendChild(bar);
    });
}

// Задержка для анимации
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function startSorting() {
    startBtn.disabled = true;
    
    try {
        statusText.innerText = "Запрос шагов у бэкенда...";
        
        // Формируем строку запроса (передаем массив в URL)
        const queryString = initialArray.map(n => `array=${n}`).join('&');
        const url = `${API_BASE_URL}/api/algorithms/bubble-sort?${queryString}`;

        // Делаем HTTP запрос к твоему C# контроллеру
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const steps = await response.json();
        
        statusText.innerText = "Анимация...";
        
        // Воспроизводим шаги
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            statusText.innerText = step.description; // Выводим описание шага из C#
            
            renderArray(step.array, step.comparedIndices, step.swappedIndices);
            
            // Ждем 300мс перед следующим шагом
            await sleep(300);
        }
        
        statusText.innerText = "Сортировка завершена!";
        // Перекрашиваем все в зеленый в конце
        Array.from(container.children).forEach(bar => {
            bar.className = 'bar sorted';
        });

    } catch (error) {
        statusText.innerText = `Ошибка соединения с API: ${error.message}`;
        console.error(error);
    } finally {
        startBtn.disabled = false;
        // Генерируем новый массив для следующего запуска
        initialArray = Array.from({length: arraySize}, () => Math.floor(Math.random() * 100) + 10);
    }
}

// Первоначальная отрисовка
renderArray(initialArray);

// Привязка события к кнопке
startBtn.addEventListener('click', startSorting);