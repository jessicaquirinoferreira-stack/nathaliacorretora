import React, { useState } from 'react';
import { 
  X, MapPin, Maximize, BedDouble, Bath, Car, Check, 
  MessageCircle, Calendar, Share2, ChevronLeft, ChevronRight, CheckCircle2 
} from 'lucide-react';
import { Property } from '../types';
import { api } from '../services/api';

interface PropertyModalProps {
  property: Property | null;
  onClose: () => void;
}

export const PropertyModal: React.FC<PropertyModalProps> = ({ property, onClose }) => {
  if (!property) return null;

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    preferredContact: 'whatsapp' as 'whatsapp' | 'email' | 'phone',
    message: '',
    visitDate: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const images = property.gallery && property.gallery.length > 0 
    ? property.gallery.map(g => g.url) 
    : [property.coverImage];

  const whatsappMessage = `Olá Nathalia, tenho interesse no imóvel Ref: ${property.referenceCode} - "${property.title}". Gostaria de mais detalhes e agendar uma visita exclusiva.`;
  const whatsappUrl = `https://wa.me/5522999315940?text=${encodeURIComponent(whatsappMessage)}`;

  const handleNextPhoto = () => {
    setActivePhotoIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevPhoto = () => {
    setActivePhotoIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleShare = async () => {
    const url = window.location.origin + `/imovel/${property.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: property.shortDescription || property.title,
          url
        });
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.submitLead({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        preferredContact: formData.preferredContact,
        message: formData.message + (formData.visitDate ? ` [Data sugerida para visita: ${formData.visitDate}]` : ''),
        type: 'visit_request',
        propertyId: property.id,
        propertyTitle: property.title,
        sourcePage: `/imovel/${property.slug}`,
        consent: true
      });
      setSubmitted(true);
    } catch (err: any) {
      alert(err.message || 'Erro ao enviar dados. Tente pelo WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="bg-[#FAF9F5] w-full max-w-5xl rounded-lg overflow-hidden shadow-2xl relative my-6 max-h-[92vh] flex flex-col">
        {/* Top Floating Close & Share */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-[#0B192C] text-white border-b border-[#C5A059]/30">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs text-[#E5C989] tracking-widest font-semibold">
              REF: {property.referenceCode}
            </span>
            <span className="text-slate-400 text-xs hidden sm:inline">|</span>
            <span className="text-xs text-slate-300 hidden sm:inline truncate max-w-md">
              {property.title}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleShare}
              className="flex items-center space-x-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/80 px-3 py-1.5 rounded-sm transition-colors cursor-pointer"
              title="Compartilhar Imóvel"
            >
              <Share2 className="w-3.5 h-3.5 text-[#C5A059]" />
              <span className="hidden sm:inline">{copied ? 'Link Copiado!' : 'Compartilhar'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-sm transition-colors cursor-pointer"
              aria-label="Fechar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 md:p-8 space-y-8">
          {/* Main Gallery Showcase */}
          <div className="relative aspect-[16/9] w-full rounded-md overflow-hidden bg-black shadow-inner">
            <img
              src={images[activePhotoIndex]}
              alt={`${property.title} - Foto ${activePhotoIndex + 1}`}
              className="w-full h-full object-cover transition-all duration-300"
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevPhoto}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black text-white p-2.5 rounded-full transition-colors cursor-pointer"
                  aria-label="Foto anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextPhoto}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black text-white p-2.5 rounded-full transition-colors cursor-pointer"
                  aria-label="Próxima foto"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-3 py-1 rounded-sm font-mono tracking-widest">
                  {activePhotoIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-thin">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhotoIndex(idx)}
                  className={`relative flex-shrink-0 w-20 h-14 rounded-sm overflow-hidden border-2 transition-all cursor-pointer ${
                    activePhotoIndex === idx ? 'border-[#C5A059] opacity-100 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Miniatura" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Title, Pricing & Highlights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <div className="flex items-center space-x-2 text-slate-500 text-xs uppercase tracking-wider mb-2">
                  <MapPin className="w-4 h-4 text-[#C5A059]" />
                  <span>{property.neighborhood ? `${property.neighborhood}, ` : ''}{property.city}</span>
                  <span>•</span>
                  <span>{property.type}</span>
                </div>
                <h1 className="font-serif-luxury text-2xl sm:text-4xl text-[#0B192C] font-semibold leading-tight">
                  {property.title}
                </h1>
              </div>

              {/* Price Banner */}
              <div className="flex flex-wrap items-baseline gap-4 p-4 rounded-md bg-white border border-slate-200">
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-500 block">Valor do Imóvel</span>
                  <span className="font-serif-luxury text-3xl font-bold text-[#0B192C]">
                    {property.priceDisplay || `R$ ${property.price.toLocaleString('pt-BR')}`}
                  </span>
                </div>
                {property.condoFee ? (
                  <div className="border-l border-slate-200 pl-4">
                    <span className="text-[11px] uppercase tracking-wider text-slate-500 block">Condomínio</span>
                    <span className="text-sm font-semibold text-slate-800">R$ {property.condoFee.toLocaleString('pt-BR')}/mês</span>
                  </div>
                ) : null}
                {property.iptu ? (
                  <div className="border-l border-slate-200 pl-4">
                    <span className="text-[11px] uppercase tracking-wider text-slate-500 block">IPTU</span>
                    <span className="text-sm font-semibold text-slate-800">R$ {property.iptu.toLocaleString('pt-BR')}/ano</span>
                  </div>
                ) : null}
              </div>

              {/* Specs Metric Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-3 rounded-md border border-slate-200/80 text-center">
                  <Maximize className="w-5 h-5 text-[#C5A059] mx-auto mb-1" />
                  <span className="text-sm font-bold text-[#0B192C] block">{property.usableArea || property.totalArea} m²</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Área Privativa</span>
                </div>
                <div className="bg-white p-3 rounded-md border border-slate-200/80 text-center">
                  <BedDouble className="w-5 h-5 text-[#C5A059] mx-auto mb-1" />
                  <span className="text-sm font-bold text-[#0B192C] block">{property.bedrooms} Dorms</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">{property.suites} Suítes</span>
                </div>
                <div className="bg-white p-3 rounded-md border border-slate-200/80 text-center">
                  <Bath className="w-5 h-5 text-[#C5A059] mx-auto mb-1" />
                  <span className="text-sm font-bold text-[#0B192C] block">{property.bathrooms} Banheiros</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Lavabo & Banhos</span>
                </div>
                <div className="bg-white p-3 rounded-md border border-slate-200/80 text-center">
                  <Car className="w-5 h-5 text-[#C5A059] mx-auto mb-1" />
                  <span className="text-sm font-bold text-[#0B192C] block">{property.parkingSpots} Vagas</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Garagem</span>
                </div>
              </div>

              {/* Full Description */}
              <div className="bg-white p-6 rounded-md border border-slate-200/80 space-y-4">
                <h3 className="font-serif-luxury text-xl font-semibold text-[#0B192C] border-b border-slate-100 pb-2">
                  Sobre esta Propriedade
                </h3>
                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>

              {/* Features & Differentials */}
              {property.features && property.features.length > 0 && (
                <div className="bg-white p-6 rounded-md border border-slate-200/80 space-y-4">
                  <h3 className="font-serif-luxury text-xl font-semibold text-[#0B192C] border-b border-slate-100 pb-2">
                    Características & Comodidades
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {property.features.map((feat, i) => (
                      <div key={i} className="flex items-center space-x-2 text-xs text-slate-700">
                        <div className="w-4 h-4 rounded-full bg-[#C5A059]/15 flex items-center justify-center flex-shrink-0">
                          <Check className="w-2.5 h-2.5 text-[#C5A059]" />
                        </div>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar: Visit Request & Direct WhatsApp */}
            <div className="space-y-6">
              {/* WhatsApp VIP Card */}
              <div className="bg-[#0B192C] text-white p-6 rounded-md border border-[#C5A059]/40 shadow-lg text-center space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#C5A059]/20 flex items-center justify-center border border-[#C5A059]">
                  <MessageCircle className="w-6 h-6 text-[#E5C989]" />
                </div>
                <div>
                  <h4 className="font-serif-luxury text-lg font-medium text-white">Atendimento Imediato</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Converse diretamente com Nathalia Robadey sobre esta propriedade no WhatsApp.
                  </p>
                </div>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-[#C5A059] to-[#D4AF37] hover:from-[#B48F48] hover:to-[#C5A059] text-[#0B192C] font-semibold text-xs uppercase tracking-widest py-3 px-4 rounded-sm transition-all duration-200 shadow-md cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Conversar no WhatsApp</span>
                </a>
              </div>

              {/* Schedule Visit Form */}
              <div className="bg-white p-6 rounded-md border border-slate-200/80 shadow-sm space-y-4">
                <h4 className="font-serif-luxury text-lg font-semibold text-[#0B192C] flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-[#C5A059]" />
                  <span>Agendar Visita Exclusiva</span>
                </h4>

                {submitted ? (
                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                    <p className="text-xs font-semibold text-emerald-800">Solicitação enviada com sucesso!</p>
                    <p className="text-[11px] text-emerald-700 leading-relaxed">
                      Nathalia Robadey entrará em contato em breve para confirmar o horário da sua visita.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitLead} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Seu Nome *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-[#FAF9F5] border border-slate-300 rounded-sm px-3 py-2 text-xs focus:border-[#C5A059] focus:outline-none"
                        placeholder="Nome completo"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Telefone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-[#FAF9F5] border border-slate-300 rounded-sm px-3 py-2 text-xs focus:border-[#C5A059] focus:outline-none"
                        placeholder="(22) 99999-9999"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        E-mail
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-[#FAF9F5] border border-slate-300 rounded-sm px-3 py-2 text-xs focus:border-[#C5A059] focus:outline-none"
                        placeholder="seuemail@exemplo.com"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Data Preferida para Visita
                      </label>
                      <input
                        type="date"
                        value={formData.visitDate}
                        onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                        className="w-full bg-[#FAF9F5] border border-slate-300 rounded-sm px-3 py-2 text-xs focus:border-[#C5A059] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Mensagem ou Dúvida
                      </label>
                      <textarea
                        rows={2}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full bg-[#FAF9F5] border border-slate-300 rounded-sm px-3 py-2 text-xs focus:border-[#C5A059] focus:outline-none"
                        placeholder="Ex: Gostaria de visitar no período da tarde..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-[#0B192C] hover:bg-[#1E293B] text-white font-semibold text-xs uppercase tracking-widest py-3 rounded-sm transition-colors cursor-pointer"
                    >
                      {submitting ? 'Enviando...' : 'Solicitar Agendamento'}
                    </button>
                    <p className="text-[10px] text-slate-600 text-center">
                      Seus dados são protegidos conforme a LGPD e usados exclusivamente para este atendimento.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
