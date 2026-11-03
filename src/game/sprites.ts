/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Player, Enemy, Boss, Bullet, PowerUp, Particle, FloatingText, Star } from './types';

export class SpriteRenderer {
  // --- Player Starfighter Drawing ---
  public static drawPlayer(ctx: CanvasRenderingContext2D, player: Player, tick: number) {
    ctx.save();
    ctx.translate(player.x, player.y);

    // Flicker if hit / invincible
    if (player.invincibleTimer > 0 && Math.floor(tick / 4) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    if (player.isDual) {
      // Draw two fighters linked side-by-side
      this.drawSingleFighter(ctx, -20, 0, tick, player);
      this.drawSingleFighter(ctx, 20, 0, tick, player);

      // Energy link beam between fighters
      ctx.save();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(-10, 2);
      ctx.lineTo(10, 2);
      ctx.stroke();

      // Connector node
      ctx.fillStyle = '#67e8f9';
      ctx.beginPath();
      ctx.arc(0, 2, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      this.drawSingleFighter(ctx, 0, 0, tick, player);
    }

    // Shield bubble
    if (player.hasShield && player.shieldHealth > 0) {
      ctx.save();
      const pulse = Math.sin(tick * 0.1) * 3;
      const radius = (player.isDual ? 44 : 28) + pulse;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#0284c7';
      ctx.shadowBlur = 12;

      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Hexagonal faint energy field
      ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();

      // Shield health indicator rings
      const angle = (player.shieldHealth / player.maxShieldHealth) * Math.PI * 2;
      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, radius + 4, -Math.PI / 2, -Math.PI / 2 + angle);
      ctx.stroke();

      ctx.restore();
    }

    ctx.restore();
  }

  private static drawSingleFighter(
    ctx: CanvasRenderingContext2D,
    offsetX: number,
    offsetY: number,
    tick: number,
    player: Player
  ) {
    ctx.save();
    ctx.translate(offsetX, offsetY);

    // Animated Thruster Exhaust Flame
    const flameH = 8 + Math.random() * 8 + Math.sin(tick * 0.3) * 4;
    ctx.save();
    ctx.fillStyle = Math.random() > 0.4 ? '#f97316' : '#facc15';
    ctx.shadowColor = '#f97316';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(-5, 16);
    ctx.lineTo(0, 16 + flameH);
    ctx.lineTo(5, 16);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Wings (Red retro swept wings)
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(-18, 14);
    ctx.lineTo(-12, 16);
    ctx.lineTo(-4, 8);
    ctx.lineTo(4, 8);
    ctx.lineTo(12, 16);
    ctx.lineTo(18, 14);
    ctx.closePath();
    ctx.fill();

    // Wingtip Cannons
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-18, 4, 3, 10);
    ctx.fillRect(15, 4, 3, 10);

    // Wing Yellow Trim
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-17, 10, 2, 4);
    ctx.fillRect(15, 10, 2, 4);

    // Main Fuselage (Classic White)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(0, -18); // Nose cone
    ctx.lineTo(6, -2);
    ctx.lineTo(6, 14);
    ctx.lineTo(0, 16);
    ctx.lineTo(-6, 14);
    ctx.lineTo(-6, -2);
    ctx.closePath();
    ctx.fill();

    // Cockpit Canopy (Glowing Cyan)
    ctx.fillStyle = '#06b6d4';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.ellipse(0, -2, 3, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Fuselage Highlight Stripe
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(-2, 4, 4, 7);

    ctx.restore();
  }

