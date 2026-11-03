/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, Trophy, HelpCircle, Shield, Sparkles } from 'lucide-react';

interface TitleScreenProps {
  onStartGame: () => void;
  onOpenManual: () => void;
  onOpenLeaderboard: () => void;
  highScore: number;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenManual,
  onOpenLeaderboard,
  highScore,
}) => {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-between p-6 bg-slate-950/80 backdrop-blur-sm text-center select-none overflow-y-auto">
      {/* Top Banner */}
      <div className="pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 text-xs font-mono mb-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>CLASSIC SPACE ARCADE 1981 REBORN</span>
        </div>
      </div>

      {/* Main Title Hero */}
      <div className="flex flex-col items-center my-auto py-4">
        <h1 className="font-arcade text-3xl sm:text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-amber-400 to-red-500 drop-shadow-[0_4px_12px_rgba(234,179,8,0.5)] tracking-wider mb-2">
          GALAXY
        </h1>
        <div className="font-arcade text-lg sm:text-2xl text-cyan-400 tracking-widest mb-6">
          ARCADE · 갤럭시
        </div>

        {/* High Score Callout */}
        <div className="font-arcade text-xs text-amber-300 mb-6 flex items-center gap-2">
          <span>HIGH SCORE:</span>
          <span className="font-mono-num text-white text-sm">
            {highScore.toString().padStart(6, '0')}
          </span>
        </div>

        {/* Start Button */}
        <button
          onClick={onStartGame}
          className="group relative px-8 py-4 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-arcade text-sm sm:text-base rounded-xl shadow-xl shadow-red-950/80 border border-amber-300/40 active:scale-95 transition-all mb-4"
        >
          <div className="flex items-center gap-3">
            <Play className="w-5 h-5 fill-current" />
            <span>GAME START · 출격</span>
          </div>
        </button>

        {/* Blinking Coin Prompt */}
        <div className="text-[11px] font-mono text-cyan-300/80 animate-pulse mb-6">
          ▶ [SPACE] 키 또는 버튼을 눌러 출격하세요
        </div>

        {/* Enemy Point Table */}
        <div className="bg-slate-900/90 border border-cyan-900/60 rounded-xl p-4 max-w-md w-full text-left text-xs font-mono">
          <div className="text-cyan-400 font-bold mb-2 pb-1 border-b border-cyan-900/60 flex justify-between">
            <span>외계 함대 정보</span>
            <span>대형 / 급강하시</span>
          </div>

          <div className="space-y-1.5 text-slate-300 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span>
                지휘관 외계기 (COMMANDER)
              </span>
              <span className="text-amber-400 font-mono-num font-bold">300 / 600 PTS</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
                붉은 호넷기 (BUTTERFLY)
              </span>
              <span className="text-amber-400 font-mono-num font-bold">160 / 320 PTS</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span>
                정찰 드론기 (DRONE)
              </span>
              <span className="text-amber-400 font-mono-num font-bold">100 / 200 PTS</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></span>
                침투 엘리트 (INFILTRATOR)
              </span>
              <span className="text-amber-400 font-mono-num font-bold">400 / 800 PTS</span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-800">
              <span className="flex items-center gap-2 text-rose-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block animate-ping"></span>
                거대 모함 보스 (STAGE 4, 8)
              </span>
              <span className="text-rose-400 font-mono-num font-bold">5,000 PTS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sub-Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={onOpenLeaderboard}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-amber-300 hover:bg-slate-800 transition-colors"
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>명예의 전당</span>
        </button>

        <button
          onClick={onOpenManual}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:bg-slate-800 transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          <span>조작 & 파워업 가이드</span>
        </button>
      </div>
    </div>
  );
};
