import React, { useState } from 'react';
import { X, RefreshCw, Check, Sparkles, SlidersHorizontal } from 'lucide-react';
import { CARD_THEMES, MARKER_STYLES } from '../utils/themes';
import { MarkerIcon } from './MarkerIcon';

interface CustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentThemeId: string;
  currentMarkerId: string;
  cardNumbers: number[][];
  mode: 'BINGO_75' | 'BINGO_90';
  isGameActive: boolean;
  onSaveCustomization: (themeId: string, markerId: string) => void;
  onRegenerateNumbers?: () => void;
}

export const CustomizerModal: React.FC<CustomizerModalProps> = ({
  isOpen,
  onClose,
  currentThemeId,
  currentMarkerId,
  cardNumbers,
  mode,
  isGameActive,
  onSaveCustomization,
  onRegenerateNumbers,
}) => {
  const [selectedThemeId, setSelectedThemeId] = useState(currentThemeId);
  const [selectedMarkerId, setSelectedMarkerId] = useState(currentMarkerId);

  if (!isOpen) return null;

  const activeTheme = CARD_THEMES.find((t) => t.id === selectedThemeId) || CARD_THEMES[0];
  const activeMarker = MARKER_STYLES.find((m) => m.id === selectedMarkerId) || MARKER_STYLES[0];

  const handleApply = () => {
    onSaveCustomization(selectedThemeId, selectedMarkerId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <SlidersHorizontal className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <h2 className="text-base font-black text-white font-display">Personalizar Cartela</h2>
              <p className="text-xs text-slate-400 font-display">
                Temas com efeito de vidro, marcadores iluminados e numeração
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full bg-white/[0.06] hover:bg-white/[0.12] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 scrollbar-thin">
          {/* Section: Themes */}
          <div>
            <label className="text-xs font-black text-amber-300 uppercase tracking-widest font-display block mb-3">
              1. Tema Visual & Cores
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CARD_THEMES.map((theme) => {
                const isSelected = theme.id === selectedThemeId;
                return (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedThemeId(theme.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/15 ring-2 ring-amber-400/30 shadow-lg shadow-amber-500/10'
                        : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-5 h-5 rounded-full shadow-md shrink-0 border border-white/20"
                        style={{ backgroundColor: theme.accent }}
                      />
                      <div>
                        <span className="text-xs font-bold text-white font-display block">{theme.name}</span>
                        <span className="text-[10px] text-slate-400 font-display">Vidro fosco & neon</span>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Markers */}
          <div>
            <label className="text-xs font-black text-amber-300 uppercase tracking-widest font-display block mb-3">
              2. Ficha & Marcador da Sorte
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {MARKER_STYLES.map((marker) => {
                const isSelected = marker.id === selectedMarkerId;
                return (
                  <button
                    key={marker.id}
                    onClick={() => setSelectedMarkerId(marker.id)}
                    className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/15 ring-2 ring-amber-400/30 shadow-lg shadow-amber-500/10'
                        : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.08]'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-white/10"
                      style={{ backgroundColor: marker.color + '25' }}
                    >
                      <MarkerIcon iconName={marker.iconName} color={marker.color} size={18} />
                    </div>
                    <div className="text-xs font-bold text-white font-display truncate">
                      {marker.name}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mini Live Preview */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-black text-amber-300 uppercase tracking-widest font-display">
                Prévia da Cartela
              </label>
              {!isGameActive && onRegenerateNumbers && (
                <button
                  onClick={onRegenerateNumbers}
                  className="flex items-center gap-1.5 text-xs text-amber-300 hover:text-white font-bold font-display py-1.5 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/30 transition-all cursor-pointer active:scale-95"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Gerar Novos Números</span>
                </button>
              )}
            </div>

            <div
              className={`p-4 rounded-3xl border ${activeTheme.cardBg} ${activeTheme.cardBorder} transition-all max-w-sm mx-auto shadow-xl`}
            >
              {mode === 'BINGO_75' ? (
                <div>
                  <div className="grid grid-cols-5 gap-1.5 mb-2 text-center text-xs font-black font-display text-slate-950">
                    {['B', 'I', 'N', 'G', 'O'].map((l) => (
                      <div key={l} className="py-1 rounded-lg bg-gradient-to-b from-amber-400 to-orange-500">
                        {l}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {(cardNumbers.length > 0 ? cardNumbers : [[1, 16, 31, 46, 61], [2, 17, 32, 47, 62], [3, 18, 0, 48, 63], [4, 19, 34, 49, 64], [5, 20, 35, 50, 65]]).map((row, r) =>
                      row.map((val, c) => {
                        const isFree = r === 2 && c === 2;
                        const isSampleMarked = (r === 1 && c === 1) || (r === 3 && c === 3);
                        return (
                          <div
                            key={`preview-${r}-${c}`}
                            className={`h-9 rounded-xl border flex items-center justify-center font-game font-bold text-xs select-none relative ${
                              isFree
                                ? 'bg-amber-400/30 text-amber-300 border-amber-400/40 text-[10px]'
                                : isSampleMarked
                                ? `${activeTheme.markedBg} ${activeTheme.markedText} border-white/30 shadow-md`
                                : `${activeTheme.cellBg} ${activeTheme.cellText} ${activeTheme.cellBorder}`
                            }`}
                          >
                            <span>{isFree ? '★' : val}</span>
                            {isSampleMarked && (
                              <div className="absolute top-0.5 right-0.5 pointer-events-none">
                                <MarkerIcon iconName={activeMarker.iconName} color={activeMarker.color} size={10} />
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-9 gap-1">
                  {(cardNumbers.length > 0 ? cardNumbers : [[4, 0, 22, 0, 41, 0, 63, 0, 85], [0, 15, 0, 33, 0, 52, 0, 71, 0], [8, 0, 27, 0, 48, 0, 69, 0, 89]]).map((row, r) =>
                    row.map((val, c) => (
                      <div
                        key={`preview90-${r}-${c}`}
                        className={`h-8 rounded-lg border flex items-center justify-center font-game font-bold text-xs ${
                          val === 0
                            ? 'bg-black/20 border-white/[0.04]'
                            : `${activeTheme.cellBg} ${activeTheme.cellText} ${activeTheme.cellBorder}`
                        }`}
                      >
                        {val > 0 ? val : ''}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-end gap-3 bg-white/[0.02]">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold font-display text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider font-display text-slate-950 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/25 cursor-pointer active:scale-95 border-2 border-amber-300"
          >
            APLICAR NA CARTELA
          </button>
        </div>
      </div>
    </div>
  );
};
