/* ================================================================
   AlgoViz v2.0 — Modern SaaS Frontend
   Clean API / UI separation, all bug fixes, ghost bars, progress
   ================================================================ */

// ── API Layer ───────────────────────────────────────
const Api = {
    async fetchSteps(algorithm, array) {
        const query = array.map(n => `array=${n}`).join('&');
        const res = await fetch(`/api/algorithms/${algorithm}?${query}`);
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`HTTP ${res.status}: ${text}`);
        }
        return res.json();
    },

    async fetchHistory() {
        const res = await fetch('/api/algorithms/history');
        if (!res.ok) throw new Error('Ошибка при загрузке истории');
        return res.json();
    }
};

// ── Algorithm Metadata ──────────────────────────────
const ALGORITHMS = {
    bubble: {
        title: "Сортировка пузырьком",
        desc: "Проходит по массиву и меняет местами соседние элементы, если они стоят в неправильном порядке. Самый простой, но медленный алгоритм.",
        time: "O(n²)", space: "O(1)",
        code: [
            "for (int i = 0; i < arr.Length - 1; i++)",
            "  for (int j = 0; j < arr.Length - i - 1; j++)",
            "    if (arr[j] > arr[j + 1])",
            "      Swap(ref arr[j], ref arr[j + 1]);"
        ]
    },
    selection: {
        title: "Сортировка выбором",
        desc: "Ищет минимальный элемент в неотсортированной части и меняет его с первым неотсортированным элементом.",
        time: "O(n²)", space: "O(1)",
        code: [
            "for (int i = 0; i < arr.Length - 1; i++)",
            "  int minIndex = i;",
            "  for (int j = i + 1; j < arr.Length; j++)",
            "    if (arr[j] < arr[minIndex]) minIndex = j;",
            "  if (minIndex != i) Swap(ref arr[i], ref arr[minIndex]);"
        ]
    },
    quick: {
        title: "Быстрая сортировка",
        desc: "Выбирает 'опорный' элемент, переносит всё меньшее влево, а большее вправо. Затем рекурсивно повторяет.",
        time: "O(n log n)", space: "O(log n)",
        code: [
            "int pivot = arr[right];",
            "for (int j = left; j < right; j++)",
            "  if (arr[j] <= pivot)",
            "    Swap(ref arr[i], ref arr[j]);",
            "Swap(ref arr[i + 1], ref arr[right]);"
        ]
    },
    merge: {
        title: "Сортировка слиянием",
        desc: "Рекурсивно делит массив пополам, затем сливает обратно в правильном порядке, используя дополнительную память.",
        time: "O(n log n)", space: "O(n)",
        code: [
            "int mid = left + (right - left) / 2;",
            "MergeSort(arr, left, mid);",
            "MergeSort(arr, mid + 1, right);",
            "if (temp[iL] <= temp[iR])",
            "  arr[cur] = temp[iL];",
            "else arr[cur] = temp[iR];"
        ]
    }
};

// ── DOM References ──────────────────────────────────
const $ = id => document.getElementById(id);

const DOM = {
    container:      $('visualization-container'),
    startBtn:       $('start-btn'),
    statusText:     $('status-text'),
    algoSelect:     $('algorithmSelect'),
    sizeSlider:     $('sizeSlider'),
    sizeValue:      $('sizeValue'),
    speedSlider:    $('speedSlider'),
    speedValue:     $('speedValue'),
    elCount:        $('el-count'),
    algoTitle:      $('algo-title'),
    algoDesc:       $('algo-desc'),
    timeComp:       $('time-complexity'),
    spaceComp:      $('space-complexity'),
    codeBlock:      $('code-block'),
    lineNumbers:    $('line-numbers'),
    progressFill:   $('progress-fill'),
    stepCounter:    $('step-counter'),
    btnPrev:        $('btn-prev'),
    btnPlayPause:   $('btn-play-pause'),
    btnNext:        $('btn-next'),
    btnMute:        $('btn-mute'),
    btnHistory:     $('btn-history'),
    historyModal:   $('history-modal'),
    closeHistory:   $('close-history'),
    historyTbody:   $('history-tbody')
};

