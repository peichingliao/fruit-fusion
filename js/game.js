'use strict';

// ─── Matter.js aliases ────────────────────────────────────────────────────────
const { Engine, World, Bodies, Body, Events } = Matter;

// ─── DOM refs ─────────────────────────────────────────────────────────────────
const canvas        = document.getElementById('gameCanvas');
const ctx           = canvas.getContext('2d');
const timerEl       = document.getElementById('timerDisplay');
const scoreEl       = document.getElementById('scoreDisplay');
const targetEl      = document.getElementById('targetDisplay');
const nextEmojiEl   = document.getElementById('nextFruitEmoji');
const nextNameEl    = document.getElementById('nextFruitName');
const progressBar   = document.getElementById('progressBar');

// ─── Layout constants (computed once per game start) ──────────────────────────
// Initialize to 0 so the initial render() call (before any game starts) is a no-op
let CANVAS_W = 0, CANVAS_H = 0;
let CUP_L = 0, CUP_R = 0, CUP_TOP = 0, CUP_BOT = 0;
let DROP_Y = 0;
let DANGER_Y = 0;

// ─── Physics ──────────────────────────────────────────────────────────────────
let engine, world;

// ─── Game state ───────────────────────────────────────────────────────────────
let gameStatus       = 'menu'; // 'menu' | 'playing' | 'paused' | 'won' | 'lost'
let currentDiffKey   = null;
let score            = 0;
let timeRemaining    = 0;
let lastTimestamp    = 0;

let fruits           = [];          // [{ body, type }]
let pendingMerges    = [];          // [{ bodyA, bodyB }]
let mergingIds       = new Set();   // body ids currently being merged

let currentDropType  = 1;           // type held by player
let nextDropType     = 1;
let dropX            = 0;
let canDrop          = true;
let dropCooldown     = 0;
const DROP_COOLDOWN  = 450;         // ms between drops

let overflowTimer    = 0;
const OVERFLOW_LIMIT = 2500;        // ms before game-over on overflow

// ─── Layout calculation ────────────────────────────────────────────────────────
function calcLayout() {
  const headerH = document.getElementById('gameHeader').offsetHeight;
  const footerH = document.getElementById('gameFooter').offsetHeight;
  const barH    = document.getElementById('progressBar').offsetHeight;
  const availH  = window.innerHeight - headerH - footerH - barH;
  const availW  = window.innerWidth;

  CANVAS_W = Math.min(availW, 420);
  CANVAS_H = Math.min(availH, Math.round(CANVAS_W * 1.55));

  canvas.width  = CANVAS_W;
  canvas.height = CANVAS_H;
  canvas.style.width  = CANVAS_W + 'px';
  canvas.style.height = CANVAS_H + 'px';

  const padX = Math.round(CANVAS_W * 0.08);
  CUP_L   = padX;
  CUP_R   = CANVAS_W - padX;
  CUP_TOP = Math.round(CANVAS_H * 0.08);
  CUP_BOT = CANVAS_H - 8;

  DROP_Y   = Math.round(CUP_TOP * 0.45);
  DANGER_Y = CUP_TOP + 28;
}

// ─── Physics setup ────────────────────────────────────────────────────────────
function initPhysics() {
  if (engine) {
    Events.off(engine);
    World.clear(world);
    Engine.clear(engine);
  }

  engine = Engine.create({ gravity: { y: 1.8 } });
  world  = engine.world;

  const wallOpts = { isStatic: true, label: 'wall', restitution: 0.25, friction: 0.6 };
  const cupW = CUP_R - CUP_L;
  const cupH = CUP_BOT - CUP_TOP;
  const thick = 12;

  World.add(world, [
    Bodies.rectangle(CUP_L - thick / 2,  CUP_TOP + cupH / 2, thick, cupH + thick * 2, wallOpts),
    Bodies.rectangle(CUP_R + thick / 2,  CUP_TOP + cupH / 2, thick, cupH + thick * 2, wallOpts),
    Bodies.rectangle(CUP_L + cupW / 2,   CUP_BOT + thick / 2, cupW + thick * 2, thick, wallOpts),
  ]);

  Events.on(engine, 'collisionStart', onCollision);
}

