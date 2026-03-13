const API_BASE_URL = 'http://localhost:5233'; 

// DOM Элементы
const container = document.getElementById('visualization-container');
const startBtn = document.getElementById('start-btn');
const statusText = document.getElementById('status-text');
const algorithmSelect = document.getElementById('algorithmSelect');

// Элементы ползунков
const sizeSlider = document.getElementById('sizeSlider');
const sizeValue = document.getElementById('sizeValue');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
const elCountDisplay = document.getElementById('el-count');

// Элементы информации
const algoTitle = document.getElementById('algo-title');
const algoDesc = document.getElementById('algo-desc');
const timeComplexity = document.getElementById('time-complexity');
const spaceComplexity = document.getElementById('space-complexity');
const codeBlock = document.getElementById('code-block');

// Код алгоритмов для отображения на экране
const algorithmCodes = {
    bubble: [
        "for (int i = 0; i < arr.Length - 1; i++)",
        "  for (int j = 0; j < arr.Length - i - 1; j++)",
        "    if (arr[j] > arr[j + 1])",
        "      Swap(ref arr[j], ref arr[j + 1]);"
    ],
    selection: [
        "for (int i = 0; i < arr.Length - 1; i++)",
        "  int minIndex = i;",
        "  for (int j = i + 1; j < arr.Length; j++)",
        "    if (arr[j] < arr[minIndex]) minIndex = j;",
        "  if (minIndex != i) Swap(ref arr[i], ref arr[minIndex]);"
    ],
    quick: [
        "int pivot = arr[right];",
        "for (int j = left; j < right; j++)",
        "  if (arr[j] <= pivot)",
        "    Swap(ref arr[i], ref arr[j]);",
        "Swap(ref arr[i + 1], ref arr[right]); // Опорный на место"
    ],
    merge: [
        "int middle = left + (right - left) / 2;",
        "MergeSort(arr, left, middle);",
        "MergeSort(arr, middle + 1, right);",
        "if (temp[iLeft] <= temp[iRight])",
        "  arr[current] = temp[iLeft];",
        "else arr[current] = temp[iRight];"
    ]
};



// Словарь информации об алгоритмах
const algorithmInfo = {
    bubble: {
        title: "Сортировка пузырьком",
        desc: "Проходит по массиву и меняет местами соседние элементы, если они стоят в неправильном порядке. Самый простой, но медленный алгоритм.",
        time: "O(n²)",
        space: "O(1)"
    },
    selection: {
        title: "Сортировка выбором",
        desc: "Ищет минимальный элемент в неотсортированной части массива и меняет его местами с первым неотсортированным элементом.",
        time: "O(n²)",
        space: "O(1)"
    },
    quick: {
        title: "Быстрая сортировка",
        desc: "Выбирает 'опорный' элемент, переносит всё, что меньше него, влево, а что больше — вправо. Затем рекурсивно повторяет процесс.",
        time: "O(n log n)",
        space: "O(log n)"
    },
    merge: {
        title: "Сортировка слиянием",
        desc: "Рекурсивно делит массив пополам вплоть до единичных элементов, а затем сливает их обратно в правильном порядке, используя дополнительную память.",
        time: "O(n log n)",
        space: "O(n)"
    }
};

let initialArray = [];

// Функция генерации массива
function generateNewArray(size) {
    return Array.from({length: size}, () => Math.floor(Math.random() * 100) + 10);
}

// Обновление интерфейса при смене алгоритма
function updateAlgorithmInfo() {
    const selected = algorithmSelect.value;
    const info = algorithmInfo[selected];
    
    algoTitle.innerText = info.title;
    algoDesc.innerText = info.desc;
    timeComplexity.innerText = info.time;
    spaceComplexity.innerText = info.space;

    // НОВОЕ: Отрисовка строк кода
    codeBlock.innerHTML = '';
    const codeLines = algorithmCodes[selected];
    codeLines.forEach((line, index) => {
        const lineDiv = document.createElement('div');
        lineDiv.className = 'code-line';
        lineDiv.id = `code-line-${index}`;
        lineDiv.innerText = line;
        codeBlock.appendChild(lineDiv);
    });
}

// Отрисовка массива
function renderArray(array, comparedIndices = [], swappedIndices = []) {
    container.innerHTML = '';
    const maxVal = Math.max(...array);

    array.forEach((value, index) => {
        const bar = document.createElement('div');
        bar.classList.add('bar');
        
        const heightPercent = (value / maxVal) * 100;
        bar.style.height = `${heightPercent}%`;

        if (swappedIndices.includes(index)) {
            bar.classList.add('swapped');
        } else if (comparedIndices.includes(index)) {
            bar.classList.add('compared');
        }

        container.appendChild(bar);
    });
}

