// ==========================================
// DEV MODE & STORAGE KEYS
// ==========================================
// Developer tools (+1 Day, Sim Tomorrow) only appear with ?dev=1 in the URL.
// Dev mode uses its own storage so testing never touches real stats/streaks.
const URL_PARAMS = new URLSearchParams(window.location.search);
const DEV_MODE = URL_PARAMS.has('dev');
const STORAGE_PREFIX = DEV_MODE ? 'keystone_dev_' : 'keystone_';
const SOUND_STORAGE_KEY = 'keystone_sound_v1';
const LANG_STORAGE_KEY = 'splice_lang_v1';
const KEEP_DAILY_SAVES_DAYS = 7;

function storageGet(key) {
  try { return localStorage.getItem(key); } catch (_) { return null; }
}
function storageSet(key, value) {
  try { localStorage.setItem(key, value); } catch (_) {}
}

// ==========================================
// LANGUAGE (EN / FR)
// ==========================================
// ?lang=fr in the URL wins, then the player's saved choice, then the browser.
const LANGS = ['en', 'fr'];
function detectLang() {
  const fromUrl = (URL_PARAMS.get('lang') || '').toLowerCase();
  if (LANGS.includes(fromUrl)) return fromUrl;
  const saved = storageGet(LANG_STORAGE_KEY);
  if (LANGS.includes(saved)) return saved;
  const nav = (typeof navigator !== 'undefined' && navigator.language) || 'en';
  return nav.toLowerCase().startsWith('fr') ? 'fr' : 'en';
}
let LANG = detectLang();

// Each language keeps its own stats, streak and daily saves.
// English keeps the original keys so existing players lose nothing.
function langPrefix() {
  return STORAGE_PREFIX + (LANG === 'en' ? '' : `${LANG}_`);
}
function statsStorageKey() { return `${langPrefix()}player_stats_v1`; }
function dailyKeyPrefix() { return `${langPrefix()}daily_state_v3_`; }

const STRINGS = {
  en: {
    howToPlay: 'How to play',
    statistics: 'Statistics',
    played: 'Played',
    winPct: 'Win %',
    streak: 'Streak',
    best: 'Best',
    nextSplice: 'Next Splice',
    share: 'Share',
    close: 'Close',
    solved: 'Solved!',
    outOfTurns: 'Out of turns',
    todaysWord: w => `Today’s word was ${w}`,
    answerWas: w => `The answer was ${w}`,
    notEnough: 'Not enough letters',
    alreadyTried: 'Already tried',
    lastTurnGuess: 'Last turn — make it a guess',
    lastTurn: 'Last turn',
    tapReveal: 'TAP TO REVEAL',
    lastTurnLocked: 'LAST TURN: GUESS',
    revealAria: 'Reveal a clue (costs 1 turn)',
    turnsAria: (left, max) => `${left} of ${max} turns left`,
    copied: 'Copied to clipboard',
    copyFail: 'Couldn’t copy — select the text and copy it',
    enterKey: 'ENTER',
    backspace: 'Backspace',
    soundOff: 'Mute sound',
    soundOn: 'Turn sound on',
    langBtn: 'FR',
    langAria: 'Jouer en français',
    devSim: 'Dev: simulate tomorrow',
    shareTag: '',
    help: `
      <p>Find the one word that joins every clue.</p>
      <div class="help-example">
        <div class="clue-row"><span>FLASH</span><span class="blank"></span></div>
        <div class="clue-row"><span class="blank"></span><span>HOUSE</span></div>
      </div>
      <p class="help-answer">→ <strong>LIGHT</strong> (flashlight, lighthouse)</p>
      <p>You get <strong>5 turns</strong>. Each turn, either guess a word or tap a hidden clue to reveal it. Your last turn must be a guess.</p>
      <p>A new Splice every day at midnight.</p>`,
    keyboard: [
      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
      ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
    ]
  },
  fr: {
    howToPlay: 'Comment jouer',
    statistics: 'Statistiques',
    played: 'Parties',
    winPct: '% gagnées',
    streak: 'Série',
    best: 'Record',
    nextSplice: 'Prochain Splice',
    share: 'Partager',
    close: 'Fermer',
    solved: 'Trouvé !',
    outOfTurns: 'Plus de tours',
    todaysWord: w => `Le mot du jour était ${w}`,
    answerWas: w => `La réponse était ${w}`,
    notEnough: 'Pas assez de lettres',
    alreadyTried: 'Déjà essayé',
    lastTurnGuess: 'Dernier tour : proposez un mot',
    lastTurn: 'Dernier tour',
    tapReveal: 'TOUCHER POUR RÉVÉLER',
    lastTurnLocked: 'DERNIER TOUR : DEVINEZ',
    revealAria: 'Révéler un indice (coûte 1 tour)',
    turnsAria: (left, max) => `${left} tour${left > 1 ? 's' : ''} restant${left > 1 ? 's' : ''} sur ${max}`,
    copied: 'Copié dans le presse-papiers',
    copyFail: 'Copie impossible : sélectionnez le texte et copiez-le',
    enterKey: 'ENTRÉE',
    backspace: 'Effacer',
    soundOff: 'Couper le son',
    soundOn: 'Activer le son',
    langBtn: 'EN',
    langAria: 'Play in English',
    devSim: 'Dev : simuler demain',
    shareTag: ' FR',
    help: `
      <p>Trouvez le mot qui complète tous les indices.</p>
      <div class="help-example">
        <div class="clue-row"><span>MOT DE</span><span class="blank"></span></div>
        <div class="clue-row"><span class="blank"></span><span>PARTOUT</span></div>
      </div>
      <p class="help-answer">→ <strong>PASSE</strong> (mot de passe, passe-partout)</p>
      <p>Vous avez <strong>5 tours</strong>. À chaque tour, proposez un mot ou touchez un indice caché pour le révéler. Le dernier tour doit être une proposition.</p>
      <p>Tapez sans accents : TÊTE s’écrit TETE.</p>
      <p>Un nouveau Splice chaque jour à minuit.</p>`,
    keyboard: [
      ['A', 'Z', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      ['Q', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M'],
      ['ENTER', 'W', 'X', 'C', 'V', 'B', 'N', 'BACKSPACE']
    ]
  }
};

function t(key, ...args) {
  const val = STRINGS[LANG][key];
  return typeof val === 'function' ? val(...args) : val;
}

// Fill every element marked data-i18n / data-i18n-aria with the current language.
function applyStaticText() {
  if (document.documentElement) document.documentElement.lang = LANG;
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    el.setAttribute('aria-label', t(el.dataset.i18nAria));
  });
  const helpBody = document.getElementById('help-body');
  if (helpBody) helpBody.innerHTML = t('help');
}

