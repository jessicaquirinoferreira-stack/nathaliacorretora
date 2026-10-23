import React from 'react';
import { Building2, Calendar, MapPin, Check, MessageCircle, FileText } from 'lucide-react';
import { Development } from '../types';

interface DevelopmentCardProps {
  development: Development;
  onSelect?: (dev: Development) => void;
}

export const DevelopmentCard: React.FC<DevelopmentCardProps> = ({ development, onSelect }) => {
  const statusLabels: Record<string, { label: string; class: string }> = {
    pre_launch: { label: 'Pré-Lançamento', class: 'bg-[#C5A059] text-[#0B192C]' },
    in_construction: { label: 'Obras Avançadas', class: 'bg-blue-900 text-white' },
    ready: { label: 'Pronto para Morar', class: 'bg-emerald-800 text-white' }
  };

  const statusInfo = statusLabels[development.status] || { label: 'Lançamento', class: 'bg-[#C5A059] text-[#0B192C]' };

  const whatsappMessage = `Olá Nathalia, gostaria de receber o book digital completo e a tabela de valores do empreendimento "${development.title}".`;
  const whatsappUrl = `https://wa.me/5522999315940?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="bg-white rounded-lg overflow-hidden border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row group">
      {/* Visual Image */}
      <div className="md:w-1/2 relative min-h-[260px] md:min-h-[380px] overflow-hidden bg-slate-900">
        <img
          src={development.coverImage || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'}
          alt={development.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Status Badge */}
        <div className="absolute top-4 left-4 z-10">
          <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-sm shadow-sm ${statusInfo.class}`}>
            {statusInfo.label}
          </span>
        </div>

        {/* Developer Badge */}
        {development.developer && (
          <div className="absolute bottom-4 left-4 z-10 text-white">
            <span className="text-[10px] text-[#E5C989] uppercase tracking-widest block font-medium">Incorporação</span>
            <span className="text-sm font-semibold tracking-wide drop-shadow-md">{development.developer}</span>
          </div>
        )}
      </div>

      {/* Details Column */}
      <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between space-y-5 bg-[#FAF9F5]">
        <div>
          <div className="flex items-center space-x-2 text-slate-500 text-xs uppercase tracking-wider mb-2">
            <MapPin className="w-4 h-4 text-[#C5A059] flex-shrink-0" />
            <span>{development.location}</span>
          </div>

          <h3 className="font-serif-luxury text-2xl sm:text-3xl font-semibold text-[#0B192C] leading-tight mb-3">
            {development.title}
          </h3>

          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
            {development.description}
          </p>

          {/* Key Facts */}
          <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-200 text-xs mb-4">
            {development.deliveryForecast && (
              <div className="flex items-center space-x-2 text-slate-700">
                <Calendar className="w-4 h-4 text-[#C5A059]" />
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Entrega</span>
                  <span className="font-semibold">{development.deliveryForecast}</span>
                </div>
              </div>
            )}
            {development.unitsCount && (
              <div className="flex items-center space-x-2 text-slate-700">
                <Building2 className="w-4 h-4 text-[#C5A059]" />
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Unidades</span>
                  <span className="font-semibold">{development.unitsCount}</span>
                </div>
              </div>
            )}
          </div>

          {/* Features */}
          {development.features && development.features.length > 0 && (
            <div className="space-y-1.5 mb-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Destaques do Projeto:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {development.features.slice(0, 4).map((f, idx) => (
                  <div key={idx} className="flex items-center space-x-1.5 text-xs text-slate-700">
                    <Check className="w-3.5 h-3.5 text-[#C5A059] flex-shrink-0" />
                    <span className="truncate">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pricing & CTA */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          {development.startingPrice ? (
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 block">Valores a partir de</span>
              <span className="font-serif-luxury text-xl sm:text-2xl font-bold text-[#0B192C]">
                R$ {development.startingPrice.toLocaleString('pt-BR')}
              </span>
            </div>
          ) : (
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#C5A059] block font-semibold">Tabela Sob Consulta</span>
              <span className="text-xs text-slate-600">Condições exclusivas de lançamento</span>
            </div>
          )}

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-[#0B192C] hover:bg-[#1E293B] text-white text-xs uppercase tracking-widest px-5 py-3 rounded-sm font-semibold transition-all shadow-sm hover:shadow-md cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-[#E5C989] fill-current" />
            <span>Receber Book & Tabela</span>
          </a>
        </div>
      </div>
    </div>
  );
};
