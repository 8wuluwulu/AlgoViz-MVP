// ВАЖНО: Проверь свой порт, он должен совпадать с тем, что в script.js
const API_BASE_URL = 'http://localhost:5233'; 

// --- DOM ЭЛЕМЕНТЫ ---
const sizeSlider = document.getElementById('sizeSlider');
const sizeValue = document.getElementById('sizeValue');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
const startRaceBtn = document.getElementById('start-race-btn');
const raceStatus = document.getElementById('race-status');

// Левый участник
const algoLeftSelect = document.getElementById('algo-left');
const vizLeft = document.getElementById('viz-left');
const statusLeft = document.getElementById('status-left');

// Правый участник
const algoRightSelect = document.getElementById('algo-right');
const vizRight = document.getElementById('viz-right');
const statusRight = document.getElementById('status-right');

let sharedArray = []; // Общий массив для честной гонки

// Генерируем новый массив
function generateNewArray(size) {
    return Array.from({length: size}, () => Math.floor(Math.random() * 100) + 10);
}

// Универсальная функция отрисовки (принимает контейнер, чтобы знать, куда рисовать)
function renderArray(container, array, comparedIndices = [], swappedIndices = []) {
    container.innerHTML = '';
    const maxVal = Math.max(...array);

    array.forEach((value, index) => {
        const bar = document.createElement('div');
        bar.classList.add('bar');
        bar.style.height = `${(value / maxVal) * 100}%`;

        if (swappedIndices.includes(index)) {
            bar.classList.add('swapped');
        } else if (comparedIndices.includes(index)) {
            bar.classList.add('compared');
        }

        container.appendChild(bar);
    });
}

// Обновление интерфейса при изменении ползунков
sizeSlider.addEventListener('input', (e) => {
    const newSize = parseInt(e.target.value);
    sizeValue.innerText = newSize;
    sharedArray = generateNewArray(newSize);
    
    // Рисуем один и тот же массив на обоих экранах
    renderArray(vizLeft, sharedArray);
    renderArray(vizRight, sharedArray);
    
    raceStatus.innerText = "Массив обновлен. Готовы к гонке!";
    statusLeft.innerText = "Ожидание...";
    statusRight.innerText = "Ожидание...";
});

speedSlider.addEventListener('input', (e) => {
    speedValue.innerText = e.target.value;
});

// Инициализация при загрузке страницы
sharedArray = generateNewArray(parseInt(sizeSlider.value));
renderArray(vizLeft, sharedArray);
renderArray(vizRight, sharedArray);

// --- ГЛАВНАЯ ЛОГИКА ГОНКИ ---

async function startRace() {
    // Блокируем управление
    startRaceBtn.disabled = true;
    sizeSlider.disabled = true;
    algoLeftSelect.disabled = true;
    algoRightSelect.disabled = true;

    raceStatus.innerText = "Запрашиваем данные у сервера...";

    const algoLeft = algoLeftSelect.value;
    const algoRight = algoRightSelect.value;
    
    // Формируем одинаковый запрос для обоих
    const queryString = sharedArray.map(n => `array=${n}`).join('&');

    try {
        // МАГИЯ ПАРАЛЛЕЛЬНОСТИ: Ждем ответа сразу от двух запросов к C#
        const [resLeft, resRight] = await Promise.all([
            fetch(`${API_BASE_URL}/api/algorithms/${algoLeft}?${queryString}`),
            fetch(`${API_BASE_URL}/api/algorithms/${algoRight}?${queryString}`)
        ]);

        if (!resLeft.ok || !resRight.ok) throw new Error("Ошибка при получении данных");

        const stepsLeft = await resLeft.json();
        const stepsRight = await resRight.json();

        raceStatus.innerText = "Гонка началась! 🏎️💨";

        // Переменная для определения первого финишировавшего
        let isWinnerFound = false;

        // Создаем независимую "машину состояний" для каждого участника
        function runRacer(steps, container, statusEl, algoName) {
            return new Promise((resolve) => {
                let currentStep = 0;
                const speed = parseInt(speedSlider.value);

                function nextFrame() {
                    if (currentStep >= steps.length) {
                        Array.from(container.children).forEach(bar => bar.className = 'bar sorted');
                        statusEl.innerText = `🏁 Финиш! (${steps.length} шагов)`;
                        resolve(algoName); // Алгоритм закончил работу
                        return;
                    }

                    const step = steps[currentStep];
                    renderArray(container, step.array, step.comparedIndices, step.swappedIndices);
                    statusEl.innerText = `Шаг ${currentStep + 1}/${steps.length}`;

                    currentStep++;
                    setTimeout(nextFrame, speed);
                }

                nextFrame();
            });
        }

        // Запускаем обоих бегунов
        const nameLeft = algoLeftSelect.options[algoLeftSelect.selectedIndex].text;
        const nameRight = algoRightSelect.options[algoRightSelect.selectedIndex].text;

        const leftRace = runRacer(stepsLeft, vizLeft, statusLeft, nameLeft);
        const rightRace = runRacer(stepsRight, vizRight, statusRight, nameRight);

        // Кто первый закончит свой Promise, тот и победитель
        leftRace.then(name => {
            if (!isWinnerFound) {
                isWinnerFound = true;
                raceStatus.innerText = `🏆 Победитель: ${name}!`;
            }
        });

        rightRace.then(name => {
            if (!isWinnerFound) {
                isWinnerFound = true;
                raceStatus.innerText = `🏆 Победитель: ${name}!`;
            }
        });

        // Ждем, пока оба закончат, чтобы разблокировать кнопку старта
        await Promise.all([leftRace, rightRace]);

    } catch (error) {
        raceStatus.innerText = `Ошибка: ${error.message}`;
        console.error(error);
    } finally {
        startRaceBtn.disabled = false;
        sizeSlider.disabled = false;
        algoLeftSelect.disabled = false;
        algoRightSelect.disabled = false;
        
        // Генерируем новый массив для следующего раунда
        sharedArray = generateNewArray(parseInt(sizeSlider.value));
    }
}

startRaceBtn.addEventListener('click', startRace);