function toggleLanguage() {
  LANG = LANG === 'en' ? 'fr' : 'en';
  storageSet(LANG_STORAGE_KEY, LANG);
  sfxTap();
  closeResultModal();
  applyStaticText();
  renderSoundButton();
  renderKeyboard();
  initDailyGame();
}

// Typed form of a word: no accents, Œ -> OE, letters only (TÊTE -> TETE).
function toTypedForm(str) {
  return str.toUpperCase()
    .replace(/Œ/g, 'OE').replace(/Æ/g, 'AE')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Z]/g, '');
}

// ==========================================
// WEB AUDIO SYNTHESIZER
// ==========================================
let soundEnabled = storageGet(SOUND_STORAGE_KEY) !== 'off';
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) audioCtx = new AudioContext();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(freq, type = 'sine', duration = 0.1, delay = 0, vol = 0.12) {
  if (!soundEnabled) return;
  const ctx = getAudioCtx();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

  gain.gain.setValueAtTime(vol, ctx.currentTime + delay);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime + delay);
  osc.stop(ctx.currentTime + delay + duration);
}

function sfxTap() { playTone(520, 'triangle', 0.06, 0, 0.1); }
function sfxFlip() {
  playTone(480, 'triangle', 0.08, 0, 0.12);
  playTone(720, 'sine', 0.11, 0.06, 0.12);
}
function sfxError() {
  playTone(210, 'sawtooth', 0.12, 0, 0.1);
  playTone(170, 'sawtooth', 0.18, 0.1, 0.1);
}
function sfxWin() {
  [523.25, 659.25, 783.99, 1046.5].forEach((f, idx) => {
    playTone(f, 'triangle', 0.22, idx * 0.09, 0.15);
  });
}

const ICON_SOUND_ON = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a10 10 0 0 1 0 14"/></svg>';
const ICON_SOUND_OFF = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="m22 9-6 6M16 9l6 6"/></svg>';

