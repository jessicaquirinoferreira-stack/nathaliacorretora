import React, { useState, useEffect } from 'react';
import { MessageCircle, Menu, X, Phone } from 'lucide-react';
import { SiteSettings } from '../types';

interface HeaderProps {
  settings: SiteSettings;
  activeTab: string;
  onNavigate: (tab: string) => void;
  onOpenSearch?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ settings, activeTab, onNavigate }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Início' },
    { id: 'imoveis', label: 'Imóveis' },
    { id: 'empreendimentos', label: 'Lançamentos' },
    { id: 'comprar', label: 'Comprar' },
    { id: 'vender', label: 'Vender Imóvel' },
    { id: 'sobre', label: 'Sobre Nathalia' },
    { id: 'contato', label: 'Contato' }
  ];

  const handleLinkClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  const whatsappHref = `https://wa.me/5522999315940?text=${encodeURIComponent(settings.ctaWhatsappDefault || 'Olá Nathalia, gostaria de atendimento exclusivo.')}`;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#FAF9F5]/98 backdrop-blur-md shadow-lg py-2.5 border-b-2 border-[#C5A059]/40'
          : 'bg-[#FAF9F5] shadow-sm py-3.5 border-b-2 border-[#C5A059]/30'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo prominently highlighted with contrasting light background and increased size */}
          <button
            onClick={() => handleLinkClick('home')}
            className="flex items-center space-x-3 sm:space-x-4 text-left focus:outline-none group cursor-pointer"
            aria-label="Nathalia Robadey Imóveis - Página Inicial"
          >
            {/* Logo image with generous dimensions, high contrast and soft shadow */}
            <div className="relative h-16 sm:h-20 md:h-22 w-auto flex-shrink-0 flex items-center justify-center p-1 rounded-md transition-transform duration-300 group-hover:scale-105">
              <img
                src={logoError ? "https://i.postimg.cc/zfsH2LJH/Logo-imobiliario-NR-dourado-e-azul-marinho.png" : "/logo-nathalia-robadey.png"}
                onError={() => setLogoError(true)}
                alt="Logotipo Oficial Nathalia Robadey Imóveis"
                className="h-16 sm:h-20 md:h-22 w-auto max-w-[200px] sm:max-w-[240px] md:max-w-[280px] object-contain drop-shadow-[0_2px_8px_rgba(11,25,44,0.12)]"
              />
            </div>

            {/* Accompanying typographic brand signature for maximum legibility */}
            <div className="flex flex-col border-l border-[#C5A059]/40 pl-3 sm:pl-4">
              <span className="font-cinzel-luxury tracking-[0.16em] text-sm sm:text-base md:text-lg font-bold text-[#0B192C] group-hover:text-[#A9843E] transition-colors leading-tight">
                NATHALIA ROBADEY
              </span>
              <span className="font-serif-luxury italic text-xs sm:text-sm tracking-[0.22em] text-[#C5A059] font-medium uppercase mt-0.5">
                Imóveis Residenciais
              </span>
            </div>
          </button>

          {/* Desktop Navigation - Dark text on light background for perfect contrast */}
          <nav className="hidden lg:flex items-center space-x-7" aria-label="Navegação principal">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className={`text-xs uppercase tracking-[0.15em] font-semibold transition-colors py-1 relative cursor-pointer ${
                    isActive ? 'text-[#C5A059]' : 'text-[#0B192C] hover:text-[#C5A059]'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C5A059] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action: WhatsApp CTA & Phone */}
          <div className="hidden sm:flex items-center space-x-4">
            <a
              href="tel:+5522999315940"
              className="text-xs text-[#0B192C] hover:text-[#C5A059] font-semibold flex items-center space-x-1.5 transition-colors"
              title="Ligar para Nathalia Robadey"
            >
              <Phone className="w-3.5 h-3.5 text-[#C5A059]" />
              <span className="tracking-wider">(22) 99931-5940</span>
            </a>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-[#0B192C] hover:bg-[#1E293B] text-[#E5C989] font-bold text-xs uppercase tracking-widest px-4 py-2.5 rounded-sm shadow-md transition-all duration-200 hover:shadow-lg border border-[#C5A059]/40 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-current text-[#E5C989]" />
              <span>WhatsApp</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 lg:hidden">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-[#0B192C] hover:text-[#C5A059]"
              aria-label="Contato via WhatsApp"
            >
              <MessageCircle className="w-6 h-6 fill-current text-[#C5A059]" />
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#0B192C] hover:text-[#C5A059] focus:outline-none cursor-pointer"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF9F5] border-b-2 border-[#C5A059]/30 px-6 py-6 space-y-4 shadow-xl animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`text-left text-sm uppercase tracking-widest py-2.5 border-b border-slate-200 font-semibold cursor-pointer ${
                  activeTab === link.id ? 'text-[#C5A059] font-bold' : 'text-[#0B192C]'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-2 flex flex-col space-y-3">
            <a
              href="tel:+5522999315940"
              className="flex items-center space-x-2 text-[#0B192C] font-semibold text-sm py-1"
            >
              <Phone className="w-4 h-4 text-[#C5A059]" />
              <span>+55 22 99931-5940</span>
            </a>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center space-x-2 bg-[#0B192C] text-[#E5C989] font-bold text-xs uppercase tracking-widest py-3 rounded-sm text-center shadow-md border border-[#C5A059]/40"
            >
              <MessageCircle className="w-4 h-4 fill-current text-[#E5C989]" />
              <span>Atendimento Exclusivo no WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
