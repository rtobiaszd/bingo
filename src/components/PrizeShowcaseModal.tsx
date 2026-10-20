import React, { useState, useEffect } from 'react';
import {
  Gift,
  Trophy,
  Sparkles,
  X,
  ExternalLink,
  Tag,
  CheckCircle2,
  Tv,
  Smartphone,
  Coffee,
  Volume2,
  Award,
} from 'lucide-react';
import { PrizeItem } from '../types/bingo';
import { DEFAULT_PRIZES } from '../utils/prizes';
import { firestoreService } from '../services/firestoreService';

interface PrizeShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPrizeId?: string;
  onSelectPrizeForRoom?: (prize: PrizeItem) => void;
  isHostOrAdmin?: boolean;
}

export const PrizeShowcaseModal: React.FC<PrizeShowcaseModalProps> = ({
  isOpen,
  onClose,
  selectedPrizeId,
  onSelectPrizeForRoom,
  isHostOrAdmin = false,
}) => {
  const [prizes, setPrizes] = useState<PrizeItem[]>(DEFAULT_PRIZES);
  const [activePrize, setActivePrize] = useState<PrizeItem>(DEFAULT_PRIZES[0]);

  useEffect(() => {
    if (!isOpen) return;
    const unsubscribe = firestoreService.subscribeToPrizes((list) => {
      if (list && list.length > 0) {
        setPrizes(list);
        if (selectedPrizeId) {
          const match = list.find((p) => p.id === selectedPrizeId);
          if (match) setActivePrize(match);
        } else {
          setActivePrize(list[0]);
        }
      }
    });
    return () => unsubscribe();
  }, [isOpen, selectedPrizeId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-slate-900 via-slate-900/95 to-[#0b1022] border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Glow Top Bar */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white font-display tracking-tight flex items-center gap-2">
                <span>Galeria de Prêmios do Bingo</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Ao Vivo
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Confira as fotos e detalhes dos prêmios reais em disputa na mesa
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Split View (Featured Prize on Left / Grid on Right) */}
        <div className="p-5 sm:p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-6 flex-1">
          {/* Left Column: Featured Highlight (7 Cols) */}
          <div className="md:col-span-7 flex flex-col bg-slate-950/60 rounded-3xl border border-white/10 overflow-hidden shadow-xl">
            {/* Prize Image Showcase */}
            <div className="relative aspect-video sm:aspect-[16/10] w-full bg-slate-950 overflow-hidden group">
              <img
                src={activePrize.imageUrl}
                alt={activePrize.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/20" />

              {/* Badge Overlay */}
              <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md">
                  {activePrize.badge || '🏆 PRÊMIO'}
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md text-slate-200 text-xs font-mono border border-white/10">
                  {activePrize.category}
                </span>
              </div>

              {activePrize.estimatedValue && (
                <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-amber-500/40 text-amber-300 font-mono font-bold text-xs shadow-lg">
                  Valor Estimado: <span className="text-white">{activePrize.estimatedValue}</span>
                </div>
              )}
            </div>

            {/* Prize Info */}
            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white font-display">
                  {activePrize.title}
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {activePrize.description}
                </p>
              </div>

              {isHostOrAdmin && onSelectPrizeForRoom && (
                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Deseja vincular à sua sala?</span>
                  <button
                    onClick={() => {
                      onSelectPrizeForRoom(activePrize);
                      onClose();
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-1.5 transition-all active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Definir como Prêmio da Sala</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Prize Thumbnails / Catalog (5 Cols) */}
          <div className="md:col-span-5 flex flex-col space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Todos os Prêmios Disponíveis ({prizes.length})</span>
            </h4>

            <div className="space-y-2.5 overflow-y-auto max-h-[460px] pr-1">
              {prizes.map((p) => {
                const isSelected = activePrize.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setActivePrize(p)}
                    className={`w-full p-2.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-400/60 shadow-lg shadow-amber-500/10'
                        : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10'
                    }`}
                  >
                    <img
                      src={p.imageUrl}
                      alt={p.title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-white/10"
                    />
                    <div className="overflow-hidden flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-md bg-white/10 text-slate-300">
                          {p.category}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-white truncate mt-1">{p.title}</p>
                      {p.estimatedValue && (
                        <p className="text-[11px] text-amber-300 font-mono font-bold">
                          {p.estimatedValue}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