// ── State ───────────────────────────────────────────
let initialArray = [];
let algorithmSteps = [];
let currentStepIndex = 0;
let isPlaying = false;
let isFetching = false;
let isMuted = false;
let animationTimeout = null;
let barElements = [];
let audioCtx = null;

// ── Helpers ─────────────────────────────────────────
function generateArray(size) {
    return Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 10);
}

function safeMax(arr) {
    let max = 0;
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] > max) max = arr[i];
    }
    return max || 1;
}

// ── Bar Rendering (optimized DOM reuse) ─────────────
function ensureBars(count, ghost = false) {
    const current = barElements.length;

    if (current > count) {
        for (let i = current - 1; i >= count; i--) {
            DOM.container.removeChild(barElements[i]);
        }
        barElements.length = count;
    } else {
        for (let i = current; i < count; i++) {
            const bar = document.createElement('div');
            bar.className = ghost ? 'bar ghost' : 'bar';
            DOM.container.appendChild(bar);
            barElements.push(bar);
        }
    }
}

function renderArray(array, compared = [], swapped = []) {
    ensureBars(array.length);
    const maxVal = safeMax(array);

    for (let i = 0; i < array.length; i++) {
        const bar = barElements[i];
        bar.style.height = `${(array[i] / maxVal) * 100}%`;

        if (swapped.includes(i)) {
            bar.className = 'bar swapped';
        } else if (compared.includes(i)) {
            bar.className = 'bar compared';
        } else {
            bar.className = 'bar';
        }
    }
}

function renderGhostBars(count) {
    ensureBars(count, true);
    for (let i = 0; i < count; i++) {
        const bar = barElements[i];
        // Random heights for visual interest
        const h = 20 + Math.random() * 70;
        bar.style.height = `${h}%`;
        bar.className = 'bar ghost';
        bar.style.animationDelay = `${i * 0.08}s`;
    }
}

function renderSorted() {
    for (const bar of barElements) {
        bar.className = 'bar sorted';
    }
}

// ── Progress Bar ────────────────────────────────────
function updateProgress() {
    if (algorithmSteps.length <= 1) {
        DOM.progressFill.style.width = '0%';
        DOM.stepCounter.textContent = '';
        return;
    }
    const pct = (currentStepIndex / (algorithmSteps.length - 1)) * 100;
    DOM.progressFill.style.width = `${pct}%`;
    DOM.stepCounter.textContent = `${currentStepIndex + 1} / ${algorithmSteps.length}`;
}

// ── Code Panel ──────────────────────────────────────
function updateCodePanel(key) {
    const lines = ALGORITHMS[key].code;
    DOM.codeBlock.innerHTML = '';
    DOM.lineNumbers.innerHTML = '';

    lines.forEach((line, i) => {
        const num = document.createElement('span');
        num.className = 'line-number';
        num.id = `line-num-${i}`;
        num.textContent = i + 1;
        DOM.lineNumbers.appendChild(num);

        const div = document.createElement('div');
        div.className = 'code-line';
        div.id = `code-line-${i}`;
        div.textContent = line;
        DOM.codeBlock.appendChild(div);
    });
}

function highlightCodeLine(lineIndex) {
    document.querySelectorAll('.code-line').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.line-number').forEach(el => el.classList.remove('active'));

    if (lineIndex != null) {
        const cl = $(`code-line-${lineIndex}`);
        const ln = $(`line-num-${lineIndex}`);
        if (cl) cl.classList.add('active');
        if (ln) ln.classList.add('active');
    }
}

