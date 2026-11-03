/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GalaxyGameEngine } from './game/gameEngine';
import { audio } from './game/audio';
import { ArcadeHeader } from './components/ArcadeHeader';
import { ArcadeControls } from './components/ArcadeControls';
import { TitleScreen } from './components/TitleScreen';
import { GameOverModal } from './components/GameOverModal';
import { PilotManualModal } from './components/PilotManualModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { GameStats, HighScoreEntry } from './game/types';
import { Play, RotateCcw, Volume2, Shield } from 'lucide-react';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<GalaxyGameEngine | null>(null);

  // UI state reactive mirrors
  const [gameStatus, setGameStatus] = useState<'MENU' | 'PLAYING' | 'CHALLENGE_STAGE' | 'BOSS_STAGE' | 'PAUSED' | 'STAGE_CLEAR' | 'GAME_OVER'>('MENU');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(20000);
  const [wave, setWave] = useState<number>(1);
  const [playerState, setPlayerState] = useState<GalaxyGameEngine['player']>({
    x: 300,
    y: 740,
    targetX: 300,
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
    invincibleTimer: 0,
    isHit: false,
    hitTimer: 0,
  });

  // Settings
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isBgmEnabled, setIsBgmEnabled] = useState<boolean>(true);
  const [isCrtEnabled, setIsCrtEnabled] = useState<boolean>(true);
  const [autoFire, setAutoFire] = useState<boolean>(true);

  // Modals
  const [showManual, setShowManual] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [showGameOver, setShowGameOver] = useState<boolean>(false);
  const [gameOverStats, setGameOverStats] = useState<GameStats>({
    shotsFired: 0,
    shotsHit: 0,
    enemiesDefeated: 0,
    bossesDefeated: 0,
    powerUpsCollected: 0,
    maxCombo: 0,
    currentCombo: 0,
    wave: 1,
  });
  const [leaderboard, setLeaderboard] = useState<HighScoreEntry[]>([]);

  // Canvas resize helper
  const handleResize = useCallback(() => {
    if (!canvasRef.current || !containerRef.current || !engineRef.current) return;
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();

    // Keep 3:4 aspect ratio (ideal for vertical retro arcade shoot'em up)
    let w = Math.min(rect.width, 640);
    let h = Math.min(rect.height, 860);

    // Ensure adequate height while maintaining ratio
    if (w * (4 / 3) <= h) {
      h = Math.floor(w * (4 / 3));
    } else {
      w = Math.floor(h * (3 / 4));
    }

    engineRef.current.setDimensions(Math.max(340, w), Math.max(480, h));
  }, []);

  // Initialize Engine
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const engine = new GalaxyGameEngine(canvas);
    engineRef.current = engine;

    setHighScore(engine.highScore);
    setLeaderboard(engine.loadHighScore());

    // State sync hook
    engine.onStateChange = () => {
      setGameStatus(engine.status);
      setScore(engine.player.score);
      setHighScore(engine.highScore);
      setWave(engine.wave);
      setPlayerState({ ...engine.player });
    };

    engine.onGameOver = (stats, finalScore) => {
      setGameOverStats(stats);
      setScore(finalScore);
      setShowGameOver(true);
      setLeaderboard(engine.loadHighScore());
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    engine.start();

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.stop();
    };
  }, [handleResize]);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!engineRef.current) return;
      const engine = engineRef.current;

      // Ensure audio context on first key press
      audio.ensureAudio();

      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        engine.keys['ArrowLeft'] = true;
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        engine.keys['ArrowRight'] = true;
      } else if (e.code === 'Space') {
        e.preventDefault();
        if (engine.status === 'MENU') {
          handleStartGame();
        } else {
          engine.firePlayerWeapon();
        }
      } else if (e.code === 'KeyB') {
        e.preventDefault();
        engine.triggerSmartBomb();
      } else if (e.code === 'KeyP') {
        e.preventDefault();
        handleTogglePause();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!engineRef.current) return;
      const engine = engineRef.current;

      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        engine.keys['ArrowLeft'] = false;
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        engine.keys['ArrowRight'] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Pointer / Touch canvas movement
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !engineRef.current) return;
    audio.ensureAudio();
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = engineRef.current.width / rect.width;
    const clientX = (e.clientX - rect.left) * scaleX;

    engineRef.current.mouseX = clientX;
    engineRef.current.isMouseDown = true;

    if (!autoFire) {
      engineRef.current.firePlayerWeapon();
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !engineRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = engineRef.current.width / rect.width;
    const clientX = (e.clientX - rect.left) * scaleX;
    engineRef.current.mouseX = clientX;
  };

  const handlePointerUp = () => {
    if (!engineRef.current) return;
    engineRef.current.isMouseDown = false;
  };

  // Actions
  const handleStartGame = () => {
    if (!engineRef.current) return;
    setShowGameOver(false);
    engineRef.current.startNewGame();
    setGameStatus('PLAYING');
  };

  const handleTogglePause = () => {
    if (!engineRef.current) return;
    if (engineRef.current.status === 'MENU' || engineRef.current.status === 'GAME_OVER') return;

    if (engineRef.current.status === 'PAUSED') {
      engineRef.current.status = 'PLAYING';
      setGameStatus('PLAYING');
    } else {
      engineRef.current.status = 'PAUSED';
      setGameStatus('PAUSED');
    }
  };

  const handleToggleAutoFire = () => {
    const next = !autoFire;
    setAutoFire(next);
    if (engineRef.current) {
      engineRef.current.autoFire = next;
    }
  };

  const handleTriggerBomb = () => {
    if (engineRef.current) {
      engineRef.current.triggerSmartBomb();
    }
  };

  const handleSaveInitials = (initials: string) => {
    if (engineRef.current) {
      const updated = engineRef.current.saveScore(initials);
      setLeaderboard(updated);
      setHighScore(engineRef.current.highScore);
    }
  };

  const handleToggleMute = () => {
    const muted = audio.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleBgm = () => {
    const enabled = audio.toggleBgm();
    setIsBgmEnabled(enabled);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#030611] text-slate-100 overflow-hidden select-none">
      {/* Top Arcade Header */}
      <ArcadeHeader
        score={score}
        highScore={highScore}
        wave={wave}
        player={playerState}
        isMuted={isMuted}
        isBgmEnabled={isBgmEnabled}
        isCrtEnabled={isCrtEnabled}
        onToggleMute={handleToggleMute}
        onToggleBgm={handleToggleBgm}
        onToggleCrt={() => setIsCrtEnabled(!isCrtEnabled)}
        onOpenManual={() => setShowManual(true)}
        onOpenLeaderboard={() => setShowLeaderboard(true)}
      />

      {/* Main Arcade Cabinet Center Area */}
      <main
        ref={containerRef}
        className="flex-1 relative flex items-center justify-center p-2 sm:p-4 overflow-hidden"
      >
        <div
          className={`relative rounded-2xl overflow-hidden border-2 shadow-2xl transition-all duration-300 ${
            isCrtEnabled
              ? 'border-cyan-800/80 shadow-[0_0_35px_rgba(6,182,212,0.25)]'
              : 'border-slate-800 shadow-[0_0_20px_rgba(0,0,0,0.8)]'
          }`}
          style={{
            maxHeight: '100%',
            maxWidth: '100%',
          }}
        >
          {/* Canvas */}
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="block cursor-crosshair touch-none"
          />

          {/* Optional CRT Scanlines and Curvature Glow Overlay */}
          {isCrtEnabled && (
            <div className="absolute inset-0 crt-scanlines crt-vignette pointer-events-none z-10" />
          )}

          {/* Title Screen Overlay */}
          {gameStatus === 'MENU' && (
            <TitleScreen
              onStartGame={handleStartGame}
              onOpenManual={() => setShowManual(true)}
              onOpenLeaderboard={() => setShowLeaderboard(true)}
              highScore={highScore}
            />
          )}

          {/* Pause Menu Overlay */}
          {gameStatus === 'PAUSED' && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-black/80 backdrop-blur-sm select-none">
              <h2 className="font-arcade text-2xl text-cyan-400 tracking-widest mb-2 animate-pulse">
                PAUSED
              </h2>
              <div className="text-xs font-mono text-slate-400 mb-6">
                일시정지됨
              </div>

              <div className="flex flex-col gap-3 w-56">
                <button
                  onClick={handleTogglePause}
                  className="w-full py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-arcade text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/60 active:scale-95 transition-all"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>게임 재개 (RESUME)</span>
                </button>

                <button
                  onClick={handleStartGame}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>처음부터 다시 (RETRY)</span>
                </button>
              </div>
            </div>
          )}

          {/* Game Over Modal */}
          {showGameOver && (
            <GameOverModal
              score={score}
              stats={gameOverStats}
              highScore={highScore}
              onRestart={handleStartGame}
              onSaveInitials={handleSaveInitials}
              onViewLeaderboard={() => setShowLeaderboard(true)}
            />
          )}

          {/* Weapon / PowerUp Status Pill at bottom right of canvas */}
          {gameStatus !== 'MENU' && (
            <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 pointer-events-none opacity-80 text-[10px] font-mono">
              {playerState.isDual && (
                <span className="px-2 py-0.5 rounded bg-cyan-950/90 text-cyan-300 border border-cyan-500 font-semibold shadow">
                  DUAL SHIP [2X]
                </span>
              )}
              {playerState.activeWeapon !== 'NORMAL' && (
                <span className="px-2 py-0.5 rounded bg-amber-950/90 text-amber-300 border border-amber-500 font-semibold shadow">
                  {playerState.activeWeapon === 'SPREAD' ? 'SPREAD LASER' : 'PLASMA BEAM'}
                </span>
              )}
              {playerState.rapidFireTimer > 0 && (
                <span className="px-2 py-0.5 rounded bg-orange-950/90 text-orange-300 border border-orange-500 font-semibold shadow">
                  RAPID FIRE
                </span>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Bottom Virtual Controls (Mobile friendly + Desktop shortcut guide) */}
      <footer className="w-full bg-slate-950/95 border-t border-cyan-950/50 backdrop-blur-md z-20">
        <ArcadeControls
          engine={engineRef.current}
          isPaused={gameStatus === 'PAUSED'}
          autoFire={autoFire}
          bombsCount={playerState.smartBombs}
          onTogglePause={handleTogglePause}
          onToggleAutoFire={handleToggleAutoFire}
          onTriggerBomb={handleTriggerBomb}
        />
      </footer>

      {/* Pilot Manual Modal */}
      {showManual && <PilotManualModal onClose={() => setShowManual(false)} />}

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <LeaderboardModal
          entries={leaderboard}
          onClose={() => setShowLeaderboard(false)}
        />
      )}
    </div>
  );
}