function renderSoundButton() {
  const btn = document.getElementById('btn-sound');
  btn.innerHTML = soundEnabled ? ICON_SOUND_ON : ICON_SOUND_OFF;
  btn.setAttribute('aria-label', soundEnabled ? t('soundOff') : t('soundOn'));
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  storageSet(SOUND_STORAGE_KEY, soundEnabled ? 'on' : 'off');
  renderSoundButton();
  if (soundEnabled) sfxTap();
}

// ==========================================
// MASTER WORD DECK
// ==========================================
// RAW_DECK lives in words.js and RAW_DECK_FR in words-fr.js (both loaded
// before this file); their headers explain the clue format and the rule for
// adding words. `answer` is shown to the player; `key` is what they type.
function buildDeck(raw) {
  return raw.map(([answer, ...clues]) => ({
    answer,
    key: toTypedForm(answer),
    pool: clues.map(clue => ({
      word: clue.replace('*', '').replace(/^[\s-]+|[\s-]+$/g, ''),
      pos: clue.startsWith('*') ? 'after' : 'before',
      full: clue.replace('*', answer)
    }))
  }));
}

const DECKS = {
  en: buildDeck(RAW_DECK),
  fr: buildDeck(typeof RAW_DECK_FR !== 'undefined' ? RAW_DECK_FR : RAW_DECK)
};
function activeDeck() { return DECKS[LANG]; }

// ==========================================
// DAILY EPOCH & MIDNIGHT RESET ENGINE
// ==========================================
// Launch Epoch: Local Midnight of Nov 18, 2026 (DayIndex = 0 -> Daily #1)
const EPOCH_YEAR = 2026;
const EPOCH_MONTH = 10; // 0-indexed (10 = November)
const EPOCH_DAY = 18;

// Developer offset to simulate advancing days (+1 Day button, dev mode only)
let devDayOffset = 0;
let activeDayIndex = 0;

function getLocalMidnightMs(dateObj = new Date()) {
  return new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()).getTime();
}

function getTodayDayIndex() {
  const epochMidnight = new Date(EPOCH_YEAR, EPOCH_MONTH, EPOCH_DAY).getTime();
  const todayMidnight = getLocalMidnightMs(new Date());
  const realDiffDays = Math.max(0, Math.round((todayMidnight - epochMidnight) / 86400000));
  return realDiffDays + devDayOffset;
}

