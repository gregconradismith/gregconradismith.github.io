'use strict';

const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');

const els = {
  roundLabel: document.getElementById('roundLabel'),
  scoreLabel: document.getElementById('scoreLabel'),
  streakLabel: document.getElementById('streakLabel'),
  scorePercent: document.getElementById('scorePercent'),
  correctCount: document.getElementById('correctCount'),
  attemptCount: document.getElementById('attemptCount'),
  currentStreak: document.getElementById('currentStreak'),
  bestStreak: document.getElementById('bestStreak'),
  promptText: document.getElementById('promptText'),
  similarButton: document.getElementById('similarButton'),
  differentButton: document.getElementById('differentButton'),
  nextButton: document.getElementById('nextButton'),
  newRoundButton: document.getElementById('newRoundButton'),
  resetButton: document.getElementById('resetButton'),
  revealPanel: document.getElementById('revealPanel'),
  resultLabel: document.getElementById('resultLabel'),
  resultText: document.getElementById('resultText'),
  resultDetail: document.getElementById('resultDetail'),
  verdictBurst: document.getElementById('verdictBurst'),
  includeFCheckbox: document.getElementById('includeFCheckbox'),
  showAxisCheckbox: document.getElementById('showAxisCheckbox'),
  soundCheckbox: document.getElementById('soundCheckbox'),
  wiggleSlider: document.getElementById('wiggleSlider'),
  answerKey: document.getElementById('answerKey'),
  signRows: document.getElementById('signRows'),
  bluePattern: document.getElementById('bluePattern'),
  redPattern: document.getElementById('redPattern'),
  historyList: document.getElementById('historyList'),
};

const colors = {
  blue: '#2557c7',
  red: '#d33838',
  green: '#1f7a4d',
  amber: '#9a671d',
  ink: '#202328',
  muted: '#8a8175',
  axis: '#bfb5a8',
  grid: '#ece5d9',
  paper: '#fffdf8',
};

const xValues = makeRange(-1, 1, 0.01);
const state = {
  round: 0,
  attempts: 0,
  correct: 0,
  streak: 0,
  bestStreak: 0,
  soundEnabled: readSoundPreference(),
  history: [],
  revealed: false,
  roundData: null,
};

els.soundCheckbox.checked = state.soundEnabled;

function makeRange(start, stop, step) {
  const values = [];
  for (let value = start; value <= stop + step / 2; value += step) {
    values.push(Number(value.toFixed(8)));
  }
  return values;
}

