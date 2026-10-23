import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Sparkles, MessageCircle, ArrowRight, User } from 'lucide-react';
import { api } from '../services/api';

interface Message {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  whatsappUrl?: string;
  timestamp: string;
}

export const VirtualAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnreadNotice, setHasUnreadNotice] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: 'Olá! Sou a Assistente Virtual de Nathalia Robadey. Estou aqui para ajudar você a encontrar imóveis exclusivos, agendar visitas ou esclarecer dúvidas sobre compra e venda de alto padrão.',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setHasUnreadNotice(false);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputValue.trim();
    if (!textToSend || loading) return;

    const userMsg: Message = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputValue('');
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const res = await api.chatAssistant(textToSend, history);

      const assistantMsg: Message = {
        id: 'msg-res-' + Date.now(),
        sender: 'assistant',
        text: res.reply,
        whatsappUrl: res.whatsappUrl,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          sender: 'assistant',
          text: 'Desculpe, tive uma instabilidade momentânea. Por favor, fale diretamente com Nathalia Robadey pelo WhatsApp +55 22 99931-5940.',
          whatsappUrl: 'https://wa.me/5522999315940',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'Quero Comprar um Imóvel',
    'Desejo Avaliar e Vender meu Imóvel',
    'Conhecer Empreendimentos e Lançamentos',
    'Falar com Nathalia no WhatsApp'
  ];

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end">
      {/* Small Notification Bubble on Initial Load */}
      {!isOpen && hasUnreadNotice && (
        <div
          onClick={() => setIsOpen(true)}
          className="mb-2 bg-[#0B192C] text-white border border-[#C5A059]/40 text-xs px-3.5 py-2 rounded-lg shadow-xl cursor-pointer flex items-center space-x-2 animate-bounce max-w-[240px]"
        >
          <Sparkles className="w-4 h-4 text-[#E5C989] flex-shrink-0" />
          <span className="truncate">Posso ajudar a encontrar seu imóvel?</span>
        </div>
      )}

      {/* Floating Trigger Button with Human Avatar Photo */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center space-x-2 bg-[#0B192C] text-white p-2 sm:px-4 sm:py-2.5 rounded-full shadow-2xl border-2 border-[#C5A059] hover:border-[#E5C989] transition-all duration-300 hover:scale-105 cursor-pointer"
          aria-label="Abrir assistente virtual"
        >
          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#C5A059] bg-slate-800 flex-shrink-0">
            <img
              src="/nathalia-robadey-portrait.jpg"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "https://i.postimg.cc/P5jCDLtx/Whats-App-Image-2026-10-23-at-13-15-02.jpg";
              }}
              alt="Assistente Virtual Nathalia Robadey"
              className="w-full h-full object-cover object-top"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0B192C]" />
          </div>
          <div className="hidden sm:flex flex-col text-left pr-1">
            <span className="text-[10px] text-[#C5A059] uppercase font-bold tracking-wider">Assistente Virtual</span>
            <span className="text-xs font-semibold text-white group-hover:text-[#E5C989]">Atendimento Online</span>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[380px] h-[520px] max-h-[85vh] bg-[#FAF9F5] border border-[#C5A059]/40 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* Header */}
          <div className="bg-[#0B192C] p-4 text-white flex items-center justify-between border-b border-[#C5A059]/30">
            <div className="flex items-center space-x-3">
              <div className="relative w-9 h-9 rounded-full overflow-hidden border border-[#C5A059]">
                <img
                  src="/nathalia-robadey-portrait.jpg"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "https://i.postimg.cc/P5jCDLtx/Whats-App-Image-2026-10-23-at-13-15-02.jpg";
                  }}
                  alt="Assistente Virtual"
                  className="w-full h-full object-cover object-top"
                />
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border border-white" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white tracking-wide flex items-center space-x-1.5">
                  <span>Assistente Nathalia Robadey</span>
                  <span className="bg-[#C5A059]/20 text-[#E5C989] text-[9px] px-1.5 py-0.2 rounded font-mono uppercase">IA</span>
                </h4>
                <p className="text-[10px] text-slate-300">Consultoria Imobiliária de Alto Padrão</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
              aria-label="Fechar assistente"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
            <div className="text-center my-1">
              <span className="text-[10px] bg-slate-200/80 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                Atendimento Inteligente e Conectado
              </span>
            </div>

            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-lg leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#0B192C] text-white rounded-br-none shadow-sm'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                  {m.whatsappUrl && (
                    <a
                      href={m.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2.5 inline-flex items-center space-x-1.5 bg-[#C5A059] hover:bg-[#B48F48] text-[#0B192C] font-bold text-[11px] px-3 py-1.5 rounded-sm transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-current" />
                      <span>Falar com Nathalia no WhatsApp</span>
                    </a>
                  )}
                </div>
                <span className="text-[9px] text-slate-400 mt-1 px-1">{m.timestamp}</span>
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-2 text-slate-500 bg-white p-3 rounded-lg border border-slate-200 w-fit">
                <div className="w-2 h-2 rounded-full bg-[#C5A059] animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-[#C5A059] animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-[#C5A059] animate-bounce [animation-delay:0.4s]" />
                <span className="text-[10px] text-slate-500">Consultando imóveis...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Shortcuts */}
          <div className="px-3 py-2 bg-slate-100/70 border-t border-slate-200/80 flex items-center space-x-1.5 overflow-x-auto scrollbar-none">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="flex-shrink-0 text-[10px] bg-white border border-slate-300 hover:border-[#C5A059] text-slate-700 hover:text-[#0B192C] px-2.5 py-1 rounded-full transition-colors cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Digite sua dúvida ou imóvel desejado..."
              className="flex-1 bg-[#FAF9F5] border border-slate-300 rounded-sm px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059] text-slate-800 placeholder-slate-400"
            />
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="bg-[#0B192C] hover:bg-[#1E293B] disabled:opacity-50 text-white p-2 rounded-sm transition-colors cursor-pointer"
              aria-label="Enviar mensagem"
            >
              <Send className="w-4 h-4 text-[#C5A059]" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
