/* ----------------- (INÍCIO DO main.js REVISADO C/ ÁUDIO) ----------------- */

/* ----------------- Config padrão / gameConfig ----------------- */
let gameConfig = {
  initialFuel: 100,
  initialScore: 0,
  initialLives: 5,
  playerSpeed: 5,
  bulletCooldown: 200,
  levelDuration: 90,
  fuelConsumptionInterval: 30000, // ms
  fuelConsumptionAmount: 10, // percent to subtract each interval
  fuelWarningThreshold: 30,
  fuelCriticalThreshold: 10,
  enemySpawnRate: 2000,
  enemySpeed: 2,
  bullet: { width: 10, height: 20, speed: 10 },
  enemyBullet: { width: 8, height: 16, speed: 7 },
  shotModes: [
    { name: "single", cooldown: 200 },   // índice 0 - sempre disponível
    { name: "triple", cooldown: 300 },   // índice 1 - liberado em >=100 kills
    { name: "quintuple", cooldown: 400 },// índice 2 - liberado em >=200 kills
    { name: "septuple", cooldown: 550 }  // índice 3 - liberado em >=500 kills
  ],
  enemies: {
    enemyPlane: { width: 64, height: 64, points: 150, shoots: true, shotCooldown: 1500 },
    helicopter: { width: 80, height: 80, points: 100, shoots: true, shotCooldown: 2000 },
    ship: { width: 120, height: 80, points: 50, shoots: false },
  },
  fuelStation: { width: 60, height: 60, speed: 3, points: 300, refuelPoints: 50 },
  powerUp: { width: 40, height: 40, speed: 4, points: 100, extraFuelAmount: 30 },
  maxLevel: 99,
  scoreMultiplierPerLevel: 0.1,
  initialEnemySpeed: 2,
  enemySpeedIncreasePerLevel: 0.3,
  initialEnemySpawnRate: 2000,
  minEnemySpawnRate: 500,
  enemySpawnRateDecreasePerLevel: 150,
  fuelStationSpawnRate: 5000,
  powerUpSpawnRate: 8000,
  hitsPerLife: 20,
  invulnerabilityDuration: 1500,
  backgroundSpeed: 1,
  backgroundSpeedIncreasePerLevel: 0.1,
};

/* ----------------- DOM Elements ----------------- */
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const hudElement = document.getElementById("hud");
const levelDisplay = document.getElementById("level");
const fuelBar = document.getElementById("fuel-bar");
const fuelPercentage = document.getElementById("fuel-percentage");
const scoreDisplay = document.getElementById("score");
const shotModeDisplay = document.getElementById("shot-mode");
const livesCountDisplay = document.getElementById("lives-count");
const killsDisplay = document.getElementById("kills");
const startButton = document.getElementById("startButton");
const pauseButton = document.getElementById("pauseButton");
const restartButton = document.getElementById("restartButton");
const gameOverScreen = document.getElementById("game-over-screen");
const finalScoreDisplay = document.getElementById("final-score");
const gameOverRestartButton = document.getElementById("gameOverRestartButton");
const winScreen = document.getElementById("win-screen");
const winScoreDisplay = document.getElementById("win-score");
const notification = document.getElementById("notification"); // central notification

/* ----------------- Assets ----------------- */
/* Splash (tela inicial) */
const assetPaths = {
  playerPlane: "assets/player/plane_idle.png",
  enemyPlane: "assets/enemies/plane_enemy_1.png",
  helicopter: "assets/enemies/helicopter.png",
  ship: "assets/enemies/ship.png",
  fuelStation: "assets/fuel_station.png",
  bulletSmall: "assets/projectiles/bullet_small.png",
  bulletMedium: "assets/projectiles/bullet_medium.png",
  bulletSpread: "assets/projectiles/bullet_spread.png",
  explosion: "assets/explosions/explosion_1.png",
  skyStrip: "assets/backgrounds/sky_strip.png",
  splash: "assets/img/Phanton-Skies-B2-Spirit-Edition.png"
};
let assets = {};

/* ----------------- Áudio (SFX) ----------------- */
const audioPaths = {
  shoot: "assets/audio/missel-1.mp3",
  refuel: "assets/audio/Abastecimento.mp3",
  enemyExplosion: "assets/audio/explosao-inimigos.mp3",
  stationExplosion: "assets/audio/explosao.mp3",
};
const SFX = {};           // pools
let audioUnlocked = false;

function createAudioPool(src, poolSize = 8, volume = 0.6) {
  const pool = [];
  for (let i = 0; i < poolSize; i++) {
    const a = new Audio(src);
    a.preload = "auto";
    a.volume = volume;
    pool.push(a);
  }
  let idx = 0;
  return {
    play() {
      if (!audioUnlocked) return;
      try {
        const a = pool[idx];
        a.currentTime = 0;
        a.play();
      } catch {}
      idx = (idx + 1) % pool.length;
    }
  };
}

