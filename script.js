let operation = '+';
let operands = [['', '', '', '', '', ''], ['', '', '', '', '', '']];
let resultWord = ['', '', '', '', '', '', ''];

function setOp(op, btn) {
    operation = op;
    document.querySelectorAll('.op-bubble').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function buildWord(word) {
    const wrap = document.createElement('div');
    wrap.className = 'word-chip';

    word.forEach((l, i) => {
        const inp = document.createElement('input');
        inp.className = 'tile';
        inp.maxLength = 1;
        inp.value = l || '';

        inp.oninput = e => {
            let v = e.target.value.replace(/[^a-z]/gi, '').toUpperCase();
            e.target.value = v;
            word[i] = v;

            if (v && e.target.nextSibling) e.target.nextSibling.focus();
        };

        wrap.appendChild(inp);
    });

    const add = document.createElement('button');
    add.className = 'icon-btn';
    add.textContent = '+';
    add.onclick = () => { word.push(''); render() };
    wrap.appendChild(add);

    const del = document.createElement('button');
    del.className = 'icon-btn';
    del.textContent = '-';
    del.onclick = () => { if (word.length > 1) { word.pop(); render() } };
    wrap.appendChild(del);

    return wrap;
}

function render() {
    const opRow = document.getElementById('operands-row');
    const resRow = document.getElementById('result-row');

    opRow.innerHTML = '';
    operands.forEach(w => opRow.appendChild(buildWord(w)));

    resRow.innerHTML = '';
    resRow.appendChild(buildWord(resultWord));
}

async function solve() {
    const btn = document.getElementById('solve-btn');
    const ra = document.getElementById('result-area');

    const words = [...operands, resultWord].map(w => w.join(''));
    if (words.some(w => !w)) {
        ra.innerHTML = 'Fill all fields';
        return;
    }

    const letters = [...new Set(words.join(''))];
    if (letters.length > 10) {
        ra.innerHTML = 'Max 10 unique letters only';
        return;
    }

    btn.disabled = true;
    ra.innerHTML = 'Solving...';

    const lead = new Set(words.map(w => w[0]));
    const solutions = [];

    function backtrack(map = {}, used = new Set()) {
        if (Object.keys(map).length === letters.length) {
            if ([...lead].some(l => map[l] === 0)) return;

            const toNum = w => +w.split('').map(l => map[l]).join('');
            const nums = operands.map(w => toNum(w.join('')));
            const res = toNum(resultWord.join(''));

            let lhs;
            if (operation === '+') lhs = nums.reduce((a, b) => a + b, 0);
            else if (operation === '-') lhs = nums.reduce((a, b) => a - b);
            else lhs = nums.reduce((a, b) => a * b, 1);

            if (lhs === res) solutions.push({ ...map });
            return;
        }

        const l = letters[Object.keys(map).length];
        for (let d = 0; d <= 9; d++) {
            if (!used.has(d)) {
                map[l] = d;
                used.add(d);

                backtrack(map, used);

                delete map[l];
                used.delete(d);
            }
        }
    }

    backtrack();
    btn.disabled = false;

    if (!solutions.length) {
        ra.innerHTML = 'No solution';
        return;
    }

    let html = '<div class="result-panel">';
    solutions.slice(0, 5).forEach(sol => {
        const toNum = w => +w.split('').map(l => sol[l]).join('');
        const nums = operands.map(w => toNum(w.join('')));
        const res = toNum(resultWord.join(''));

        html += `<div class="solution-item">
      <b>${nums.join(' ' + operation + ' ')} = ${res}</b><br>
      ${Object.entries(sol).map(([l, d]) => `<span class="map-tag">${l}:${d}</span>`).join('')}
    </div>`;
    });

    html += '</div>';
    ra.innerHTML = html;
}

render();

function handleBackspace() {
    const active = document.activeElement;

    if (active && active.classList.contains('tile')) {
        if (active.value) {
            active.value = '';
            active.dispatchEvent(new Event('input'));
            return;
        }

        const prev = active.previousSibling;
        if (prev && prev.classList.contains('tile')) {
            prev.focus();
            prev.value = '';
            prev.dispatchEvent(new Event('input'));
            return;
        }
    }

    // fallback: delete last letter in last operand
    let lastWord = operands[operands.length - 1];
    if (lastWord && lastWord.length > 1) {
        lastWord.pop();
        render();
    }
}

function clearAll() {
    operation = '+';
    operands = [['', '', '', '', '', ''], ['', '', '', '', '', '']];
    resultWord = ['', '', '', '', '', '', ''];

    document.querySelectorAll('.op-bubble').forEach(b => b.classList.remove('active'));
    document.querySelector('.op-bubble').classList.add('active');

    document.getElementById('result-area').innerHTML = '';

    render();
}