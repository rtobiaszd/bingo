import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Sparkles } from 'lucide-react';
import { ChatMessage } from '../types/bingo';

interface ChatPanelProps {
  messages: ChatMessage[];
  currentPlayerId: string;
  onSendMessage: (text: string, reaction?: string) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  currentPlayerId,
  onSendMessage,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickReactions = ['🍀 Boa Sorte!', '👏 Parabéns!', '🎺 BINGO!', '🔥 Essa é minha!', '😱 Quase!'];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl flex flex-col h-full overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <MessageSquare className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-black text-white uppercase tracking-wider font-display">
            Chat dos Jogadores
          </span>
        </div>
        <span className="text-[10px] text-cyan-400/80 font-bold font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
          {messages.length} msgs
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5 min-h-[220px] max-h-[380px] scrollbar-thin">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentPlayerId;

          if (msg.isSystem) {
            return (
              <div
                key={msg.id}
                className="py-1 px-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-center text-[11px] text-slate-300 font-display"
              >
                {msg.text}
              </div>
            );
          }

          if (msg.isBingoCall) {
            return (
              <div
                key={msg.id}
                className="py-2.5 px-3 rounded-2xl bg-gradient-to-r from-amber-500/30 via-orange-500/30 to-amber-500/30 border border-amber-400/60 text-center text-xs font-black text-amber-200 shadow-lg shadow-amber-500/20 font-display animate-pulse"
              >
                {msg.text}
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex flex-col text-xs ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1">
                <span className="text-sm">{msg.senderAvatar || '🎲'}</span>
                <span className="text-[11px] font-bold text-slate-300 font-display">
                  {isMe ? 'Você' : msg.senderName}
                </span>
                <span className="text-[9px] text-slate-500 font-mono">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div
                className={`py-2 px-3 rounded-2xl max-w-[85%] break-words leading-relaxed text-xs font-medium shadow-md ${
                  isMe
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-tr-none'
                    : 'bg-white/[0.08] text-slate-100 rounded-tl-none border border-white/10'
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Reaction Pills */}
      <div className="px-3 py-2 border-t border-white/10 bg-black/20 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {quickReactions.map((reaction) => (
          <button
            key={reaction}
            onClick={() => onSendMessage(reaction)}
            className="px-2.5 py-1 text-[11px] font-bold text-slate-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] rounded-xl border border-white/10 transition-all whitespace-nowrap shrink-0 cursor-pointer active:scale-95 font-display"
          >
            {reaction}
          </button>
        ))}
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-white/10 bg-black/30 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Envie uma mensagem..."
          maxLength={140}
          className="flex-1 bg-white/[0.06] border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:bg-white/[0.1] transition-all"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 disabled:opacity-30 text-slate-950 font-bold rounded-2xl transition-all shadow-md shadow-cyan-500/20 cursor-pointer active:scale-95"
        >
          <Send className="w-4 h-4 stroke-[2.5]" />
        </button>
      </form>
    </div>
  );
};
