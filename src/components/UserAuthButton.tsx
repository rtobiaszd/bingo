import React, { useState } from 'react';
import { LogIn, LogOut, Crown, ShieldCheck, User as UserIcon, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface UserAuthButtonProps {
  onOpenAdminDashboard: () => void;
}

export const UserAuthButton: React.FC<UserAuthButtonProps> = ({ onOpenAdminDashboard }) => {
  const { user, isMasterAdmin, signInWithGoogle, signOut, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-slate-800 animate-pulse border border-slate-700" />
    );
  }

  if (!user) {
    return (
      <button
        onClick={signInWithGoogle}
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-black transition-all transform active:scale-95 shadow-md shadow-white/10 shrink-0 cursor-pointer"
        title="Entrar com conta Google para salvar perfil e acessar recursos"
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#EA4335"
            d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
          />
          <path
            fill="#4285F4"
            d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
          />
          <path
            fill="#FBBC05"
            d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12.5s.7 2.8 1.9 5.2l3.7-2.9z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 17C3.7 20.7 7.5 24 12 24z"
          />
        </svg>
        <span className="font-display font-bold">Entrar com Google</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-1.5">
        {/* If Master Admin, highlight Master Button directly in header! */}
        {isMasterAdmin && (
          <button
            onClick={onOpenAdminDashboard}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs shadow-md shadow-amber-500/30 animate-pulse transition-all"
            title="Abrir Painel Master Admin"
          >
            <Crown className="w-3.5 h-3.5 fill-slate-950" />
            <span className="hidden md:inline">PAINEL MASTER</span>
          </button>
        )}

        {/* User profile toggle button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs transition-colors"
        >
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'Usuário'}
              className="w-6 h-6 rounded-full object-cover ring-1 ring-amber-400/50"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs">
              {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
            </div>
          )}
          <span className="hidden sm:inline font-medium text-slate-200 max-w-[100px] truncate">
            {user.displayName || 'Jogador'}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      {/* Dropdown Menu */}
      {menuOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-3 z-50 animate-fade-in text-slate-200">
          <div className="flex items-center gap-3 pb-3 mb-2 border-b border-slate-800">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'Perfil'}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-500/40"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
                <UserIcon className="w-5 h-5" />
              </div>
            )}
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{user.displayName || 'Jogador'}</p>
              <p className="text-xs text-slate-400 truncate font-mono">{user.email}</p>
            </div>
          </div>

          {isMasterAdmin && (
            <button
              onClick={() => {
                setMenuOpen(false);
                onOpenAdminDashboard();
              }}
              className="w-full mb-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/10 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all text-left"
            >
              <Crown className="w-4 h-4 text-amber-400" />
              <div>
                <p className="leading-tight">Painel Master Admin</p>
                <p className="text-[10px] text-amber-400/80 font-normal">Ver todas as cartelas ao vivo</p>
              </div>
            </button>
          )}

          <div className="text-[11px] text-slate-400 px-1 py-1 mb-2">
            Status: <span className="text-emerald-400 font-semibold">Online no Firebase</span>
          </div>

          <button
            onClick={() => {
              setMenuOpen(false);
              signOut();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 text-xs font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair da Conta Google
          </button>
        </div>
      )}
    </div>
  );
};