function getFormattedDateForDayIndex(dayIndex) {
  const d = new Date(EPOCH_YEAR, EPOCH_MONTH, EPOCH_DAY + dayIndex);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function seededShuffle(arr, seed) {
  const copy = [...arr];
  let s = seed * 9301 + 49297;
  for (let i = copy.length - 1; i > 0; i--) {
    s = (s * 233280 + 12345) % 2147483647;
    const j = Math.abs(s) % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// The first pass plays words.js in file order, so appending new words never
// changes an existing day. Later passes reuse the deck in a seeded shuffle.
function getRawCycleQueue(cycleIndex) {
  const indices = activeDeck().map((_, idx) => idx);
  if (cycleIndex === 0) return indices;
  return seededShuffle(indices, (cycleIndex + 1) * 101 + 7);
}

// Answer order for one pass through the deck. The first word of a cycle is
// never the same as the last word of the previous cycle (no repeat days).
// Swapping positions 0 and 1 never changes the last position, so the previous
// cycle's raw last word is always its real last word.
function getCycleQueue(cycleIndex) {
  const queue = getRawCycleQueue(cycleIndex);
  if (cycleIndex > 0 && queue.length > 2) {
    const prev = getRawCycleQueue(cycleIndex - 1);
    if (queue[0] === prev[prev.length - 1]) {
      [queue[0], queue[1]] = [queue[1], queue[0]];
    }
  }
  return queue;
}

// Deterministic mapping: any dayIndex -> exact Word + exact 5 Clues
function getDailyPuzzleForDay(dayIndex) {
  const deck = activeDeck();
  const deckSize = deck.length;
  const cycleIndex = Math.floor(dayIndex / deckSize); // 0, 1, 2...
  const posInCycle = dayIndex % deckSize;

  const wordEntry = deck[getCycleQueue(cycleIndex)[posInCycle]];

  // Select 5 clues based on cycleIndex (Deck Rotation!)
  const pool = wordEntry.pool;
  let chosen;
  if (cycleIndex === 0) {
    chosen = pool.slice(0, 5);
  } else if (cycleIndex === 1) {
    chosen = pool.slice(5, 10);
  } else {
    const rotatedPool = seededShuffle(pool, cycleIndex * 73 + wordEntry.key.charCodeAt(0));
    chosen = rotatedPool.slice(0, 5);
  }

  const setChar = String.fromCharCode(65 + (cycleIndex % 26));
  return {
    dayNumber: dayIndex + 1,
    cycleNumber: cycleIndex + 1,
    wordEntry,
    activeClues: chosen,
    variationLabel: `Clue Set ${setChar}`
  };
}

// ==========================================
// LOCALSTORAGE PERSISTENCE & STREAK STATS
// ==========================================
function getDailyStorageKey(dayIndex) {
  return `${dailyKeyPrefix()}${dayIndex}`;
}

function loadPlayerStats() {
  const raw = storageGet(statsStorageKey());
  if (raw) {
    try { return JSON.parse(raw); } catch (_) {}
  }
  return {
    played: 0,
    wins: 0,
    currentStreak: 0,
    maxStreak: 0,
    lastCompletedDay: null
  };
}

function savePlayerStats(stats) {
  storageSet(statsStorageKey(), JSON.stringify(stats));
}

// The stored streak is only still alive if the last finished day was today
// or yesterday; otherwise the player missed a day and the streak is 0.
function getLiveStreak(stats, todayIndex) {
  if (stats.lastCompletedDay === null || stats.lastCompletedDay === undefined) return 0;
  return stats.lastCompletedDay >= todayIndex - 1 ? stats.currentStreak : 0;
}

function recordDailyCompletion(dayIndex, isWin) {
  const stats = loadPlayerStats();
  if (stats.lastCompletedDay !== null && stats.lastCompletedDay !== undefined &&
      dayIndex <= stats.lastCompletedDay) {
    return stats; // Already recorded (or an older day) - never count twice
  }

  stats.played += 1;
  if (isWin) {
    stats.wins += 1;
    stats.currentStreak = stats.lastCompletedDay === dayIndex - 1 ? stats.currentStreak + 1 : 1;
    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
  } else {
    stats.currentStreak = 0;
  }

  stats.lastCompletedDay = dayIndex;
  savePlayerStats(stats);
  return stats;
}

function saveDailyBoardState() {
  const payload = {
    dayIndex: ksState.dayIndex,
    tileStates: ksState.tileStates,
    turnsUsed: ksState.turnsUsed,
    guesses: ksState.guesses,
    history: ksState.history,
    solved: ksState.solved,
    gameOver: ksState.gameOver,
    shareText: ksState.shareText || ''
  };
  storageSet(getDailyStorageKey(ksState.dayIndex), JSON.stringify(payload));
}

function loadDailyBoardState(dayIndex) {
  const raw = storageGet(getDailyStorageKey(dayIndex));
  if (raw) {
    try { return JSON.parse(raw); } catch (_) {}
  }
  return null;
}

// Remove board saves older than a week, plus saves from the old v1 format.
function pruneOldDailySaves(todayIndex) {
  try {
    const toRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (/^keystone_(dev_)?daily_state_v[12]_/.test(key)) {
        toRemove.push(key); // saves from older puzzle schedules
      } else if (key.startsWith(dailyKeyPrefix())) {
        const idx = parseInt(key.slice(dailyKeyPrefix().length), 10);
        if (!Number.isNaN(idx) && idx < todayIndex - KEEP_DAILY_SAVES_DAYS) toRemove.push(key);
      }
    }
    toRemove.forEach(key => localStorage.removeItem(key));
  } catch (_) {}
}

// ==========================================
// GAME STATE & INITIALIZATION
// ==========================================
const TURNS_MAX = 5;

let ksState = {
  dayIndex: 0,
  dayNumber: 1,
  wordEntry: null,
  activeClues: [],
  variationLabel: 'Clue Set A',
  tileStates: [],
  turnsMax: TURNS_MAX,
  turnsUsed: 0,
  currentInput: '',
  guesses: [],
  history: [], // one entry per turn: 'flip' | 'miss' | 'hit'
  solved: false,
  gameOver: false,
  shareText: ''
};

function shakeWord() {
  const el = document.getElementById('ks-word-slots');
  el.classList.remove('shake');
  void el.offsetWidth; // restart the animation
  el.classList.add('shake');
}

function initDailyGame() {
  activeDayIndex = getTodayDayIndex();
  pruneOldDailySaves(activeDayIndex);
  const dailyData = getDailyPuzzleForDay(activeDayIndex);
  const saved = loadDailyBoardState(activeDayIndex);

  ksState = {
    dayIndex: activeDayIndex,
    dayNumber: dailyData.dayNumber,
    wordEntry: dailyData.wordEntry,
    activeClues: dailyData.activeClues,
    variationLabel: dailyData.variationLabel,
    tileStates: saved ? saved.tileStates : ['starter', 'starter', 'locked', 'locked', 'locked'],
    turnsMax: TURNS_MAX,
    turnsUsed: saved ? saved.turnsUsed : 0,
    currentInput: '',
    guesses: saved ? saved.guesses : [],
    history: saved && Array.isArray(saved.history) ? saved.history : [],
    solved: saved ? saved.solved : false,
    gameOver: saved ? saved.gameOver : false,
    shareText: saved ? (saved.shareText || '') : ''
  };

  renderKeystone();
}

function simulateNextDay() {
  if (!DEV_MODE) return;
  sfxFlip();
  devDayOffset += 1;
  initDailyGame();
  showToast(`Dev: Daily #${ksState.dayNumber}`);
}

// ==========================================
// GAMEPLAY INTERACTIONS
// ==========================================
function turnsLeft() {
  return Math.max(0, ksState.turnsMax - ksState.turnsUsed);
}

function flipClueTile(clueIdx) {
  if (ksState.gameOver) return;
  if (ksState.tileStates[clueIdx] !== 'locked') return;
  if (turnsLeft() <= 1) {
    sfxError();
    showToast(t('lastTurnGuess'));
    return;
  }

  sfxFlip();
  ksState.turnsUsed += 1;
  ksState.tileStates[clueIdx] = 'extra';
  ksState.history.push('flip');

  if (turnsLeft() === 1) showToast(t('lastTurnGuess'));

  saveDailyBoardState();
  renderKeystone();
}

function handleKeystoneKey(key) {
  if (ksState.gameOver) return;
  const targetLen = ksState.wordEntry.key.length;

  if (key === 'BACKSPACE') {
    if (ksState.currentInput.length > 0) {
      sfxTap();
      ksState.currentInput = ksState.currentInput.slice(0, -1);
      renderKeystoneInput();
    }
    return;
  }

  if (key === 'ENTER') {
    if (ksState.currentInput.length < targetLen) {
      sfxError();
      shakeWord();
      showToast(t('notEnough'));
      return;
    }
    submitKeystoneGuess();
    return;
  }

  if (/^[A-Z]$/.test(key) && ksState.currentInput.length < targetLen) {
    sfxTap();
    ksState.currentInput += key;
    renderKeystoneInput();
  }
}

function buildShareText() {
  const clueRow = ksState.tileStates.map(st => {
    if (st === 'starter') return '🟦';
    if (st === 'extra') return '🟨';
    return ksState.solved ? '🟩' : '⬜';
  }).join('');
  const turnRow = ksState.history.map(h => (h === 'flip' ? '🔓' : h === 'miss' ? '❌' : '🎯')).join('');
  const score = ksState.solved ? `${ksState.turnsUsed}/${ksState.turnsMax}` : `X/${ksState.turnsMax}`;
  return `🧩 Splice${t('shareTag')} #${ksState.dayNumber} ${score}\n${clueRow}\n${turnRow}`;
}

function submitKeystoneGuess() {
  const guess = ksState.currentInput.toUpperCase();
  const answer = ksState.wordEntry.key;

  if (guess === answer) {
    ksState.solved = true;
    ksState.gameOver = true;
    ksState.turnsUsed += 1;
    ksState.history.push('hit');
    sfxWin();

    ksState.shareText = buildShareText();
    recordDailyCompletion(ksState.dayIndex, true);
    saveDailyBoardState();
    renderKeystone();

    setTimeout(() => openStatsModal(), 420);
    return;
  }

  // Repeated wrong guess: don't charge a turn for it
  if (ksState.guesses.includes(guess)) {
    sfxError();
    shakeWord();
    showToast(t('alreadyTried'));
    return;
  }

  // Wrong guess: costs a turn, but does NOT reveal a clue.
  // Revealing clues is the player's choice (tap a locked stone).
  sfxError();
  ksState.guesses.push(guess);
  ksState.history.push('miss');
  ksState.currentInput = '';
  ksState.turnsUsed += 1;

  if (turnsLeft() === 0) {
    ksState.gameOver = true;
    ksState.shareText = buildShareText();
    recordDailyCompletion(ksState.dayIndex, false);
    saveDailyBoardState();
    renderKeystone();

    setTimeout(() => openStatsModal(), 450);
    return;
  }

  shakeWord();
  if (turnsLeft() === 1) showToast(t('lastTurn'));

  saveDailyBoardState();
  renderKeystone();
}

// ==========================================
// RENDERING & MIDNIGHT TICKER
// ==========================================
function renderKeystone() {
  // Turns: one dot per turn, filled once used
  const turnsEl = document.getElementById('ks-turns');
  turnsEl.innerHTML = Array.from({ length: ksState.turnsMax }, (_, i) =>
    `<span class="turn-dot ${i < ksState.turnsUsed ? 'used' : ''}"></span>`).join('');
  turnsEl.setAttribute('aria-label', t('turnsAria', turnsLeft(), ksState.turnsMax));

  // Clues: one row each, blank shows where the answer goes
  const ans = ksState.wordEntry.answer;
  const canFlip = !ksState.gameOver && turnsLeft() > 1;
  document.getElementById('ks-grid').innerHTML = ksState.activeClues.map((clue, idx) => {
    const state = ksState.tileStates[idx];

    if (state === 'locked' && !ksState.gameOver) {
      return `<button type="button" class="clue-row locked" onclick="flipClueTile(${idx})"
        ${canFlip ? '' : 'disabled'} aria-label="${t('revealAria')}">
        ${canFlip ? t('tapReveal') : t('lastTurnLocked')}</button>`;
    }

    let cls = '';
    if (state === 'extra') cls = 'flipped';
    else if (state === 'locked') cls = ksState.solved ? 'bonus' : 'unused';

    const blank = ksState.gameOver
      ? `<span class="answer-part">${ans}</span>`
      : '<span class="blank"></span>';
    const word = `<span>${clue.word}</span>`;
    const parts = clue.pos === 'before' ? word + blank : blank + word;
    const longCls = clue.word.length > 13 ? 'long' : '';
    return `<div class="clue-row ${cls} ${longCls}">${parts}</div>`;
  }).join('');

  // Wrong guesses
  document.getElementById('ks-guess-list').innerHTML =
    ksState.guesses.map(g => `<span>${g}</span>`).join('');

  // Keyboard vs. finished bar
  document.getElementById('ks-keyboard').classList.toggle('hidden', ksState.gameOver);
  document.getElementById('ks-locked-banner').classList.toggle('hidden', !ksState.gameOver);

  renderKeystoneInput();
}

function renderKeystoneInput() {
  const len = ksState.wordEntry.key.length;
  const word = ksState.gameOver ? ksState.wordEntry.key : ksState.currentInput;
  const endCls = ksState.solved ? 'solved' : (ksState.gameOver ? 'failed' : '');

  let html = '';
  for (let i = 0; i < len; i++) {
    const ch = word[i] || '';
    html += `<div class="letter-box ${ch ? 'filled' : ''} ${endCls}">${ch}</div>`;
  }
  document.getElementById('ks-word-slots').innerHTML = html;
}

function formatMsToHMS(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const hrs = String(Math.floor(totalSec / 3600)).padStart(2, '0');
  const mins = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
  const secs = String(totalSec % 60).padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
}

function startMidnightTicker() {
  const tick = () => {
    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime();
    const formatted = formatMsToHMS(nextMidnight - now.getTime());

    const modalClock = document.getElementById('modal-countdown');
    const bannerClock = document.getElementById('banner-countdown');
    if (modalClock) modalClock.textContent = formatted;
    if (bannerClock) bannerClock.textContent = formatted;

    // Auto-rollover if real midnight passes while page is open!
    if (getTodayDayIndex() !== activeDayIndex) {
      initDailyGame();
    }
  };
  tick();
  setInterval(tick, 1000);
}

// ==========================================
// MODALS & KEYBOARD
// ==========================================
function openStatsModal() {
  const stats = loadPlayerStats();
  const winPct = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;

  document.getElementById('stat-played').textContent = stats.played;
  document.getElementById('stat-win-pct').textContent = winPct;
  document.getElementById('stat-streak').textContent = getLiveStreak(stats, ksState.dayIndex);
  document.getElementById('stat-max-streak').textContent = stats.maxStreak;

  const titleEl = document.getElementById('modal-title');
  const subEl = document.getElementById('modal-subtitle');
  const shareEl = document.getElementById('modal-share-preview');
  const copyBtn = document.getElementById('btn-copy-share');

  if (ksState.gameOver) {
    titleEl.textContent = ksState.solved ? t('solved') : t('outOfTurns');
    subEl.textContent = ksState.solved
      ? t('todaysWord', ksState.wordEntry.answer)
      : t('answerWas', ksState.wordEntry.answer);
    shareEl.textContent = ksState.shareText;
    shareEl.classList.remove('hidden');
    copyBtn.disabled = false;
  } else {
    titleEl.textContent = t('statistics');
    subEl.textContent = '';
    shareEl.classList.add('hidden');
    copyBtn.disabled = true;
  }

  document.getElementById('result-modal').classList.remove('hidden');
}

function closeResultModal() {
  document.getElementById('result-modal').classList.add('hidden');
}

let toastTimer = null;
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 2200);
}

