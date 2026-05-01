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
            "public void BubbleSort(int[] arr)",
            "{",
            "    int n = arr.Length;",
            "    for (int i = 0; i < n - 1; i++)",
            "    {",
            "        for (int j = 0; j < n - i - 1; j++)",
            "        {",
            "            if (arr[j] > arr[j + 1])",
            "            {",
            "                int temp = arr[j];",
            "                arr[j] = arr[j + 1];",
            "                arr[j + 1] = temp;",
            "            }",
            "        }",
            "    }",
            "}"
        ]
    },
    selection: {
        title: "Сортировка выбором",
        desc: "Ищет минимальный элемент в неотсортированной части и меняет его с первым неотсортированным элементом.",
        time: "O(n²)", space: "O(1)",
        code: [
            "public void SelectionSort(int[] arr)",
            "{",
            "    int n = arr.Length;",
            "    for (int i = 0; i < n - 1; i++)",
            "    {",
            "        int minIndex = i;",
            "        for (int j = i + 1; j < n; j++)",
            "        {",
            "            if (arr[j] < arr[minIndex])",
            "                minIndex = j;",
            "        }",
            "        if (minIndex != i)",
            "        {",
            "            int temp = arr[minIndex];",
            "            arr[minIndex] = arr[i];",
            "            arr[i] = temp;",
            "        }",
            "    }",
            "}"
        ]
    },
    quick: {
        title: "Быстрая сортировка",
        desc: "Выбирает 'опорный' элемент, переносит всё меньшее влево, а большее вправо. Затем рекурсивно повторяет.",
        time: "O(n log n)", space: "O(log n)",
        code: [
            "public void QuickSort(int[] arr, int left, int right)",
            "{",
            "    if (left < right)",
            "    {",
            "        int pivotIndex = Partition(arr, left, right);",
            "        QuickSort(arr, left, pivotIndex - 1);",
            "        QuickSort(arr, pivotIndex + 1, right);",
            "    }",
            "}",
            "",
            "private int Partition(int[] arr, int left, int right)",
            "{",
            "    int pivot = arr[right];",
            "    int i = left - 1;",
            "    for (int j = left; j < right; j++)",
            "    {",
            "        if (arr[j] <= pivot)",
            "        {",
            "            i++;",
            "            int temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;",
            "        }",
            "    }",
            "    int temp1 = arr[i + 1]; arr[i + 1] = arr[right]; arr[right] = temp1;",
            "    return i + 1;",
            "}"
        ]
    },
    merge: {
        title: "Сортировка слиянием",
        desc: "Рекурсивно делит массив пополам, затем сливает обратно в правильном порядке, используя дополнительную память.",
        time: "O(n log n)", space: "O(n)",
        code: [
            "public void MergeSort(int[] arr, int left, int right)",
            "{",
            "    if (left < right)",
            "    {",
            "        int middle = left + (right - left) / 2;",
            "        MergeSort(arr, left, middle);",
            "        MergeSort(arr, middle + 1, right);",
            "        Merge(arr, left, middle, right);",
            "    }",
            "}",
            "",
            "private void Merge(int[] arr, int left, int middle, int right)",
            "{",
            "    int[] temp = new int[right - left + 1];",
            "    int i = left, j = middle + 1, k = 0;",
            "",
            "    while (i <= middle && j <= right)",
            "    {",
            "        if (arr[i] <= arr[j]) temp[k++] = arr[i++];",
            "        else temp[k++] = arr[j++];",
            "    }",
            "    while (i <= middle) temp[k++] = arr[i++];",
            "    while (j <= right) temp[k++] = arr[j++];",
            "    for (int p = 0; p < temp.Length; p++) arr[left + p] = temp[p];",
            "}"
        ]
    }
};

// ── DOM References ──────────────────────────────────
const $ = id => document.getElementById(id);

const DOM = {
    container: $('visualization-container'),
    startBtn: $('start-btn'),
    statusText: $('status-text'),
    algoSelect: $('algorithmSelect'),
    sizeSlider: $('sizeSlider'),
    sizeValue: $('sizeValue'),
    speedSlider: $('speedSlider'),
    speedValue: $('speedValue'),
    elCount: $('el-count'),
    algoTitle: $('algo-title'),
    algoDesc: $('algo-desc'),
    timeComp: $('time-complexity'),
    spaceComp: $('space-complexity'),
    codeBlock: $('code-block'),
    lineNumbers: $('line-numbers'),
    progressFill: $('progress-fill'),
    stepCounter: $('step-counter'),
    btnPrev: $('btn-prev'),
    btnPlayPause: $('btn-play-pause'),
    btnStop: $('btn-stop'),
    btnNext: $('btn-next'),
    btnMute: $('btn-mute'),
    btnHistory: $('btn-history'),
    historyModal: $('history-modal'),
    closeHistory: $('close-history'),
    historyTbody: $('history-tbody')
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
            bar.className = 'bar';
            DOM.container.appendChild(bar);
            barElements.push(bar);
        }
    }

    // Reset className on ALL bars (clears ghost, sorted, etc.)
    const cls = ghost ? 'bar ghost' : 'bar';
    for (let i = 0; i < barElements.length; i++) {
        barElements[i].className = cls;
    }
}