function loadAudio() {
  SFX.shoot = createAudioPool(audioPaths.shoot, 10, 0.65);
  SFX.refuel = createAudioPool(audioPaths.refuel, 4, 0.9);
  SFX.enemyExplosion = createAudioPool(audioPaths.enemyExplosion, 6, 0.8);
  SFX.stationExplosion = createAudioPool(audioPaths.stationExplosion, 6, 0.9);
}

/* Desbloqueia áudio na primeira interação do usuário (mobile/autoplay) */
function unlockAudioOnce() {
  if (audioUnlocked) return;
  audioUnlocked = true;
  window.removeEventListener("pointerdown", unlockAudioOnce);
  window.removeEventListener("keydown", unlockAudioOnce);
}
window.addEventListener("pointerdown", unlockAudioOnce, { passive: true });
window.addEventListener("keydown", unlockAudioOnce);

/* Helpers p/ tocar som com segurança */
function playSfx(name) {
  const p = SFX[name];
  if (p && typeof p.play === "function") p.play();
}

/* ----------------- Game State ----------------- */
let gameState = {
  running: false,
  paused: false,
  gameOver: false,
  win: false,
  level: 1,
  score: 0,
  fuel: 100,
  shotModeIndex: 0,
  lives: 5,
  hitsTaken: 0,
  invulnerable: false,
  invulnerableTimer: 0,
  kills: 0,
  enemiesToNextLevel: 100,
  enemiesForLife: 100,
  enemySpawnMultiplier: 1,
  fuelTimer: 0,
  lastTimestamp: performance.now(),
  screenShake: { intensity: 0, duration: 0 },
};

/* ----------------- Splash control ----------------- */
let showSplash = true;

/* ----------------- Entities ----------------- */
let player = null;
let bullets = [];
let enemyBullets = [];
let enemies = [];
let fuelStations = [];
let powerUps = [];
let explosions = [];
let particles = [];
let keys = {};
let lastEnemySpawn = 0;
let lastFuelSpawn = 0;
let lastPowerUpSpawn = 0;
let debugMode = false;

/* ----------------- Utility ----------------- */
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function now() { return performance.now(); }
function rand(min, max) { return Math.random() * (max - min) + min; }

/* ----------------- Load config.json then init ----------------- */
async function loadConfig() {
  try {
    const res = await fetch("config.json", { cache: "no-cache" });
    if (!res.ok) throw new Error("config.json not found");
    const parsed = await res.json();
    gameConfig = { ...gameConfig, ...parsed };
    console.log("Config carregada:", gameConfig);
  } catch (err) {
    console.warn("Não foi possível carregar config.json — usando defaults.", err);
  }
}

/* ----------------- Load assets with placeholders ----------------- */
async function loadAssets() {
  const keys = Object.keys(assetPaths);
  await Promise.all(keys.map(k => new Promise(resolve => {
    const img = new Image();
    img.src = assetPaths[k];
    img.onload = () => { assets[k] = img; resolve(); };
    img.onerror = () => {
      const c = document.createElement("canvas");
      c.width = gameConfig.enemies?.enemyPlane?.width || 64;
      c.height = gameConfig.enemies?.enemyPlane?.height || 64;
      const cc = c.getContext("2d");
      cc.fillStyle = "#888";
      cc.fillRect(0, 0, c.width, c.height);
      cc.fillStyle = "#222";
      cc.fillText(k, 4, 12);
      assets[k] = c;
      console.warn("Asset faltando, placeholder:", k, assetPaths[k]);
      resolve();
    };
  })));
}

/* ----------------- Resize canvas ----------------- */
function resizeCanvas() {
  const isMobile = window.innerWidth <= 768;
  if (isMobile) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  } else {
    canvas.width = Math.min(window.innerWidth, 800);
    canvas.height = Math.min(window.innerHeight, 600);
  }
  if (player) {
    player.x = clamp(player.x, 0, canvas.width - player.width);
    player.y = clamp(player.y, 0, canvas.height - player.height);
  }
}

/* ----------------- Reset / Init Game ----------------- */
function resetGame() {
  gameState = {
    running: false,
    paused: false,
    gameOver: false,
    win: false,
    level: 1,
    score: gameConfig.initialScore || 0,
    fuel: gameConfig.initialFuel || 100,
    shotModeIndex: 0,
    lives: gameConfig.initialLives || 5,
    hitsTaken: 0,
    invulnerable: false,
    invulnerableTimer: 0,
    kills: 0,
    enemiesToNextLevel: 100,
    enemiesForLife: 100,
    enemySpawnMultiplier: 1,
    fuelTimer: 0,
    lastTimestamp: performance.now(),
    screenShake: { intensity: 0, duration: 0 },
  };

  player = {
    x: (canvas.width / 2) - 32,
    y: canvas.height - 100,
    width: 64, height: 64,
    speed: gameConfig.playerSpeed || 5,
    image: assets.playerPlane,
    lastShotTime: 0,
  };

  bullets = [];
  enemyBullets = [];
  enemies = [];
  fuelStations = [];
  powerUps = [];
  explosions = [];
  particles = [];
  lastEnemySpawn = now();
  lastFuelSpawn = now();
  lastPowerUpSpawn = now();

  gameOverScreen.classList.add("hidden");
  winScreen.classList.add("hidden");
  updateHUD();
  draw();
}