// ── Algorithm Info ──────────────────────────────────
function updateAlgorithmInfo() {
    const key = DOM.algoSelect.value;
    const info = ALGORITHMS[key];
    DOM.algoTitle.textContent = info.title;
    DOM.algoDesc.textContent = info.desc;
    DOM.timeComp.textContent = info.time;
    DOM.spaceComp.textContent = info.space;
    updateCodePanel(key);
}

// ── Audio ───────────────────────────────────────────
function getAudioCtx() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
}

function playNote(value, maxVal) {
    if (isMuted) return;
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') ctx.resume();

    const freq = 200 + (value / maxVal) * 600;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.07, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
}

// ── Player Controls ─────────────────────────────────
function updatePlayerButtons() {
    DOM.btnPrev.disabled = currentStepIndex <= 0;
    DOM.btnNext.disabled = currentStepIndex >= algorithmSteps.length - 1;
    DOM.btnPlayPause.disabled = algorithmSteps.length === 0;
    DOM.btnPlayPause.textContent = isPlaying ? '⏸' : '▶';
    DOM.startBtn.disabled = isPlaying || isFetching;
}

function drawCurrentStep() {
    if (algorithmSteps.length === 0) return;

    const step = algorithmSteps[currentStepIndex];
    DOM.statusText.textContent = `Шаг ${currentStepIndex + 1}/${algorithmSteps.length}: ${step.description}`;
    renderArray(step.array, step.comparedIndices, step.swappedIndices);
    updateProgress();

    // Audio
    const maxVal = safeMax(step.array);
    if (step.swappedIndices.length > 0) {
        step.swappedIndices.forEach(i => playNote(step.array[i], maxVal));
    } else if (step.comparedIndices.length > 0) {
        step.comparedIndices.forEach(i => playNote(step.array[i], maxVal));
    }

    highlightCodeLine(step.activeLine);
    updatePlayerButtons();
}

function playAnimation() {
    if (!isPlaying) return;

    if (currentStepIndex >= algorithmSteps.length - 1) {
        isPlaying = false;
        DOM.statusText.textContent = 'Сортировка завершена ✓';
        renderSorted();
        updatePlayerButtons();
        updateProgress();
        DOM.sizeSlider.disabled = false;
        DOM.algoSelect.disabled = false;
        return;
    }

    currentStepIndex++;
    drawCurrentStep();
    animationTimeout = setTimeout(playAnimation, parseInt(DOM.speedSlider.value));
}

// ── Main Fetch ──────────────────────────────────────
async function startSorting() {
    if (isFetching || isPlaying) return;

    isFetching = true;
    DOM.startBtn.disabled = true;
    DOM.algoSelect.disabled = true;
    DOM.sizeSlider.disabled = true;

    isPlaying = false;
    clearTimeout(animationTimeout);
    currentStepIndex = 0;
    algorithmSteps = [];
    updatePlayerButtons();
    updateProgress();

    try {
        DOM.statusText.textContent = 'Запрос к серверу...';
        algorithmSteps = await Api.fetchSteps(DOM.algoSelect.value, initialArray);
        DOM.statusText.textContent = `Получено ${algorithmSteps.length} шагов — запуск...`;

        drawCurrentStep();
        isPlaying = true;
        playAnimation();
    } catch (err) {
        DOM.statusText.textContent = `Ошибка: ${err.message}`;
        console.error(err);
        DOM.startBtn.disabled = false;
        DOM.algoSelect.disabled = false;
        DOM.sizeSlider.disabled = false;
    } finally {
        isFetching = false;
        updatePlayerButtons();
    }
}

// ── Event Listeners ─────────────────────────────────
DOM.algoSelect.addEventListener('change', () => {
    updateAlgorithmInfo();
    if (algorithmSteps.length > 0 && !isPlaying) {
        algorithmSteps = [];
        currentStepIndex = 0;
        updatePlayerButtons();
        updateProgress();
        renderArray(initialArray);
        DOM.statusText.textContent = 'Алгоритм изменён — нажмите ▶';
    }
});

