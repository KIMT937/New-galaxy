/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Volume2, VolumeX, Music, Monitor, HelpCircle, Trophy, Shield, Bomb } from 'lucide-react';
import { audio } from '../game/audio';
import { Player } from '../game/types';

interface ArcadeHeaderProps {
  score: number;
  highScore: number;
  wave: number;
  player: Player;
  isMuted: boolean;
  isBgmEnabled: boolean;
  isCrtEnabled: boolean;
  onToggleMute: () => void;
  onToggleBgm: () => void;
  onToggleCrt: () => void;
  onOpenManual: () => void;
  onOpenLeaderboard: () => void;
}

export const ArcadeHeader: React.FC<ArcadeHeaderProps> = ({
  score,
  highScore,
  wave,
  player,
  isMuted,
  isBgmEnabled,
  isCrtEnabled,
  onToggleMute,
  onToggleBgm,
  onToggleCrt,
  onOpenManual,
  onOpenLeaderboard,
}) => {
  return (
    <header className="w-full bg-slate-950/95 border-b border-cyan-900/40 px-3 py-2.5 backdrop-blur-md z-20">
      <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-arcade text-xs md:text-sm text-cyan-400 tracking-wider">
              GALAXY
            </span>
            <span className="font-tech text-xs uppercase px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              아케이드
            </span>
          </div>

          {/* Quick Info Badges */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono-num text-slate-400">
            <span>WAVE {wave}</span>
            <span className="text-slate-600">·</span>
            <span className="flex items-center gap-1 text-pink-400">
              <Bomb className="w-3.5 h-3.5" />
              {player.smartBombs}
            </span>
            {player.hasShield && (
              <>
                <span className="text-slate-600">·</span>
                <span className="flex items-center gap-1 text-cyan-400">
                  <Shield className="w-3.5 h-3.5" />
                  {player.shieldHealth}/{player.maxShieldHealth}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Scores Display */}
        <div className="flex items-center gap-6 font-arcade text-[10px] md:text-xs">
          <div className="text-center">
            <div className="text-red-500 tracking-widest text-[9px] mb-0.5">1UP</div>
            <div className="text-white font-mono-num tracking-wider">
              {score.toString().padStart(6, '0')}
            </div>
          </div>

          <div className="text-center">
            <div className="text-amber-400 tracking-widest text-[9px] mb-0.5">HIGH SCORE</div>
            <div className="text-amber-300 font-mono-num tracking-wider">
              {Math.max(highScore, score).toString().padStart(6, '0')}
            </div>
          </div>

          {/* Lives Indicator */}
          <div className="hidden md:flex items-center gap-1">
            {Array.from({ length: Math.max(0, player.lives) }).map((_, i) => (
              <svg
                key={i}
                className="w-4 h-4 text-cyan-400 fill-current"
                viewBox="0 0 24 24"
              >
                <path d="M12 2L4 18h4l4-3 4 3h4L12 2z" />
              </svg>
            ))}
          </div>
        </div>

        {/* Control Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleMute}
            title={isMuted ? '음소거 해제' : '음소거'}
            className={`p-1.5 rounded-md border transition-colors ${
              isMuted
                ? 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-300'
                : 'bg-cyan-950/60 border-cyan-800/80 text-cyan-300 hover:bg-cyan-900/60'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onToggleBgm}
            title={isBgmEnabled ? 'BGM 끄기' : 'BGM 켜기'}
            className={`p-1.5 rounded-md border transition-colors ${
              !isBgmEnabled
                ? 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-300'
                : 'bg-cyan-950/60 border-cyan-800/80 text-cyan-300 hover:bg-cyan-900/60'
            }`}
          >
            <Music className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleCrt}
            title="CRT 오락실 화면 필터"
            className={`p-1.5 rounded-md border transition-colors ${
              isCrtEnabled
                ? 'bg-amber-950/50 border-amber-700/70 text-amber-300'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenLeaderboard}
            title="명예의 전당 랭킹"
            className="p-1.5 rounded-md border border-cyan-900/60 bg-slate-900 text-amber-400 hover:bg-cyan-950/40 transition-colors"
          >
            <Trophy className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenManual}
            title="조작법 및 정보"
            className="p-1.5 rounded-md border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