  // --- Alien Enemies Drawing ---
  public static drawEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy, tick: number) {
    ctx.save();
    ctx.translate(enemy.x, enemy.y);

    // Dynamic rotation if diving
    if (enemy.state === 'DIVING') {
      ctx.rotate(enemy.diveAngle + Math.PI / 2);
    } else if (enemy.state === 'ENTERING') {
      ctx.rotate(enemy.diveAngle + Math.PI / 2);
    }

    const wingFlap = Math.sin(tick * 0.15 + enemy.id) * 0.25;

    switch (enemy.type) {
      case 'COMMANDER':
        this.drawCommander(ctx, wingFlap, enemy.hp < enemy.maxHp);
        break;
      case 'BUTTERFLY':
        this.drawButterfly(ctx, wingFlap);
        break;
      case 'DRONE':
        this.drawDrone(ctx, wingFlap);
        break;
      case 'INFILTRATOR':
        this.drawInfiltrator(ctx, wingFlap);
        break;
      default:
        this.drawDrone(ctx, wingFlap);
    }

    ctx.restore();
  }

  // Commander (Green Flagship - takes 2 hits, changes color on hit)
  private static drawCommander(ctx: CanvasRenderingContext2D, wingFlap: number, isDamaged: boolean) {
    // Colors: Green normal, Dark Blue/Cyan when damaged
    const mainColor = isDamaged ? '#0284c7' : '#16a34a';
    const subColor = isDamaged ? '#38bdf8' : '#4ade80';

    // Left Wing
    ctx.save();
    ctx.rotate(wingFlap);
    ctx.fillStyle = mainColor;
    ctx.beginPath();
    ctx.moveTo(-6, -4);
    ctx.lineTo(-18, -14);
    ctx.lineTo(-16, 8);
    ctx.lineTo(-6, 6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-17, -12, 3, 5);
    ctx.restore();

    // Right Wing
    ctx.save();
    ctx.rotate(-wingFlap);
    ctx.fillStyle = mainColor;
    ctx.beginPath();
    ctx.moveTo(6, -4);
    ctx.lineTo(18, -14);
    ctx.lineTo(16, 8);
    ctx.lineTo(6, 6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#facc15';
    ctx.fillRect(14, -12, 3, 5);
    ctx.restore();

    // Main Body
    ctx.fillStyle = subColor;
    ctx.beginPath();
    ctx.ellipse(0, 0, 7, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Mandibles / Antennae
    ctx.fillStyle = '#eab308';
    ctx.fillRect(-4, -14, 2, 5);
    ctx.fillRect(2, -14, 2, 5);

    // Glowing Central Core / Eye
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Butterfly / Red Hornet (Red and Yellow swooper)
  private static drawButterfly(ctx: CanvasRenderingContext2D, wingFlap: number) {
    // Wings Left
    ctx.save();
    ctx.rotate(wingFlap * 1.3);
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(-4, -2);
    ctx.lineTo(-15, -12);
    ctx.lineTo(-17, 4);
    ctx.lineTo(-4, 5);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.ellipse(-10, -3, 3, 5, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Wings Right
    ctx.save();
    ctx.rotate(-wingFlap * 1.3);
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(4, -2);
    ctx.lineTo(15, -12);
    ctx.lineTo(17, 4);
    ctx.lineTo(4, 5);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.ellipse(10, -3, 3, 5, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Center Torso
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.ellipse(0, 0, 5, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head / Eye
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(-2, -6, 2, 0, Math.PI * 2);
    ctx.arc(2, -6, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-1.5, -6.5, 1, 1);
    ctx.fillRect(1.5, -6.5, 1, 1);
  }

  // Drone (Cyan/Blue grunt scout)
  private static drawDrone(ctx: CanvasRenderingContext2D, wingFlap: number) {
    // Outer Armor Shell
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.moveTo(0, -11);
    ctx.lineTo(12 + wingFlap * 2, -2);
    ctx.lineTo(9, 9);
    ctx.lineTo(0, 6);
    ctx.lineTo(-9, 9);
    ctx.lineTo(-12 - wingFlap * 2, -2);
    ctx.closePath();
    ctx.fill();

    // Inner Shell (Bright Cyan)
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.lineTo(6, -1);
    ctx.lineTo(5, 5);
    ctx.lineTo(0, 3);
    ctx.lineTo(-5, 5);
    ctx.lineTo(-6, -1);
    ctx.closePath();
    ctx.fill();

    // Central core sensor
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(0, 0, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Elite Infiltrator (Purple stealth attacker)
  private static drawInfiltrator(ctx: CanvasRenderingContext2D, wingFlap: number) {
    ctx.fillStyle = '#8b5cf6';
    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.lineTo(14 + wingFlap * 3, 6);
    ctx.lineTo(7, 10);
    ctx.lineTo(0, 5);
    ctx.lineTo(-7, 10);
    ctx.lineTo(-14 - wingFlap * 3, 6);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#c084fc';
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(6, 2);
    ctx.lineTo(0, 4);
    ctx.lineTo(-6, 2);
    ctx.closePath();
    ctx.fill();

    // Plasma crystal
    ctx.fillStyle = '#ec4899';
    ctx.shadowColor = '#ec4899';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- Giant Boss Alien Flagship ---
  public static drawBoss(ctx: CanvasRenderingContext2D, boss: Boss, tick: number) {
    ctx.save();
    ctx.translate(boss.x, boss.y);

    const pulse = Math.sin(tick * 0.08) * 3;

    // Enraged aura if low HP
    if (boss.isEnraged) {
      ctx.save();
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.ellipse(0, 0, 68 + pulse * 2, 48 + pulse * 2, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Boss Shield Bubble
    if (boss.shieldActive && boss.shieldHp > 0) {
      ctx.save();
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.ellipse(0, 0, 75 + pulse, 52 + pulse, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(168, 85, 247, 0.12)';
      ctx.fill();
      ctx.restore();
    }

    // Boss Giant Main Wings (Outer Mechanical Plates)
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(0, -32);
    ctx.lineTo(58, -12);
    ctx.lineTo(64, 18);
    ctx.lineTo(38, 30);
    ctx.lineTo(18, 22);
    ctx.lineTo(0, 28);
    ctx.lineTo(-18, 22);
    ctx.lineTo(-38, 30);
    ctx.lineTo(-64, 18);
    ctx.lineTo(-58, -12);
    ctx.closePath();
    ctx.fill();

    // Dark Carbon Armor Trim
    ctx.fillStyle = boss.isEnraged ? '#7f1d1d' : '#1e293b';
    ctx.beginPath();
    ctx.moveTo(0, -26);
    ctx.lineTo(46, -6);
    ctx.lineTo(50, 14);
    ctx.lineTo(26, 20);
    ctx.lineTo(0, 24);
    ctx.lineTo(-26, 20);
    ctx.lineTo(-50, 14);
    ctx.lineTo(-46, -6);
    ctx.closePath();
    ctx.fill();

    // Wing Cannon Pods Left & Right
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(-52, -18, 8, 24);
    ctx.fillRect(44, -18, 8, 24);

    // Glowing Cannon Muzzles
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 8;
    ctx.fillRect(-50, 6, 4, 3);
    ctx.fillRect(46, 6, 4, 3);

    // Alien Bio-Mechanical Segments (Golden/Orange)
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.ellipse(-24, 0, 8, 12, -0.3, 0, Math.PI * 2);
    ctx.ellipse(24, 0, 8, 12, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Massive Glowing Central Eye / Reactor
    const eyeGlow = Math.sin(tick * 0.12) * 2;
    ctx.fillStyle = boss.isEnraged ? '#ff0055' : '#06b6d4';
    ctx.shadowColor = boss.isEnraged ? '#ff0055' : '#38bdf8';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.ellipse(0, 0, 14 + eyeGlow, 18 + eyeGlow, 0, 0, Math.PI * 2);
    ctx.fill();

    // Inner Iris
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();

    // Boss Health Bar above Boss
    ctx.restore(); // Exit translate to draw HUD cleanly
    ctx.save();
    const barW = 120;
    const barH = 7;
    const barX = boss.x - barW / 2;
    const barY = boss.y - boss.height / 2 - 18;

    // Background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);

    // HP Fill
    const hpRatio = Math.max(0, boss.hp / boss.maxHp);
    const hpGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    if (boss.isEnraged) {
      hpGrad.addColorStop(0, '#f43f5e');
      hpGrad.addColorStop(1, '#e11d48');
    } else {
      hpGrad.addColorStop(0, '#eab308');
      hpGrad.addColorStop(1, '#ef4444');
    }
    ctx.fillStyle = hpGrad;
    ctx.fillRect(barX, barY, barW * hpRatio, barH);

    // Border
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barW, barH);

    // Text Label
    ctx.fillStyle = '#f8fafc';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('BOSS DREADNOUGHT', boss.x, barY - 4);
    ctx.restore();
  }

  // --- Bullets & Lasers Drawing ---
  public static drawBullet(ctx: CanvasRenderingContext2D, bullet: Bullet) {
    ctx.save();
    ctx.translate(bullet.x, bullet.y);

    if (bullet.isPlayer) {
      if (bullet.type === 'PLASMA') {
        // Long Piercing Plasma Ray
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#22c55e';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(0, 10);
        ctx.lineTo(0, -16);
        ctx.stroke();

        ctx.strokeStyle = '#f0fdf4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 8);
        ctx.lineTo(0, -14);
        ctx.stroke();
      } else if (bullet.type === 'SPREAD') {
        // Golden Spread Energy Dart
        ctx.fillStyle = '#facc15';
        ctx.shadowColor = '#eab308';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(0, -8);
        ctx.lineTo(3, 4);
        ctx.lineTo(-3, 4);
        ctx.closePath();
        ctx.fill();
      } else {
        // Classic Arcade Dual/Single Laser Bolt (Glowing Red or Blue)
        ctx.fillStyle = bullet.color || '#38bdf8';
        ctx.shadowColor = bullet.color || '#38bdf8';
        ctx.shadowBlur = 8;
        ctx.fillRect(-2, -8, 4, 16);

        // Bright white center core
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-1, -6, 2, 12);
      }
    } else {
      // Enemy Fire: Red/Orange teardrop plasma or boss missile
      if (bullet.type === 'BOSS_MISSILE') {
        ctx.fillStyle = '#f43f5e';
        ctx.shadowColor = '#e11d48';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(0, 0, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  // --- PowerUp Drops ---
  public static drawPowerUp(ctx: CanvasRenderingContext2D, powerUp: PowerUp, tick: number) {
    ctx.save();
    ctx.translate(powerUp.x, powerUp.y);

    const pulse = Math.sin(tick * 0.15) * 2;
    const r = powerUp.radius + pulse;

    // Glowing Ring
    ctx.strokeStyle = powerUp.color;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = powerUp.color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();

    // Dark semi-transparent core
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // Label Icon / Letter
    ctx.fillStyle = powerUp.color;
    ctx.font = 'bold 10px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(powerUp.label, 0, 1);

    ctx.restore();
  }

  // --- Starfield Background ---
  public static drawStars(
    ctx: CanvasRenderingContext2D,
    stars: Star[],
    isWarping: boolean,
    width: number,
    height: number
  ) {
    ctx.save();
    for (let i = 0; i < stars.length; i++) {
      const star = stars[i];
      ctx.globalAlpha = star.alpha;
      ctx.fillStyle = star.color;

      if (isWarping) {
        // Hyperspace Warp Lines
        const streakLength = star.speed * 20;
        ctx.strokeStyle = star.color;
        ctx.lineWidth = star.size * 1.5;
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(star.x, star.y + streakLength);
        ctx.stroke();
      } else {
        // Classic Twinkling Star
        ctx.fillRect(star.x, star.y, star.size, star.size);
      }
    }
    ctx.restore();
  }

  // --- Particles & Explosions ---
  public static drawParticle(ctx: CanvasRenderingContext2D, p: Particle) {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // --- Floating Combat Text (+100, +800, DUAL SHIP!) ---
  public static drawFloatingText(ctx: CanvasRenderingContext2D, ft: FloatingText) {
    ctx.save();
    ctx.globalAlpha = ft.alpha;
    ctx.fillStyle = ft.color;
    ctx.shadowColor = ft.color;
    ctx.shadowBlur = 6;
    ctx.font = `${ft.size}px "Press Start 2P", monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  }
}