/* ----------------- Input ----------------- */
function setupInput() {
  window.addEventListener("keydown", (e) => {
    if (showSplash) {
      if (e.code === "Enter" || e.key === "Enter") {
        showSplash = false;
        startGame();
      }
      return;
    }

    keys[e.code] = true;

    if (e.code === "KeyF") {
      const unlocked = getUnlockedShotModeIndices();
      let pos = unlocked.indexOf(gameState.shotModeIndex);
      if (pos === -1) gameState.shotModeIndex = unlocked[0];
      else gameState.shotModeIndex = unlocked[(pos + 1) % unlocked.length];
      updateHUD();
    }

    if (e.code === "Space") {
      e.preventDefault();
      shoot();
    }

    if (e.code === "KeyT") debugMode = !debugMode;
    if (e.code === "Escape") togglePause();
  });

  window.addEventListener("keyup", (e) => {
    if (showSplash) return;
    keys[e.code] = false;
  });
}

/* ----------------- Mobile controls ----------------- */
function setupMobileControls() {
  const mobileUp = document.getElementById("mobile-up");
  const mobileDown = document.getElementById("mobile-down");
  const mobileLeft = document.getElementById("mobile-left");
  const mobileRight = document.getElementById("mobile-right");
  const mobileShoot = document.getElementById("mobile-shoot");
  const mobileMode = document.getElementById("mobile-mode");

  if (mobileUp) {
    mobileUp.addEventListener("touchstart", (e) => { keys["ArrowUp"] = true; e.preventDefault(); });
    mobileUp.addEventListener("touchend", () => keys["ArrowUp"] = false);
  }
  if (mobileDown) {
    mobileDown.addEventListener("touchstart", (e) => { keys["ArrowDown"] = true; e.preventDefault(); });
    mobileDown.addEventListener("touchend", () => keys["ArrowDown"] = false);
  }
  if (mobileLeft) {
    mobileLeft.addEventListener("touchstart", (e) => { keys["ArrowLeft"] = true; e.preventDefault(); });
    mobileLeft.addEventListener("touchend", () => keys["ArrowLeft"] = false);
  }
  if (mobileRight) {
    mobileRight.addEventListener("touchstart", (e) => { keys["ArrowRight"] = true; e.preventDefault(); });
    mobileRight.addEventListener("touchend", () => keys["ArrowRight"] = false);
  }

  if (mobileShoot) {
    let interval = null;
    mobileShoot.addEventListener("touchstart", (e) => { shoot(); interval = setInterval(shoot, 150); e.preventDefault(); });
    mobileShoot.addEventListener("touchend", () => { if (interval) clearInterval(interval); interval = null; });
  }

  if (mobileMode) {
    mobileMode.addEventListener("touchstart", (e) => {
      e.preventDefault();
      const unlocked = getUnlockedShotModeIndices();
      let pos = unlocked.indexOf(gameState.shotModeIndex);
      if (pos === -1) gameState.shotModeIndex = unlocked[0];
      else gameState.shotModeIndex = unlocked[(pos + 1) % unlocked.length];
      updateHUD();
    });
  }
}

/* ----------------- UI Buttons ----------------- */
function attachButtons() {
  startButton.addEventListener("click", () => {
    if (showSplash) showSplash = false;
    startGame();
  });
  pauseButton.addEventListener("click", togglePause);
  restartButton.addEventListener("click", resetGame);
  gameOverRestartButton.addEventListener("click", resetGame);
  winRestartButton.addEventListener("click", resetGame);
}

/* ----------------- Start / Pause ----------------- */
function startGame() {
  if (!gameState.running) {
    gameState.running = true;
    gameState.paused = false;
    gameState.lastTimestamp = now();
    requestAnimationFrame(loop);
  }
}
function togglePause() {
  if (!gameState.running) return;
  gameState.paused = !gameState.paused;
  if (!gameState.paused) {
    gameState.lastTimestamp = now();
    requestAnimationFrame(loop);
  }
}

/* ----------------- Game Loop ----------------- */
function loop(timestamp) {
  if (!gameState.running || gameState.paused || gameState.gameOver || gameState.win) return;
  const delta = timestamp - gameState.lastTimestamp;
  gameState.lastTimestamp = timestamp;

  update(delta);
  draw();

  requestAnimationFrame(loop);
}

/* ----------------- Update (delta ms) ----------------- */
function update(delta) {
  if (gameState.invulnerable) {
    gameState.invulnerableTimer -= delta;
    if (gameState.invulnerableTimer <= 0) gameState.invulnerable = false;
  }

  updatePlayerPosition();
  updateBullets();
  updateEnemyBullets();
  updateEnemies(delta);
  updateFuelStations(delta);
  updatePowerUps(delta);
  updateExplosions(delta);
  updateParticles(delta);
  updateScreenShake(delta);
  handleSpawning();
  updateFuelConsumption(delta);
  checkCollisions();
  updateHUD();
}

