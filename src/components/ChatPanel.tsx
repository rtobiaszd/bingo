import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare } from 'lucide-react';
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

  const quickReactions = ['Boa sorte a todos', 'Parabéns!', 'Quase lá!', 'Essa é minha!'];

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
    <div className="bg-[#18191e] border border-zinc-800 rounded-lg flex flex-col h-full overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-3.5 py-2.5 border-b border-zinc-800 flex items-center justify-between bg-[#141518]">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
            Chat ao Vivo
          </span>
        </div>
        <span className="text-[11px] text-zinc-500 font-mono tabular-nums">
          {messages.length} msgs
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2 min-h-[200px] max-h-[360px] scrollbar-thin">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentPlayerId;

          if (msg.isSystem) {
            return (
              <div
                key={msg.id}
                className="py-1 px-2 rounded bg-zinc-900/60 border border-zinc-800/50 text-center text-[11px] text-zinc-400 font-mono"
              >
                {msg.text}
              </div>
            );
          }

          if (msg.isBingoCall) {
            return (
              <div
                key={msg.id}
                className="py-2 px-3 rounded-md bg-emerald-950/40 border border-emerald-500/40 text-center text-xs font-bold text-emerald-300"
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
              <div className="flex items-center gap-1.5 mb-0.5 px-0.5">
                <span className="text-[11px] font-medium text-zinc-400">
                  {isMe ? 'Você' : msg.senderName}
                </span>
                <span className="text-[9px] text-zinc-600 font-mono tabular-nums">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div
                className={`py-1.5 px-2.5 rounded-md max-w-[85%] break-words leading-relaxed text-xs ${
                  isMe
                    ? 'bg-zinc-800 text-zinc-100 font-normal border border-zinc-700/80'
                    : 'bg-[#202227] text-zinc-300 border border-zinc-800'
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
      <div className="px-2.5 py-1.5 border-t border-zinc-800 bg-[#141518] flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {quickReactions.map((reaction) => (
          <button
            key={reaction}
            onClick={() => onSendMessage(reaction)}
            className="px-2 py-0.5 text-[11px] text-zinc-400 hover:text-zinc-200 bg-zinc-850 hover:bg-zinc-800 rounded border border-zinc-800 transition-colors whitespace-nowrap shrink-0"
          >
            {reaction}
          </button>
        ))}
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="p-2.5 border-t border-zinc-800 bg-[#141518] flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Mensagem..."
          maxLength={140}
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-md px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 rounded-md transition-all cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