// ─── Fruit management ─────────────────────────────────────────────────────────
function makeFruitBody(type, x, y) {
  const r    = FRUITS_DATA[type - 1].radius;
  const body = Bodies.circle(x, y, r, {
    label:       'fruit',
    restitution: 0.3,
    friction:    0.55,
    frictionAir: 0.008,
  });
  body.fruitType = type;
  World.add(world, body);
  return { body, type };
}

function dropFruit(x) {
  if (!canDrop || gameStatus !== 'playing') return;
  const r = FRUITS_DATA[currentDropType - 1].radius;
  const cx = Math.max(CUP_L + r + 2, Math.min(CUP_R - r - 2, x));
  fruits.push(makeFruitBody(currentDropType, cx, DROP_Y));
  canDrop          = false;
  dropCooldown     = DROP_COOLDOWN;
  currentDropType  = nextDropType;
  pickNextFruit();
}

function pickNextFruit() {
  const types     = DIFFICULTY_CONFIG[currentDiffKey].dropTypes;
  nextDropType    = types[Math.floor(Math.random() * types.length)];
  const fd        = FRUITS_DATA[nextDropType - 1];
  nextEmojiEl.textContent = fd.emoji;
  nextNameEl.textContent  = fd.name;
}

// ─── Collision handling ───────────────────────────────────────────────────────
function onCollision(event) {
  event.pairs.forEach(({ bodyA, bodyB }) => {
    if (bodyA.label !== 'fruit' || bodyB.label !== 'fruit') return;
    if (bodyA.fruitType !== bodyB.fruitType)               return;
    if (bodyA.fruitType >= 15)                             return;
    if (mergingIds.has(bodyA.id) || mergingIds.has(bodyB.id)) return;

    mergingIds.add(bodyA.id);
    mergingIds.add(bodyB.id);
    pendingMerges.push({ bodyA, bodyB });
  });
}

function processMerges() {
  if (!pendingMerges.length) return;

  pendingMerges.forEach(({ bodyA, bodyB }) => {
    const fa = fruits.find(f => f.body === bodyA);
    const fb = fruits.find(f => f.body === bodyB);
    if (!fa || !fb) return;

    const mx      = (bodyA.position.x + bodyB.position.x) / 2;
    const my      = (bodyA.position.y + bodyB.position.y) / 2;
    const newType = bodyA.fruitType + 1;

    World.remove(world, bodyA);
    World.remove(world, bodyB);
    fruits = fruits.filter(f => f.body !== bodyA && f.body !== bodyB);

    const nf = makeFruitBody(newType, mx, my);
    fruits.push(nf);

    // Give a small upward impulse so the merged fruit bounces slightly
    Body.applyForce(nf.body, nf.body.position, { x: 0, y: -0.015 * FRUITS_DATA[newType - 1].radius });

    score += newType * newType * 10;
    scoreEl.textContent = score;

    updateProgress(newType);

    if (newType >= DIFFICULTY_CONFIG[currentDiffKey].targetFruitId) {
      endGame(true);
    }
  });

  pendingMerges = [];
  mergingIds.clear();
}

// ─── Overflow check ───────────────────────────────────────────────────────────
function checkOverflow(delta) {
  const overflowing = fruits.some(({ body }) => body.position.y < DANGER_Y);
  if (overflowing) {
    overflowTimer += delta;
    if (overflowTimer >= OVERFLOW_LIMIT) endGame(false);
  } else {
    overflowTimer = 0;
  }
}