/* ----------------- Player movement update ----------------- */
function updatePlayerPosition() {
  if (!player) return;
  if (keys["ArrowLeft"] || keys["KeyA"]) player.x -= player.speed;
  if (keys["ArrowRight"] || keys["KeyD"]) player.x += player.speed;
  if (keys["ArrowUp"] || keys["KeyW"]) player.y -= player.speed;
  if (keys["ArrowDown"] || keys["KeyS"]) player.y += player.speed;

  player.x = clamp(player.x, 0, canvas.width - player.width);
  player.y = clamp(player.y, 0, canvas.height - player.height);
}

// retorna array com índices de modos liberados (sempre contém 0)
function getUnlockedShotModeIndices() {
  const unlocked = [0]; // modo single sempre disponível
  if (gameState.kills >= 100) unlocked.push(1);   // libera triple
  if (gameState.kills >= 200) unlocked.push(2);   // libera quintuple
  if (gameState.kills >= 500) unlocked.push(3);   // libera septuple (7 tiros)
  return unlocked;
}

/* ----------------- Shooting ----------------- */
function shoot() {
  if (!gameState.running) return;
  const nowMs = Date.now();
  const unlockedModes = getUnlockedShotModeIndices();
  let modeIndex = gameState.shotModeIndex;
  if (!unlockedModes.includes(modeIndex)) {
    modeIndex = unlockedModes[unlockedModes.length - 1] || 0;
  }
  const cooldown = gameConfig.shotModes[modeIndex]?.cooldown || 200;
  if (nowMs - player.lastShotTime < cooldown) return;
  player.lastShotTime = nowMs;

  const cx = player.x + player.width / 2 - gameConfig.bullet.width / 2;
  const base = {
    y: player.y,
    width: gameConfig.bullet.width,
    height: gameConfig.bullet.height,
    speed: gameConfig.bullet.speed,
    image: assets.bulletSmall,
    type: "player"
  };

  if (modeIndex === 0) {
    bullets.push({ ...base, x: cx });
  } else if (modeIndex === 1) {
    bullets.push({ ...base, x: cx, angle: 0 });
    bullets.push({ ...base, x: cx, angle: -0.2 });
    bullets.push({ ...base, x: cx, angle: 0.2 });
  } else if (modeIndex === 2) {
    // 5 tiros
    bullets.push({ ...base, x: cx, angle: 0 });
    bullets.push({ ...base, x: cx, angle: -0.15 });
    bullets.push({ ...base, x: cx, angle: 0.15 });
    bullets.push({ ...base, x: cx, angle: -0.3 });
    bullets.push({ ...base, x: cx, angle: 0.3 });
  } else if (modeIndex === 3) {
    // 7 tiros
    const angles = [-0.35, -0.25, -0.15, 0, 0.15, 0.25, 0.35];
    angles.forEach(a => bullets.push({ ...base, x: cx, angle: a }));
  }

  // som de tiro (1 por acionamento)
  playSfx("shoot");
}

/* determine shot mode by kills thresholds (maior desbloqueado) */
function shotModeFromKills() {
  if (gameState.kills >= 500) return 3;
  if (gameState.kills >= 200) return 2;
  if (gameState.kills >= 100) return 1;
  return 0;
}

/* ----------------- Update bullets ----------------- */
function updateBullets() {
  bullets = bullets.filter(b => {
    if (b.angle) b.x += Math.sin(b.angle) * b.speed;
    b.y -= b.speed;
    return b.y + b.height > -50 && b.x + b.width > -50 && b.x < canvas.width + 50;
  });
}

/* ----------------- Enemy bullets ----------------- */
function updateEnemyBullets() {
  enemyBullets = enemyBullets.filter(b => {
    b.y += b.speed;
    return b.y - b.height < canvas.height + 50;
  });
}

/* ----------------- Spawn enemy ----------------- */
function spawnEnemy() {
  const types = Object.keys(gameConfig.enemies);
  const t = types[Math.floor(Math.random() * types.length)];
  const cfg = gameConfig.enemies[t];
  const e = {
    type: t,
    x: Math.random() * (canvas.width - cfg.width),
    y: -cfg.height - 10,
    width: cfg.width,
    height: cfg.height,
    speed: (gameConfig.initialEnemySpeed || gameConfig.enemySpeed) + (gameState.level - 1) * (gameConfig.enemySpeedIncreasePerLevel || 0.2) + Math.random() * 0.5,
    image: assets[t] || assets.enemyPlane,
    points: cfg.points || 50,
    shoots: cfg.shoots || false,
    shotCooldown: cfg.shotCooldown || 2000,
    lastShotTime: Date.now() - Math.random() * 1000
  };
  enemies.push(e);
}