// Слушатели событий интерфейса
algorithmSelect.addEventListener('change', updateAlgorithmInfo);

sizeSlider.addEventListener('input', (e) => {
    const newSize = parseInt(e.target.value);
    sizeValue.innerText = newSize;
    elCountDisplay.innerText = newSize;
    
    initialArray = generateNewArray(newSize);
    renderArray(initialArray);
    statusText.innerText = "Выберите настройки и запустите алгоритм";
});

speedSlider.addEventListener('input', (e) => {
    speedValue.innerText = e.target.value;
});

// Задержка
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Главная функция запуска
// --- НОВЫЕ ПЕРЕМЕННЫЕ ДЛЯ ПЛЕЕРА ---
let algorithmSteps = [];     // Здесь будем хранить все шаги, полученные с бэкенда
let currentStepIndex = 0;    // Текущий кадр анимации
let isPlaying = false;       // Флаг: играет или на паузе
let animationTimeout = null; // Таймер анимации, чтобы мы могли его остановить

// Элементы кнопок плеера
const btnPrev = document.getElementById('btn-prev');
const btnPlayPause = document.getElementById('btn-play-pause');
const btnNext = document.getElementById('btn-next');

// Функция: Обновить состояние кнопок
function updatePlayerButtons() {
    // Включаем/выключаем кнопки в зависимости от текущего кадра
    btnPrev.disabled = currentStepIndex <= 0;
    btnNext.disabled = currentStepIndex >= algorithmSteps.length - 1;
    btnPlayPause.disabled = algorithmSteps.length === 0;
    
    // Меняем текст кнопки Play/Pause
    btnPlayPause.innerText = isPlaying ? "⏸ Пауза" : "▶ Пуск";
}

// Функция: Отрисовать конкретный кадр
function drawCurrentStep() {
    if (algorithmSteps.length === 0) return;
    
    const step = algorithmSteps[currentStepIndex];
    statusText.innerText = `Шаг ${currentStepIndex + 1}/${algorithmSteps.length}: ${step.description}`;
    renderArray(step.array, step.comparedIndices, step.swappedIndices);
    
    // --- НОВОЕ: ИГРАЕМ ЗВУК ---
    const maxVal = Math.max(...step.array);
    
    // Если есть обмен, играем звук обмениваемых элементов
    if (step.swappedIndices.length > 0) {
        step.swappedIndices.forEach(index => playNote(step.array[index], maxVal));
    } 
    // Иначе играем звук сравниваемых
    else if (step.comparedIndices.length > 0) {
        step.comparedIndices.forEach(index => playNote(step.array[index], maxVal));
    }

    document.querySelectorAll('.code-line').forEach(el => el.classList.remove('active'));
    
    // Добавляем подсветку текущей строке (если бэкенд прислал её номер)
    if (step.activeLine !== undefined) {
        const activeLineElement = document.getElementById(`code-line-${step.activeLine}`);
        if (activeLineElement) {
            activeLineElement.classList.add('active');
        }
    }
    
    updatePlayerButtons();
}

// Функция: Цикл анимации
function playAnimation() {
    if (!isPlaying) return; // Если нажали паузу, останавливаем цикл
    
    if (currentStepIndex >= algorithmSteps.length - 1) {
        // Дошли до конца
        isPlaying = false;
        statusText.innerText = "Сортировка успешно завершена!";
        Array.from(container.children).forEach(bar => bar.className = 'bar sorted');
        updatePlayerButtons();

        sizeSlider.disabled = false;

        return;
    }

    currentStepIndex++;
    drawCurrentStep();

    // Запускаем следующий кадр с учетом ползунка скорости
    const currentSpeed = parseInt(speedSlider.value);
    animationTimeout = setTimeout(playAnimation, currentSpeed);
}

// --- ОБРАБОТЧИКИ КНОПОК ПЛЕЕРА ---

btnPlayPause.addEventListener('click', () => {
    isPlaying = !isPlaying; // Переключаем состояние
    
    if (isPlaying) {
        // Если дошли до конца и нажали Play - начинаем заново
        if (currentStepIndex >= algorithmSteps.length - 1) {
            currentStepIndex = 0;
        }
        playAnimation();
    } else {
        clearTimeout(animationTimeout); // Физически останавливаем таймер
    }
    updatePlayerButtons();
});

btnNext.addEventListener('click', () => {
    if (currentStepIndex < algorithmSteps.length - 1) {
        currentStepIndex++;
        drawCurrentStep();
    }
});

btnPrev.addEventListener('click', () => {
    if (currentStepIndex > 0) {
        currentStepIndex--;
        drawCurrentStep();
    }
});

