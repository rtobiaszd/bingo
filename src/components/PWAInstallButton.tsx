import React, { useState } from 'react';
import { Download, Smartphone, X, Sparkles, Check, Share2, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'button' | 'banner';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'button',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already installed and running standalone, do not show button
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok) {
        setInstallSuccess(true);
        setTimeout(() => setInstallSuccess(false), 4000);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // Ambient fallback instructions
      setShowIOSGuide(true);
    }
  };

  // Header compact pill variant
  if (variant === 'header') {
    return (
      <>
        <button
          onClick={handleInstallClick}
          title="Instalar App no Celular ou Computador"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-black font-display uppercase tracking-wider transition-all shadow-md shadow-emerald-500/10 cursor-pointer active:scale-95 ${className}`}
        >
          {installSuccess ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Instalado!</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Instalar App</span>
              <span className="sm:hidden">App</span>
            </>
          )}
        </button>

        {showIOSGuide && (
          <IOSInstallModal onClose={() => setShowIOSGuide(false)} />
        )}
      </>
    );
  }

  // Banner variant for Lobby
  if (variant === 'banner') {
    return (
      <>
        <div
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900/90 to-teal-950/70 border border-emerald-500/30 p-4 shadow-xl backdrop-blur-xl ${className}`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/30 shrink-0">
                <Smartphone className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-white font-display">Instalar Bingo Real-Time Club</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                    PWA App
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-display mt-0.5">
                  Jogue em tela cheia com resposta ultrarrápida, sem barra de navegação e offline!
                </p>
              </div>
            </div>

            <button
              onClick={handleInstallClick}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 text-xs font-black uppercase font-display tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer active:scale-95 shrink-0"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Instalar Agora</span>
            </button>
          </div>
        </div>

        {showIOSGuide && (
          <IOSInstallModal onClose={() => setShowIOSGuide(false)} />
        )}
      </>
    );
  }

  // Standard Button variant
  return (
    <>
      <button
        onClick={handleInstallClick}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 text-xs font-black uppercase font-display tracking-wider transition-all shadow-lg shadow-emerald-500/20 cursor-pointer active:scale-95 ${className}`}
      >
        <Smartphone className="w-4 h-4" />
        <span>Instalar Aplicativo (PWA)</span>
      </button>

      {showIOSGuide && (
        <IOSInstallModal onClose={() => setShowIOSGuide(false)} />
      )}
    </>
  );
};

// Safari / Generic Install Instruction Modal
function IOSInstallModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-white/15 p-6 shadow-2xl relative text-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center font-black">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white font-display">Instalar no seu Dispositivo</h3>
            <p className="text-[11px] text-amber-300 font-display">Passo a passo rápido</p>
          </div>
        </div>

        <div className="space-y-3 text-xs leading-relaxed text-slate-300 font-display bg-black/40 p-3.5 rounded-2xl border border-white/5">
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              1
            </div>
            <div>
              <p className="font-semibold text-white">No iPhone/iPad (Safari):</p>
              <p className="text-slate-400 text-[11px] mt-0.5 flex items-center gap-1.5">
                Toque no botão <Share2 className="w-3.5 h-3.5 text-cyan-400 inline" /> <strong>Compartilhar</strong> na barra do Safari.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              2
            </div>
            <div>
              <p className="font-semibold text-white">Adicionar à Tela:</p>
              <p className="text-slate-400 text-[11px] mt-0.5 flex items-center gap-1.5">
                Role para baixo e selecione <PlusSquare className="w-3.5 h-3.5 text-amber-400 inline" /> <strong>Adicionar à Tela de Início</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              3
            </div>
            <div>
              <p className="font-semibold text-white">No Chrome / Android / PC:</p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Clique nos 3 pontinhos do navegador ou no ícone de instalar na barra de endereços.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-xs uppercase font-display tracking-wider hover:from-amber-300 hover:to-orange-400 transition-all cursor-pointer shadow-lg"
        >
          Entendido, Vamos Jogar!
        </button>
      </div>
    </div>
  );
}