/* ----------------- Update enemies ----------------- */
function updateEnemies(delta) {
  enemies = enemies.filter(enemy => {
    enemy.y += enemy.speed;
    if (enemy.shoots && Date.now() - enemy.lastShotTime > enemy.shotCooldown) {
      enemyBullets.push({
        x: enemy.x + enemy.width / 2 - gameConfig.enemyBullet.width / 2,
        y: enemy.y + enemy.height,
        width: gameConfig.enemyBullet.width,
        height: gameConfig.enemyBullet.height,
        speed: gameConfig.enemyBullet.speed,
        image: assets.bulletSmall,
      });
      enemy.lastShotTime = Date.now();
    }
    return enemy.y < canvas.height + enemy.height + 50;
  });
}

/* ----------------- Spawn / Update Fuel Stations ----------------- */
function spawnFuelStation() {
  const x = Math.random() * (canvas.width - gameConfig.fuelStation.width);
  fuelStations.push({
    x,
    y: -gameConfig.fuelStation.height - 20,
    width: gameConfig.fuelStation.width,
    height: gameConfig.fuelStation.height,
    speed: gameConfig.fuelStation.speed,
    image: assets.fuelStation,
    refillRate: gameConfig.fuelStation.refillRate,
    refuelPoints: gameConfig.fuelStation.refuelPoints,
  });
}
function updateFuelStations(delta) {
  fuelStations = fuelStations.filter(s => {
    s.y += s.speed;
    return s.y < canvas.height + s.height + 50;
  });
}

/* ----------------- Spawn / Update Powerups ----------------- */
function spawnPowerUp() {
  const types = ["extraFuel", "rapidFire", "shield"];
  const t = types[Math.floor(Math.random() * types.length)];
  powerUps.push({
    x: Math.random() * (canvas.width - gameConfig.powerUp.width),
    y: -gameConfig.powerUp.height - 10,
    width: gameConfig.powerUp.width,
    height: gameConfig.powerUp.height,
    speed: gameConfig.powerUp.speed,
    type: t,
    collected: false,
  });
}
function updatePowerUps(delta) {
  powerUps = powerUps.filter(p => {
    p.y += p.speed;
    return p.y < canvas.height + p.height + 50;
  });
}

/* ----------------- Handle Spawning (enemy/fuel/powerup) ----------------- */
function handleSpawning() {
  const nowMs = Date.now();

  const spawnRate = gameConfig.enemySpawnRate || gameConfig.initialEnemySpawnRate;
  if (nowMs - lastEnemySpawn > spawnRate) {
    const spawnCount = Math.min(Math.max(1, Math.round(gameState.enemySpawnMultiplier)), 12);
    for (let i = 0; i < spawnCount; i++) spawnEnemy();
    lastEnemySpawn = nowMs;
  }

  if (nowMs - lastFuelSpawn > (gameConfig.fuelStationSpawnRate || 5000)) {
    spawnFuelStation();
    lastFuelSpawn = nowMs;
  }

  if (nowMs - lastPowerUpSpawn > (gameConfig.powerUpSpawnRate || 8000)) {
    spawnPowerUp();
    lastPowerUpSpawn = nowMs;
  }
}

/* ----------------- Fuel consumption (delta accum) ----------------- */
function updateFuelConsumption(delta) {
  if (!gameState.running || gameState.paused) return;
  gameState.fuelTimer += delta;
  const interval = gameConfig.fuelConsumptionInterval || 30000;
  if (gameState.fuelTimer >= interval) {
    const steps = Math.floor(gameState.fuelTimer / interval);
    const amount = (gameConfig.fuelConsumptionAmount || 10) * steps;
    gameState.fuelTimer -= steps * interval;
    gameState.fuel -= amount;
    if (gameState.fuel < 0) gameState.fuel = 0;
    if (gameState.fuel <= 0) {
      // explosão do player (não solicitado som específico)
      createExplosion(player.x + player.width / 2, player.y + player.height / 2);
      handleFuelDepletion();
    }
  }
}

/* ----------------- When fuel is depleted ----------------- */
function handleFuelDepletion() {
  gameState.lives--;
  if (gameState.lives <= 0) {
    triggerGameOver();
  } else {
    gameState.fuel = Math.min(gameConfig.initialFuel || 100, 50);
    gameState.invulnerable = true;
    gameState.invulnerableTimer = gameConfig.invulnerabilityDuration || 1500;
    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height - player.height - 30;
    showTemporaryMessage("Combustível esgotado! -1 Vida");
  }
}

