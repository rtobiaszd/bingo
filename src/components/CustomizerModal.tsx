import React, { useState } from 'react';
import { X, RefreshCw, Check, Sparkles, SlidersHorizontal } from 'lucide-react';
import { CARD_THEMES, MARKER_STYLES } from '../utils/themes';
import { MarkerIcon } from './MarkerIcon';
import { CardTheme, MarkerStyle } from '../types/bingo';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Personalização da Cartela</h2>
              <p className="text-xs text-zinc-400">
                Ajuste temas visuais, marcadores e números em tempo real
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Section: Themes */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block mb-3">
              1. Tema Visual da Cartela
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CARD_THEMES.map((theme) => {
                const isSelected = theme.id === selectedThemeId;
                return (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedThemeId(theme.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between h-24 ${
                      isSelected
                        ? 'border-amber-400 ring-2 ring-amber-400/20 bg-zinc-800/90 shadow-md'
                        : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 hover:bg-zinc-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-100">{theme.name}</span>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    {/* Visual miniature stripe */}
                    <div className="w-full h-3 rounded flex overflow-hidden border border-zinc-700/50">
                      <div className="w-1/3 h-full" style={{ backgroundColor: theme.accent }} />
                      <div className="w-2/3 h-full bg-zinc-900" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Markers */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block mb-3">
              2. Estilo do Marcador de Pedras
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {MARKER_STYLES.map((marker) => {
                const isSelected = marker.id === selectedMarkerId;
                return (
                  <button
                    key={marker.id}
                    onClick={() => setSelectedMarkerId(marker.id)}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                      isSelected
                        ? 'border-amber-400 ring-2 ring-amber-400/20 bg-zinc-800 shadow-md'
                        : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 hover:bg-zinc-800/40'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center shrink-0">
                      <MarkerIcon iconName={marker.iconName} color={marker.color} size={22} />
                    </div>
                    <div className="text-left overflow-hidden">
                      <div className="text-xs font-bold text-zinc-200 truncate">{marker.name}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Mini Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Prévia da Cartela ({mode === 'BINGO_75' ? '75 Bolas' : '90 Bolas'})
              </label>
              {!isGameActive && onRegenerateNumbers && (
                <button
                  onClick={onRegenerateNumbers}
                  className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium py-1 px-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Gerar Novos Números</span>
                </button>
              )}
            </div>

            {/* Mini preview card */}
            <div
              className={`p-3 rounded-xl border ${activeTheme.cardBg} ${activeTheme.cardBorder} transition-all max-w-sm mx-auto shadow-lg`}
            >
              {mode === 'BINGO_75' ? (
                <>
                  <div className="grid grid-cols-5 gap-1 mb-1 text-center text-xs font-extrabold text-amber-400">
                    <div>B</div>
                    <div>I</div>
                    <div>N</div>
                    <div>G</div>
                    <div>O</div>
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    {cardNumbers.slice(0, 3).map((row, r) =>
                      row.map((val, c) => {
                        const isSimulatedMarked = (r === 0 && c === 1) || (r === 1 && c === 2) || (r === 2 && c === 2);
                        return (
                          <div
                            key={`${r}-${c}`}
                            className={`h-9 rounded flex items-center justify-center text-xs font-bold border relative ${
                              isSimulatedMarked
                                ? `${activeTheme.markedBg} ${activeTheme.markedText} border-amber-500/50`
                                : `${activeTheme.cellBg} ${activeTheme.cellText} ${activeTheme.cellBorder}`
                            }`}
                          >
                            {val === 0 ? 'FREE' : val}
                            {isSimulatedMarked && (
                              <div className="absolute inset-0 flex items-center justify-center opacity-85">
                                <MarkerIcon
                                  iconName={activeMarker.iconName}
                                  color={activeMarker.color}
                                  size={18}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-9 gap-1">
                  {cardNumbers.slice(0, 2).map((row, r) =>
                    row.map((val, c) => (
                      <div
                        key={`${r}-${c}`}
                        className={`h-8 rounded flex items-center justify-center text-[11px] font-bold border ${
                          val > 0
                            ? `${activeTheme.cellBg} ${activeTheme.cellText} ${activeTheme.cellBorder}`
                            : 'bg-zinc-900/30 border-transparent opacity-30'
                        }`}
                      >
                        {val > 0 ? val : ''}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            {isGameActive && (
              <p className="text-[11px] text-zinc-500 text-center mt-2">
                Os números não podem ser alterados com a partida em andamento, apenas as cores e marcadores.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleApply}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-zinc-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-lg shadow-sm shadow-amber-500/20 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Salvar Estilo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
