/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft, ArrowRight, Zap, Bomb, Pause, Play } from 'lucide-react';
import { GalaxyGameEngine } from '../game/gameEngine';

interface ArcadeControlsProps {
  engine: GalaxyGameEngine | null;
  isPaused: boolean;
  autoFire: boolean;
  bombsCount: number;
  onTogglePause: () => void;
  onToggleAutoFire: () => void;
  onTriggerBomb: () => void;
}

export const ArcadeControls: React.FC<ArcadeControlsProps> = ({
  engine,
  isPaused,
  autoFire,
  bombsCount,
  onTogglePause,
  onToggleAutoFire,
  onTriggerBomb,
}) => {
  const handleMoveLeftStart = () => {
    if (engine) engine.keys['ArrowLeft'] = true;
  };

  const handleMoveLeftEnd = () => {
    if (engine) engine.keys['ArrowLeft'] = false;
  };

  const handleMoveRightStart = () => {
    if (engine) engine.keys['ArrowRight'] = true;
  };

  const handleMoveRightEnd = () => {
    if (engine) engine.keys['ArrowRight'] = false;
  };

  const handleFirePress = () => {
    if (engine) engine.firePlayerWeapon();
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-2 flex flex-col gap-2">
      {/* Mobile Virtual Controller Deck */}
      <div className="flex items-center justify-between gap-4 select-none touch-none">
        {/* Directional Pad */}
        <div className="flex items-center gap-2">
          <button
            onPointerDown={handleMoveLeftStart}
            onPointerUp={handleMoveLeftEnd}
            onPointerLeave={handleMoveLeftEnd}
            aria-label="좌측 이동"
            className="w-14 h-14 rounded-xl bg-slate-900/90 active:bg-cyan-600/40 border border-slate-700/80 active:border-cyan-400 text-slate-200 active:text-cyan-200 flex items-center justify-center transition-transform active:scale-95 shadow-lg"
          >
            <ArrowLeft className="w-7 h-7" />
          </button>

          <button
            onPointerDown={handleMoveRightStart}
            onPointerUp={handleMoveRightEnd}
            onPointerLeave={handleMoveRightEnd}
            aria-label="우측 이동"
            className="w-14 h-14 rounded-xl bg-slate-900/90 active:bg-cyan-600/40 border border-slate-700/80 active:border-cyan-400 text-slate-200 active:text-cyan-200 flex items-center justify-center transition-transform active:scale-95 shadow-lg"
          >
            <ArrowRight className="w-7 h-7" />
          </button>
        </div>

        {/* Center Quick Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleAutoFire}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold transition-colors ${
              autoFire
                ? 'bg-cyan-950/80 border-cyan-500/80 text-cyan-300'
                : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}
          >
            AUTO FIRE: {autoFire ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={onTogglePause}
            className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 active:bg-slate-800 transition-colors"
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
          </button>
        </div>

        {/* Action Buttons (Fire & Bomb) */}
        <div className="flex items-center gap-2">
          {/* Smart Bomb Button */}
          <button
            onClick={onTriggerBomb}
            disabled={bombsCount <= 0}
            className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center border transition-all active:scale-95 shadow-lg ${
              bombsCount > 0
                ? 'bg-pink-950/70 border-pink-500/80 text-pink-300 active:bg-pink-600/60 shadow-pink-950/50'
                : 'bg-slate-900/40 border-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            <Bomb className="w-5 h-5" />
            <span className="text-[10px] font-mono-num font-bold mt-0.5">BOMB ({bombsCount})</span>
          </button>

          {/* Fire Button */}
          <button
            onPointerDown={handleFirePress}
            className="w-14 h-14 rounded-xl bg-red-600/90 active:bg-red-500 border border-red-400 text-white flex flex-col items-center justify-center transition-all active:scale-95 shadow-lg shadow-red-950/60"
          >
            <Zap className="w-5 h-5" />
            <span className="text-[9px] font-arcade mt-0.5">FIRE</span>
          </button>
        </div>
      </div>

      {/* Keyboard Shortcut Hints for Desktop */}
      <div className="hidden sm:flex items-center justify-center gap-4 text-[11px] font-mono text-slate-400 py-1">
        <span>[← / → / A, D] 이동</span>
        <span className="text-slate-700">·</span>
        <span>[SPACE / 클릭] 발사</span>
        <span className="text-slate-700">·</span>
        <span>[B] EMP 폭탄</span>
        <span className="text-slate-700">·</span>
        <span>[P] 일시정지</span>
        <span className="text-slate-700">·</span>
        <span>[터치/마우스] 드래그 이동</span>
      </div>
    </div>
  );
};