function gaussian() {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function polyval(coefficients, x) {
  return coefficients.reduce((acc, coefficient) => acc * x + coefficient, 0);
}

function polyder(coefficients) {
  const degree = coefficients.length - 1;
  return coefficients.slice(0, -1).map((coefficient, index) => coefficient * (degree - index));
}

function sign(value) {
  if (Math.abs(value) < 1e-10) return 0;
  return value > 0 ? 1 : -1;
}

function generateRound() {
  const sigma = 5;
  const wiggle = sigma * Number(els.wiggleSlider.value) / 100;
  const verticalOffset = 10;
  const degree = randomInt(2, 4);

  const blueCoefficients = Array.from({ length: degree + 1 }, () => sigma * gaussian());
  const redCoefficients = blueCoefficients.map(value => value + wiggle * gaussian());
  const blueD = polyder(blueCoefficients);
  const redD = polyder(redCoefficients);
  const blueDD = polyder(blueD);
  const redDD = polyder(redD);

  const blue = {
    f: xValues.map(x => verticalOffset + polyval(blueCoefficients, x)),
    df: xValues.map(x => polyval(blueD, x)),
    ddf: xValues.map(x => polyval(blueDD, x)),
  };
  const red = {
    f: xValues.map(x => verticalOffset + polyval(redCoefficients, x)),
    df: xValues.map(x => polyval(redD, x)),
    ddf: xValues.map(x => polyval(redDD, x)),
  };

  return {
    degree,
    blue,
    red,
    blueSigns: signsFor(blue),
    redSigns: signsFor(red),
    includeF: els.includeFCheckbox.checked,
  };
}

function signsFor(curve) {
  return {
    f: curve.f.map(sign),
    df: curve.df.map(sign),
    ddf: curve.ddf.map(sign),
  };
}

function activeRows() {
  return state.roundData.includeF
    ? ['f', 'df', 'ddf']
    : ['df', 'ddf'];
}

function collapseSignStates(signs) {
  const rows = activeRows();
  const states = [rows.map(row => signs[row][0])];

  for (let i = 1; i < xValues.length; i += 1) {
    const next = rows.map(row => signs[row][i]);
    const last = states[states.length - 1];
    if (next.some((value, index) => value !== last[index])) {
      states.push(next);
    }
  }

  return states;
}

function statePattern(states) {
  return states.map(column => column.map(signToChar).join('')).join('  ');
}

function signToChar(value) {
  if (value < 0) return '-';
  if (value > 0) return '+';
  return '0';
}

function isSimilar() {
  const blueStates = collapseSignStates(state.roundData.blueSigns);
  const redStates = collapseSignStates(state.roundData.redSigns);
  return statePattern(blueStates) === statePattern(redStates);
}

function startRound() {
  state.round += 1;
  state.revealed = false;
  state.roundData = generateRound();
  els.revealPanel.hidden = true;
  els.answerKey.hidden = true;
  els.promptText.textContent = 'Are the blue and red curves qualitatively similar?';
  els.similarButton.disabled = false;
  els.differentButton.disabled = false;
  els.similarButton.className = 'answer-button';
  els.differentButton.className = 'answer-button';
  els.revealPanel.className = 'reveal-panel';
  els.verdictBurst.className = 'verdict-burst';
  els.resultDetail.textContent = '';
  updateLabels();
  drawGraph();
}

function resetGame() {
  state.round = 0;
  state.attempts = 0;
  state.correct = 0;
  state.streak = 0;
  state.bestStreak = 0;
  state.history = [];
  renderHistory();
  startRound();
}

function answer(userSaysSimilar) {
  if (state.revealed) return;
  const correctAnswer = isSimilar();
  const gotIt = userSaysSimilar === correctAnswer;

  state.revealed = true;
  state.attempts += 1;
  if (gotIt) {
    state.correct += 1;
    state.streak += 1;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
  } else {
    state.streak = 0;
  }

  state.history.unshift({
    round: state.round,
    gotIt,
    answer: correctAnswer ? 'Similar' : 'Different',
  });
  state.history = state.history.slice(0, 6);

  els.similarButton.disabled = true;
  els.differentButton.disabled = true;
  els.similarButton.classList.toggle('correct', correctAnswer);
  els.differentButton.classList.toggle('correct', !correctAnswer);
  if (!gotIt) {
    (userSaysSimilar ? els.similarButton : els.differentButton).classList.add('incorrect');
  }

  els.resultLabel.textContent = gotIt ? 'Correct' : 'Not quite';
  els.resultText.textContent = gotIt ? 'Correct!' : 'Not quite';
  els.resultDetail.textContent = correctAnswer
    ? 'The curves are qualitatively similar.'
    : 'The curves are qualitatively different.';
  els.promptText.textContent = gotIt
    ? celebratoryPrompt()
    : 'Close look: the sign-state sequences differ.';
  els.revealPanel.classList.toggle('is-correct', gotIt);
  els.revealPanel.classList.toggle('is-incorrect', !gotIt);
  els.verdictBurst.classList.toggle('is-correct', gotIt);
  els.verdictBurst.classList.toggle('is-incorrect', !gotIt);
  playAnswerSound(gotIt);
  els.revealPanel.hidden = false;
  els.answerKey.hidden = false;

  updateLabels();
  renderAnswerKey();
  renderHistory();
  drawGraph();
}

function updateLabels() {
  els.roundLabel.textContent = `Round ${state.round}`;
  els.scoreLabel.textContent = `${state.correct} / ${state.attempts}`;
  els.streakLabel.textContent = `Streak ${state.streak}`;
  els.correctCount.textContent = state.correct;
  els.attemptCount.textContent = state.attempts;
  els.currentStreak.textContent = state.streak;
  els.bestStreak.textContent = state.bestStreak;
  els.scorePercent.textContent = state.attempts === 0
    ? '0%'
    : `${Math.round((state.correct / state.attempts) * 100)}%`;
}

function celebratoryPrompt() {
  if (state.streak >= 5) return `On fire: ${state.streak} in a row.`;
  if (state.streak >= 3) return `Streak ${state.streak}. The signs are lining up.`;
  return 'Nice. The sign-state sequences agree.';
}

function readSoundPreference() {
  try {
    return localStorage.getItem('polyqual-sound-enabled') !== 'false';
  } catch {
    return true;
  }
}

function saveSoundPreference(enabled) {
  try {
    localStorage.setItem('polyqual-sound-enabled', String(enabled));
  } catch {
    // Ignore storage failures; the in-session setting still works.
  }
}

function playAnswerSound(gotIt) {
  if (!state.soundEnabled) return;

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  const audio = playAnswerSound.audio || new AudioContext();
  playAnswerSound.audio = audio;
  if (audio.state === 'suspended') audio.resume();

  const now = audio.currentTime;
  const notes = gotIt
    ? [523.25, 659.25, 783.99]
    : [220, 174.61];

  notes.forEach((frequency, index) => {
    const start = now + index * 0.09;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = gotIt ? 'sine' : 'triangle';
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(gotIt ? 0.10 : 0.075, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.16);
    oscillator.connect(gain).connect(audio.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.18);
  });
}

function renderHistory() {
  els.historyList.innerHTML = '';
  state.history.forEach(item => {
    const li = document.createElement('li');
    li.className = item.gotIt ? 'correct' : 'incorrect';
    li.textContent = `Round ${item.round}: ${item.answer}`;
    els.historyList.appendChild(li);
  });
}

function renderAnswerKey() {
  const rows = activeRows();
  els.signRows.innerHTML = '';
  rows.slice().reverse().forEach(row => {
    const wrapper = document.createElement('div');
    wrapper.className = 'sign-row';

    const label = document.createElement('div');
    label.className = 'sign-row-label';
    label.textContent = rowLabel(row);

    const track = document.createElement('div');
    track.className = 'mini-track';
    const miniCanvas = document.createElement('canvas');
    miniCanvas.width = 420;
    miniCanvas.height = 72;
    track.appendChild(miniCanvas);
    wrapper.append(label, track);
    els.signRows.appendChild(wrapper);

    drawSignTrack(miniCanvas, state.roundData.blueSigns[row], state.roundData.redSigns[row]);
  });

  els.bluePattern.textContent = statePattern(collapseSignStates(state.roundData.blueSigns));
  els.redPattern.textContent = statePattern(collapseSignStates(state.roundData.redSigns));
}

function rowLabel(row) {
  if (row === 'f') return 'f';
  if (row === 'df') return "f'";
  return "f''";
}

function drawGraph() {
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.max(600, Math.floor(rect.width * ratio));
  canvas.height = Math.max(360, Math.floor(rect.height * ratio));

  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  const width = canvas.width / ratio;
  const height = canvas.height / ratio;
  const padding = { left: 34, right: 24, top: 24, bottom: 30 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const allY = state.roundData.blue.f.concat(state.roundData.red.f);
  let yMin = Math.min(0, ...allY);
  let yMax = Math.max(0, ...allY);
  const margin = Math.max(1, (yMax - yMin) * 0.12);
  yMin -= margin;
  yMax += margin;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = colors.paper;
  ctx.fillRect(0, 0, width, height);

  drawGrid(ctx, padding, plotWidth, plotHeight, yMin, yMax);
  if (state.roundData.includeF || els.showAxisCheckbox.checked) {
    drawZeroLine(ctx, padding, plotWidth, yMin, yMax, plotHeight);
  }

  drawCurve(ctx, state.roundData.blue.f, padding, plotWidth, plotHeight, yMin, yMax, colors.blue);
  drawCurve(ctx, state.roundData.red.f, padding, plotWidth, plotHeight, yMin, yMax, colors.red);

  if (state.revealed) {
    drawVerdictBadge(ctx, width, isSimilar());
  }
}

function toX(index, padding, plotWidth) {
  return padding.left + (index / (xValues.length - 1)) * plotWidth;
}

function toY(value, padding, plotHeight, yMin, yMax) {
  return padding.top + (1 - (value - yMin) / (yMax - yMin)) * plotHeight;
}

function drawGrid(context, padding, plotWidth, plotHeight, yMin, yMax) {
  context.save();
  context.strokeStyle = colors.grid;
  context.lineWidth = 1;

  for (let i = 0; i <= 4; i += 1) {
    const y = padding.top + (i / 4) * plotHeight;
    context.beginPath();
    context.moveTo(padding.left, y);
    context.lineTo(padding.left + plotWidth, y);
    context.stroke();
  }

  for (let i = 0; i <= 4; i += 1) {
    const x = padding.left + (i / 4) * plotWidth;
    context.beginPath();
    context.moveTo(x, padding.top);
    context.lineTo(x, padding.top + plotHeight);
    context.stroke();
  }

  context.strokeStyle = colors.axis;
  context.strokeRect(padding.left, padding.top, plotWidth, plotHeight);
  context.fillStyle = colors.muted;
  context.font = '12px ui-monospace, Menlo, monospace';
  context.fillText(yMax.toFixed(1), 8, padding.top + 8);
  context.fillText(yMin.toFixed(1), 8, padding.top + plotHeight);
  context.restore();
}

function drawZeroLine(context, padding, plotWidth, yMin, yMax, plotHeight) {
  const y = toY(0, padding, plotHeight, yMin, yMax);
  context.save();
  context.strokeStyle = colors.ink;
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(padding.left, y);
  context.lineTo(padding.left + plotWidth, y);
  context.stroke();
  context.restore();
}

function drawCurve(context, values, padding, plotWidth, plotHeight, yMin, yMax, color) {
  context.save();
  context.strokeStyle = color;
  context.lineWidth = 3;
  context.lineJoin = 'round';
  context.lineCap = 'round';
  context.beginPath();
  values.forEach((value, index) => {
    const x = toX(index, padding, plotWidth);
    const y = toY(value, padding, plotHeight, yMin, yMax);
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  });
  context.stroke();
  context.restore();
}

function drawVerdictBadge(context, width, similar) {
  const text = similar ? 'similar' : 'different';
  context.save();
  context.font = '700 16px ui-sans-serif, system-ui';
  const textWidth = context.measureText(text).width;
  const badgeWidth = textWidth + 28;
  const x = width - badgeWidth - 22;
  const y = 22;
  context.fillStyle = similar ? 'rgba(31, 122, 77, 0.15)' : 'rgba(154, 103, 29, 0.17)';
  context.strokeStyle = similar ? 'rgba(31, 122, 77, 0.55)' : 'rgba(154, 103, 29, 0.55)';
  roundRect(context, x, y, badgeWidth, 34, 8);
  context.fill();
  context.stroke();
  context.fillStyle = similar ? colors.green : colors.amber;
  context.fillText(text, x + 14, y + 22);
  context.restore();
}

function drawSignTrack(trackCanvas, blueSigns, redSigns) {
  const c = trackCanvas.getContext('2d');
  const w = trackCanvas.width;
  const h = trackCanvas.height;
  c.clearRect(0, 0, w, h);
  c.fillStyle = colors.paper;
  c.fillRect(0, 0, w, h);
  c.strokeStyle = colors.grid;
  c.beginPath();
  c.moveTo(0, h / 2);
  c.lineTo(w, h / 2);
  c.stroke();
  drawSignLine(c, blueSigns, w, h, 1, colors.blue);
  drawSignLine(c, redSigns, w, h, 0.86, colors.red);
}

function drawSignLine(context, signs, width, height, scale, color) {
  context.save();
  context.strokeStyle = color;
  context.lineWidth = 3;
  context.lineJoin = 'miter';
  context.beginPath();
  signs.forEach((value, index) => {
    const x = (index / (signs.length - 1)) * width;
    const y = height / 2 - value * scale * height * 0.34;
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  });
  context.stroke();
  context.restore();
}

function roundRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

els.similarButton.addEventListener('click', () => answer(true));
els.differentButton.addEventListener('click', () => answer(false));
els.nextButton.addEventListener('click', startRound);
els.newRoundButton.addEventListener('click', startRound);
els.resetButton.addEventListener('click', resetGame);
els.includeFCheckbox.addEventListener('change', () => {
  if (!state.revealed) {
    state.roundData.includeF = els.includeFCheckbox.checked;
  }
  drawGraph();
});
els.showAxisCheckbox.addEventListener('change', drawGraph);
els.soundCheckbox.addEventListener('change', () => {
  state.soundEnabled = els.soundCheckbox.checked;
  saveSoundPreference(state.soundEnabled);
});
els.wiggleSlider.addEventListener('input', () => {
  if (!state.revealed) return;
  els.promptText.textContent = 'Use New to draw another pair with this difference setting.';
});
window.addEventListener('resize', drawGraph);

resetGame();

if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
  navigator.serviceWorker.register('service-worker.js').catch(() => {
    // The game still works normally if offline caching is unavailable.
  });
}
