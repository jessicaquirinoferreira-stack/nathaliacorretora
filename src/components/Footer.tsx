import React, { useState } from 'react';
import { Phone, Mail, Instagram, MessageCircle, MapPin, ShieldCheck, Lock } from 'lucide-react';
import { SiteSettings } from '../types';

interface FooterProps {
  settings: SiteSettings;
  onNavigateTab: (tab: string) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onNavigateTab, onOpenAdmin }) => {
  const [logoError, setLogoError] = useState(false);
  const whatsappUrl = `https://wa.me/5522999315940?text=${encodeURIComponent(settings.ctaWhatsappDefault || 'Olá Nathalia, gostaria de atendimento exclusivo.')}`;

  return (
    <footer className="bg-[#0B192C] text-slate-300 border-t border-[#C5A059]/30 pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand & Mission Column */}
          <div className="space-y-4">
            {/* Luminous Light Pedestal for Logo to ensure maximum contrast and legibility */}
            <div className="bg-[#FAF9F5] p-3 sm:p-3.5 rounded-xl border border-[#C5A059]/50 shadow-md inline-flex items-center space-x-3 max-w-full">
              <div className="relative h-14 sm:h-16 md:h-18 w-auto flex-shrink-0 flex items-center justify-center">
                <img
                  src={logoError ? "https://i.postimg.cc/zfsH2LJH/Logo-imobiliario-NR-dourado-e-azul-marinho.png" : "/logo-nathalia-robadey.png"}
                  onError={() => setLogoError(true)}
                  alt="Nathalia Robadey Imóveis"
                  className="h-14 sm:h-16 md:h-18 w-auto max-w-[180px] object-contain drop-shadow-sm"
                />
              </div>
              <div className="flex flex-col border-l border-[#C5A059]/40 pl-3">
                <span className="font-cinzel-luxury tracking-[0.16em] text-xs sm:text-sm font-bold text-[#0B192C]">
                  NATHALIA ROBADEY
                </span>
                <span className="font-serif-luxury italic text-[10px] sm:text-xs tracking-[0.2em] text-[#C5A059] font-semibold uppercase">
                  Imóveis de Alto Padrão
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Curadoria imobiliária de alto padrão, residências contemporâneas e refúgios na Região Serrana e no Estado do Rio de Janeiro. Atendimento sob medida com total discrição e assessoria jurídica.
            </p>

            <div className="pt-2 flex items-center space-x-3">
              <a
                href="https://www.instagram.com/nathaliarobadey/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-[#C5A059] hover:text-[#0B192C] flex items-center justify-center text-slate-300 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-[#C5A059] hover:text-[#0B192C] flex items-center justify-center text-slate-300 transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#E5C989]">Navegação</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigateTab('home')} className="hover:text-white transition-colors cursor-pointer">
                  Início
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('imoveis')} className="hover:text-white transition-colors cursor-pointer">
                  Catálogo de Imóveis
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('empreendimentos')} className="hover:text-white transition-colors cursor-pointer">
                  Lançamentos & Condomínios
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('comprar')} className="hover:text-white transition-colors cursor-pointer">
                  Como Comprar com Nathalia
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('vender')} className="hover:text-white transition-colors cursor-pointer">
                  Avaliação para Venda
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('sobre')} className="hover:text-white transition-colors cursor-pointer">
                  Sobre a Corretora
                </button>
              </li>
            </ul>
          </div>

          {/* Direct Contacts */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#E5C989]">Canais Oficiais</h4>
            <div className="space-y-3 text-xs">
              <a href="tel:+5522999315940" className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors">
                <Phone className="w-4 h-4 text-[#C5A059]" />
                <span>+55 22 99931-5940</span>
              </a>

              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors">
                <MessageCircle className="w-4 h-4 text-[#C5A059]" />
                <span>WhatsApp: (22) 99931-5940</span>
              </a>

              <a href="mailto:nathaliardmp@gmail.com" className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors">
                <Mail className="w-4 h-4 text-[#C5A059]" />
                <span>nathaliardmp@gmail.com</span>
              </a>

              <div className="flex items-start space-x-2 text-slate-400 pt-1">
                <MapPin className="w-4 h-4 text-[#C5A059] flex-shrink-0 mt-0.5" />
                <span>{settings.address || 'Região Serrana & Rio de Janeiro, RJ - Atendimento com hora marcada'}</span>
              </div>
            </div>
          </div>

          {/* Legal & Compliance */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#E5C989]">Privacidade & Termos</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigateTab('privacidade')} className="hover:text-white transition-colors cursor-pointer">
                  Política de Privacidade (LGPD)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('cookies')} className="hover:text-white transition-colors cursor-pointer">
                  Política de Cookies
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('termos')} className="hover:text-white transition-colors cursor-pointer">
                  Termos de Uso
                </button>
              </li>
            </ul>

            <div className="pt-2 flex items-center space-x-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Ambiente Protegido & Conformidade LGPD</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Centered Admin Link */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} Nathalia Robadey Imóveis. Todos os direitos reservados.</p>

          {/* Discreet Centered Admin Link */}
          <button
            onClick={onOpenAdmin}
            className="flex items-center space-x-1.5 text-slate-500 hover:text-[#E5C989] transition-colors py-1 px-3 rounded-full hover:bg-slate-800/60 cursor-pointer"
            title="Acesso restrito para administração"
          >
            <Lock className="w-3.5 h-3.5 text-[#C5A059]" />
            <span className="text-[11px] tracking-wider uppercase font-medium">Área Administrativa</span>
          </button>

          <p className="text-[11px] text-slate-400">
            Tecnologia & Gestão Imobiliária
          </p>
        </div>
      </div>
    </footer>
  );
};