/* ----------------- Collisions ----------------- */
function checkCollisions() {
  // bullets vs enemies
  for (let bi = bullets.length - 1; bi >= 0; bi--) {
    const b = bullets[bi];
    for (let ei = enemies.length - 1; ei >= 0; ei--) {
      const e = enemies[ei];
      if (isColliding(b, e)) {
        bullets.splice(bi, 1);
        enemies.splice(ei, 1);
        createExplosion(e.x + e.width / 2, e.y + e.height / 2);
        playSfx("enemyExplosion"); // som de explosão de inimigo
        addScore(e.points || 50);
        onEnemyDestroyed();
        break;
      }
    }
  }

  // bullets vs fuelStations
  for (let bi = bullets.length - 1; bi >= 0; bi--) {
    const b = bullets[bi];
    for (let fi = fuelStations.length - 1; fi >= 0; fi--) {
      const f = fuelStations[fi];
      if (isColliding(b, f)) {
        bullets.splice(bi, 1);
        fuelStations.splice(fi, 1);
        createExplosion(f.x + f.width / 2, f.y + f.height / 2);
        playSfx("stationExplosion"); // som da explosão do posto
        addScore(gameConfig.fuelStation.points || 0);
        break;
      }
    }
  }

  // player vs enemies
  if (!gameState.invulnerable) {
    for (let ei = enemies.length - 1; ei >= 0; ei--) {
      const e = enemies[ei];
      if (isColliding(player, e)) {
        enemies.splice(ei, 1);
        createExplosion(e.x + e.width / 2, e.y + e.height / 2);
        playSfx("enemyExplosion"); // colisão também é explosão de inimigo
        takeHit();
      }
    }
  }

  // player vs enemy bullets
  if (!gameState.invulnerable) {
    for (let bi = enemyBullets.length - 1; bi >= 0; bi--) {
      const b = enemyBullets[bi];
      if (isColliding(player, b)) {
        enemyBullets.splice(bi, 1);
        takeHit();
      }
    }
  }

  // player vs fuel stations (refuel)
  for (let fi = fuelStations.length - 1; fi >= 0; fi--) {
    const f = fuelStations[fi];
    if (isColliding(player, f)) {
      const lost = 100 - gameState.fuel;
      const gain = Math.ceil(lost * 0.05);
      gameState.fuel = clamp(gameState.fuel + gain, 0, 100);
      addScore(f.refuelPoints || (gameConfig.fuelStation.refuelPoints || 0));
      fuelStations.splice(fi, 1);
      showTemporaryMessage(`Reabastecido (+${gain})`);
      playSfx("refuel"); // som de reabastecimento
    }
  }

  // player vs powerups
  for (let pi = powerUps.length - 1; pi >= 0; pi--) {
    const p = powerUps[pi];
    if (isColliding(player, p)) {
      activatePowerUp(p.type);
      powerUps.splice(pi, 1);
    }
  }
}

/* ----------------- Collision AABB ----------------- */
function isColliding(a, b) {
  if (!a || !b) return false;
  return (a.x < b.x + b.width && a.x + a.width > b.x &&
          a.y < b.y + b.height && a.y + a.height > b.y);
}

/* ----------------- When enemy destroyed (update kills, levels, lives, shot mode) ----------------- */
function onEnemyDestroyed() {
  gameState.kills++;
  if (gameState.kills >= gameState.enemiesForLife) {
    gameState.lives++;
    gameState.enemiesForLife = Math.ceil(gameState.enemiesForLife * 1.1);
    showTemporaryMessage("Vida extra!");
  }
  if (gameState.kills >= gameState.enemiesToNextLevel) {
    levelUp();
  }
  handleShotModeUnlocks();
}

/* ----------------- Level up logic based on kills ----------------- */
function levelUp() {
  if (gameState.level >= gameConfig.maxLevel) {
    triggerWin();
    return;
  }
  gameState.level++;
  gameState.enemiesToNextLevel = Math.ceil(gameState.enemiesToNextLevel * 1.05);
  gameState.enemySpawnMultiplier = +(gameState.enemySpawnMultiplier * 1.05).toFixed(3);
  gameConfig.enemySpeed = (gameConfig.initialEnemySpeed || gameConfig.enemySpeed) + (gameState.level - 1) * (gameConfig.enemySpeedIncreasePerLevel || 0.3);
  gameConfig.enemySpawnRate = Math.max(gameConfig.minEnemySpawnRate || 500, (gameConfig.initialEnemySpawnRate || 2000) - (gameState.level - 1) * (gameConfig.enemySpawnRateDecreasePerLevel || 150));
  showTemporaryMessage(`Nível ${gameState.level}!`);
}

/* ----------------- Shot mode unlock notification ----------------- */
let lastShotModeNotified = -1;
function handleShotModeUnlocks() {
  const mode = shotModeFromKills();
  if (mode !== lastShotModeNotified) {
    if (mode > lastShotModeNotified) {
      if (mode === 1) showTemporaryMessage("Modo Triplo Liberado!");
      else if (mode === 2) showTemporaryMessage("Modo Quíntuplo Liberado!");
      else if (mode === 3) showTemporaryMessage("Modo 7 Tiros Liberado!");
    }
    lastShotModeNotified = mode;
  }
}

/* ----------------- Take hit / lose life ----------------- */
function takeHit() {
  gameState.hitsTaken++;
  if (gameState.hitsTaken >= (gameConfig.hitsPerLife || 20)) {
    gameState.lives--;
    gameState.hitsTaken = 0;
    createExplosion(player.x + player.width/2, player.y + player.height/2);
    if (gameState.lives <= 0) {
      triggerGameOver();
      return;
    } else {
      gameState.invulnerable = true;
      gameState.invulnerableTimer = gameConfig.invulnerabilityDuration || 1500;
      player.x = canvas.width/2 - player.width/2;
      player.y = canvas.height - player.height - 30;
      showTemporaryMessage("-1 Vida");
    }
  } else {
    gameState.invulnerable = true;
    gameState.invulnerableTimer = (gameConfig.invulnerabilityDuration || 1500) / 1.5;
  }
}