// --- ГЛАВНАЯ ФУНКЦИЯ ЗАПРОСА К СЕРВЕРУ ---
async function startSorting() {
    // Блокируем настройки на время работы
    startBtn.disabled = true;
    algorithmSelect.disabled = true;
    sizeSlider.disabled = true;
    
    // Сбрасываем плеер
    isPlaying = false;
    clearTimeout(animationTimeout);
    currentStepIndex = 0;
    algorithmSteps = [];
    
    try {
        statusText.innerText = "Генерируем математику на сервере...";
        
        const selectedAlgorithm = algorithmSelect.value;
        const queryString = initialArray.map(n => `array=${n}`).join('&');
        const url = `${API_BASE_URL}/api/algorithms/${selectedAlgorithm}?${queryString}`;

        const response = await fetch(url);
        
        if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);

        // Сохраняем все шаги в нашу глобальную переменную
        algorithmSteps = await response.json();
        
        statusText.innerText = `Получено ${algorithmSteps.length} шагов. Нажмите ▶ Пуск!`;
        
        // Отрисовываем первый (нулевой) кадр и включаем кнопки
        drawCurrentStep();
        updatePlayerButtons();
        
        // Опционально: можно сразу запустить анимацию, чтобы пользователю не приходилось жать Play
        isPlaying = true;
        playAnimation();

    } catch (error) {
        statusText.innerText = `Ошибка: ${error.message}`;
        console.error(error);
    } finally {
        startBtn.disabled = false;
        algorithmSelect.disabled = false;
        // Мы НЕ разблокируем sizeSlider здесь, чтобы во время паузы нельзя было сменить размер массива
    }
}

// Инициализация при загрузке страницы (эти строки оставляем из старого кода)
updateAlgorithmInfo();
initialArray = generateNewArray(parseInt(sizeSlider.value));
elCountDisplay.innerText = sizeSlider.value;
renderArray(initialArray);
startBtn.addEventListener('click', startSorting);

// НОВОЕ: Разблокировка ползунка при ручном изменении
sizeSlider.addEventListener('change', () => {
    // Сбрасываем плеер если пользователь решил сменить размер массива
    isPlaying = false;
    clearTimeout(animationTimeout);
    algorithmSteps = [];
    currentStepIndex = 0;
    updatePlayerButtons();
});

// --- ЛОГИКА ДАШБОРДА (ИСТОРИЯ ИЗ БД) ---

const btnHistory = document.getElementById('btn-history');
const historyModal = document.getElementById('history-modal');
const closeHistoryBtn = document.getElementById('close-history');
const historyTbody = document.getElementById('history-tbody');

// Открыть окно и загрузить данные
btnHistory.addEventListener('click', async () => {
    historyModal.style.display = 'block';
    historyTbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Загрузка данных из БД...</td></tr>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/algorithms/history`);
        if (!response.ok) throw new Error('Ошибка при загрузке истории');
        
        const historyData = await response.json();
        
        // Очищаем таблицу
        historyTbody.innerHTML = '';
        
        if (historyData.length === 0) {
            historyTbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">История пока пуста</td></tr>';
            return;
        }

        // Рисуем строки
        historyData.forEach(run => {
            // Форматируем дату в удобный вид
            const date = new Date(run.createdAt).toLocaleString('ru-RU');
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${run.id}</td>
                <td style="color: var(--accent);">${run.algorithmName}</td>
                <td>${run.arraySize}</td>
                <td>${run.stepsCount}</td>
                <td style="color: #8b929a;">${date}</td>
            `;
            historyTbody.appendChild(tr);
        });
        
    } catch (error) {
        historyTbody.innerHTML = `<tr><td colspan="5" style="color: #ff4081; text-align: center;">${error.message}</td></tr>`;
    }
});

// Закрыть окно при клике на крестик
closeHistoryBtn.addEventListener('click', () => {
    historyModal.style.display = 'none';
});

// Закрыть окно при клике мимо него
window.addEventListener('click', (event) => {
    if (event.target === historyModal) {
        historyModal.style.display = 'none';
    }
});

// --- АУДИО СИНТЕЗАТОР ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playNote(value, maxVal) {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume(); // Браузеры требуют активации звука по клику
    }
    
    // Переводим значение массива в частоту (от 200 Гц до 800 Гц)
    const minFreq = 200;
    const maxFreq = 800;
    const frequency = minFreq + (value / maxVal) * (maxFreq - minFreq);

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine'; // Тип волны: мягкий синус (можно поменять на 'triangle' или 'square')
    oscillator.frequency.value = frequency;

    // Делаем звук коротким и плавным (чтобы не было щелчков)
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1);
}

