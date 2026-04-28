let operation = '+';
let operands = [['', '', '', ''], ['', '', '', '']];
let resultWord = ['', '', '', '', ''];

const EXAMPLES = [
    { label: 'SEND + MORE = MONEY', op: '+', lhs: [['S', 'E', 'N', 'D'], ['M', 'O', 'R', 'E']], rhs: ['M', 'O', 'N', 'E', 'Y'] },
    { label: 'BASE + BALL = GAMES', op: '+', lhs: [['B', 'A', 'S', 'E'], ['B', 'A', 'L', 'L']], rhs: ['G', 'A', 'M', 'E', 'S'] },
    { label: 'TO + GO = OUT', op: '+', lhs: [['T', 'O'], ['G', 'O']], rhs: ['O', 'U', 'T'] },
    { label: 'AB × C = DE', op: '*', lhs: [['A', 'B'], ['C']], rhs: ['D', 'E'] },
    { label: 'FORTY + TEN = SIXTY', op: '+', lhs: [['F', 'O', 'R', 'T', 'Y'], ['T', 'E', 'N']], rhs: ['S', 'I', 'X', 'T', 'Y'] },
];

// particles
(function () {
    const c = document.getElementById('dots');
    for (let i = 0; i < 18; i++) {
        const d = document.createElement('div'); d.className = 'dot';
        const s = Math.random() * 2.5 + 1;
        d.style.cssText = `width:${s}px;height:${s}px;left:${Math.random() * 100}%;animation-duration:${9 + Math.random() * 14}s;animation-delay:${Math.random() * 12}s;`;
        c.appendChild(d);
    }
})();

let guideOpen = false;
function toggleGuide() {
    guideOpen = !guideOpen;
    document.getElementById('guide-body').classList.toggle('open', guideOpen);
    document.getElementById('guide-chevron').classList.toggle('open', guideOpen);
    document.getElementById('guide-sub').textContent = guideOpen ? 'click to collapse' : 'click to expand guide';
}

function renderExamples() {
    const row = document.getElementById('examples-chips');
    EXAMPLES.forEach(ex => {
        const btn = document.createElement('button'); btn.className = 'ex-chip'; btn.textContent = ex.label;
        btn.onclick = () => {
            operation = ex.op; operands = ex.lhs.map(w => [...w]); resultWord = [...ex.rhs];
            document.getElementById('result-output').innerHTML = '';
            document.getElementById('error-msg').style.display = 'none';
            render(); if (guideOpen) toggleGuide();
        };
        row.appendChild(btn);
    });
}

function renderOpRow() {
    const opts = [{ sym: '+', val: '+' }, { sym: '−', val: '-' }, { sym: '×', val: '*' }];
    const row = document.getElementById('op-row'); row.innerHTML = '';
    opts.forEach(o => {
        const btn = document.createElement('button');
        btn.className = 'op-btn' + (operation === o.val ? ' active' : '');
        btn.textContent = o.sym;
        btn.onclick = () => { operation = o.val; renderOpRow(); };
        row.appendChild(btn);
    });
    const syms = { '+': '+ = result', '-': '− = result', '*': '× = result' };
    document.getElementById('eq-sym-label').textContent = syms[operation] || '= result';
}

function buildChip(word) {
    const wrap = document.createElement('div'); wrap.className = 'word-chip';
    function refresh() {
        [...wrap.querySelectorAll('.tile')].forEach(t => t.remove());
        word.forEach((l, i) => {
            const inp = document.createElement('input');
            inp.className = 'tile' + (l ? ' filled' : ''); inp.maxLength = 1; inp.value = l || '';
            inp.setAttribute('autocomplete', 'off'); inp.setAttribute('spellcheck', 'false');
            inp.oninput = e => {
                const v = e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(-1);
                e.target.value = v; word[i] = v; inp.classList.toggle('filled', !!v);
                if (v) { const n = inp.nextSibling; if (n && n.classList.contains('tile')) n.focus(); }
            };
            inp.onkeydown = e => {
                if (e.key === 'Backspace' && !inp.value) {
                    const p = inp.previousSibling;
                    if (p && p.classList.contains('tile')) { e.preventDefault(); p.focus(); p.value = ''; word[i - 1] = ''; p.classList.remove('filled'); }
                }
                if (e.key === 'ArrowLeft') { const p = inp.previousSibling; if (p && p.classList.contains('tile')) { e.preventDefault(); p.focus(); } }
                if (e.key === 'ArrowRight') { const n = inp.nextSibling; if (n && n.classList.contains('tile')) { e.preventDefault(); n.focus(); } }
            };
            wrap.insertBefore(inp, wrap.querySelector('.chip-ctrl'));
        });
    }
    const add = document.createElement('button'); add.className = 'chip-ctrl'; add.title = 'Add letter'; add.textContent = '+';
    add.onclick = () => { word.push(''); refresh(); };
    wrap.appendChild(add);
    const del = document.createElement('button'); del.className = 'chip-ctrl del'; del.title = 'Remove letter'; del.textContent = '−';
    del.onclick = () => { if (word.length > 1) { word.pop(); refresh(); } };
    wrap.appendChild(del);
    refresh(); return wrap;
}

function render() { renderOpRow(); renderOperands(); renderResult(); }

