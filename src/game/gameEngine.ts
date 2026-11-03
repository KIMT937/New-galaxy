/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { audio } from './audio';
import { SpriteRenderer } from './sprites';
import {
  GameStatus,
  Player,
  Enemy,
  Boss,
  Bullet,
  PowerUp,
  Particle,
  FloatingText,
  Star,
  HighScoreEntry,
  GameStats,
  PowerUpType,
} from './types';

export class GalaxyGameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  public status: GameStatus = 'MENU';
  public width: number = 600;
  public height: number = 800;

  // Entities
  public player: Player;
  public enemies: Enemy[] = [];
  public boss: Boss | null = null;
  public bullets: Bullet[] = [];
  public powerUps: PowerUp[] = [];
  public particles: Particle[] = [];
  public floatingTexts: FloatingText[] = [];
  public stars: Star[] = [];

  // Progression & Stats
  public wave: number = 1;
  public highScore: number = 20000;
  public stats: GameStats = {
    shotsFired: 0,
    shotsHit: 0,
    enemiesDefeated: 0,
    bossesDefeated: 0,
    powerUpsCollected: 0,
    maxCombo: 0,
    currentCombo: 0,
    wave: 1,
  };

  // State timers
  private tick: number = 0;
  private animFrameId: number | null = null;
  private lastTime: number = 0;
  private isWarping: boolean = false;
  private warpTimer: number = 0;
  private stageClearTimer: number = 0;
  private formationOffsetX: number = 0;
  private formationDirection: number = 1;
  private nextDiveTimer: number = 100;
  private shootCooldown: number = 0;

  // Challenge stage tracking
  public challengeWaveTotal: number = 40;
  public challengeWaveHit: number = 0;

  // Controls
  public keys: Record<string, boolean> = {};
  public mouseX: number | null = null;
  public isMouseDown: boolean = false;
  public autoFire: boolean = true;

  // Callback to React state updates
  public onStateChange?: () => void;
  public onGameOver?: (stats: GameStats, score: number) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.width = canvas.width;
    this.height = canvas.height;

    this.player = this.createInitialPlayer();
    this.initStars();
    this.loadHighScore();
  }

  private createInitialPlayer(): Player {
    return {
      x: this.width / 2,
      y: this.height - 60,
      targetX: this.width / 2,
      width: 36,
      height: 36,
      speed: 6.5,
      lives: 3,
      score: 0,
      isDual: false,
      hasShield: false,
      shieldHealth: 0,
      maxShieldHealth: 3,
      activeWeapon: 'NORMAL',
      weaponTimer: 0,
      rapidFireTimer: 0,
      smartBombs: 2,
      invincibleTimer: 120, // 2s spawn invulnerability
      isHit: false,
      hitTimer: 0,
    };
  }

  private initStars() {
    this.stars = [];
    const colors = ['#ffffff', '#93c5fd', '#fef08a', '#c084fc', '#67e8f9'];
    for (let i = 0; i < 110; i++) {
      const layer = Math.random() < 0.2 ? 3 : Math.random() < 0.5 ? 2 : 1;
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        speed: layer * 0.7 + 0.3,
        size: layer === 3 ? 2.5 : layer === 2 ? 1.8 : 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 0.3 + Math.random() * 0.7,
        layer,
      });
    }
  }

  public setDimensions(w: number, h: number) {
    this.width = w;
    this.height = h;
    this.canvas.width = w;
    this.canvas.height = h;
    if (this.player) {
      this.player.y = h - 60;
      this.player.x = Math.min(Math.max(25, this.player.x), w - 25);
    }
  }

  // --- High Score Persistence ---
  public loadHighScore(): HighScoreEntry[] {
    try {
      const stored = localStorage.getItem('galaxy_arcade_leaderboard');
      if (stored) {
        const parsed: HighScoreEntry[] = JSON.parse(stored);
        if (parsed.length > 0) {
          this.highScore = parsed[0].score;
          return parsed;
        }
      }
    } catch {
      // Ignore storage errors
    }

    const defaultLeaderboard: HighScoreEntry[] = [
      { rank: 1, name: 'ACE', score: 35000, wave: 8, date: '2026-11-01' },
      { rank: 2, name: 'TOP', score: 25400, wave: 6, date: '2026-10-30' },
      { rank: 3, name: 'GLX', score: 18200, wave: 4, date: '2026-10-28' },
      { rank: 4, name: 'FOX', score: 12500, wave: 3, date: '2026-10-25' },
      { rank: 5, name: 'NEO', score: 8400, wave: 2, date: '2026-10-20' },
    ];
    this.highScore = defaultLeaderboard[0].score;
    return defaultLeaderboard;
  }

  public saveScore(name: string): HighScoreEntry[] {
    const list = this.loadHighScore();
    const newEntry: HighScoreEntry = {
      rank: 0,
      name: (name || 'AAA').toUpperCase().slice(0, 3),
      score: this.player.score,
      wave: this.wave,
      date: new Date().toISOString().split('T')[0],
    };

    list.push(newEntry);
    list.sort((a, b) => b.score - a.score);
    const trimmed = list.slice(0, 10).map((item, idx) => ({ ...item, rank: idx + 1 }));

    try {
      localStorage.setItem('galaxy_arcade_leaderboard', JSON.stringify(trimmed));
    } catch {
      // Storage unavailable
    }

    if (trimmed.length > 0) {
      this.highScore = trimmed[0].score;
    }

    return trimmed;
  }

  // --- Start & Restart Flow ---
  public startNewGame() {
    audio.ensureAudio();
    audio.playStageStart();
    audio.startBgm();

    this.player = this.createInitialPlayer();
    this.wave = 1;
    this.stats = {
      shotsFired: 0,
      shotsHit: 0,
      enemiesDefeated: 0,
      bossesDefeated: 0,
      powerUpsCollected: 0,
      maxCombo: 0,
      currentCombo: 0,
      wave: 1,
    };

    this.bullets = [];
    this.powerUps = [];
    this.particles = [];
    this.floatingTexts = [];
    this.boss = null;
    this.isWarping = false;

    this.startWave(this.wave);
  }

  public startWave(waveNum: number) {
    this.wave = waveNum;
    this.stats.wave = waveNum;
    this.bullets = [];
    this.powerUps = [];
    this.boss = null;
    this.nextDiveTimer = 120;

    // Is this a Boss Stage (every 4th stage)?
    if (waveNum % 4 === 0) {
      this.status = 'BOSS_STAGE';
      audio.playBossAlert();
      this.spawnBoss(waveNum);
      this.spawnEscortFleet();
    }
    // Is this a Challenge Stage (every 3rd stage that is not a boss stage)?
    else if (waveNum % 3 === 0) {
      this.status = 'CHALLENGE_STAGE';
      this.challengeWaveTotal = 24;
      this.challengeWaveHit = 0;
      this.spawnChallengeStage();
    } else {
      this.status = 'PLAYING';
      this.spawnStandardFormation(waveNum);
    }

    // Warp in effect
    this.isWarping = true;
    this.warpTimer = 60;

    this.addFloatingText(this.width / 2, this.height / 2 - 40, `STAGE ${waveNum}`, '#38bdf8', 16, 70);

    if (this.onStateChange) this.onStateChange();
  }

  private spawnStandardFormation(waveNum: number) {
    this.enemies = [];
    const cols = 8;
    const spacingX = Math.min(50, (this.width - 80) / cols);
    const startX = (this.width - (cols - 1) * spacingX) / 2;
    const startY = 80;

    let id = 1;

    // Row 0: Commanders (Green flagships)
    for (let c = 0; c < 4; c++) {
      const col = c * 2 + 1;
      const targetX = startX + col * spacingX;
      const targetY = startY;
      this.enemies.push(this.createEnemy(id++, 'COMMANDER', targetX, targetY, 0, col, waveNum));
    }

    // Row 1 & 2: Butterflies (Red swoopers)
    for (let r = 1; r <= 2; r++) {
      for (let c = 0; c < cols; c++) {
        const targetX = startX + c * spacingX;
        const targetY = startY + r * 38;
        this.enemies.push(this.createEnemy(id++, 'BUTTERFLY', targetX, targetY, r, c, waveNum));
      }
    }

    // Row 3 & 4: Drones (Cyan scouts)
    for (let r = 3; r <= 4; r++) {
      for (let c = 0; c < cols; c++) {
        const targetX = startX + c * spacingX;
        const targetY = startY + r * 36;
        this.enemies.push(this.createEnemy(id++, 'DRONE', targetX, targetY, r, c, waveNum));
      }
    }

    // On wave >= 3, add Infiltrators
    if (waveNum >= 3) {
      for (let c = 0; c < 2; c++) {
        const col = c * 5 + 1;
        const targetX = startX + col * spacingX;
        const targetY = startY + 5 * 36;
        this.enemies.push(this.createEnemy(id++, 'INFILTRATOR', targetX, targetY, 5, col, waveNum));
      }
    }
  }

  private createEnemy(
    id: number,
    type: Enemy['type'],
    targetX: number,
    targetY: number,
    row: number,
    col: number,
    waveNum: number
  ): Enemy {
    const hpMap = { DRONE: 1, BUTTERFLY: 1, COMMANDER: 2, INFILTRATOR: 2, BOSS: 100 };
    const pointsMap = { DRONE: 100, BUTTERFLY: 160, COMMANDER: 300, INFILTRATOR: 400, BOSS: 5000 };
    const colorsMap = { DRONE: '#38bdf8', BUTTERFLY: '#ef4444', COMMANDER: '#16a34a', INFILTRATOR: '#a855f7', BOSS: '#e11d48' };

    // Entrance path curve (looping in from top sides)
    const entranceSide = id % 2 === 0 ? -40 : this.width + 40;

    return {
      id,
      type,
      x: entranceSide,
      y: -30 - (id % 8) * 20,
      width: type === 'COMMANDER' ? 36 : 28,
      height: type === 'COMMANDER' ? 32 : 26,
      hp: hpMap[type] + Math.floor((waveNum - 1) / 4),
      maxHp: hpMap[type] + Math.floor((waveNum - 1) / 4),
      points: pointsMap[type],
      state: 'ENTERING',
      formationRow: row,
      formationCol: col,
      formationTargetX: targetX,
      formationTargetY: targetY,
      pathProgress: 0,
      pathType: id % 3,
      diveAngle: Math.PI / 2,
      speed: 3 + Math.min(3, waveNum * 0.3),
      wingAngle: 0,
      color: colorsMap[type],
      shootCooldown: 60 + Math.random() * 120,
    };
  }

  private spawnChallengeStage() {
    this.enemies = [];
    let id = 1;
    // 24 acrobatic flyers flying in 3 waves through smooth Bézier paths
    for (let i = 0; i < 24; i++) {
      const enemy = this.createEnemy(id++, 'BUTTERFLY', 0, 0, 0, 0, 1);
      enemy.state = 'DIVING';
      enemy.points = 200;
      enemy.x = -50 - i * 45;
      enemy.y = 80 + Math.sin(i * 0.5) * 60;
      enemy.speed = 4.2;
      enemy.pathType = i % 2;
      this.enemies.push(enemy);
    }
  }

  private spawnBoss(waveNum: number) {
    const baseHp = 100 + waveNum * 40;
    this.boss = {
      x: this.width / 2,
      y: 110,
      targetX: this.width / 2,
      width: 130,
      height: 70,
      hp: baseHp,
      maxHp: baseHp,
      phase: 1,
      moveAngle: 0,
      attackTimer: 80,
      shieldActive: true,
      shieldHp: 30 + waveNum * 10,
      maxShieldHp: 30 + waveNum * 10,
      isEnraged: false,
    };
  }

  private spawnEscortFleet() {
    // 4 escorts flanking boss
    this.enemies = [];
    const escorts: Enemy['type'][] = ['COMMANDER', 'INFILTRATOR', 'COMMANDER', 'INFILTRATOR'];
    escorts.forEach((t, i) => {
      const offsetX = (i - 1.5) * 70;
      const enemy = this.createEnemy(100 + i, t, this.width / 2 + offsetX, 190, 1, i, this.wave);
      enemy.state = 'FORMATION';
      enemy.x = this.width / 2 + offsetX;
      enemy.y = 190;
      this.enemies.push(enemy);
    });
  }

  // --- Fire Player Weapon ---
  public firePlayerWeapon() {
    if (this.player.isHit || this.status === 'PAUSED' || this.status === 'GAME_OVER' || this.status === 'MENU') return;

    audio.ensureAudio();
    const rateLimit = this.player.rapidFireTimer > 0 ? 9 : 14;
    if (this.shootCooldown > 0) return;
    this.shootCooldown = rateLimit;

    this.stats.shotsFired++;

    const isPlasma = this.player.activeWeapon === 'PLASMA';
    const isSpread = this.player.activeWeapon === 'SPREAD';
    const isDual = this.player.isDual;

    audio.playLaser(isDual, isPlasma);

    const bulletSpeed = 11;
    const bulletId = Date.now() + Math.random();

    if (isPlasma) {
      // Piercing beam cannon
      this.bullets.push({
        id: bulletId,
        x: this.player.x,
        y: this.player.y - 18,
        vx: 0,
        vy: -bulletSpeed * 1.3,
        isPlayer: true,
        type: 'PLASMA',
        damage: 3.5,
        color: '#4ade80',
        radius: 6,
      });
      return;
    }

    if (isSpread) {
      // 3-way spread lasers
      const angles = [-0.18, 0, 0.18];
      angles.forEach((ang, idx) => {
        this.bullets.push({
          id: bulletId + idx,
          x: this.player.x,
          y: this.player.y - 16,
          vx: Math.sin(ang) * bulletSpeed,
          vy: -Math.cos(ang) * bulletSpeed,
          isPlayer: true,
          type: 'SPREAD',
          damage: 1.5,
          color: '#facc15',
          radius: 4,
        });
      });
      return;
    }

    // Normal / Dual classic blaster
    if (isDual) {
      this.bullets.push(
        {
          id: bulletId,
          x: this.player.x - 20,
          y: this.player.y - 16,
          vx: 0,
          vy: -bulletSpeed,
          isPlayer: true,
          type: 'NORMAL',
          damage: 1.5,
          color: '#38bdf8',
          radius: 3,
        },
        {
          id: bulletId + 1,
          x: this.player.x + 20,
          y: this.player.y - 16,
          vx: 0,
          vy: -bulletSpeed,
          isPlayer: true,
          type: 'NORMAL',
          damage: 1.5,
          color: '#38bdf8',
          radius: 3,
        }
      );
    } else {
      this.bullets.push({
        id: bulletId,
        x: this.player.x,
        y: this.player.y - 18,
        vx: 0,
        vy: -bulletSpeed,
        isPlayer: true,
        type: 'NORMAL',
        damage: 1.2,
        color: '#38bdf8',
        radius: 3.5,
      });
    }
  }

  // --- Trigger EMP Smart Bomb ---
  public triggerSmartBomb() {
    if (this.player.smartBombs <= 0 || this.status !== 'PLAYING' && this.status !== 'BOSS_STAGE') return;
    this.player.smartBombs--;
    audio.playSmartBomb();

    // Clear all enemy bullets
    this.bullets = this.bullets.filter((b) => b.isPlayer);

    // Blast effect shockwave particles
    for (let i = 0; i < 40; i++) {
      const angle = (i / 40) * Math.PI * 2;
      const spd = 6 + Math.random() * 8;
      this.particles.push({
        id: Math.random(),
        x: this.player.x,
        y: this.player.y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        color: '#67e8f9',
        radius: 4 + Math.random() * 4,
        alpha: 1,
        life: 0,
        maxLife: 35,
      });
    }

    // Heavy damage to all enemies
    this.enemies.forEach((enemy) => {
      enemy.hp -= 3;
      if (enemy.hp <= 0) {
        this.destroyEnemy(enemy);
      }
    });

    if (this.boss) {
      if (this.boss.shieldActive) {
        this.boss.shieldHp -= 20;
        if (this.boss.shieldHp <= 0) {
          this.boss.shieldActive = false;
        }
      } else {
        this.boss.hp -= 25;
      }
    }

    this.addFloatingText(this.player.x, this.player.y - 30, 'EMP DETONATED!', '#67e8f9', 14, 45);
    if (this.onStateChange) this.onStateChange();
  }

  // --- Loop & Engine Core ---
  public start() {
    if (this.animFrameId) return;
    this.lastTime = performance.now();
    const loop = (time: number) => {
      const dt = Math.min(32, time - this.lastTime);
      this.lastTime = time;
      this.update(dt);
      this.render();
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  public stop() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  // --- Update Physics & Logic ---
  private update(dt: number) {
    this.tick++;

    // Starfield scroll
    const warpMult = this.isWarping ? 10 : 1;
    this.stars.forEach((star) => {
      star.y += star.speed * warpMult;
      if (star.y > this.height) {
        star.y = 0;
        star.x = Math.random() * this.width;
      }
    });

    if (this.isWarping) {
      this.warpTimer--;
      if (this.warpTimer <= 0) {
        this.isWarping = false;
      }
    }

    if (this.status === 'PAUSED' || this.status === 'MENU' || this.status === 'GAME_OVER') {
      return;
    }

    // Update Player Movement
    this.updatePlayer();

    // Auto-fire or cooldown
    if (this.shootCooldown > 0) this.shootCooldown--;
    if (this.autoFire && (this.status === 'PLAYING' || this.status === 'CHALLENGE_STAGE' || this.status === 'BOSS_STAGE')) {
      if (this.shootCooldown <= 0) {
        this.firePlayerWeapon();
      }
    }

    // Timers
    if (this.player.weaponTimer > 0) {
      this.player.weaponTimer--;
      if (this.player.weaponTimer <= 0) {
        this.player.activeWeapon = 'NORMAL';
      }
    }
    if (this.player.rapidFireTimer > 0) this.player.rapidFireTimer--;
    if (this.player.invincibleTimer > 0) this.player.invincibleTimer--;

    // Update Formation oscillation
    this.formationOffsetX += this.formationDirection * 0.6;
    if (Math.abs(this.formationOffsetX) > 35) {
      this.formationDirection *= -1;
    }

    // Update Enemies
    this.updateEnemies();

    // Update Boss
    if (this.boss) {
      this.updateBoss();
    }

    // Update Bullets
    this.updateBullets();

    // Update PowerUps
    this.updatePowerUps();

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.life++;
      p.alpha = 1 - p.life / p.maxLife;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }

    // Update Floating Text
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 0.8;
      ft.life++;
      ft.alpha = 1 - ft.life / ft.maxLife;
      if (ft.life >= ft.maxLife) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // Check Stage Clear conditions
    this.checkStageStatus();
  }

  private updatePlayer() {
    let moveDir = 0;
    if (this.keys['ArrowLeft'] || this.keys['KeyA']) moveDir -= 1;
    if (this.keys['ArrowRight'] || this.keys['KeyD']) moveDir += 1;

    // Keyboard move
    if (moveDir !== 0) {
      this.player.x += moveDir * this.player.speed;
      this.player.targetX = this.player.x;
    } else if (this.mouseX !== null) {
      // Smooth tracking towards mouse/touch
      const dx = this.mouseX - this.player.x;
      if (Math.abs(dx) > 2) {
        this.player.x += dx * 0.25;
      }
    }

    // Bound inside screen
    const boundary = this.player.isDual ? 42 : 24;
    this.player.x = Math.max(boundary, Math.min(this.width - boundary, this.player.x));
  }

  private updateEnemies() {
    // Random dive trigger
    this.nextDiveTimer--;
    if (this.nextDiveTimer <= 0 && this.status === 'PLAYING') {
      this.nextDiveTimer = Math.max(60, 180 - this.wave * 12);
      this.triggerEnemyDive();
    }

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];

      // Wing flap animation
      enemy.wingAngle = Math.sin(this.tick * 0.2 + enemy.id) * 0.3;

      if (enemy.state === 'ENTERING') {
        enemy.pathProgress += 0.02;
        // Move towards assigned formation spot
        const tx = enemy.formationTargetX + this.formationOffsetX;
        const ty = enemy.formationTargetY;
        const dx = tx - enemy.x;
        const dy = ty - enemy.y;

        enemy.x += dx * 0.06;
        enemy.y += dy * 0.06;
        enemy.diveAngle = Math.atan2(dy, dx);

        if (Math.hypot(dx, dy) < 8) {
          enemy.state = 'FORMATION';
        }
      } else if (enemy.state === 'FORMATION') {
        enemy.x = enemy.formationTargetX + this.formationOffsetX;
        enemy.y = enemy.formationTargetY;

        // Occasional pot-shot from formation if wave >= 2
        enemy.shootCooldown--;
        if (enemy.shootCooldown <= 0 && this.wave >= 2 && Math.random() < 0.005) {
          enemy.shootCooldown = 180 + Math.random() * 120;
          this.fireEnemyBullet(enemy.x, enemy.y + 12);
        }
      } else if (enemy.state === 'DIVING') {
        // Swooping attack flight path
        const targetX = this.player.x;
        const targetY = this.player.y;
        const angleToPlayer = Math.atan2(targetY - enemy.y, targetX - enemy.x);

        // Turn towards player smoothly
        const angleDiff = angleToPlayer - enemy.diveAngle;
        enemy.diveAngle += Math.sin(angleDiff) * 0.07;

        enemy.x += Math.cos(enemy.diveAngle) * enemy.speed;
        enemy.y += Math.sin(enemy.diveAngle) * enemy.speed;

        // Shoot while diving
        enemy.shootCooldown--;
        if (enemy.shootCooldown <= 0) {
          enemy.shootCooldown = 90;
          this.fireEnemyBullet(enemy.x, enemy.y);
        }

        // Loop back up if it falls off bottom
        if (enemy.y > this.height + 30) {
          if (this.status === 'CHALLENGE_STAGE') {
            // Escapes without kill
            this.enemies.splice(i, 1);
            continue;
          }
          enemy.y = -30;
          enemy.x = enemy.formationTargetX;
          enemy.state = 'ENTERING';
        }
      }

      // Check collision with player
      if (this.player.invincibleTimer <= 0) {
        const dist = Math.hypot(enemy.x - this.player.x, enemy.y - this.player.y);
        const hitRadius = (this.player.isDual ? 36 : 22) + enemy.width / 2;
        if (dist < hitRadius) {
          this.handlePlayerHit();
          this.destroyEnemy(enemy);
        }
      }
    }
  }

  private triggerEnemyDive() {
    const formationEnemies = this.enemies.filter((e) => e.state === 'FORMATION');
    if (formationEnemies.length === 0) return;

    // Pick 1 to 2 enemies
    const diveCount = Math.min(formationEnemies.length, Math.random() < 0.6 ? 2 : 1);
    for (let i = 0; i < diveCount; i++) {
      const idx = Math.floor(Math.random() * formationEnemies.length);
      const chosen = formationEnemies.splice(idx, 1)[0];
      chosen.state = 'DIVING';
      chosen.diveAngle = Math.PI / 2;
      chosen.speed = 4 + Math.min(3, this.wave * 0.35);
      audio.playEnemyDive();
    }
  }

  private fireEnemyBullet(x: number, y: number, isMissile = false) {
    if (this.status === 'CHALLENGE_STAGE') return; // Bonus stage has no enemy fire

    audio.playEnemyLaser();
    const angle = Math.atan2(this.player.y - y, this.player.x - x);
    const speed = isMissile ? 4.2 : 5.2;

    this.bullets.push({
      id: Date.now() + Math.random(),
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      isPlayer: false,
      type: isMissile ? 'BOSS_MISSILE' : 'ENEMY',
      damage: 1,
      color: isMissile ? '#f43f5e' : '#ef4444',
      radius: isMissile ? 5 : 3.5,
    });
  }

  private updateBoss() {
    if (!this.boss) return;

    // Boss swaying motion
    this.boss.moveAngle += 0.03;
    this.boss.x = this.width / 2 + Math.sin(this.boss.moveAngle) * (this.width / 2 - 90);

    // Enrage trigger
    if (this.boss.hp <= this.boss.maxHp * 0.4 && !this.boss.isEnraged) {
      this.boss.isEnraged = true;
      this.addFloatingText(this.boss.x, this.boss.y - 20, 'DANGER! BOSS ENRAGED', '#ef4444', 12, 60);
    }

    // Attack timer
    this.boss.attackTimer--;
    if (this.boss.attackTimer <= 0) {
      this.boss.attackTimer = this.boss.isEnraged ? 45 : 75;

      // Cannon barrages from wing pods
      this.fireEnemyBullet(this.boss.x - 48, this.boss.y + 12);
      this.fireEnemyBullet(this.boss.x + 48, this.boss.y + 12);

      // Enraged homing missiles from center
      if (this.boss.isEnraged) {
        this.fireEnemyBullet(this.boss.x, this.boss.y + 20, true);
      }
    }
  }

  private updateBullets() {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x += b.vx;
      b.y += b.vy;

      // Remove out of screen
      if (b.y < -30 || b.y > this.height + 30 || b.x < -30 || b.x > this.width + 30) {
        this.bullets.splice(i, 1);
        continue;
      }

      if (b.isPlayer) {
        // Check hit against boss
        if (this.boss) {
          const hitBoss =
            Math.abs(b.x - this.boss.x) < this.boss.width / 2 &&
            Math.abs(b.y - this.boss.y) < this.boss.height / 2;

          if (hitBoss) {
            this.stats.shotsHit++;
            this.bullets.splice(i, 1);
            this.handleBossDamage(b.damage);
            continue;
          }
        }

        // Check hit against normal enemies
        let bulletConsumed = false;
        for (let j = this.enemies.length - 1; j >= 0; j--) {
          const enemy = this.enemies[j];
          const dist = Math.hypot(b.x - enemy.x, b.y - enemy.y);
          if (dist < enemy.width / 2 + b.radius) {
            this.stats.shotsHit++;
            enemy.hp -= b.damage;

            // Spawn sparks
            this.spawnSparks(b.x, b.y, b.color, 4);

            if (enemy.hp <= 0) {
              this.destroyEnemy(enemy);
            } else {
              audio.playExplosion(false);
            }

            if (b.type !== 'PLASMA') {
              // Plasma pierces through!
              this.bullets.splice(i, 1);
              bulletConsumed = true;
              break;
            }
          }
        }
        if (bulletConsumed) continue;
      } else {
        // Enemy bullet hitting player
        if (this.player.invincibleTimer <= 0) {
          const hitRadius = (this.player.isDual ? 32 : 18) + b.radius;
          const dist = Math.hypot(b.x - this.player.x, b.y - this.player.y);
          if (dist < hitRadius) {
            this.bullets.splice(i, 1);
            this.handlePlayerHit();
            continue;
          }
        }
      }
    }
  }

  private handleBossDamage(damage: number) {
    if (!this.boss) return;

    audio.playExplosion(false);
    this.spawnSparks(this.boss.x + (Math.random() - 0.5) * 60, this.boss.y + 10, '#38bdf8', 6);

    if (this.boss.shieldActive && this.boss.shieldHp > 0) {
      this.boss.shieldHp -= damage;
      if (this.boss.shieldHp <= 0) {
        this.boss.shieldActive = false;
        audio.playExplosion(true);
        this.addFloatingText(this.boss.x, this.boss.y, 'SHIELD DOWN!', '#a855f7', 12, 50);
      }
      return;
    }

    this.boss.hp -= damage;
    if (this.boss.hp <= 0) {
      this.destroyBoss();
    }
  }

  private destroyEnemy(enemy: Enemy) {
    const idx = this.enemies.indexOf(enemy);
    if (idx !== -1) {
      this.enemies.splice(idx, 1);
    }

    this.stats.enemiesDefeated++;
    this.stats.currentCombo++;
    if (this.stats.currentCombo > this.stats.maxCombo) {
      this.stats.maxCombo = this.stats.currentCombo;
    }

    // Diving enemies award double points!
    const multiplier = enemy.state === 'DIVING' ? 2 : 1;
    const earnedPoints = enemy.points * multiplier;
    this.player.score += earnedPoints;

    audio.playExplosion(enemy.type === 'COMMANDER');
    this.spawnExplosion(enemy.x, enemy.y, enemy.color, 16);

    // Floating score popup
    this.addFloatingText(
      enemy.x,
      enemy.y,
      `+${earnedPoints}`,
      multiplier > 1 ? '#facc15' : '#ffffff',
      multiplier > 1 ? 12 : 9,
      35
    );

    // Chance to drop power-up (higher on Commander)
    const dropRate = enemy.type === 'COMMANDER' ? 0.45 : enemy.type === 'INFILTRATOR' ? 0.35 : 0.08;
    if (Math.random() < dropRate) {
      this.spawnPowerUp(enemy.x, enemy.y);
    }

    // High score check
    if (this.player.score > this.highScore) {
      this.highScore = this.player.score;
    }

    if (this.status === 'CHALLENGE_STAGE') {
      this.challengeWaveHit++;
    }

    if (this.onStateChange) this.onStateChange();
  }

  private destroyBoss() {
    if (!this.boss) return;

    audio.playExplosion(true);
    for (let i = 0; i < 60; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 2 + Math.random() * 8;
      this.particles.push({
        id: Math.random(),
        x: this.boss.x + (Math.random() - 0.5) * 80,
        y: this.boss.y + (Math.random() - 0.5) * 40,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        color: Math.random() > 0.5 ? '#f43f5e' : '#fbbf24',
        radius: 4 + Math.random() * 5,
        alpha: 1,
        life: 0,
        maxLife: 50,
      });
    }

    this.player.score += 5000;
    this.stats.bossesDefeated++;
    this.addFloatingText(this.boss.x, this.boss.y, 'BOSS DESTROYED! +5000', '#facc15', 14, 60);

    // Guaranteed 1UP or Dual Fighter drop
    this.spawnPowerUp(this.boss.x, this.boss.y, 'DUAL_FIGHTER');

    this.boss = null;
    this.enemies = []; // Escorts perish with mothership
    if (this.onStateChange) this.onStateChange();
  }

  private handlePlayerHit() {
    // If shield active, absorb hit
    if (this.player.hasShield && this.player.shieldHealth > 0) {
      this.player.shieldHealth--;
      audio.playExplosion(false);
      this.spawnSparks(this.player.x, this.player.y, '#38bdf8', 12);
      this.addFloatingText(this.player.x, this.player.y - 20, 'SHIELD HIT!', '#38bdf8', 10, 30);
      if (this.player.shieldHealth <= 0) {
        this.player.hasShield = false;
        this.addFloatingText(this.player.x, this.player.y - 20, 'SHIELD BROKEN!', '#ef4444', 10, 35);
      }
      return;
    }

    // If dual ship, sacrifice one wing!
    if (this.player.isDual) {
      this.player.isDual = false;
      this.player.invincibleTimer = 90;
      audio.playExplosion(true);
      this.spawnExplosion(this.player.x + 20, this.player.y, '#ef4444', 20);
      this.addFloatingText(this.player.x, this.player.y - 30, 'WING DESTROYED!', '#f87171', 12, 45);
      if (this.onStateChange) this.onStateChange();
      return;
    }

    // Standard death
    this.player.lives--;
    this.stats.currentCombo = 0;
    audio.playExplosion(true);
    this.spawnExplosion(this.player.x, this.player.y, '#ffffff', 30);

    if (this.player.lives <= 0) {
      this.gameOver();
    } else {
      // Respawn
      this.player.x = this.width / 2;
      this.player.invincibleTimer = 150;
      this.player.activeWeapon = 'NORMAL';
      this.player.hasShield = false;
      this.addFloatingText(this.width / 2, this.height - 90, 'RESPAWN!', '#e2e8f0', 12, 45);
    }

    if (this.onStateChange) this.onStateChange();
  }

  private gameOver() {
    this.status = 'GAME_OVER';
    audio.stopBgm();
    this.saveScore('YOU');
    if (this.onGameOver) {
      this.onGameOver(this.stats, this.player.score);
    }
    if (this.onStateChange) this.onStateChange();
  }

  private spawnPowerUp(x: number, y: number, forceType?: PowerUpType) {
    const types: PowerUpType[] = ['DUAL_FIGHTER', 'SPREAD_SHOT', 'RAPID_FIRE', 'PLASMA_BEAM', 'SHIELD', 'SMART_BOMB', 'EXTRA_LIFE'];
    const weights = [0.18, 0.22, 0.22, 0.14, 0.12, 0.08, 0.04];

    let chosenType = forceType;
    if (!chosenType) {
      const rand = Math.random();
      let cumulative = 0;
      for (let i = 0; i < types.length; i++) {
        cumulative += weights[i];
        if (rand < cumulative) {
          chosenType = types[i];
          break;
        }
      }
    }
    if (!chosenType) chosenType = 'SPREAD_SHOT';

    const configs: Record<PowerUpType, { label: string; color: string }> = {
      DUAL_FIGHTER: { label: '2X', color: '#38bdf8' },
      SPREAD_SHOT: { label: 'SP', color: '#facc15' },
      RAPID_FIRE: { label: 'RP', color: '#f97316' },
      PLASMA_BEAM: { label: 'PL', color: '#4ade80' },
      SHIELD: { label: 'SH', color: '#06b6d4' },
      SMART_BOMB: { label: 'BM', color: '#ec4899' },
      EXTRA_LIFE: { label: '1UP', color: '#a855f7' },
    };

    this.powerUps.push({
      id: Date.now() + Math.random(),
      type: chosenType,
      x,
      y,
      vy: 1.8,
      radius: 13,
      label: configs[chosenType].label,
      color: configs[chosenType].color,
    });
  }

  private updatePowerUps() {
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const p = this.powerUps[i];
      p.y += p.vy;

      if (p.y > this.height + 20) {
        this.powerUps.splice(i, 1);
        continue;
      }

      // Check collision with player
      const dist = Math.hypot(p.x - this.player.x, p.y - this.player.y);
      if (dist < p.radius + (this.player.isDual ? 32 : 18)) {
        this.collectPowerUp(p);
        this.powerUps.splice(i, 1);
      }
    }
  }

  private collectPowerUp(p: PowerUp) {
    audio.playPowerUp();
    this.stats.powerUpsCollected++;
    this.spawnSparks(p.x, p.y, p.color, 12);

    switch (p.type) {
      case 'DUAL_FIGHTER':
        this.player.isDual = true;
        this.addFloatingText(this.player.x, this.player.y - 25, 'DUAL SHIP ARMED!', '#38bdf8', 12, 50);
        break;
      case 'SPREAD_SHOT':
        this.player.activeWeapon = 'SPREAD';
        this.player.weaponTimer = 600; // 10 seconds
        this.addFloatingText(this.player.x, this.player.y - 25, 'SPREAD LASER!', '#facc15', 12, 50);
        break;
      case 'PLASMA_BEAM':
        this.player.activeWeapon = 'PLASMA';
        this.player.weaponTimer = 500;
        this.addFloatingText(this.player.x, this.player.y - 25, 'PLASMA CANNON!', '#4ade80', 12, 50);
        break;
      case 'RAPID_FIRE':
        this.player.rapidFireTimer = 600;
        this.addFloatingText(this.player.x, this.player.y - 25, 'RAPID FIRE!', '#f97316', 12, 50);
        break;
      case 'SHIELD':
        this.player.hasShield = true;
        this.player.shieldHealth = this.player.maxShieldHealth;
        this.addFloatingText(this.player.x, this.player.y - 25, 'ENERGY SHIELD!', '#06b6d4', 12, 50);
        break;
      case 'SMART_BOMB':
        this.player.smartBombs = Math.min(5, this.player.smartBombs + 1);
        this.addFloatingText(this.player.x, this.player.y - 25, '+1 SMART BOMB', '#ec4899', 12, 50);
        break;
      case 'EXTRA_LIFE':
        this.player.lives++;
        audio.play1UP();
        this.addFloatingText(this.player.x, this.player.y - 25, '1UP! EXTRA LIFE', '#a855f7', 14, 60);
        break;
    }

    if (this.onStateChange) this.onStateChange();
  }

  private checkStageStatus() {
    if (this.status === 'PLAYING') {
      if (this.enemies.length === 0) {
        this.stageClearTimer++;
        if (this.stageClearTimer > 60) {
          this.stageClearTimer = 0;
          this.startWave(this.wave + 1);
        }
      }
    } else if (this.status === 'CHALLENGE_STAGE') {
      if (this.enemies.length === 0) {
        this.stageClearTimer++;
        if (this.stageClearTimer > 60) {
          this.stageClearTimer = 0;
          // Calculate challenge bonus
          const bonus = this.challengeWaveHit === this.challengeWaveTotal ? 10000 : this.challengeWaveHit * 100;
          this.player.score += bonus;
          if (this.challengeWaveHit === this.challengeWaveTotal) {
            this.addFloatingText(this.width / 2, this.height / 2, 'PERFECT! +10,000 PTS', '#facc15', 14, 90);
          } else {
            this.addFloatingText(this.width / 2, this.height / 2, `BONUS +${bonus} PTS`, '#38bdf8', 12, 80);
          }
          this.startWave(this.wave + 1);
        }
      }
    } else if (this.status === 'BOSS_STAGE') {
      if (!this.boss && this.enemies.length === 0) {
        this.stageClearTimer++;
        if (this.stageClearTimer > 80) {
          this.stageClearTimer = 0;
          this.startWave(this.wave + 1);
        }
      }
    }
  }

  // --- Particle Spawners ---
  private spawnExplosion(x: number, y: number, color: string, count = 20) {
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 1.5 + Math.random() * 5.5;
      this.particles.push({
        id: Math.random(),
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        color: Math.random() > 0.4 ? color : '#facc15',
        radius: 2 + Math.random() * 3,
        alpha: 1,
        life: 0,
        maxLife: 25 + Math.random() * 20,
      });
    }
  }

  private spawnSparks(x: number, y: number, color: string, count = 6) {
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 2 + Math.random() * 4;
      this.particles.push({
        id: Math.random(),
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        color,
        radius: 1.5,
        alpha: 1,
        life: 0,
        maxLife: 15,
      });
    }
  }

  public addFloatingText(x: number, y: number, text: string, color: string, size = 10, maxLife = 40) {
    this.floatingTexts.push({
      id: Math.random(),
      x,
      y,
      text,
      color,
      alpha: 1,
      life: 0,
      maxLife,
      size,
    });
  }

  // --- Canvas Render ---
  public render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Deep space background
    this.ctx.fillStyle = '#05070f';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw Stars
    SpriteRenderer.drawStars(this.ctx, this.stars, this.isWarping, this.width, this.height);

    // Draw PowerUps
    this.powerUps.forEach((p) => SpriteRenderer.drawPowerUp(this.ctx, p, this.tick));

    // Draw Enemies
    this.enemies.forEach((enemy) => SpriteRenderer.drawEnemy(this.ctx, enemy, this.tick));

    // Draw Boss
    if (this.boss) {
      SpriteRenderer.drawBoss(this.ctx, this.boss, this.tick);
    }

    // Draw Bullets
    this.bullets.forEach((b) => SpriteRenderer.drawBullet(this.ctx, b));

    // Draw Player
    if (this.status !== 'GAME_OVER' && this.status !== 'MENU') {
      SpriteRenderer.drawPlayer(this.ctx, this.player, this.tick);
    }

    // Draw Particles
    this.particles.forEach((p) => SpriteRenderer.drawParticle(this.ctx, p));

    // Draw Floating Texts
    this.floatingTexts.forEach((ft) => SpriteRenderer.drawFloatingText(this.ctx, ft));

    // Challenge stage hit counter HUD
    if (this.status === 'CHALLENGE_STAGE') {
      this.ctx.save();
      this.ctx.fillStyle = '#facc15';
      this.ctx.font = '10px "Press Start 2P", monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(`BONUS STAGE: ${this.challengeWaveHit} / ${this.challengeWaveTotal}`, this.width / 2, 45);
      this.ctx.restore();
    }
  }
}
