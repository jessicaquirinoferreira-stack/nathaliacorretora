import React from 'react';
import { BedDouble, Bath, Car, Maximize, MapPin, MessageCircle, ArrowUpRight } from 'lucide-react';
import { Property } from '../types';

interface PropertyCardProps {
  property: Property;
  onSelect: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onSelect }) => {
  const whatsappText = `Olá Nathalia, tenho interesse no imóvel Ref: ${property.referenceCode} - "${property.title}". Poderia me passar mais informações e disponibilidade de visita?`;
  const whatsappUrl = `https://wa.me/5522999315940?text=${encodeURIComponent(whatsappText)}`;

  return (
    <div className="group bg-white rounded-md overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full hover:border-[#C5A059]/50">
      {/* Image Container with Badges */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-900 cursor-pointer" onClick={() => onSelect(property)}>
        <img
          src={property.coverImage || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'}
          alt={property.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <span className="bg-[#0B192C]/90 text-[#E5C989] text-[10px] uppercase font-semibold tracking-wider px-2.5 py-1 rounded-sm backdrop-blur-sm border border-[#C5A059]/30">
            {property.purpose === 'venda' ? 'Venda' : 'Aluguel'}
          </span>
          {property.isFeatured && (
            <span className="bg-[#C5A059] text-[#0B192C] text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-sm shadow-sm">
              Destaque
            </span>
          )}
          {property.isOpportunity && (
            <span className="bg-emerald-800/90 text-white text-[10px] uppercase font-semibold tracking-wider px-2.5 py-1 rounded-sm backdrop-blur-sm">
              Oportunidade
            </span>
          )}
        </div>

        {/* Reference Code Badge Top Right */}
        <div className="absolute top-3 right-3 z-10">
          <span className="bg-black/60 text-white text-[10px] font-mono tracking-widest px-2 py-0.5 rounded-sm backdrop-blur-sm border border-white/20">
            {property.referenceCode}
          </span>
        </div>

        {/* Price Tag Bottom Left */}
        <div className="absolute bottom-3 left-3 z-10">
          <div className="text-white">
            <span className="text-[10px] uppercase tracking-wider text-[#E5C989] block -mb-1 font-medium">Valor de investimento</span>
            <span className="font-serif-luxury text-xl sm:text-2xl font-semibold tracking-tight text-white drop-shadow-md">
              {property.priceDisplay || `R$ ${property.price.toLocaleString('pt-BR')}`}
            </span>
          </div>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Location */}
          <div className="flex items-center space-x-1.5 text-slate-500 text-xs mb-2">
            <MapPin className="w-3.5 h-3.5 text-[#C5A059] flex-shrink-0" />
            <span className="truncate">{property.neighborhood ? `${property.neighborhood}, ` : ''}{property.city}</span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onSelect(property)}
            className="font-serif-luxury text-lg sm:text-xl font-medium text-[#0B192C] line-clamp-2 hover:text-[#C5A059] transition-colors cursor-pointer mb-2"
          >
            {property.title}
          </h3>

          {/* Short Description */}
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
            {property.shortDescription || property.description}
          </p>
        </div>

        <div>
          {/* Specs Grid */}
          <div className="grid grid-cols-4 gap-2 py-3 border-y border-slate-100 text-slate-700 text-center mb-4">
            {property.usableArea ? (
              <div className="flex flex-col items-center">
                <Maximize className="w-4 h-4 text-[#C5A059] mb-1" />
                <span className="text-[11px] font-semibold">{property.usableArea} m²</span>
                <span className="text-[9px] text-slate-600 uppercase">Útil</span>
              </div>
            ) : null}

            <div className="flex flex-col items-center">
              <BedDouble className="w-4 h-4 text-[#C5A059] mb-1" />
              <span className="text-[11px] font-semibold">{property.bedrooms}</span>
              <span className="text-[9px] text-slate-600 uppercase">{property.suites ? `${property.suites} suítes` : 'Quartos'}</span>
            </div>

            <div className="flex flex-col items-center">
              <Bath className="w-4 h-4 text-[#C5A059] mb-1" />
              <span className="text-[11px] font-semibold">{property.bathrooms}</span>
              <span className="text-[9px] text-slate-600 uppercase">Banhos</span>
            </div>

            <div className="flex flex-col items-center">
              <Car className="w-4 h-4 text-[#C5A059] mb-1" />
              <span className="text-[11px] font-semibold">{property.parkingSpots}</span>
              <span className="text-[9px] text-slate-600 uppercase">Vagas</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center space-x-2 pt-1">
            <button
              onClick={() => onSelect(property)}
              className="flex-1 flex items-center justify-center space-x-1 border border-slate-300 hover:border-[#0B192C] text-[#0B192C] hover:bg-[#0B192C] hover:text-white text-xs uppercase tracking-wider py-2.5 px-3 rounded-sm font-semibold transition-all cursor-pointer"
            >
              <span>Detalhes</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-1.5 bg-[#C5A059] hover:bg-[#B48F48] text-[#0B192C] text-xs uppercase tracking-wider py-2.5 px-3 rounded-sm font-semibold transition-colors cursor-pointer"
              title="Conversar sobre este imóvel no WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