DOM.sizeSlider.addEventListener('input', e => {
    const size = parseInt(e.target.value);
    DOM.sizeValue.textContent = size;
    DOM.elCount.textContent = size;
    initialArray = generateArray(size);
    renderArray(initialArray);
    DOM.statusText.textContent = 'Настройте параметры и нажмите ▶';

    isPlaying = false;
    clearTimeout(animationTimeout);
    algorithmSteps = [];
    currentStepIndex = 0;
    updatePlayerButtons();
    updateProgress();
});

DOM.speedSlider.addEventListener('input', e => {
    DOM.speedValue.textContent = e.target.value;
});

DOM.startBtn.addEventListener('click', startSorting);

DOM.btnPlayPause.addEventListener('click', () => {
    isPlaying = !isPlaying;
    if (isPlaying) {
        if (currentStepIndex >= algorithmSteps.length - 1) currentStepIndex = 0;
        playAnimation();
    } else {
        clearTimeout(animationTimeout);
    }
    updatePlayerButtons();
});

DOM.btnNext.addEventListener('click', () => {
    if (currentStepIndex < algorithmSteps.length - 1) {
        currentStepIndex++;
        drawCurrentStep();
    }
});

DOM.btnPrev.addEventListener('click', () => {
    if (currentStepIndex > 0) {
        currentStepIndex--;
        drawCurrentStep();
    }
});

DOM.btnMute.addEventListener('click', () => {
    isMuted = !isMuted;
    DOM.btnMute.textContent = isMuted ? '🔇' : '🔊';
    DOM.btnMute.classList.toggle('muted', isMuted);
});

// ── History Modal ───────────────────────────────────
DOM.btnHistory.addEventListener('click', async () => {
    DOM.historyModal.style.display = 'block';
    DOM.historyTbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:24px">Загрузка...</td></tr>';

    try {
        const data = await Api.fetchHistory();
        DOM.historyTbody.innerHTML = '';

        if (data.length === 0) {
            DOM.historyTbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:24px">История пуста</td></tr>';
            return;
        }

        data.forEach(run => {
            const date = new Date(run.createdAt).toLocaleString('ru-RU');
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="color:var(--text-muted)">#${run.id}</td>
                <td style="color:var(--accent-light)">${run.algorithmName}</td>
                <td>${run.arraySize}</td>
                <td>${run.stepsCount}</td>
                <td style="color:var(--text-muted)">${date}</td>
            `;
            DOM.historyTbody.appendChild(tr);
        });
    } catch (err) {
        DOM.historyTbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--danger);padding:24px">${err.message}</td></tr>`;
    }
});

DOM.closeHistory.addEventListener('click', () => {
    DOM.historyModal.style.display = 'none';
});

window.addEventListener('click', e => {
    if (e.target === DOM.historyModal) {
        DOM.historyModal.style.display = 'none';
    }
});

// ── Keyboard shortcuts ──────────────────────────────
window.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

    switch (e.code) {
        case 'Space':
            e.preventDefault();
            if (algorithmSteps.length > 0) DOM.btnPlayPause.click();
            break;
        case 'ArrowRight':
            e.preventDefault();
            DOM.btnNext.click();
            break;
        case 'ArrowLeft':
            e.preventDefault();
            DOM.btnPrev.click();
            break;
        case 'KeyM':
            DOM.btnMute.click();
            break;
    }
});

// ── Init ────────────────────────────────────────────
updateAlgorithmInfo();
initialArray = generateArray(parseInt(DOM.sizeSlider.value));
DOM.elCount.textContent = DOM.sizeSlider.value;

// Show ghost bars initially for visual interest
renderGhostBars(parseInt(DOM.sizeSlider.value));

// After a brief moment, show the real array
setTimeout(() => {
    renderArray(initialArray);
}, 1200);
