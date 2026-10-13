import React, { useState } from 'react';
import { X, RefreshCw, Check, SlidersHorizontal } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#18191e] border border-zinc-800 rounded-lg w-full max-w-2xl overflow-hidden shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-zinc-800 text-zinc-300 rounded-md">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">Personalizar Visual da Cartela</h2>
              <p className="text-xs text-zinc-400">
                Ajuste temas cromáticos e estilos de marcação
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Section: Themes */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2.5">
              1. Paleta de Cores
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {CARD_THEMES.map((theme) => {
                const isSelected = theme.id === selectedThemeId;
                return (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedThemeId(theme.id)}
                    className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between h-20 ${
                      isSelected
                        ? 'border-emerald-500 bg-[#202227] ring-1 ring-emerald-500/30'
                        : 'border-zinc-800 bg-[#141518] hover:border-zinc-700 hover:bg-[#1a1c21]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-200">{theme.name}</span>
                      {isSelected && (
                        <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    {/* Clean minimal color dot */}
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-3 h-3 rounded-full border border-black/20"
                        style={{ backgroundColor: theme.accent }}
                      />
                      <span className="text-[11px] text-zinc-400 font-mono">
                        {theme.id.includes('claro') ? 'Modo Claro' : 'Modo Escuro'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Markers */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2.5">
              2. Estilo do Marcador
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {MARKER_STYLES.map((marker) => {
                const isSelected = marker.id === selectedMarkerId;
                return (
                  <button
                    key={marker.id}
                    onClick={() => setSelectedMarkerId(marker.id)}
                    className={`p-2.5 rounded-lg border flex items-center gap-2.5 transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-[#202227] ring-1 ring-emerald-500/30'
                        : 'border-zinc-800 bg-[#141518] hover:border-zinc-700 hover:bg-[#1a1c21]'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 text-emerald-400">
                      <MarkerIcon iconName={marker.iconName} size={14} />
                    </div>
                    <div className="text-xs font-medium text-zinc-200 truncate">
                      {marker.name}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mini Live Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Prévia da Cartela
              </label>
              {!isGameActive && onRegenerateNumbers && (
                <button
                  onClick={onRegenerateNumbers}
                  className="flex items-center gap-1 text-xs text-zinc-300 hover:text-white font-medium py-1 px-2.5 rounded-md bg-zinc-800 hover:bg-zinc-700 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Novos Números</span>
                </button>
              )}
            </div>

            <div
              className={`p-3 rounded-lg border ${activeTheme.cardBg} ${activeTheme.cardBorder} transition-all max-w-sm mx-auto shadow-sm`}
            >
              {mode === 'BINGO_75' ? (
                <>
                  <div className="grid grid-cols-5 gap-1.5 mb-1.5 text-center text-xs font-bold text-zinc-400">
                    <div>B</div>
                    <div>I</div>
                    <div>N</div>
                    <div>G</div>
                    <div>O</div>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {cardNumbers.slice(0, 3).map((row, r) =>
                      row.map((val, c) => {
                        const isSimulatedMarked = (r === 0 && c === 1) || (r === 1 && c === 2);
                        return (
                          <div
                            key={`${r}-${c}`}
                            className={`h-9 rounded-md flex items-center justify-center text-xs font-bold border relative ${
                              isSimulatedMarked
                                ? `${activeTheme.markedBg} ${activeTheme.markedText} border-transparent`
                                : `${activeTheme.cellBg} ${activeTheme.cellText} ${activeTheme.cellBorder}`
                            }`}
                          >
                            {val === 0 ? 'FREE' : val}
                            {isSimulatedMarked && activeMarker.iconName !== 'fill' && (
                              <div className="absolute top-0.5 right-0.5">
                                <MarkerIcon iconName={activeMarker.iconName} size={10} />
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
                        className={`h-8 rounded-md flex items-center justify-center text-[11px] font-bold border ${
                          val > 0
                            ? `${activeTheme.cellBg} ${activeTheme.cellText} ${activeTheme.cellBorder}`
                            : 'bg-zinc-900/30 border-transparent opacity-20'
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

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-zinc-800 bg-[#141518] flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 text-xs font-semibold text-zinc-950 bg-emerald-500 hover:bg-emerald-400 rounded-md transition-colors shadow-sm"
          >
            Salvar Preferências
          </button>
        </div>
      </div>
    </div>
  );
};
