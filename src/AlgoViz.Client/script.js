const API_URL = 'http://localhost:5233/api/algorithms/bubble-sort';

async function runSort() {
    const input = document.getElementById('arrayInput').value;
    const array = input.split(',').map(num => parseInt(num.trim()));

    if (array.some(isNaN)) {
        alert('Введите корректные числа!');
        return;
    }

    // Отключаем кнопку
    document.getElementById('runButton').disabled = true;

    try {
        // Запрос к API
        const response = await fetch(`${API_URL}?${array.map(n => `array=${n}`).join('&')}`);
        const steps = await response.json();

        // Показываем шаги
        for (let step of steps) {
            await visualizeStep(step);
            await sleep(800);
        }

        document.getElementById('stepDescription').textContent = '✅ Сортировка завершена!';

    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка подключения к API. Убедитесь что сервер запущен на localhost:5233');
    } finally {
        document.getElementById('runButton').disabled = false;
    }
}

function visualizeStep(step) {
    const container = document.getElementById('visualization');
    const description = document.getElementById('stepDescription');

    // Описание шага
    description.textContent = `Шаг ${step.stepNumber}: ${step.description}`;

    // Очищаем контейнер
    container.innerHTML = '';

    // Создаём блоки для каждого элемента
    step.array.forEach((value, index) => {
        const item = document.createElement('div');
        item.className = 'array-item';
        item.textContent = value;

        // Подсветка сравниваемых
        if (step.comparedIndices.includes(index)) {
            item.classList.add('compared');
        }

        // Подсветка обменянных
        if (step.swappedIndices.includes(index)) {
            item.classList.add('swapped');
        }

        container.appendChild(item);
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