function renderOperands() {
    const area = document.getElementById('operands-area'); area.innerHTML = '';
    operands.forEach((word, idx) => {
        const row = document.createElement('div'); row.className = 'word-row';
        const lbl = document.createElement('span'); lbl.className = 'op-index'; lbl.textContent = (idx + 1) + '.';
        row.appendChild(lbl); row.appendChild(buildChip(word));
        if (operands.length > 2) {
            const rm = document.createElement('button'); rm.className = 'chip-ctrl del'; rm.title = 'Remove operand'; rm.textContent = '✕';
            rm.onclick = () => { operands.splice(idx, 1); renderOperands(); };
            row.appendChild(rm);
        }
        area.appendChild(row);
    });
    document.getElementById('add-operand-btn').onclick = () => { operands.push(['', '', '', '']); renderOperands(); };
}

function renderResult() {
    const area = document.getElementById('result-area-row'); area.innerHTML = '';
    const row = document.createElement('div'); row.className = 'word-row';
    row.appendChild(buildChip(resultWord)); area.appendChild(row);
}

async function solve() {
    const solveBtn = document.getElementById('solve-btn');
    const output = document.getElementById('result-output');
    const errEl = document.getElementById('error-msg');
    const progWrap = document.getElementById('progress-wrap');
    const progLbl = document.getElementById('progress-label');
    errEl.style.display = 'none'; output.innerHTML = '';

    const words = [...operands, resultWord].map(w => w.join('').trim());
    if (words.some(w => !w)) { showError('Fill in all word fields before solving.'); return; }

    const allLetters = [...new Set(words.join(''))].filter(c => /[A-Z]/.test(c));
    if (allLetters.length > 10) { showError(`Too many unique letters (${allLetters.length}). Max is 10.`); return; }

    solveBtn.disabled = true; progWrap.style.display = 'block';
    progLbl.textContent = `Searching… (${allLetters.length} unique letter${allLetters.length !== 1 ? 's' : ''})`;
    await new Promise(r => setTimeout(r, 30));

    const leadChars = new Set(words.map(w => w[0]));
    const solutions = [];

    function backtrack(map, used, idx) {
        if (idx === allLetters.length) {
            for (const l of leadChars) if (map[l] === 0) return;
            const toNum = w => parseInt(w.split('').map(l => map[l]).join(''));
            const nums = operands.map(w => toNum(w.join('')));
            const res = toNum(resultWord.join(''));
            let lhs;
            if (operation === '+') lhs = nums.reduce((a, b) => a + b, 0);
            else if (operation === '-') lhs = nums.reduce((a, b) => a - b);
            else lhs = nums.reduce((a, b) => a * b, 1);
            if (lhs === res) solutions.push({ ...map }); return;
        }
        const letter = allLetters[idx];
        for (let d = 0; d <= 9; d++) {
            if (!used.has(d)) { map[letter] = d; used.add(d); backtrack(map, used, idx + 1); delete map[letter]; used.delete(d); }
        }
    }

    backtrack({}, new Set(), 0);
    solveBtn.disabled = false; progWrap.style.display = 'none';
    renderResults(solutions);
}

function renderResults(solutions) {
    const output = document.getElementById('result-output');
    const dispSym = { '+': '+', '-': '−', '*': '×' }[operation] || operation;

    if (!solutions.length) {
        output.innerHTML = `<div class="results-wrap"><div class="no-solution">
      <div class="ns-title">No solution found</div>
      <div class="ns-hint">Each letter must map to a unique digit 0–9. Leading zeros are not allowed.</div>
    </div></div>`;
        return;
    }

    const shown = solutions.slice(0, 8);
    const countLabel = solutions.length === 1 ? '1 solution found' : `${solutions.length} solutions found`;

    let html = `<div class="results-wrap">
    <div class="results-header">
      <span class="results-label">Results</span>
      <span class="results-badge badge-found">${countLabel}</span>
    </div>
    <div class="solutions-list">`;

    shown.forEach(sol => {
        const toNum = w => parseInt(w.split('').map(l => sol[l]).join(''));
        const nums = operands.map(w => toNum(w.join('')));
        const res = toNum(resultWord.join(''));

        let eqHtml = '';
        nums.forEach((n, i) => {
            eqHtml += `<span class="sol-num">${n}</span>`;
            if (i < nums.length - 1) eqHtml += `<span class="sol-op-badge">${dispSym}</span>`;
        });
        eqHtml += `<span class="sol-equals">=</span><span class="sol-result">${res}</span>`;

        const chips = Object.entries(sol)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([l, d]) => `<div class="map-chip">${l}<span class="sep">=</span>${d}</div>`)
            .join('');

        html += `<div class="sol-card">
      <div class="sol-eq">${eqHtml}</div>
      <div class="sol-divider"></div>
      <div class="sol-map-label">Letter → Digit mapping</div>
      <div class="sol-mapping">${chips}</div>
    </div>`;
    });

    html += `</div>`;
    if (solutions.length > 8) html += `<div class="more-label">+ ${solutions.length - 8} more solution${solutions.length - 8 !== 1 ? 's' : ''} not shown</div>`;
    html += `</div>`;

    output.innerHTML = html;
    output.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showError(msg) { const el = document.getElementById('error-msg'); el.textContent = msg; el.style.display = 'block'; }

function handleBackspace() {
    const a = document.activeElement;
    if (a && a.classList.contains('tile')) {
        if (a.value) { a.value = ''; a.dispatchEvent(new Event('input')); return; }
        const p = a.previousSibling;
        if (p && p.classList.contains('tile')) { p.focus(); p.value = ''; p.dispatchEvent(new Event('input')); }
    }
}

function clearAll() {
    operation = '+'; operands = [['', '', '', ''], ['', '', '', '']]; resultWord = ['', '', '', '', ''];
    document.getElementById('result-output').innerHTML = '';
    document.getElementById('error-msg').style.display = 'none';
    document.getElementById('progress-wrap').style.display = 'none';
    render();
}

renderExamples();
render();
