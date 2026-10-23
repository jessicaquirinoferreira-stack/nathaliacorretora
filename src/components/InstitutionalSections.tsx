import React, { useState } from 'react';
import { 
  Award, Shield, FileCheck, Sparkles, MessageCircle, 
  Instagram, ArrowRight, CheckCircle, Compass, Users 
} from 'lucide-react';
import { SiteSettings } from '../types';

interface InstitutionalProps {
  settings: SiteSettings;
  onNavigateTab: (tab: string) => void;
}

export const AboutSection: React.FC<InstitutionalProps> = ({ settings, onNavigateTab }) => {
  const whatsappUrl = `https://wa.me/5522999315940?text=${encodeURIComponent('Olá Nathalia, gostaria de agendar uma reunião exclusiva para apresentar minhas necessidades imobiliárias.')}`;

  return (
    <section className="py-20 bg-[#FAF9F5] border-t border-slate-200/80 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Editorial Portrait Column */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="aspect-[3/4] rounded-lg overflow-hidden shadow-2xl border-2 border-[#C5A059]/30 bg-[#0B192C]">
                <img
                  src="https://i.postimg.cc/P5jCDLtx/Whats-App-Image-2026-10-23-at-13-15-02.jpg"
                  alt="Nathalia Robadey - Consultora Imobiliária"
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B192C]/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <span className="font-serif-luxury text-2xl font-semibold tracking-wide block">Nathalia Robadey</span>
                  <span className="text-xs uppercase tracking-widest text-[#E5C989]">Especialista Imobiliária</span>
                </div>
              </div>

              {/* Decorative Luxury Frame Accent */}
              <div className="absolute -bottom-4 -right-4 w-full h-full border-2 border-[#C5A059]/40 rounded-lg -z-10 hidden sm:block" />
            </div>
          </div>

          {/* Editorial Text Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 border border-[#C5A059]/40 bg-[#0B192C]/5 px-3.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
              <span className="text-xs uppercase tracking-[0.2em] font-medium text-[#0B192C]">
                Perfil Institucional
              </span>
            </div>

            <h2 className="font-serif-luxury text-3xl sm:text-5xl font-light text-[#0B192C] leading-tight">
              A elegância de morar bem com a <span className="italic font-normal text-[#C5A059]">segurança</span> de um investimento sólido.
            </h2>

            <blockquote className="border-l-2 border-[#C5A059] pl-4 italic text-slate-700 font-serif-luxury text-lg sm:text-xl">
              "{settings.aboutQuote || 'Um imóvel não é apenas um espaço físico; é a expressão do seu estilo de vida e o refúgio da sua família.'}"
            </blockquote>

            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
              {settings.aboutStory || 'Nathalia Robadey é especialista no mercado imobiliário, oferecendo uma experiência sob medida para clientes que buscam residências aconchegantes, refúgios na serra e investimentos sólidos.'}
            </p>

            {/* Differential highlights grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-[#C5A059] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B192C]">Sigilo Absoluto</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Atendimento reservado para compradores e vendedores exigentes.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <FileCheck className="w-5 h-5 text-[#C5A059] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B192C]">Assessoria Jurídica</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Auditoria documental completa antes de qualquer assinatura.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Sparkles className="w-5 h-5 text-[#C5A059] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B192C]">Curadoria Arquitetônica</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Imóveis avaliados por sua estética, conforto e potencial de valorização.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Compass className="w-5 h-5 text-[#C5A059] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B192C]">Conexão Regional</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Amplo domínio da Região Serrana e principais endereços do Rio.</p>
                </div>
              </div>
            </div>

            {/* Direct Contact CTAs */}
            <div className="pt-4 flex flex-wrap gap-4">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-[#0B192C] hover:bg-[#1E293B] text-white text-xs uppercase tracking-widest px-6 py-3.5 rounded-sm font-semibold transition-all shadow-md cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-[#E5C989] fill-current" />
                <span>Conversar com Nathalia Robadey</span>
              </a>

              <button
                onClick={() => onNavigateTab('vender')}
                className="inline-flex items-center space-x-2 border border-[#C5A059] text-[#0B192C] hover:bg-[#C5A059] hover:text-[#0B192C] text-xs uppercase tracking-widest px-6 py-3.5 rounded-sm font-semibold transition-all cursor-pointer"
              >
                <span>Avaliar meu Imóvel</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const ProcessSection: React.FC<{ onNavigateTab: (tab: string) => void }> = ({ onNavigateTab }) => {
  const [activeMode, setActiveMode] = useState<'comprar' | 'vender' | 'investir'>('comprar');

  const steps = {
    comprar: [
      { num: '01', title: 'Alinhamento de Perfil', desc: 'Entendimento profundo do seu estilo de vida, necessidades familiares e expectativas de metragem e localização.' },
      { num: '02', title: 'Curadoria Exclusiva', desc: 'Apresentação de uma seleção refinada de imóveis que atendem rigorosamente aos seus critérios, incluindo opções off-market.' },
      { num: '03', title: 'Visitas Privativas', desc: 'Agendamento e acompanhamento pessoal em horários convenientes, com análise técnica do imóvel.' },
      { num: '04', title: 'Due Diligence & Fechamento', desc: 'Assessoria jurídica integral na checagem de certidões, negociação de valores e elaboração de contratos seguros.' }
    ],
    vender: [
      { num: '01', title: 'Avaliação Mercadológica', desc: 'Estudo comparativo detalhado considerando particularidades arquitetônicas, estado de conservação e liquidez da região.' },
      { num: '02', title: 'Produção Audiovisual', desc: 'Fotografia arquitetônica profissional, vídeos imersivos e descrição editorial que valorizam cada detalhe.' },
      { num: '03', title: 'Divulgação Qualificada', desc: 'Apresentação direta à base de clientes compradores ativos e campanhas direcionadas sem exposição desnecessária.' },
      { num: '04', title: 'Negociação & Conclusão', desc: 'Condução ética de propostas e assistência documental até a assinatura da escritura definitiva.' }
    ],
    investir: [
      { num: '01', title: 'Análise de Cenário', desc: 'Identificação de vetores de crescimento e valorização imobiliária na Região Serrana e Litoral Fluminense.' },
      { num: '02', title: 'Oportunidades em Lançamento', desc: 'Acesso antecipado a tabelas de pré-lançamento em condomínios fechados e edifícios boutique.' },
      { num: '03', title: 'Projeção de Retorno', desc: 'Avaliação de rentabilidade estimada por valorização de capital ou locação por temporada de luxo.' },
      { num: '04', title: 'Segurança Contratual', desc: 'Verificação da solidez das incorporadoras e construtoras parceiras.' }
    ]
  };

  return (
    <section className="py-20 bg-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-bold block mb-2">
          Metodologia de Atendimento
        </span>
        <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#0B192C] font-semibold mb-8">
          Processo Transparente e Seguro
        </h2>

        {/* Tab switch */}
        <div className="inline-flex p-1 bg-[#FAF9F5] border border-slate-200 rounded-sm mb-12">
          <button
            onClick={() => setActiveMode('comprar')}
            className={`px-5 py-2 text-xs uppercase tracking-widest font-semibold transition-all cursor-pointer ${
              activeMode === 'comprar' ? 'bg-[#0B192C] text-white shadow-sm' : 'text-slate-600 hover:text-[#0B192C]'
            }`}
          >
            Para Compradores
          </button>
          <button
            onClick={() => setActiveMode('vender')}
            className={`px-5 py-2 text-xs uppercase tracking-widest font-semibold transition-all cursor-pointer ${
              activeMode === 'vender' ? 'bg-[#0B192C] text-white shadow-sm' : 'text-slate-600 hover:text-[#0B192C]'
            }`}
          >
            Para Vendedores
          </button>
          <button
            onClick={() => setActiveMode('investir')}
            className={`px-5 py-2 text-xs uppercase tracking-widest font-semibold transition-all cursor-pointer ${
              activeMode === 'investir' ? 'bg-[#0B192C] text-white shadow-sm' : 'text-slate-600 hover:text-[#0B192C]'
            }`}
          >
            Para Investidores
          </button>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {steps[activeMode].map((st, idx) => (
            <div key={idx} className="bg-[#FAF9F5] p-6 rounded-md border border-slate-200/80 relative hover:border-[#C5A059] transition-colors">
              <span className="font-cinzel-luxury text-3xl font-bold text-[#C5A059]/40 block mb-3">{st.num}</span>
              <h3 className="font-serif-luxury text-lg font-semibold text-[#0B192C] mb-2">{st.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{st.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const InstagramSection: React.FC = () => {
  const instagramImages = [
    {
      img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80',
      title: 'Residência Mury'
    },
    {
      img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80',
      title: 'Cobertura Panorâmica'
    },
    {
      img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
      title: 'Reserva das Araucárias'
    },
    {
      img: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80',
      title: 'Living Sofisticado'
    }
  ];

  return (
    <section className="py-16 bg-[#070F1E] text-white border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center space-x-2 text-[#E5C989] text-xs uppercase tracking-widest font-semibold mb-2">
              <Instagram className="w-4 h-4" />
              <span>Acompanhe nas Redes Sociais</span>
            </div>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl font-light text-white">
              Siga <span className="italic font-normal text-[#E5C989]">@nathaliarobadey</span> no Instagram
            </h2>
          </div>

          <a
            href="https://www.instagram.com/nathaliarobadey/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 border border-[#C5A059] hover:bg-[#C5A059] text-[#E5C989] hover:text-[#0B192C] px-5 py-2.5 rounded-sm text-xs uppercase tracking-widest font-semibold transition-all cursor-pointer"
          >
            <span>Ver Perfil Oficial</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {instagramImages.map((item, idx) => (
            <a
              key={idx}
              href="https://www.instagram.com/nathaliarobadey/"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square rounded-md overflow-hidden bg-slate-900 block"
            >
              <img
                src={item.img}
                alt={item.title}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Instagram className="w-8 h-8 text-[#E5C989]" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