function renderArray(array, compared = [], swapped = []) {
    ensureBars(array.length);
    const maxVal = safeMax(array);

    // Get the actual height of the container in pixels
    const containerHeight = DOM.container.clientHeight || 300;
    const isMobile = window.innerWidth <= 768;

    for (let i = 0; i < array.length; i++) {
        const bar = barElements[i];
        bar.className = 'bar'; // Ensure ghost/sorted classes are cleared

        const pct = (array[i] / maxVal);

        if (isMobile) {
            // Force pixel height on mobile to bypass percentage bugs
            bar.style.height = `${Math.max(4, Math.round(pct * (containerHeight - 40)))}px`;
        } else {
            bar.style.height = `${Math.max(1, pct * 100)}%`;
        }

        if (swapped.includes(i)) bar.classList.add('swapped');
        else if (compared.includes(i)) bar.classList.add('compared');
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

// ── Active Line Mapping (backend ID → new code line index) ──
const LINE_MAP = {
    bubble: { 0: 0, 2: 7, 3: 9 },
    selection: { 0: 0, 3: 8, 4: 13 },
    quick: { 0: 0, 2: 16, 3: 19, 4: 22 },
    merge: { 0: 0, 3: 18, 4: 18, 5: 19 }
};

// ── Syntax Highlighting ─────────────────────────────
function applySyntaxHighlighting(text) {
    // Escape HTML first
    let html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Keywords (blue)
    html = html.replace(
        /\b(public|void|int|for|if|else|new|private|return|ref|while)\b/g,
        '<span class="hljs-keyword">$1</span>'
    );

    // Type names (teal)
    html = html.replace(
        /\b(Length|string|bool|var)\b/g,
        '<span class="hljs-type">$1</span>'
    );

    // Numbers (green)
    html = html.replace(
        /\b(\d+)\b/g,
        '<span class="hljs-number">$1</span>'
    );

    return html;
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
        div.innerHTML = applySyntaxHighlighting(line);
        DOM.codeBlock.appendChild(div);
    });
}

function highlightCodeLine(lineIndex) {
    document.querySelectorAll('.code-line').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.line-number').forEach(el => el.classList.remove('active'));

    if (lineIndex != null) {
        const key = DOM.algoSelect.value;
        const map = LINE_MAP[key] || {};
        const mapped = map[lineIndex] != null ? map[lineIndex] : lineIndex;

        const cl = $(`code-line-${mapped}`);
        const ln = $(`line-num-${mapped}`);
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
    DOM.startBtn.disabled = isPlaying || isFetching;

    // Stop is active only when steps exist (algorithm running or paused)
    DOM.btnStop.disabled = algorithmSteps.length === 0;

    // Swap Play / Pause SVG
    if (isPlaying) {
        DOM.btnPlayPause.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="4" width="4" height="16" rx="1"/><rect x="15" y="4" width="4" height="16" rx="1"/></svg>';
    } else {
        DOM.btnPlayPause.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="6,4 20,12 6,20"/></svg>';
    }
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
        DOM.btnStop.disabled = true;
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

        DOM.btnStop.disabled = false;
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

// ── Stop / Reset ────────────────────────────────────
function stopSorting() {
    clearTimeout(animationTimeout);
    isPlaying = false;
    isFetching = false;
    currentStepIndex = 0;
    algorithmSteps = [];

    DOM.startBtn.disabled = false;
    DOM.algoSelect.disabled = false;
    DOM.sizeSlider.disabled = false;
    DOM.btnStop.disabled = true;

    DOM.progressFill.style.width = '0%';
    DOM.stepCounter.textContent = '';
    DOM.statusText.textContent = 'Алгоритм остановлен';

    renderArray(initialArray);
    highlightCodeLine(null);
    updatePlayerButtons();
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
DOM.btnStop.addEventListener('click', stopSorting);

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
    if (isMuted) {
        DOM.btnMute.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="none"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>';
    } else {
        DOM.btnMute.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="none"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>';
    }
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
        case 'Escape':
            stopSorting();
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

// ── Resize: re-render bars when layout changes (mobile ↔ desktop) ──
let resizeTimer = null;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (algorithmSteps.length > 0) {
            drawCurrentStep();
        } else {
            renderArray(initialArray);
        }
    }, 150);
});