function legacyCopy(text) {
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch (_) {
    return false;
  }
}

async function copyShareReceipt() {
  if (!ksState.shareText) return;
  let ok = false;
  try {
    await navigator.clipboard.writeText(ksState.shareText);
    ok = true;
  } catch (_) {
    ok = legacyCopy(ksState.shareText);
  }
  showToast(ok ? t('copied') : t('copyFail'));
}

function openHelpModal() {
  sfxTap();
  document.getElementById('help-modal').classList.remove('hidden');
}

function closeHelpModal() {
  document.getElementById('help-modal').classList.add('hidden');
}

// On-screen keyboard: QWERTY in English, AZERTY in French.
function renderKeyboard() {
  const rows = t('keyboard');
  const kbEl = document.getElementById('ks-keyboard');
  kbEl.innerHTML = rows.map(row => `
    <div class="kb-row">
      ${row.map(k => {
        const isWide = k === 'ENTER' || k === 'BACKSPACE';
        const label = k === 'BACKSPACE' ? '⌫' : (k === 'ENTER' ? t('enterKey') : k);
        const aria = k === 'BACKSPACE' ? `aria-label="${t('backspace')}"` : '';
        const extraCls = k === 'BACKSPACE' ? 'wide back' : (isWide ? 'wide' : '');
        // blur() so a later physical Enter submits instead of re-pressing this key
        return `<button type="button" class="kb-key ${extraCls}" ${aria} onclick="handleKeystoneKey('${k}'); this.blur();">${label}</button>`;
      }).join('')}
    </div>
  `).join('');
}