// ─── Game loop ────────────────────────────────────────────────────────────────
function gameLoop(timestamp) {
  if (lastTimestamp === 0) lastTimestamp = timestamp;
  const delta = Math.min(timestamp - lastTimestamp, 50);
  lastTimestamp = timestamp;

  if (gameStatus === 'playing') {
    Engine.update(engine, delta);
    processMerges();
    checkOverflow(delta);

    // 計時功能已關閉

    if (!canDrop) {
      dropCooldown -= delta;
      if (dropCooldown <= 0) canDrop = true;
    }
  }

  render();
  requestAnimationFrame(gameLoop);
}

// ─── Rendering ────────────────────────────────────────────────────────────────
function render() {
  if (!CANVAS_W || !CANVAS_H) return; // not yet initialized — skip to avoid crashing the loop
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  drawBg();
  drawCup();
  drawDangerLine();

  if (gameStatus === 'playing' || gameStatus === 'paused') {
    drawFruits();
    if (gameStatus === 'playing' && canDrop) drawDropGuide();
  }
}

function drawBg() {
  const g = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  g.addColorStop(0, '#111827');
  g.addColorStop(1, '#0d1520');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
}

function drawCup() {
  const lw = 7;
  ctx.lineWidth   = lw;
  ctx.strokeStyle = 'rgba(180,140,80,0.55)';
  ctx.lineCap     = 'round';
  ctx.lineJoin    = 'round';

  // Interior fill
  ctx.fillStyle = 'rgba(255,255,255,0.025)';
  ctx.fillRect(CUP_L, CUP_TOP, CUP_R - CUP_L, CUP_BOT - CUP_TOP);

  // Three walls (U-shape)
  ctx.beginPath();
  ctx.moveTo(CUP_L, CUP_TOP);
  ctx.lineTo(CUP_L, CUP_BOT);
  ctx.lineTo(CUP_R, CUP_BOT);
  ctx.lineTo(CUP_R, CUP_TOP);
  ctx.stroke();
}

