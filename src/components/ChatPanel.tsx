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
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col h-full overflow-hidden shadow-xl">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
            Chat da Sala
          </span>
        </div>
        <span className="text-[11px] text-zinc-500 font-mono">
          {messages.length} mensagens
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2.5 min-h-[220px] max-h-[380px] scrollbar-thin">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentPlayerId;

          if (msg.isSystem) {
            return (
              <div
                key={msg.id}
                className="py-1 px-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800/60 text-center text-[11px] text-zinc-400 font-mono"
              >
                {msg.text}
              </div>
            );
          }

          if (msg.isBingoCall) {
            return (
              <div
                key={msg.id}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-600/20 to-amber-500/20 border border-amber-500/50 text-center text-xs font-black text-amber-200 shadow-md"
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
              <div className="flex items-center gap-1.5 mb-0.5 px-1">
                <span className="text-xs">{msg.senderAvatar || '🎲'}</span>
                <span className="text-[11px] font-bold text-zinc-400">
                  {isMe ? 'Você' : msg.senderName}
                </span>
                <span className="text-[9px] text-zinc-600 font-mono">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div
                className={`py-1.5 px-3 rounded-2xl max-w-[85%] break-words leading-relaxed ${
                  isMe
                    ? 'bg-amber-500 text-zinc-950 font-medium rounded-tr-none shadow-sm'
                    : 'bg-zinc-800 text-zinc-100 rounded-tl-none border border-zinc-700/60'
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Reaction Pill-Strip */}
      <div className="px-3 py-2 border-t border-zinc-800/80 bg-zinc-950/40 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {quickReactions.map((reaction) => (
          <button
            key={reaction}
            onClick={() => onSendMessage(reaction)}
            className="px-2.5 py-1 text-[11px] font-medium text-zinc-300 bg-zinc-800/80 hover:bg-zinc-700 hover:text-white rounded-lg transition-colors whitespace-nowrap shrink-0 border border-zinc-700/50"
          >
            {reaction}
          </button>
        ))}
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-zinc-800 bg-zinc-950 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Envie uma mensagem..."
          maxLength={140}
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2 bg-amber-400 hover:bg-amber-300 disabled:bg-zinc-800 text-zinc-950 disabled:text-zinc-600 rounded-xl transition-all shadow-sm"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