function initKeyboard() {
  renderKeyboard();
  window.addEventListener('keydown', (e) => {
    const resultOpen = !document.getElementById('result-modal').classList.contains('hidden');
    const helpOpen = !document.getElementById('help-modal').classList.contains('hidden');

    if (e.key === 'Escape') {
      if (resultOpen) closeResultModal();
      if (helpOpen) closeHelpModal();
      return;
    }
    if (resultOpen || helpOpen) return;

    // Leave browser/OS shortcuts alone (Cmd+R, Ctrl+C, ...)
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    // Let Enter/Space activate a focused clue stone (keyboard accessibility)
    if ((e.key === 'Enter' || e.key === ' ') && e.target.closest && e.target.closest('.clue-row')) return;

    if (e.key === 'Backspace') {
      e.preventDefault();
      handleKeystoneKey('BACKSPACE');
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleKeystoneKey('ENTER');
    } else if (e.key.length === 1) {
      // Accented keys count as the plain letter (é -> E), as answers are typed without accents
      const letter = toTypedForm(e.key);
      if (/^[A-Z]$/.test(letter)) handleKeystoneKey(letter);
    }
  });
}

window.addEventListener('DOMContentLoaded', () => {
  if (DEV_MODE) {
    document.querySelectorAll('.dev-only').forEach(el => el.classList.remove('hidden'));
  }
  applyStaticText();
  renderSoundButton();
  initKeyboard();
  initDailyGame();
  startMidnightTicker();

  // First visit: explain the rules once
  if (!storageGet('keystone_seen_help_v1')) {
    storageSet('keystone_seen_help_v1', '1');
    openHelpModal();
  }
});
