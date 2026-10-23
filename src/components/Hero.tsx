import React, { useState } from 'react';
import { Search, Compass, ShieldCheck, Award, SlidersHorizontal } from 'lucide-react';
import { SiteSettings } from '../types';

interface HeroProps {
  settings: SiteSettings;
  onSearch: (filters: {
    purpose?: string;
    type?: string;
    city?: string;
    bedrooms?: string;
    search?: string;
  }) => void;
  onExploreClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ settings, onSearch, onExploreClick }) => {
  const [purpose, setPurpose] = useState('venda');
  const [propertyType, setPropertyType] = useState('all');
  const [city, setCity] = useState('all');
  const [bedrooms, setBedrooms] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      purpose,
      type: propertyType === 'all' ? undefined : propertyType,
      city: city === 'all' ? undefined : city,
      bedrooms: bedrooms === 'all' ? undefined : bedrooms,
      search: searchTerm.trim() || undefined
    });
  };

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center pt-24 pb-16 overflow-hidden">
      {/* Background Architectural Photo with subtle parallax tone and luxury overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2200&q=85"
          alt="Arquitetura Residencial - Nathalia Robadey Imóveis"
          className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B192C] via-[#0B192C]/80 to-[#0B192C]/50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(197,160,89,0.08)_0,transparent_70%)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white mt-6">

        {/* Editorial Subtitle Badge */}
        <div className="inline-flex items-center space-x-2 border border-[#C5A059]/40 bg-[#0B192C]/80 backdrop-blur-md px-4 py-1.5 rounded-full mb-6 block mx-auto w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-pulse" />
          <span className="text-xs uppercase tracking-[0.25em] font-medium text-[#E5C989]">
            {settings.heroBadge || 'Curadoria Imobiliária Exclusiva'}
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="font-serif-luxury text-4xl sm:text-6xl md:text-7xl font-light tracking-tight text-white max-w-4xl mx-auto leading-[1.1] mb-6">
          Encontre o refúgio perfeito onde <span className="italic text-[#E5C989] font-normal">arquitetura</span> e <span className="italic text-[#E5C989] font-normal">privacidade</span> se encontram.
        </h1>

        <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-slate-300 font-light leading-relaxed mb-10">
          {settings.heroSubtitle || 'Residências de arquitetura primorosa, refúgios na serra e investimentos de solidez comprovada sob curadoria criteriosa de Nathalia Robadey.'}
        </p>

        {/* Integrated Luxury Search Bar */}
        <div className="max-w-5xl mx-auto bg-[#070F1E]/90 backdrop-blur-xl border border-[#C5A059]/30 rounded-lg p-4 sm:p-6 shadow-2xl text-left">
          {/* Purpose Tabs: Venda / Aluguel */}
          <div className="flex items-center space-x-4 mb-4 pb-3 border-b border-slate-700/60">
            <button
              type="button"
              onClick={() => setPurpose('venda')}
              className={`text-xs uppercase tracking-widest px-4 py-1.5 rounded-sm font-semibold transition-all cursor-pointer ${
                purpose === 'venda'
                  ? 'bg-[#C5A059] text-[#0B192C]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Comprar
            </button>
            <button
              type="button"
              onClick={() => setPurpose('aluguel')}
              className={`text-xs uppercase tracking-widest px-4 py-1.5 rounded-sm font-semibold transition-all cursor-pointer ${
                purpose === 'aluguel'
                  ? 'bg-[#C5A059] text-[#0B192C]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Alugar
            </button>
          </div>

          <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 items-end">
            {/* Field: Keyword or Reference */}
            <div className="lg:col-span-1">
              <label className="block text-[10px] uppercase tracking-widest text-[#C5A059] font-semibold mb-1">
                Referência / Termo
              </label>
              <input
                type="text"
                placeholder="Ex: NRI-101 ou Mury"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0B192C] border border-slate-700 focus:border-[#C5A059] rounded-sm px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Field: Property Type */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#C5A059] font-semibold mb-1">
                Tipo de Imóvel
              </label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full bg-[#0B192C] border border-slate-700 focus:border-[#C5A059] rounded-sm px-3 py-2.5 text-xs text-white focus:outline-none transition-colors"
              >
                <option value="all">Todos os tipos</option>
                <option value="casa">Casa Residencial</option>
                <option value="cobertura">Cobertura</option>
                <option value="apartamento">Apartamento</option>
                <option value="sitio">Sítio / Chácara</option>
                <option value="terreno">Terreno em Condomínio</option>
              </select>
            </div>

            {/* Field: City / Region */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#C5A059] font-semibold mb-1">
                Localização
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-[#0B192C] border border-slate-700 focus:border-[#C5A059] rounded-sm px-3 py-2.5 text-xs text-white focus:outline-none transition-colors"
              >
                <option value="all">Todas as regiões</option>
                <option value="Nova Friburgo">Nova Friburgo (Região Serrana)</option>
                <option value="Mury">Mury / Amparo</option>
                <option value="Cônego">Cônego / Cascata</option>
                <option value="Rio de Janeiro">Rio de Janeiro (Litoral)</option>
              </select>
            </div>

            {/* Field: Bedrooms */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#C5A059] font-semibold mb-1">
                Dormitórios
              </label>
              <select
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="w-full bg-[#0B192C] border border-slate-700 focus:border-[#C5A059] rounded-sm px-3 py-2.5 text-xs text-white focus:outline-none transition-colors"
              >
                <option value="all">Qualquer quantidade</option>
                <option value="2">2+ quartos</option>
                <option value="3">3+ quartos</option>
                <option value="4">4+ suítes</option>
                <option value="5">5+ quartos</option>
              </select>
            </div>

            {/* Submit Search Button */}
            <div>
              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-[#C5A059] to-[#D4AF37] hover:from-[#B48F48] hover:to-[#C5A059] text-[#0B192C] font-semibold text-xs uppercase tracking-widest py-3 px-4 rounded-sm transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
              >
                <Search className="w-4 h-4 text-[#0B192C]" />
                <span>Buscar Imóveis</span>
              </button>
            </div>
          </form>
        </div>

        {/* Trust Badges / Differentials */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto pt-6 border-t border-slate-700/40">
          <div className="flex items-center justify-center space-x-3 text-slate-300">
            <Award className="w-5 h-5 text-[#C5A059]" />
            <span className="text-xs tracking-wider uppercase font-medium">Curadoria Criteriosa</span>
          </div>
          <div className="flex items-center justify-center space-x-3 text-slate-300">
            <ShieldCheck className="w-5 h-5 text-[#C5A059]" />
            <span className="text-xs tracking-wider uppercase font-medium">Sigilo & Discrição Absoluta</span>
          </div>
          <div className="flex items-center justify-center space-x-3 text-slate-300">
            <Compass className="w-5 h-5 text-[#C5A059]" />
            <span className="text-xs tracking-wider uppercase font-medium">Assessoria Jurídica Completa</span>
          </div>
        </div>
      </div>
    </section>
  );
};
