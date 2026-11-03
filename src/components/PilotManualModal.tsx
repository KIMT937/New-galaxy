/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Shield, Bomb, Zap, Crosshair, HelpCircle, Trophy } from 'lucide-react';

interface PilotManualModalProps {
  onClose: () => void;
}

export const PilotManualModal: React.FC<PilotManualModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none">
      <div className="max-w-lg w-full max-h-[85vh] bg-slate-950 border border-cyan-800/80 rounded-2xl p-5 flex flex-col text-slate-200 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-900/60 mb-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            <h3 className="font-arcade text-sm text-cyan-300">비행 가이드 & 파일럿 매뉴얼</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto space-y-5 text-xs font-mono pr-1">
          {/* Controls section */}
          <div>
            <div className="text-cyan-400 font-bold text-xs uppercase mb-2 flex items-center gap-1.5">
              <Crosshair className="w-4 h-4 text-cyan-400" />
              <span>전투기 조작 체계</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-1.5 text-slate-300 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">키보드 이동:</span>
                <span>방향키 [← / →] 또는 [A / D]</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">무기 발사:</span>
                <span>[SPACE] 키 또는 마우스 클릭</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">EMP 스마트 폭탄:</span>
                <span>[B] 키 또는 폭탄 버튼</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">마우스 / 터치:</span>
                <span>화면 드래그로 기체 자유 조준 이동</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">일시정지:</span>
                <span>[P] 키 또는 상단 버튼</span>
              </div>
            </div>
          </div>

          {/* Power-ups List */}
          <div>
            <div className="text-cyan-400 font-bold text-xs uppercase mb-2 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>보급 캡슐 (파워업) 정보</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="bg-slate-900/80 border border-cyan-900/40 rounded-lg p-2 flex items-start gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-400 text-cyan-300 font-arcade text-[10px] flex items-center justify-center shrink-0">
                  2X
                </span>
                <div>
                  <div className="text-cyan-300 font-bold text-[11px]">듀얼 파이터 (DUAL SHIP)</div>
                  <div className="text-[10px] text-slate-400">전투기 2기 도킹! 더블 레이저로 화력 2배 증강. 피격 시 1기만 희생.</div>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-amber-900/40 rounded-lg p-2 flex items-start gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-amber-950 border border-amber-400 text-amber-300 font-arcade text-[10px] flex items-center justify-center shrink-0">
                  SP
                </span>
                <div>
                  <div className="text-amber-300 font-bold text-[11px]">스프레드 샷 (SPREAD)</div>
                  <div className="text-[10px] text-slate-400">전방 3개 각도로 동시 발사되는 확산형 에너지 레이저.</div>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-emerald-900/40 rounded-lg p-2 flex items-start gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-400 text-emerald-300 font-arcade text-[10px] flex items-center justify-center shrink-0">
                  PL
                </span>
                <div>
                  <div className="text-emerald-300 font-bold text-[11px]">플라즈마 캐논 (PLASMA)</div>
                  <div className="text-[10px] text-slate-400">적 편대를 관통하여 뒤편 적까지 궤멸시키는 일직선 관통 광선.</div>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-orange-900/40 rounded-lg p-2 flex items-start gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-orange-950 border border-orange-400 text-orange-300 font-arcade text-[10px] flex items-center justify-center shrink-0">
                  RP
                </span>
                <div>
                  <div className="text-orange-300 font-bold text-[11px]">래피드 파이어 (RAPID)</div>
                  <div className="text-[10px] text-slate-400">발사 연사 속도가 2배로 증가하여 압도적인 탄막 형성.</div>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-sky-900/40 rounded-lg p-2 flex items-start gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-sky-950 border border-sky-400 text-sky-300 font-arcade text-[10px] flex items-center justify-center shrink-0">
                  SH
                </span>
                <div>
                  <div className="text-sky-300 font-bold text-[11px]">에너지 실드 (SHIELD)</div>
                  <div className="text-[10px] text-slate-400">기체 주변에 에너지 보호막 생성 (최대 3회 피격 방어).</div>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-pink-900/40 rounded-lg p-2 flex items-start gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-pink-950 border border-pink-400 text-pink-300 font-arcade text-[10px] flex items-center justify-center shrink-0">
                  BM
                </span>
                <div>
                  <div className="text-pink-300 font-bold text-[11px]">스마트 폭탄 (EMP BOMB)</div>
                  <div className="text-[10px] text-slate-400">화면 내 모든 적 탄환 소멸 및 전역 충격파 대미지.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Scoring Tactics */}
          <div>
            <div className="text-cyan-400 font-bold text-xs uppercase mb-2 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>고득점 아케이드 공략 비결</span>
            </div>
            <ul className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-1.5 text-slate-300 text-[11px] list-disc list-inside">
              <li>
                <strong className="text-amber-300">급강하 중 격추 (2X 득점):</strong> 대형에서 대기 중인 적보다 화면 아래로 급강하 공격해올 때 격추하면 점수가 2배가 됩니다!
              </li>
              <li>
                <strong className="text-cyan-300">지휘관 우선 격추:</strong> 녹색 지휘관 외계기는 격추 시 파워업 캡슐을 높은 확률로 드롭합니다.
              </li>
              <li>
                <strong className="text-emerald-300">챌린지 보너스 스테이지:</strong> 매 3스테이지마다 적이 탄환을 쏘지 않고 곡예 비행을 합니다. 24기 전원 격추 시 <strong className="text-amber-300">10,000점 퍼펙트 보너스</strong>가 지급됩니다!
              </li>
              <li>
                <strong className="text-rose-400">거대 모함 보스 공략:</strong> 4스테이지마다 출현하는 보스는 좌우 날개 포탑을 먼저 무력화시킨 뒤 중앙 코어를 집중 타격하세요.
              </li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-cyan-900/60 mt-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-cyan-900 hover:bg-cyan-800 text-white font-mono text-xs border border-cyan-600 transition-colors"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