/* ----------------- Score ----------------- */
function addScore(points) {
  const mult = 1 + (gameState.level - 1) * (gameConfig.scoreMultiplierPerLevel || 0);
  gameState.score += Math.floor(points * mult);
}

/* ----------------- Game Over / Win ----------------- */
function triggerGameOver() {
  gameState.running = false;
  gameState.gameOver = true;
  finalScoreDisplay.textContent = gameState.score.toLocaleString();
  gameOverScreen.classList.remove("hidden");
}
function triggerWin() {
  gameState.running = false;
  gameState.win = true;
  winScoreDisplay.textContent = gameState.score.toLocaleString();
  winScreen.classList.remove("hidden");
}

/* ----------------- Power-up activation ----------------- */
function activatePowerUp(type) {
  switch(type) {
    case "extraFuel":
      gameState.fuel = clamp(gameState.fuel + (gameConfig.powerUp?.extraFuelAmount || 30), 0, 100);
      showTemporaryMessage("Combustível +");
      break;
    case "rapidFire":
      showTemporaryMessage("Tiro Rápido!");
      break;
    case "shield":
      gameState.invulnerable = true;
      gameState.invulnerableTimer = 3000;
      showTemporaryMessage("Escudo!");
      break;
  }
}

/* ----------------- Explosions & particles ----------------- */
function createExplosion(x, y) {
  explosions.push({
    x: x - 32, y: y - 32, width: 64, height: 64,
    image: assets.explosion,
    start: now(), duration: 600
  });
  createParticles(x, y, 12);
  addScreenShake(6, 300);
}
function updateExplosions(delta) {
  explosions = explosions.filter(ex => now() - ex.start < ex.duration);
}
function createParticles(x, y, count=10) {
  for (let i=0;i<count;i++) {
    particles.push({
      x, y,
      vx: (Math.random()-0.5)*6, vy: (Math.random()-0.5)*6,
      life: 1, decay: 0.02 + Math.random()*0.03,
      color: "#ff8800", size: 1 + Math.random()*3
    });
  }
}
function updateParticles(delta) {
  particles = particles.filter(p => {
    p.x += p.vx; p.y += p.vy; p.life -= p.decay;
    return p.life > 0;
  });
}

/* ----------------- Screen shake ----------------- */
function addScreenShake(intensity, duration) {
  gameState.screenShake.intensity = Math.max(gameState.screenShake.intensity, intensity);
  gameState.screenShake.duration = Math.max(gameState.screenShake.duration, duration);
}
function updateScreenShake(delta) {
  if (gameState.screenShake.duration > 0) {
    gameState.screenShake.duration -= delta;
    if (gameState.screenShake.duration <= 0) gameState.screenShake.intensity = 0;
  }
}

/* ----------------- HUD ----------------- */
function updateHUD() {
  const fuelVal = Math.round(gameState.fuel);
  fuelBar.style.width = `${clamp(fuelVal,0,100)}%`;
  fuelPercentage.textContent = `${clamp(fuelVal,0,100)}%`;
  scoreDisplay.textContent = `Pontuação: ${gameState.score.toLocaleString()}`;
  levelDisplay.textContent = `Nível: ${gameState.level}`;
  livesCountDisplay.textContent = gameState.lives;
  killsDisplay.textContent = `Kills: ${gameState.kills}`;

  if (gameState.fuel <= gameConfig.fuelCriticalThreshold) {
    hudElement.classList.add("critical-fuel");
    hudElement.classList.remove("low-fuel");
  } else if (gameState.fuel <= gameConfig.fuelWarningThreshold) {
    hudElement.classList.add("low-fuel");
    hudElement.classList.remove("critical-fuel");
  } else {
    hudElement.classList.remove("low-fuel", "critical-fuel");
  }

  const unlocked = getUnlockedShotModeIndices();
  if (!unlocked.includes(gameState.shotModeIndex)) {
    gameState.shotModeIndex = unlocked[0];
  }

  const modeNames = ["Simples","Triplo","Quíntuplo","7 Tiros"];
  shotModeDisplay.textContent = `Tiro: ${modeNames[gameState.shotModeIndex] || "Simples"}`;
}

/* ----------------- Show temporary notification center ----------------- */
let notifTimeout = null;
function showTemporaryMessage(text, ms = 2600) {
  if (!notification) {
    console.log("[NOTIF]", text);
  } else {
    notification.textContent = text;
    notification.classList.remove("hidden");
    if (notifTimeout) clearTimeout(notifTimeout);
    notifTimeout = setTimeout(() => {
      notification.classList.add("hidden");
      notifTimeout = null;
    }, ms);
  }
}

