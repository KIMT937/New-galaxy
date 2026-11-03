/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Trophy, Medal, Award } from 'lucide-react';
import { HighScoreEntry } from '../game/types';

interface LeaderboardModalProps {
  entries: HighScoreEntry[];
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ entries, onClose }) => {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none">
      <div className="max-w-md w-full bg-slate-950 border border-amber-900/60 rounded-2xl p-5 flex flex-col text-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-900/50 mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="font-arcade text-sm text-amber-300">명예의 전당 (HALL OF FAME)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scores Table */}
        <div className="space-y-1.5 font-mono text-xs mb-4">
          <div className="grid grid-cols-12 text-slate-400 font-bold px-3 py-1.5 border-b border-slate-800 text-[11px]">
            <span className="col-span-2">순위</span>
            <span className="col-span-3">파일럿</span>
            <span className="col-span-4 text-right">스코어</span>
            <span className="col-span-3 text-right">도달</span>
          </div>

          <div className="max-h-72 overflow-y-auto space-y-1 pr-1">
            {entries.map((entry, index) => {
              const isTop3 = index < 3;
              const rankColor =
                index === 0
                  ? 'text-amber-400'
                  : index === 1
                  ? 'text-slate-300'
                  : index === 2
                  ? 'text-amber-600'
                  : 'text-slate-500';

              return (
                <div
                  key={index}
                  className={`grid grid-cols-12 items-center px-3 py-2 rounded-lg ${
                    index === 0
                      ? 'bg-amber-950/40 border border-amber-600/40 text-amber-200'
                      : index % 2 === 0
                      ? 'bg-slate-900/70 text-slate-300'
                      : 'bg-slate-900/30 text-slate-300'
                  }`}
                >
                  <span className={`col-span-2 font-arcade text-[10px] flex items-center gap-1 ${rankColor}`}>
                    {index === 0 ? (
                      <Medal className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    ) : index === 1 ? (
                      <Award className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    ) : (
                      <span>{entry.rank || index + 1}</span>
                    )}
                  </span>
                  <span className="col-span-3 font-arcade text-[11px] text-cyan-300">
                    {entry.name}
                  </span>
                  <span className="col-span-4 font-mono-num font-bold text-right text-white">
                    {entry.score.toLocaleString()}
                  </span>
                  <span className="col-span-3 text-right text-[10px] text-slate-400">
                    ST.{entry.wave}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