function drawDangerLine() {
  ctx.save();
  ctx.strokeStyle = 'rgba(255,80,60,0.45)';
  ctx.lineWidth   = 1.5;
  ctx.setLineDash([6, 5]);
  ctx.beginPath();
  ctx.moveTo(CUP_L, DANGER_Y);
  ctx.lineTo(CUP_R, DANGER_Y);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function drawFruits() {
  fruits.forEach(({ body, type }) => {
    drawFruit(ctx, type, body.position.x, body.position.y, FRUITS_DATA[type - 1].radius, 1.0);
  });
}

function drawDropGuide() {
  const fd = FRUITS_DATA[currentDropType - 1];
  const r  = fd.radius;
  const cx = Math.max(CUP_L + r + 2, Math.min(CUP_R - r - 2, dropX));

  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth   = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(cx, DROP_Y + r);
  ctx.lineTo(cx, DANGER_Y);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  drawFruit(ctx, currentDropType, cx, DROP_Y, r, 0.5);
}

// ─── UI helpers ───────────────────────────────────────────────────────────────
function renderTimer() {
  timerEl.textContent = '∞';
  timerEl.style.color = '#fff';
}

function updateProgress(achievedType) {
  document.querySelectorAll('.progress-fruit').forEach(el => {
    const t = parseInt(el.dataset.type, 10);
    if (t <= achievedType) el.classList.add('achieved');
  });
}

function buildProgressBar(targetId) {
  progressBar.innerHTML = '';
  FRUITS_DATA.forEach(fd => {
    const span = document.createElement('span');
    span.className      = 'progress-fruit';
    span.dataset.type   = fd.id;
    span.textContent    = fd.emoji;
    span.title          = fd.name;
    if (fd.id === targetId) span.classList.add('target');
    progressBar.appendChild(span);
  });
}

function showScreen(id) {
  const overlays = ['pauseScreen', 'resultScreen'];
  if (overlays.includes(id)) {
    document.getElementById(id).classList.add('active');
  } else {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  }
}

function hideOverlay(id) {
  document.getElementById(id).classList.remove('active');
}

// ─── Game lifecycle ───────────────────────────────────────────────────────────
function startGame(diffKey) {
  currentDiffKey = diffKey;
  const diff = DIFFICULTY_CONFIG[diffKey];

  score         = 0;
  timeRemaining = diff.timeLimit;
  fruits        = [];
  pendingMerges = [];
  mergingIds.clear();
  overflowTimer = 0;
  canDrop       = true;
  dropCooldown  = 0;
  lastTimestamp = 0;

  // Show screen FIRST so header/footer/progressBar have non-zero offsetHeight
  showScreen('gameScreen');
  // Reading offsetHeight forces the browser to compute layout immediately
  void document.getElementById('gameScreen').offsetHeight;

  calcLayout();
  initPhysics();

  dropX           = CANVAS_W / 2;
  currentDropType = diff.dropTypes[Math.floor(Math.random() * diff.dropTypes.length)];
  pickNextFruit();

  scoreEl.textContent  = '0';
  const tgt = FRUITS_DATA[diff.targetFruitId - 1];
  targetEl.textContent = `${tgt.emoji} ${tgt.name}`;
  buildProgressBar(diff.targetFruitId);
  renderTimer();

  gameStatus = 'playing';
}

function endGame(won) {
  if (gameStatus === 'won' || gameStatus === 'lost') return; // already ended
  gameStatus = won ? 'won' : 'lost';

  const diff = DIFFICULTY_CONFIG[currentDiffKey];
  const tgt  = FRUITS_DATA[diff.targetFruitId - 1];

  document.getElementById('resultEmoji').textContent   = won ? '🎉' : '💔';
  document.getElementById('resultTitle').textContent   = won ? '恭喜過關！' : '遊戲結束';
  document.getElementById('resultMessage').textContent = won
    ? `成功融合出「${tgt.name}」！`
    : `時間到了，未能達成「${tgt.name}」`;
  document.getElementById('resultScore').textContent   = `得分：${score}`;

  showScreen('resultScreen');
}

// ─── Input ────────────────────────────────────────────────────────────────────
function canvasX(clientX) {
  return clientX - canvas.getBoundingClientRect().left;
}

canvas.addEventListener('mousemove', e => {
  dropX = canvasX(e.clientX);
});

canvas.addEventListener('click', e => {
  if (gameStatus === 'playing') dropFruit(canvasX(e.clientX));
});

canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  dropX = canvasX(e.touches[0].clientX);
}, { passive: false });

canvas.addEventListener('touchend', e => {
  e.preventDefault();
  if (gameStatus === 'playing') dropFruit(canvasX(e.changedTouches[0].clientX));
}, { passive: false });

// ─── Button wiring ────────────────────────────────────────────────────────────
document.querySelectorAll('.diff-btn').forEach(btn => {
  btn.addEventListener('click', () => startGame(btn.dataset.difficulty));
});

document.getElementById('pauseBtn').addEventListener('click', () => {
  if (gameStatus === 'playing') {
    gameStatus = 'paused';
    showScreen('pauseScreen');
  }
});

document.getElementById('resumeBtn').addEventListener('click', () => {
  hideOverlay('pauseScreen');
  gameStatus    = 'playing';
  lastTimestamp = 0;
});

document.getElementById('restartBtn').addEventListener('click', () => {
  hideOverlay('pauseScreen');
  startGame(currentDiffKey);
});

document.getElementById('menuFromPauseBtn').addEventListener('click', () => {
  hideOverlay('pauseScreen');
  gameStatus = 'menu';
  showScreen('menuScreen');
});

document.getElementById('playAgainBtn').addEventListener('click', () => {
  hideOverlay('resultScreen');
  startGame(currentDiffKey);
});

document.getElementById('menuFromResultBtn').addEventListener('click', () => {
  hideOverlay('resultScreen');
  gameStatus = 'menu';
  showScreen('menuScreen');
});

// ─── Bootstrap ────────────────────────────────────────────────────────────────
requestAnimationFrame(gameLoop);
