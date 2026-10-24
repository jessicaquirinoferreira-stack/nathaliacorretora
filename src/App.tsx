import React, { useState, useEffect } from 'react';
import { 
  Building2, Home as HomeIcon, Search, ShieldCheck, 
  Award, Sparkles, MessageCircle, Phone, Mail, MapPin, 
  ArrowRight, Filter, SlidersHorizontal, Check, Compass 
} from 'lucide-react';
import { api, getAuthToken } from './services/api';
import { Property, Development, SiteSettings, LandingPage } from './types';
import { 
  INITIAL_SETTINGS, 
  INITIAL_PROPERTIES, 
  INITIAL_DEVELOPMENTS, 
  INITIAL_LANDING_PAGES 
} from './data/initialData';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { PropertyCard } from './components/PropertyCard';
import { PropertyModal } from './components/PropertyModal';
import { DevelopmentCard } from './components/DevelopmentCard';
import { VirtualAssistant } from './components/VirtualAssistant';
import { SellEvaluationForm, CustomSearchForm } from './components/LeadForms';
import { AboutSection, ProcessSection, InstagramSection } from './components/InstitutionalSections';
import { Footer } from './components/Footer';
import { CookieBanner } from './components/CookieBanner';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminLayout } from './components/admin/AdminLayout';

