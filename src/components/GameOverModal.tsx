/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RotateCcw, Trophy, Target, Award, Zap } from 'lucide-react';
import { GameStats } from '../game/types';

interface GameOverModalProps {
  score: number;
  stats: GameStats;
  highScore: number;
  onRestart: () => void;
  onSaveInitials: (initials: string) => void;
  onViewLeaderboard: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  stats,
  highScore,
  onRestart,
  onSaveInitials,
  onViewLeaderboard,
}) => {
  const [initials, setInitials] = useState('ACE');
  const [saved, setSaved] = useState(false);

  const accuracy = stats.shotsFired > 0
    ? Math.round((stats.shotsHit / stats.shotsFired) * 100)
    : 0;

  const isNewHighScore = score >= highScore && score > 0;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saved && initials.trim()) {
      onSaveInitials(initials.trim().toUpperCase());
      setSaved(true);
    }
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none">
      <div className="max-w-md w-full bg-slate-950 border border-red-900/60 rounded-2xl p-6 text-center shadow-2xl shadow-red-950/50">
        {/* Game Over Title */}
        <h2 className="font-arcade text-2xl sm:text-3xl text-red-500 tracking-widest mb-1 animate-pulse">
          GAME OVER
        </h2>
        <div className="text-xs font-mono text-slate-400 mb-5">
          우주 전투기 파괴됨 · 작전 종료
        </div>

        {/* High Score Banner if applicable */}
        {isNewHighScore && (
          <div className="flex items-center justify-center gap-2 py-1.5 px-3 mb-4 rounded-lg bg-amber-950/80 border border-amber-500 text-amber-300 font-arcade text-xs">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>NEW HIGH RECORD! 신기록 달성</span>
          </div>
        )}

        {/* Final Score */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 mb-5">
          <div className="text-[10px] font-arcade text-slate-400 mb-1">FINAL SCORE</div>
          <div className="text-3xl sm:text-4xl font-mono-num font-bold text-white tracking-wider">
            {score.toLocaleString()}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 text-left mb-5">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Target className="w-3.5 h-3.5 text-cyan-400" />
              <span>탄환 명중률</span>
            </div>
            <div className="text-lg font-mono-num font-semibold text-cyan-300">
              {accuracy}%
            </div>
            <div className="text-[10px] text-slate-500">
              {stats.shotsHit} / {stats.shotsFired} 명중
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>최종 도달</span>
            </div>
            <div className="text-lg font-mono-num font-semibold text-amber-300">
              STAGE {stats.wave}
            </div>
            <div className="text-[10px] text-slate-500">
              적 격추 {stats.enemiesDefeated}기
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Zap className="w-3.5 h-3.5 text-pink-400" />
              <span>최대 콤보</span>
            </div>
            <div className="text-lg font-mono-num font-semibold text-pink-300">
              {stats.maxCombo} 연타
            </div>
            <div className="text-[10px] text-slate-500">
              보스 격퇴 {stats.bossesDefeated}척
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Trophy className="w-3.5 h-3.5 text-emerald-400" />
              <span>파워업 획득</span>
            </div>
            <div className="text-lg font-mono-num font-semibold text-emerald-300">
              {stats.powerUpsCollected}개
            </div>
            <div className="text-[10px] text-slate-500">
              특수 무장 수집
            </div>
          </div>
        </div>

        {/* Initials Registry for Arcade High Score */}
        <form onSubmit={handleSave} className="mb-5 bg-slate-900/80 border border-cyan-950 p-3 rounded-xl flex items-center justify-between gap-3">
          <div className="text-left text-xs font-mono">
            <div className="text-cyan-300 font-semibold">아케이드 랭킹 등록</div>
            <div className="text-slate-500 text-[10px]">3자리 이니셜 입력</div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              maxLength={3}
              value={initials}
              onChange={(e) => setInitials(e.target.value.toUpperCase())}
              disabled={saved}
              className="w-16 h-9 text-center uppercase font-arcade text-sm bg-black border border-cyan-700 text-cyan-300 rounded focus:outline-none focus:border-cyan-400 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={saved}
              className="px-3 py-2 bg-cyan-900/80 hover:bg-cyan-800 text-cyan-200 text-xs font-mono rounded border border-cyan-700 disabled:opacity-50 transition-colors"
            >
              {saved ? '등록됨' : '저장'}
            </button>
          </div>
        </form>

        {/* Bottom Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onRestart}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-arcade text-xs sm:text-sm rounded-xl border border-red-400/50 flex items-center justify-center gap-2 shadow-lg shadow-red-950/60 active:scale-95 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>다시 도전 (RETRY)</span>
          </button>

          <button
            onClick={onViewLeaderboard}
            className="py-3 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 font-mono text-xs rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Trophy className="w-4 h-4" />
            <span>랭킹</span>
          </button>
        </div>
      </div>
    </div>
  );
};