/* ----------------- Drawing ----------------- */
function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.save();

  if (gameState.screenShake.intensity > 0) {
    const s = gameState.screenShake.intensity;
    ctx.translate((Math.random()-0.5)*s, (Math.random()-0.5)*s);
  }

  drawBackground();

  fuelStations.forEach(s => {
    if (s.image) ctx.drawImage(s.image, s.x, s.y, s.width, s.height);
    else { ctx.fillStyle = "#0ff"; ctx.fillRect(s.x, s.y, s.width, s.height); }
  });

  powerUps.forEach(p => {
    ctx.save();
    ctx.fillStyle = "#ff0";
    ctx.fillRect(p.x, p.y, p.width, p.height);
    ctx.restore();
  });

  enemies.forEach(e => {
    if (e.image) ctx.drawImage(e.image, e.x, e.y, e.width, e.height);
    else { ctx.fillStyle="#f00"; ctx.fillRect(e.x, e.y, e.width, e.height); }
  });

  const shouldBlink = gameState.invulnerable || (gameState.fuel <= gameConfig.fuelWarningThreshold && (Date.now() % 1000 < 500));
  if (shouldBlink) ctx.globalAlpha = 0.5;
  if (player && player.image) ctx.drawImage(player.image, player.x, player.y, player.width, player.height);
  else if (player) { ctx.fillStyle="#0f0"; ctx.fillRect(player.x, player.y, player.width, player.height); }
  ctx.globalAlpha = 1.0;

  bullets.forEach(b => {
    if (b.image) ctx.drawImage(b.image, b.x, b.y, b.width, b.height);
    else { ctx.fillStyle="#0f0"; ctx.fillRect(b.x, b.y, b.width, b.height); }
  });

  enemyBullets.forEach(b => {
    if (b.image) ctx.drawImage(b.image, b.x, b.y, b.width, b.height);
    else { ctx.fillStyle="#f00"; ctx.fillRect(b.x, b.y, b.width, b.height); }
  });

  explosions.forEach(ex => {
    if (ex.image) ctx.drawImage(ex.image, ex.x, ex.y, ex.width, ex.height);
    else { ctx.fillStyle="#ff8800"; ctx.fillRect(ex.x, ex.y, ex.width, ex.height); }
  });

  particles.forEach(p => {
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
  });
  ctx.globalAlpha = 1;

  ctx.restore();

  if (debugMode) drawDebugInfo();
}

/* ----------------- Background draw (tile) ----------------- */
let bgY = 0;
function drawBackground() {
  const bg = assets.skyStrip;
  if (!bg) {
    ctx.fillStyle = "#001"; ctx.fillRect(0,0,canvas.width,canvas.height);
    return;
  }
  const bgSpeed = (gameConfig.backgroundSpeed || 1) + (gameState.level - 1) * (gameConfig.backgroundSpeedIncreasePerLevel || 0.05);
  bgY = (bgY + bgSpeed) % bg.height;
  ctx.drawImage(bg, 0, bgY, canvas.width, bg.height);
  ctx.drawImage(bg, 0, bgY - bg.height, canvas.width, bg.height);
}

/* ----------------- Debug info ----------------- */
function drawDebugInfo() {
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.fillRect(10,10,300,140);
  ctx.fillStyle = "#0f0"; ctx.font = "12px monospace";
  const lines = [
    `Level: ${gameState.level}`,
    `Kills: ${gameState.kills}`,
    `Lives: ${gameState.lives}`,
    `Fuel: ${gameState.fuel.toFixed(1)}%`,
    `Enemies: ${enemies.length}`,
    `Bullets: ${bullets.length}`,
    `enemySpawnMultiplier: ${gameState.enemySpawnMultiplier}`
  ];
  lines.forEach((l,i) => ctx.fillText(l, 18, 32 + i*16));
  ctx.restore();
}

/* ----------------- Show splash (title) screen ----------------- */
function drawSplashScreen() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const s = assets.splash;
  if (s) {
    ctx.drawImage(s, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = "#001";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "28px monospace";
    ctx.textAlign = "center";
    ctx.fillText("Phantom Skies: B2 Spirit Edition", canvas.width / 2, canvas.height / 2 - 20);
  }
  ctx.fillStyle = "#fff";
  ctx.font = "20px monospace";
  ctx.textAlign = "center";
  ctx.fillText("Pressione ENTER para começar", canvas.width / 2, canvas.height - 60);
}

/* splash animation loop */
function splashLoop() {
  if (!showSplash) return;
  drawSplashScreen();
  requestAnimationFrame(splashLoop);
}

/* ----------------- Initialization sequence ----------------- */
async function init() {
  await loadConfig();
  await loadAssets();
  loadAudio();                 // <-- carregar SFX
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  setupInput();
  setupMobileControls();
  attachButtons();
  resetGame();

  splashLoop();

  setInterval(() => handleShotModeUnlocks(), 1000);
  console.log("Init completo. Splash visível:", showSplash);
}

/* ----------------- Kick off init ----------------- */
init().catch(err => { console.error("Erro inicializando jogo:", err); });

/* ----------------- End of main.js ----------------- */