import { firestoreService } from './services/firebase';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);
  const [properties, setProperties] = useState<Property[]>([]);
  const [developments, setDevelopments] = useState<Development[]>([]);
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);

  // Property Detail Modal
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Search & Filter State
  const [filterPurpose, setFilterPurpose] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCity, setFilterCity] = useState<string>('all');
  const [filterBedrooms, setFilterBedrooms] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('featured');

  // Admin states
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Check URL pathname for /admin or /landing/:slug
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/admin' || path === '/admin/') {
      setIsAdminOpen(true);
    }
  }, []);

  const loadData = async () => {
    try {
      const [sett, props, devs, lps] = await Promise.all([
        api.getSettings().catch(() => INITIAL_SETTINGS),
        api.getProperties().catch(() => INITIAL_PROPERTIES),
        api.getDevelopments().catch(() => INITIAL_DEVELOPMENTS),
        api.getLandingPages().catch(() => INITIAL_LANDING_PAGES)
      ]);
      setSettings(sett);
      setProperties(props);
      setDevelopments(devs);
      setLandingPages(lps);
    } catch (err) {
      console.error('Failed to load portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Auto-seed admin credentials and initial data in Firestore if empty
    firestoreService.seedAdminUser().catch(() => {});
    firestoreService.seedInitialCatalog(
      INITIAL_PROPERTIES, 
      INITIAL_DEVELOPMENTS, 
      INITIAL_SETTINGS, 
      INITIAL_LANDING_PAGES
    ).catch(() => {});

    const token = getAuthToken();
    if (token) {
      setIsAdminLoggedIn(true);
    }

    // Inscrição em tempo real no Firestore para sincronização instantânea mundial (Vercel & Clientes)
    const unsubProps = firestoreService.subscribeProperties((updatedProps) => {
      if (updatedProps && updatedProps.length > 0) {
        setProperties(updatedProps);
      }
    });

    const unsubDevs = firestoreService.subscribeDevelopments((updatedDevs) => {
      if (updatedDevs && updatedDevs.length > 0) {
        setDevelopments(updatedDevs);
      }
    });

    const unsubSettings = firestoreService.subscribeSettings((updatedSettings) => {
      if (updatedSettings) {
        setSettings(prev => ({ ...prev, ...updatedSettings }));
      }
    });

    const unsubLandingPages = firestoreService.subscribeLandingPages((updatedPages) => {
      if (updatedPages && updatedPages.length > 0) {
        setLandingPages(updatedPages);
      }
    });

    return () => {
      unsubProps();
      unsubDevs();
      unsubSettings();
      unsubLandingPages();
    };
  }, []);

  // Filter properties
  const filteredProperties = properties.filter((p) => {
    if (filterPurpose !== 'all' && p.purpose !== filterPurpose) return false;
    if (filterType !== 'all' && p.type !== filterType) return false;
    if (filterCity !== 'all' && !p.city.toLowerCase().includes(filterCity.toLowerCase())) return false;
    if (filterBedrooms !== 'all' && p.bedrooms < parseInt(filterBedrooms, 10)) return false;
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      const match =
        p.title.toLowerCase().includes(t) ||
        p.referenceCode.toLowerCase().includes(t) ||
        p.neighborhood.toLowerCase().includes(t) ||
        p.city.toLowerCase().includes(t) ||
        p.description.toLowerCase().includes(t);
      if (!match) return false;
    }
    return true;
  });

  // Sort properties
  const sortedProperties = [...filteredProperties].sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    if (sortBy === 'area_desc') return (b.usableArea || 0) - (a.usableArea || 0);
    return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
  });

  const handleHeroSearch = (filters: {
    purpose?: string;
    type?: string;
    city?: string;
    bedrooms?: string;
    search?: string;
  }) => {
    if (filters.purpose) setFilterPurpose(filters.purpose);
    if (filters.type) setFilterType(filters.type);
    if (filters.city) setFilterCity(filters.city);
    if (filters.bedrooms) setFilterBedrooms(filters.bedrooms);
    if (filters.search) setSearchTerm(filters.search);
    setActiveTab('imoveis');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAdmin = () => {
    const token = getAuthToken();
    setIsAdminLoggedIn(Boolean(token));
    setIsAdminOpen(true);
  };

  const featuredProperties = properties.filter((p) => p.isFeatured && p.status === 'published');
  const opportunityProperties = properties.filter((p) => p.isOpportunity && p.status === 'published');

  const defaultWhatsappUrl = `https://wa.me/5522999315940?text=${encodeURIComponent(settings.ctaWhatsappDefault || 'Olá Nathalia, gostaria de atendimento exclusivo.')}`;

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1E293B] flex flex-col font-sans selection:bg-[#C5A059]/30">
      {/* Header */}
      <Header
        settings={settings}
        activeTab={activeTab}
        onNavigate={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {/* TAB 1: HOME */}
        {activeTab === 'home' && (
          <div>
            {/* Cinematic Hero */}
            <Hero
              settings={settings}
              onSearch={handleHeroSearch}
              onExploreClick={() => {
                setActiveTab('imoveis');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* Featured Properties Section */}
            <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                <div>
                  <span className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-bold block mb-1">
                    Seleção de Luxo
                  </span>
                  <h2 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl font-light text-[#0B192C]">
                    Imóveis em <span className="italic font-normal text-[#C5A059]">Destaque</span>
                  </h2>
                </div>

                <button
                  onClick={() => {
                    setActiveTab('imoveis');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center space-x-2 text-xs uppercase tracking-widest font-semibold text-[#0B192C] hover:text-[#C5A059] transition-colors cursor-pointer group"
                >
                  <span>Explorar Todos os Imóveis</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {featuredProperties.length === 0 ? (
                <div className="bg-white p-12 rounded-lg border border-slate-200 text-center text-slate-500">
                  <p>Nenhum imóvel em destaque no momento.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {featuredProperties.map((prop) => (
                    <PropertyCard
                      key={prop.id}
                      property={prop}
                      onSelect={(p) => setSelectedProperty(p)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Developments / Lançamentos Section */}
            {developments.length > 0 && (
              <section className="py-20 bg-white border-y border-slate-200/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center max-w-3xl mx-auto mb-12">
                    <span className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-bold block mb-2">
                      Exclusividade & Lançamentos
                    </span>
                    <h2 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl font-light text-[#0B192C]">
                      Empreendimentos & Condomínios Fechados
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
                      Projetos residenciais inovadores que combinam topografia exuberante, lazer de padrão internacional e segurança perimetral máxima.
                    </p>
                  </div>

                  <div className="space-y-8">
                    {developments.map((dev) => (
                      <DevelopmentCard key={dev.id} development={dev} />
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Opportunities Section */}
            {opportunityProperties.length > 0 && (
              <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                  <div>
                    <span className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-bold block mb-1">
                      Liquidez & Valorização
                    </span>
                    <h2 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl font-light text-[#0B192C]">
                      Oportunidades <span className="italic font-normal text-[#C5A059]">Selecionadas</span>
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {opportunityProperties.map((prop) => (
                    <PropertyCard
                      key={prop.id}
                      property={prop}
                      onSelect={(p) => setSelectedProperty(p)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* About Section */}
            <AboutSection
              settings={settings}
              onNavigateTab={(t) => {
                setActiveTab(t);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* Process Section */}
            <ProcessSection
              onNavigateTab={(t) => {
                setActiveTab(t);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* Instagram Feed Section */}
            <InstagramSection />

            {/* Strategic VIP Conversion Banner */}
            <section className="py-20 bg-[#0B192C] text-white relative overflow-hidden">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
                <div className="inline-flex items-center space-x-2 border border-[#C5A059]/40 bg-[#C5A059]/10 px-4 py-1.5 rounded-full">
                  <Sparkles className="w-4 h-4 text-[#E5C989]" />
                  <span className="text-xs uppercase tracking-[0.2em] font-medium text-[#E5C989]">
                    Consultoria Sob Medida
                  </span>
                </div>

                <h2 className="font-serif-luxury text-3xl sm:text-5xl font-light text-white leading-tight">
                  Deseja um atendimento personalizado e confidencial para seu patrimônio?
                </h2>

                <p className="max-w-2xl mx-auto text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                  Seja para encontrar a residência dos seus sonhos na serra ou negociar um imóvel com discrição absoluta, Nathalia Robadey oferece a consultoria ideal para o seu perfil.
                </p>

                <div className="pt-4 flex flex-wrap justify-center gap-4">
                  <a
                    href={defaultWhatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#C5A059] to-[#D4AF37] hover:from-[#B48F48] hover:to-[#C5A059] text-[#0B192C] font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-sm shadow-xl transition-all duration-200 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>Iniciar Conversa no WhatsApp</span>
                  </a>

                  <button
                    onClick={() => {
                      setActiveTab('contato');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center space-x-2 border border-slate-400 hover:border-white text-white font-semibold text-xs uppercase tracking-widest px-8 py-4 rounded-sm transition-all duration-200 cursor-pointer"
                  >
                    <span>Enviar Mensagem por E-mail</span>
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: IMÓVEIS (FULL CATALOG VIEW WITH FILTERS) */}
        {activeTab === 'imoveis' && (
          <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center max-w-2xl mx-auto">
              <span className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-bold block mb-1">
                Catálogo Exclusivo
              </span>
              <h1 className="font-serif-luxury text-4xl sm:text-5xl text-[#0B192C] font-semibold">
                Portfólio de Imóveis Residenciais
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Explore residências selecionadas com rigor arquitetônico, vista panorâmica e solidez de investimento na Região Serrana e Rio de Janeiro.
              </p>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm mb-10 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Finalidade
                  </label>
                  <select
                    value={filterPurpose}
                    onChange={(e) => setFilterPurpose(e.target.value)}
                    className="w-full bg-[#FAF9F5] border border-slate-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
                  >
                    <option value="all">Todas as finalidades</option>
                    <option value="venda">Venda</option>
                    <option value="aluguel">Aluguel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Tipo de Imóvel
                  </label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full bg-[#FAF9F5] border border-slate-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
                  >
                    <option value="all">Todos os tipos</option>
                    <option value="casa">Casa</option>
                    <option value="cobertura">Cobertura</option>
                    <option value="apartamento">Apartamento</option>
                    <option value="sitio">Sítio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Cidade
                  </label>
                  <select
                    value={filterCity}
                    onChange={(e) => setFilterCity(e.target.value)}
                    className="w-full bg-[#FAF9F5] border border-slate-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
                  >
                    <option value="all">Todas as cidades</option>
                    <option value="Nova Friburgo">Nova Friburgo</option>
                    <option value="Rio de Janeiro">Rio de Janeiro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Dormitórios
                  </label>
                  <select
                    value={filterBedrooms}
                    onChange={(e) => setFilterBedrooms(e.target.value)}
                    className="w-full bg-[#FAF9F5] border border-slate-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
                  >
                    <option value="all">Qualquer quantidade</option>
                    <option value="2">2+ quartos</option>
                    <option value="3">3+ quartos</option>
                    <option value="4">4+ suítes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Buscar por termo
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Ref, bairro ou detalhe..."
                    className="w-full bg-[#FAF9F5] border border-slate-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              {/* Sort & Counter bar */}
              <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <span className="text-slate-600 font-medium">
                  {sortedProperties.length} {sortedProperties.length === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}
                </span>

                <div className="flex items-center space-x-2">
                  <span className="text-slate-500">Ordenar por:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent border-0 font-semibold text-[#0B192C] focus:outline-none cursor-pointer"
                  >
                    <option value="featured">Destaques</option>
                    <option value="price_asc">Menor Preço</option>
                    <option value="price_desc">Maior Preço</option>
                    <option value="area_desc">Maior Área</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Properties Grid */}
            {sortedProperties.length === 0 ? (
              <div className="bg-white p-12 rounded-lg border border-slate-200 text-center space-y-4">
                <HomeIcon className="w-12 h-12 text-[#C5A059] mx-auto opacity-70" />
                <h3 className="font-serif-luxury text-2xl font-semibold text-[#0B192C]">
                  Nenhum imóvel corresponde aos filtros selecionados
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Tente limpar os filtros ou fale com Nathalia para consultar oportunidades reservadas off-market.
                </p>
                <button
                  onClick={() => {
                    setFilterPurpose('all');
                    setFilterType('all');
                    setFilterCity('all');
                    setFilterBedrooms('all');
                    setSearchTerm('');
                  }}
                  className="bg-[#0B192C] text-white px-5 py-2 rounded text-xs uppercase font-semibold hover:bg-[#1E293B]"
                >
                  Limpar Filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sortedProperties.map((prop) => (
                  <PropertyCard
                    key={prop.id}
                    property={prop}
                    onSelect={(p) => setSelectedProperty(p)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: EMPREENDIMENTOS */}
        {activeTab === 'empreendimentos' && (
          <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center max-w-2xl mx-auto">
              <span className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-bold block mb-1">
                Lançamentos Exclusivos
              </span>
              <h1 className="font-serif-luxury text-4xl sm:text-5xl text-[#0B192C] font-semibold">
                Empreendimentos & Condomínios Fechados
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Garanta condições especiais de tabela em fase de pré-lançamento e escolha as unidades mais valorizadas.
              </p>
            </div>

            <div className="space-y-8">
              {developments.map((dev) => (
                <DevelopmentCard key={dev.id} development={dev} />
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: COMPRAR */}
        {activeTab === 'comprar' && (
          <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-6 space-y-6">
                <span className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-bold block">
                  Assessoria de Aquisição
                </span>
                <h1 className="font-serif-luxury text-4xl sm:text-5xl font-light text-[#0B192C] leading-tight">
                  Como Comprar com <span className="italic font-normal text-[#C5A059]">Segurança & Curadoria</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Adquirir um imóvel exige um olhar técnico sobre a documentação imobiliária, estado estrutural e potencial de liquidez futura. Nathalia Robadey atua ao seu lado em cada detalhe.
                </p>

                <div className="space-y-4 pt-4 border-t border-slate-200 text-xs">
                  <div className="flex items-start space-x-3">
                    <Check className="w-4 h-4 text-[#C5A059] flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#0B192C] block">Acesso a Imóveis Off-Market</span>
                      <span className="text-slate-600">Propriedades exclusivas que os proprietários preferem negociar de forma confidencial sem anúncios abertos.</span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-4 h-4 text-[#C5A059] flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#0B192C] block">Auditoria Jurídica Completa</span>
                      <span className="text-slate-600">Verificação rigorosa de certidões cíveis, fiscais e de ônus reais para garantir uma transação 100% segura.</span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-4 h-4 text-[#C5A059] flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#0B192C] block">Pós-Venda Atencioso</span>
                      <span className="text-slate-600">Suporte completo na transição da posse, cartórios de notas e registros de imóveis.</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6">
                <CustomSearchForm />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: VENDER */}
        {activeTab === 'vender' && (
          <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-5 space-y-6">
                <span className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-bold block">
                  Captação & Comercialização
                </span>
                <h1 className="font-serif-luxury text-4xl sm:text-5xl font-light text-[#0B192C] leading-tight">
                  Venda seu Imóvel com a <span className="italic font-normal text-[#C5A059]">Estratégia Certa</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Imóveis singulares não devem ser anunciados de maneira banal. Desenvolvemos uma produção audiovisual refinada, posicionamento editorial e direcionamento qualificado para compradores reais.
                </p>

                <div className="bg-[#0B192C] text-white p-6 rounded-lg space-y-3">
                  <h4 className="font-serif-luxury text-lg font-bold text-[#E5C989]">Diferenciais de Divulgação</h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
                      <span>Fotografia arquitetônica profissional e filmagens com drone</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
                      <span>Qualificação prévia de interessados antes de visitas presenciais</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
                      <span>Total sigilo na divulgação e proteção do endereço</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="lg:col-span-7">
                <SellEvaluationForm />
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: SOBRE NATHALIA */}
        {activeTab === 'sobre' && (
          <div className="pt-24 pb-20">
            <AboutSection
              settings={settings}
              onNavigateTab={(t) => {
                setActiveTab(t);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            <ProcessSection
              onNavigateTab={(t) => {
                setActiveTab(t);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}

        {/* TAB 7: CONTATO */}
        {activeTab === 'contato' && (
          <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-bold block mb-1">
                Fale Conosco
              </span>
              <h1 className="font-serif-luxury text-4xl sm:text-5xl text-[#0B192C] font-semibold">
                Canais de Atendimento Oficial
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-2">
                Converse diretamente com Nathalia Robadey para agendar reuniões privativas ou solicitar consultoria imobiliária.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <a
                href={defaultWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white p-8 rounded-lg border border-slate-200 text-center hover:border-[#C5A059] transition-all hover:shadow-lg group"
              >
                <div className="w-14 h-14 mx-auto rounded-full bg-[#C5A059]/15 flex items-center justify-center text-[#C5A059] mb-4 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-7 h-7 fill-current" />
                </div>
                <h3 className="font-serif-luxury text-xl font-bold text-[#0B192C]">WhatsApp Oficial</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">Atendimento ágil e envio de portfólios</p>
                <span className="text-xs font-bold text-[#C5A059] uppercase tracking-wider block">
                  +55 22 99931-5940
                </span>
              </a>

              <a
                href="tel:+5522999315940"
                className="bg-white p-8 rounded-lg border border-slate-200 text-center hover:border-[#C5A059] transition-all hover:shadow-lg group"
              >
                <div className="w-14 h-14 mx-auto rounded-full bg-[#C5A059]/15 flex items-center justify-center text-[#C5A059] mb-4 group-hover:scale-110 transition-transform">
                  <Phone className="w-7 h-7" />
                </div>
                <h3 className="font-serif-luxury text-xl font-bold text-[#0B192C]">Ligação Direta</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">Atendimento com hora marcada</p>
                <span className="text-xs font-bold text-[#C5A059] uppercase tracking-wider block">
                  (22) 99931-5940
                </span>
              </a>

              <a
                href="mailto:nathaliardmp@gmail.com"
                className="bg-white p-8 rounded-lg border border-slate-200 text-center hover:border-[#C5A059] transition-all hover:shadow-lg group"
              >
                <div className="w-14 h-14 mx-auto rounded-full bg-[#C5A059]/15 flex items-center justify-center text-[#C5A059] mb-4 group-hover:scale-110 transition-transform">
                  <Mail className="w-7 h-7" />
                </div>
                <h3 className="font-serif-luxury text-xl font-bold text-[#0B192C]">E-mail Corporativo</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">Envio de documentos e propostas</p>
                <span className="text-xs font-bold text-[#C5A059] uppercase tracking-wider block truncate">
                  nathaliardmp@gmail.com
                </span>
              </a>
            </div>
          </div>
        )}

        {/* TAB 8: POLÍTICA DE PRIVACIDADE */}
        {activeTab === 'privacidade' && (
          <div className="pt-24 pb-20 max-w-4xl mx-auto px-4 sm:px-6">
            <h1 className="font-serif-luxury text-4xl text-[#0B192C] font-semibold mb-6">
              Política de Privacidade & Proteção de Dados (LGPD)
            </h1>
            <div className="bg-white p-8 rounded-lg border border-slate-200 text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line space-y-4">
              <p>{settings.privacyPolicy}</p>
              <h3 className="font-bold text-[#0B192C] text-base pt-4">1. Coleta e Finalidade dos Dados</h3>
              <p>Os dados fornecidos em nossos formulários (como nome, telefone e e-mail) são utilizados estritamente para responder à sua solicitação comercial, agendamento de visitas ou envio de portfólio de imóveis.</p>
              <h3 className="font-bold text-[#0B192C] text-base pt-2">2. Sigilo e Confidencialidade</h3>
              <p>Não comercializamos, alugamos ou compartilhamos suas informações pessoais com terceiros sem prévia autorização. Todos os dados são armazenados em ambiente seguro com controle de acesso.</p>
            </div>
          </div>
        )}

        {/* TAB 9: POLÍTICA DE COOKIES */}
        {activeTab === 'cookies' && (
          <div className="pt-24 pb-20 max-w-4xl mx-auto px-4 sm:px-6">
            <h1 className="font-serif-luxury text-4xl text-[#0B192C] font-semibold mb-6">
              Política de Cookies
            </h1>
            <div className="bg-white p-8 rounded-lg border border-slate-200 text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line space-y-4">
              <p>{settings.cookiesPolicy}</p>
            </div>
          </div>
        )}

        {/* TAB 10: TERMOS DE USO */}
        {activeTab === 'termos' && (
          <div className="pt-24 pb-20 max-w-4xl mx-auto px-4 sm:px-6">
            <h1 className="font-serif-luxury text-4xl text-[#0B192C] font-semibold mb-6">
              Termos de Uso
            </h1>
            <div className="bg-white p-8 rounded-lg border border-slate-200 text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line space-y-4">
              <p>{settings.termsOfUse}</p>
            </div>
          </div>
        )}
      </main>

      {/* Property Details Modal */}
      {selectedProperty && (
        <PropertyModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}

      {/* Virtual Assistant Floating Widget with Human Avatar */}
      <VirtualAssistant />

      {/* LGPD Cookie Consent Banner */}
      <CookieBanner onOpenPolicy={() => setActiveTab('cookies')} />

      {/* Footer */}
      <Footer
        settings={settings}
        onNavigateTab={(t) => {
          setActiveTab(t);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* Admin Panel Container */}
      {isAdminOpen && (
        isAdminLoggedIn ? (
          <AdminLayout
            siteSettings={settings}
            onRefreshSettings={loadData}
            onClose={() => {
              loadData();
              setIsAdminOpen(false);
            }}
            onLogout={() => {
              setIsAdminLoggedIn(false);
              setIsAdminOpen(false);
            }}
          />
        ) : (
          <AdminLogin
            onSuccess={() => {
              setIsAdminLoggedIn(true);
            }}
            onCancel={() => setIsAdminOpen(false)}
          />
        )
      )}
    </div>
  );
}
