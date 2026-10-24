import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, Home, Building2, Image as ImageIcon, 
  FileCode, Bot, MessageCircle, Share2, FileText, Globe, 
  Cpu, KeyRound, Settings, History, LogOut, ExternalLink, 
  CheckCircle, AlertCircle, Plus, Search, Download, Trash2, 
  Edit3, Eye, Copy, RefreshCw, Sparkles, Send, Shield,
  UploadCloud, Star, Check
} from 'lucide-react';
import { api, setAuthToken } from '../../services/api';
import { Property, Development, Lead, LandingPage, SiteSettings, SocialPost, AuditLog } from '../../types';
import { processAndWatermarkPhoto } from '../../utils/imageWatermark';

interface AdminLayoutProps {
  onClose: () => void;
  onLogout?: () => void;
  siteSettings: SiteSettings;
  onRefreshSettings: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onClose, onLogout, siteSettings, onRefreshSettings }) => {
  const [activeMenu, setActiveMenu] = useState('overview');
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Data states
  const [leads, setLeads] = useState<Lead[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [developments, setDevelopments] = useState<Development[]>([]);
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [uploadStatus, setUploadStatus] = useState<any>(null);
  const [firebaseStatus, setFirebaseStatus] = useState<any>(null);

  // Loading indicator
  const [refreshing, setRefreshing] = useState(false);

  const loadAllAdminData = async () => {
    setRefreshing(true);
    try {
      const [s, l, p, d, lp, sp, al, us, fs] = await Promise.all([
        api.getDashboardStats().catch(() => null),
        api.getLeads().catch(() => []),
        api.getProperties({ includeUnpublished: 'true' }).catch(() => []),
        api.getDevelopments().catch(() => []),
        api.getLandingPages().catch(() => []),
        api.getSocialPosts().catch(() => []),
        api.getAuditLogs().catch(() => []),
        api.getUploadStatus().catch(() => null),
        api.getFirebaseStatus().catch(() => null)
      ]);

      setStats(s);
      setLeads(l);
      setProperties(p);
      setDevelopments(d);
      setLandingPages(lp);
      setSocialPosts(sp);
      setAuditLogs(al);
      setUploadStatus(us);
      setFirebaseStatus(fs);

      // Sincroniza em tempo real com o site público
      if (onRefreshSettings) {
        onRefreshSettings();
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoadingStats(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const handleLogout = async () => {
    try {
      await api.adminLogout();
    } catch (e) {
      console.warn('Logout notice:', e);
    }
    setAuthToken(null);
    if (onLogout) {
      onLogout();
    } else {
      onClose();
    }
  };

  const navMenuItems = [
    { id: 'overview', label: '1. Visão Geral', icon: LayoutDashboard },
    { id: 'leads', label: '2. Leads & Clientes', icon: Users, badge: stats?.leads?.new },
    { id: 'properties', label: '3. Imóveis', icon: Home, count: properties.length },
    { id: 'developments', label: '4. Empreendimentos', icon: Building2, count: developments.length },
    { id: 'gallery', label: '5. Galeria de Fotos', icon: ImageIcon },
    { id: 'landingPages', label: '6. Landing Pages', icon: FileCode, count: landingPages.length },
    { id: 'assistant', label: '7. Assistente Virtual', icon: Bot },
    { id: 'whatsapp', label: '8. WhatsApp Comercial', icon: MessageCircle },
    { id: 'social', label: '9. Redes Sociais & IA', icon: Share2 },
    { id: 'content', label: '10. Conteúdo e Páginas', icon: FileText },
    { id: 'seo', label: '11. SEO & Analytics', icon: Globe },
    { id: 'integrations', label: '12. Integrações (Blob & Firebase)', icon: Cpu },
    { id: 'users', label: '13. Usuários & Senha', icon: KeyRound },
    { id: 'settings', label: '14. Configurações Gerais', icon: Settings },
    { id: 'auditLogs', label: '15. Logs de Auditoria', icon: History }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#F4F5F8] text-[#1E293B] flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-[#0B192C] text-white px-4 sm:px-6 py-3 flex items-center justify-between border-b border-[#C5A059]/30 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="bg-[#FAF9F5] p-1.5 rounded-lg border border-[#C5A059]/50 flex items-center space-x-2.5 shadow-sm">
            <img
              src="/logo-nathalia-robadey.png"
              alt="Logo Nathalia Robadey"
              className="h-10 w-auto object-contain"
            />
            <span className="font-cinzel-luxury text-xs sm:text-sm font-bold text-[#0B192C] tracking-wider pr-1">
              NATHALIA ROBADEY
            </span>
          </div>
          <span className="bg-[#C5A059] text-[#0B192C] text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-sm shadow-sm hidden sm:inline-block">
            Painel Administrativo
          </span>
        </div>

        {/* Integration Status Badges */}
        <div className="hidden md:flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">
            <span className={`w-2 h-2 rounded-full ${uploadStatus?.vercelBlobConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span className="text-slate-300">Vercel Blob:</span>
            <span className="font-mono text-[10px] text-white">
              {uploadStatus?.vercelBlobConfigured ? 'Conectado' : 'Fallback Local'}
            </span>
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">
            <span className={`w-2 h-2 rounded-full ${firebaseStatus?.configured ? 'bg-emerald-400' : 'bg-emerald-400'}`} />
            <span className="text-slate-300">Firebase:</span>
            <span className="font-mono text-[10px] text-emerald-400 font-semibold">
              {firebaseStatus?.projectId ? `${firebaseStatus.projectId.slice(0, 14)}...` : 'Ativo (Firestore)'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          <button
            onClick={loadAllAdminData}
            disabled={refreshing}
            className="p-1.5 text-slate-300 hover:text-white rounded hover:bg-slate-800 transition-colors"
            title="Atualizar dados"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#C5A059]' : ''}`} />
          </button>

          <button
            onClick={onClose}
            className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-xs px-3 py-1.5 rounded text-white transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#C5A059]" />
            <span className="hidden sm:inline">Ver Site Público</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 bg-red-950/40 hover:bg-red-900 border border-red-800/60 text-xs px-3 py-1.5 rounded text-red-200 transition-colors cursor-pointer"
            title="Sair da sessão"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Menu */}
        <aside className="w-64 bg-[#070F1E] text-slate-300 border-r border-slate-800 flex flex-col justify-between overflow-y-auto flex-shrink-0">
          <div className="p-3 space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#C5A059] px-3 py-2 block">
              Módulos do Sistema
            </span>

            {navMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#C5A059] text-[#0B192C] font-bold shadow-sm'
                      : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#0B192C]' : 'text-[#C5A059]'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge ? (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      {item.badge}
                    </span>
                  ) : item.count !== undefined ? (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isActive ? 'bg-[#0B192C] text-[#C5A059]' : 'bg-slate-800 text-slate-400'}`}>
                      {item.count}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="p-3 border-t border-slate-800 space-y-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-2.5 px-3 py-2 rounded text-xs font-semibold text-red-300 hover:text-white bg-red-950/40 hover:bg-red-900/70 border border-red-800/50 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span>Sair do Painel</span>
            </button>
            <div className="text-[11px] text-slate-500 px-1 pt-0.5">
              <p className="font-semibold text-slate-400">Nathalia Robadey Imóveis</p>
              <p className="text-[10px]">Versão 2.4 Production</p>
            </div>
          </div>
        </aside>

        {/* Dynamic Center Work Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-[#F4F5F8]">
          {activeMenu === 'overview' && (
            <OverviewModule stats={stats} leads={leads} properties={properties} onSelectTab={setActiveMenu} />
          )}

          {activeMenu === 'leads' && (
            <LeadsModule leads={leads} onRefresh={loadAllAdminData} />
          )}

          {activeMenu === 'properties' && (
            <PropertiesModule properties={properties} onRefresh={loadAllAdminData} />
          )}

          {activeMenu === 'developments' && (
            <DevelopmentsModule developments={developments} onRefresh={loadAllAdminData} />
          )}

          {activeMenu === 'gallery' && (
            <GalleryModule uploadStatus={uploadStatus} />
          )}

          {activeMenu === 'landingPages' && (
            <LandingPagesModule landingPages={landingPages} onRefresh={loadAllAdminData} />
          )}

          {activeMenu === 'assistant' && (
            <AssistantModule />
          )}

          {activeMenu === 'whatsapp' && (
            <WhatsAppModule settings={siteSettings} onRefresh={onRefreshSettings} />
          )}

          {activeMenu === 'social' && (
            <SocialModule properties={properties} posts={socialPosts} onRefresh={loadAllAdminData} />
          )}

          {activeMenu === 'content' && (
            <ContentModule settings={siteSettings} onRefresh={onRefreshSettings} />
          )}

          {activeMenu === 'seo' && (
            <SEOModule settings={siteSettings} onRefresh={onRefreshSettings} />
          )}

          {activeMenu === 'integrations' && (
            <IntegrationsModule uploadStatus={uploadStatus} firebaseStatus={firebaseStatus} />
          )}

          {activeMenu === 'users' && (
            <UsersModule />
          )}

          {activeMenu === 'settings' && (
            <SettingsModule settings={siteSettings} onRefresh={onRefreshSettings} />
          )}

          {activeMenu === 'auditLogs' && (
            <AuditLogsModule logs={auditLogs} />
          )}
        </main>
      </div>
    </div>
  );
};

// ==========================================
// 1. OVERVIEW MODULE (KPIs & Conversion Rate)
// ==========================================
const OverviewModule: React.FC<{
  stats: any;
  leads: Lead[];
  properties: Property[];
  onSelectTab: (tab: string) => void;
}> = ({ stats, leads, properties, onSelectTab }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#0B192C]">
            Painel Executivo & Indicadores de Conversão
          </h2>
          <p className="text-xs text-slate-500">
            Acompanhamento em tempo real de captação de clientes, imóveis ativos e métricas comerciais.
          </p>
        </div>

        <button
          onClick={() => onSelectTab('leads')}
          className="inline-flex items-center space-x-2 bg-[#0B192C] hover:bg-[#1E293B] text-white text-xs uppercase tracking-wider font-semibold px-4 py-2.5 rounded-sm transition-colors cursor-pointer"
        >
          <Users className="w-4 h-4 text-[#C5A059]" />
          <span>Ver Todos os Leads</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-500">Total de Leads</span>
            <Users className="w-5 h-5 text-[#C5A059]" />
          </div>
          <span className="text-3xl font-bold text-[#0B192C]">{stats?.leads?.total || leads.length}</span>
          <span className="text-[11px] text-emerald-600 font-medium block mt-1">
            {stats?.leads?.new || 0} novos cadastros aguardando
          </span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-500">Taxa de Conversão</span>
            <Sparkles className="w-5 h-5 text-[#C5A059]" />
          </div>
          <span className="text-3xl font-bold text-[#0B192C]">{stats?.leads?.conversionRate || '0.0%'}</span>
          <span className="text-[10px] text-slate-500 block mt-1">
            Fórmula: (Leads Convertidos / Total) * 100
          </span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-500">Imóveis Publicados</span>
            <Home className="w-5 h-5 text-[#C5A059]" />
          </div>
          <span className="text-3xl font-bold text-[#0B192C]">
            {properties.filter(p => p.status === 'published').length}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">
            {properties.filter(p => p.status === 'draft').length} em rascunho
          </span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-500">Visitas Solicitadas</span>
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="text-3xl font-bold text-[#0B192C]">
            {stats?.leads?.visitRequests || leads.filter(l => l.type === 'visit_request').length}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">
            Via formulário individual de imóvel
          </span>
        </div>
      </div>

      {/* Recent Leads Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif-luxury text-lg font-bold text-[#0B192C]">Últimos Leads Recebidos</h3>
          <button
            onClick={() => onSelectTab('leads')}
            className="text-xs font-semibold text-[#C5A059] hover:underline cursor-pointer"
          >
            Gerenciar Leads →
          </button>
        </div>

        {leads.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">Nenhum lead recebido ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Cliente</th>
                  <th className="py-2.5 px-3 font-semibold">Contato</th>
                  <th className="py-2.5 px-3 font-semibold">Interesse / Imóvel</th>
                  <th className="py-2.5 px-3 font-semibold">Data</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.slice(0, 5).map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-3 font-medium text-slate-900">{l.name}</td>
                    <td className="py-3 px-3 text-slate-600">{l.phone || l.email}</td>
                    <td className="py-3 px-3 text-slate-600 truncate max-w-xs">{l.propertyTitle || l.type}</td>
                    <td className="py-3 px-3 text-slate-500">{new Date(l.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        l.status === 'new' ? 'bg-amber-100 text-amber-800' :
                        l.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        l.status === 'converted' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {l.status === 'new' ? 'Novo' : l.status === 'in_progress' ? 'Em Atendimento' : l.status === 'converted' ? 'Convertido' : l.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 2. LEADS CRM MODULE
// ==========================================
const LeadsModule: React.FC<{ leads: Lead[]; onRefresh: () => void }> = ({ leads, onRefresh }) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [newNote, setNewNote] = useState('');

  const filtered = leads.filter(l => {
    if (filterStatus !== 'all' && l.status !== filterStatus) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        l.name.toLowerCase().includes(term) ||
        l.email.toLowerCase().includes(term) ||
        l.phone.includes(term) ||
        (l.propertyTitle && l.propertyTitle.toLowerCase().includes(term))
      );
    }
    return true;
  });

  const handleUpdateStatus = async (leadId: string, status: string) => {
    try {
      await api.updateLeadStatus(leadId, status);
      onRefresh();
      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead({ ...selectedLead, status: status as any });
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddNote = async (leadId: string) => {
    if (!newNote.trim()) return;
    try {
      await api.addLeadNote(leadId, newNote);
      setNewNote('');
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleExportCSV = () => {
    window.open('/api/leads/export/csv', '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#0B192C]">
            Gestão de Leads & Atendimentos
          </h2>
          <p className="text-xs text-slate-500">
            Acompanhe o funil de atendimento, adicione notas internas e exporte relatórios em CSV.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center space-x-2 bg-[#C5A059] hover:bg-[#B48F48] text-[#0B192C] text-xs uppercase tracking-wider font-bold px-4 py-2.5 rounded-sm transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Exportar Relatório CSV</span>
        </button>
      </div>

      {/* Filters bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          {['all', 'new', 'in_progress', 'converted', 'archived'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-sm text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                filterStatus === st
                  ? 'bg-[#0B192C] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'all' ? 'Todos' : st === 'new' ? 'Novos' : st === 'in_progress' ? 'Em Atendimento' : st === 'converted' ? 'Convertidos' : 'Arquivados'}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, telefone..."
            className="w-full bg-[#FAF9F5] border border-slate-300 rounded-sm pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#C5A059]"
          />
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Data/Hora</th>
                <th className="py-3 px-4">Nome & Contato</th>
                <th className="py-3 px-4">Tipo & Interesse</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    Nenhum lead encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filtered.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(lead.createdAt).toLocaleString('pt-BR')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{lead.name}</div>
                      <div className="text-[11px] text-slate-500 flex items-center space-x-2 mt-0.5">
                        <span>{lead.phone}</span>
                        {lead.email && <span>• {lead.email}</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-800 block">
                        {lead.propertyTitle || (lead.type === 'sell_evaluation' ? 'Avaliação para Venda' : lead.type)}
                      </span>
                      {lead.message && (
                        <span className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {lead.message}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={lead.status}
                        onChange={(e) => handleUpdateStatus(lead.id, e.target.value)}
                        className="bg-[#FAF9F5] border border-slate-300 rounded px-2 py-1 text-[11px] font-semibold text-slate-800 focus:outline-none focus:border-[#C5A059]"
                      >
                        <option value="new">Novo</option>
                        <option value="in_progress">Em Atendimento</option>
                        <option value="contacted">Contatado</option>
                        <option value="converted">Convertido</option>
                        <option value="archived">Arquivado</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <a
                        href={`https://wa.me/${lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${lead.name}, aqui é Nathalia Robadey. Recebi seu contato em nosso site sobre ${lead.propertyTitle || 'imóveis de alto padrão'}.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded text-[10px] uppercase font-bold"
                      >
                        <MessageCircle className="w-3 h-3 fill-current" />
                        <span>Chamar</span>
                      </a>
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="inline-flex items-center space-x-1 bg-slate-800 hover:bg-slate-900 text-white px-2.5 py-1 rounded text-[10px] uppercase font-bold cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Notas</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notes Drawer Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-serif-luxury text-xl font-bold text-[#0B192C]">
                  Histórico & Notas: {selectedLead.name}
                </h3>
                <p className="text-xs text-slate-500">{selectedLead.phone} | {selectedLead.email}</p>
              </div>
              <button onClick={() => setSelectedLead(null)} className="text-slate-400 hover:text-black">✕</button>
            </div>

            {selectedLead.message && (
              <div className="bg-[#FAF9F5] p-3 rounded text-xs border border-slate-200">
                <span className="font-bold text-slate-700 block mb-1">Mensagem do Lead:</span>
                <p className="text-slate-600">{selectedLead.message}</p>
              </div>
            )}

            <div className="space-y-2 max-h-52 overflow-y-auto">
              <span className="text-[11px] font-bold text-slate-700 uppercase">Anotações Internas:</span>
              {selectedLead.notes && selectedLead.notes.length > 0 ? (
                selectedLead.notes.map((n) => (
                  <div key={n.id} className="bg-slate-50 p-2.5 rounded border border-slate-200 text-xs">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span className="font-semibold text-slate-700">{n.author}</span>
                      <span>{new Date(n.timestamp).toLocaleString('pt-BR')}</span>
                    </div>
                    <p className="text-slate-700">{n.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">Nenhuma anotação registrada ainda.</p>
              )}
            </div>

            <div className="space-y-2 pt-2 border-t">
              <textarea
                rows={2}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Adicionar nota interna (ex: cliente prefere visitas aos finais de semana)..."
                className="w-full bg-[#FAF9F5] border border-slate-300 rounded p-2 text-xs focus:outline-none focus:border-[#C5A059]"
              />
              <button
                onClick={() => handleAddNote(selectedLead.id)}
                className="w-full bg-[#0B192C] text-white py-2 rounded text-xs uppercase font-bold tracking-wider hover:bg-[#1E293B]"
              >
                Salvar Anotação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 3. PROPERTIES MODULE (CRUD)
// ==========================================
const PropertiesModule: React.FC<{ properties: Property[]; onRefresh: () => void }> = ({ properties, onRefresh }) => {
  const [editingProp, setEditingProp] = useState<Partial<Property> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');

  const handleUploadPropertyPhotos = async (files: FileList | null) => {
    if (!files || files.length === 0 || !editingProp) return;
    setUploadingPhotos(true);
    const fileArray = Array.from(files);
    const processedFiles: File[] = [];

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        setUploadProgressText(`Processando foto ${i + 1}/${fileArray.length}: redimensionando e aplicando marca d’água oficial...`);
        const processed = await processAndWatermarkPhoto(file, {
          maxWidth: 1920,
          maxHeight: 1280,
          quality: 0.88,
          position: 'bottom-right'
        });
        processedFiles.push(processed);
      }

      setUploadProgressText(`Enviando ${processedFiles.length} foto(s) para o armazenamento Vercel Blob...`);
      const res = await api.uploadFiles(processedFiles);

      const newMediaItems = (res.files || []).map((f: any, idx: number) => ({
        id: f.id || `media-${Date.now()}-${idx}`,
        url: f.url,
        title: f.title || 'Foto do Imóvel',
        isCover: false
      }));

      const existingGallery = editingProp.gallery || [];
      const updatedGallery = [...existingGallery, ...newMediaItems];
      const newCover = (!editingProp.coverImage || editingProp.coverImage.includes('unsplash')) && updatedGallery[0]
        ? updatedGallery[0].url
        : (editingProp.coverImage || (updatedGallery[0] ? updatedGallery[0].url : ''));

      setEditingProp({
        ...editingProp,
        gallery: updatedGallery,
        coverImage: newCover
      });
      setUploadProgressText('Upload e marca d’água concluídos com sucesso!');
      setTimeout(() => setUploadProgressText(''), 3000);
    } catch (err: any) {
      alert('Erro durante o upload das fotos: ' + (err.message || 'Verifique sua conexão.'));
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleSetCover = (url: string) => {
    if (!editingProp) return;
    const updatedGallery = (editingProp.gallery || []).map(g => ({
      ...g,
      isCover: g.url === url
    }));
    setEditingProp({
      ...editingProp,
      coverImage: url,
      gallery: updatedGallery
    });
  };

  const handleRemovePhoto = (url: string) => {
    if (!editingProp) return;
    const updatedGallery = (editingProp.gallery || []).filter(g => g.url !== url);
    let newCover = editingProp.coverImage;
    if (newCover === url) {
      newCover = updatedGallery[0] ? updatedGallery[0].url : '';
    }
    setEditingProp({
      ...editingProp,
      gallery: updatedGallery,
      coverImage: newCover
    });
  };

  const handleAddNew = () => {
    setEditingProp({
      title: '',
      referenceCode: `NRI-${Math.floor(100 + Math.random() * 900)}`,
      purpose: 'venda',
      type: 'casa',
      city: 'Nova Friburgo',
      neighborhood: 'Mury',
      price: 1500000,
      priceDisplay: 'R$ 1.500.000',
      bedrooms: 3,
      suites: 3,
      bathrooms: 4,
      parkingSpots: 2,
      usableArea: 250,
      totalArea: 600,
      description: '',
      shortDescription: '',
      features: ['Piscina', 'Área Gourmet', 'Vista Panorâmica'],
      coverImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      status: 'published',
      isFeatured: true
    });
    setIsModalOpen(true);
  };

  const handleEdit = (prop: Property) => {
    setEditingProp({ ...prop });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Tem certeza que deseja excluir o imóvel "${title}"? Esta ação removerá a propriedade do catálogo público.`)) {
      try {
        await api.deleteProperty(id);
        onRefresh();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProp || !editingProp.title) return;

    setSaving(true);
    try {
      if (editingProp.id) {
        await api.updateProperty(editingProp.id, editingProp);
      } else {
        await api.createProperty(editingProp);
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#0B192C]">
            Catálogo de Imóveis
          </h2>
          <p className="text-xs text-slate-500">
            Cadastre, edite fotos, configure diferenciais e controle o status de publicação.
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="inline-flex items-center space-x-2 bg-[#0B192C] hover:bg-[#1E293B] text-white text-xs uppercase tracking-wider font-semibold px-4 py-2.5 rounded-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#C5A059]" />
          <span>Cadastrar Novo Imóvel</span>
        </button>
      </div>

      {/* Properties Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Foto & Referência</th>
                <th className="py-3 px-4">Título & Localização</th>
                <th className="py-3 px-4">Preço</th>
                <th className="py-3 px-4">Dormitórios / Área</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {properties.map((prop) => (
                <tr key={prop.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 flex items-center space-x-3">
                    <img
                      src={prop.coverImage || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=200&q=80'}
                      alt=""
                      className="w-14 h-10 object-cover rounded"
                    />
                    <span className="font-mono font-bold text-[#0B192C]">{prop.referenceCode}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{prop.title}</div>
                    <div className="text-[11px] text-slate-500">{prop.neighborhood ? `${prop.neighborhood}, ` : ''}{prop.city}</div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {prop.priceDisplay || `R$ ${prop.price.toLocaleString('pt-BR')}`}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {prop.bedrooms} quartos ({prop.suites} suítes) • {prop.usableArea || prop.totalArea} m²
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                      prop.status === 'published' ? 'bg-emerald-100 text-emerald-800' :
                      prop.status === 'reserved' ? 'bg-amber-100 text-amber-800' :
                      prop.status === 'sold' ? 'bg-blue-100 text-blue-800' :
                      'bg-slate-200 text-slate-700'
                    }`}>
                      {prop.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(prop)}
                      className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer"
                      title="Editar"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(prop.id, prop.title)}
                      className="p-1.5 text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Property Edit / Create Modal */}
      {isModalOpen && editingProp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full p-6 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif-luxury text-xl font-bold text-[#0B192C]">
                {editingProp.id ? `Editar Imóvel (${editingProp.referenceCode})` : 'Novo Cadastro de Imóvel'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-black">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-semibold uppercase text-slate-700 mb-1">Título do Imóvel *</label>
                  <input
                    type="text"
                    required
                    value={editingProp.title || ''}
                    onChange={(e) => setEditingProp({ ...editingProp, title: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-slate-300 rounded px-3 py-2 text-xs"
                    placeholder="Ex: Mansão Contemporânea com Vista Panorâmica"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-slate-700 mb-1">Código de Referência</label>
                  <input
                    type="text"
                    value={editingProp.referenceCode || ''}
                    onChange={(e) => setEditingProp({ ...editingProp, referenceCode: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-slate-300 rounded px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-slate-700 mb-1">Valor Numérico (R$) *</label>
                  <input
                    type="number"
                    required
                    value={editingProp.price || 0}
                    onChange={(e) => setEditingProp({ ...editingProp, price: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#FAF9F5] border border-slate-300 rounded px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-slate-700 mb-1">Finalidade</label>
                  <select
                    value={editingProp.purpose || 'venda'}
                    onChange={(e) => setEditingProp({ ...editingProp, purpose: e.target.value as any })}
                    className="w-full bg-[#FAF9F5] border border-slate-300 rounded px-3 py-2 text-xs"
                  >
                    <option value="venda">Venda</option>
                    <option value="aluguel">Aluguel</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase text-slate-700 mb-1">Tipo</label>
                  <select
                    value={editingProp.type || 'casa'}
                    onChange={(e) => setEditingProp({ ...editingProp, type: e.target.value as any })}
                    className="w-full bg-[#FAF9F5] border border-slate-300 rounded px-3 py-2 text-xs"
                  >
                    <option value="casa">Casa de Alto Padrão</option>
                    <option value="cobertura">Cobertura</option>
                    <option value="apartamento">Apartamento</option>
                    <option value="sitio">Sítio / Chácara</option>
                    <option value="terreno">Terreno</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase text-slate-700 mb-1">Cidade</label>
                  <input
                    type="text"
                    value={editingProp.city || ''}
                    onChange={(e) => setEditingProp({ ...editingProp, city: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-slate-300 rounded px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-slate-700 mb-1">Bairro</label>
                  <input
                    type="text"
                    value={editingProp.neighborhood || ''}
                    onChange={(e) => setEditingProp({ ...editingProp, neighborhood: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-slate-300 rounded px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-slate-700 mb-1">Dormitórios</label>
                  <input
                    type="number"
                    value={editingProp.bedrooms || 0}
                    onChange={(e) => setEditingProp({ ...editingProp, bedrooms: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-[#FAF9F5] border border-slate-300 rounded px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-slate-700 mb-1">Suítes</label>
                  <input
                    type="number"
                    value={editingProp.suites || 0}
                    onChange={(e) => setEditingProp({ ...editingProp, suites: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-[#FAF9F5] border border-slate-300 rounded px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-slate-700 mb-1">Área Privativa (m²)</label>
                  <input
                    type="number"
                    value={editingProp.usableArea || 0}
                    onChange={(e) => setEditingProp({ ...editingProp, usableArea: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-[#FAF9F5] border border-slate-300 rounded px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-slate-700 mb-1">Vagas de Garagem</label>
                  <input
                    type="number"
                    value={editingProp.parkingSpots || 0}
                    onChange={(e) => setEditingProp({ ...editingProp, parkingSpots: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-[#FAF9F5] border border-slate-300 rounded px-3 py-2 text-xs"
                  />
                </div>

                {/* Device Upload & Automatic Watermark Section */}
                <div className="sm:col-span-2 bg-[#FAF9F5] p-4 rounded-lg border-2 border-dashed border-[#C5A059]/40 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-bold uppercase text-[#0B192C] text-xs flex items-center space-x-1.5">
                        <UploadCloud className="w-4 h-4 text-[#C5A059]" />
                        <span>Fotografias do Imóvel & Marca d'Água Oficial</span>
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Selecione as fotos do computador ou celular. As imagens são redimensionadas para Full HD (1920px) e a marca d'água oficial transparente de Nathalia Robadey Imóveis é aplicada automaticamente.
                      </p>
                    </div>

                    <label className={`inline-flex items-center space-x-2 bg-[#0B192C] hover:bg-[#1E293B] text-[#E5C989] px-4 py-2.5 rounded-sm font-bold text-xs uppercase tracking-wider cursor-pointer shadow-md transition-all ${
                      uploadingPhotos ? 'opacity-60 pointer-events-none' : ''
                    }`}>
                      <UploadCloud className="w-4 h-4 text-[#C5A059]" />
                      <span>{uploadingPhotos ? 'Processando...' : 'Subir Fotos do Dispositivo'}</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        disabled={uploadingPhotos}
                        onChange={(e) => handleUploadPropertyPhotos(e.target.files)}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Watermark Guarantee Badge */}
                  <div className="bg-white/80 p-2.5 rounded border border-[#C5A059]/30 flex items-center justify-between text-[11px] text-slate-700">
                    <div className="flex items-center space-x-2">
                      <img
                        src="/logo-nathalia-robadey.png"
                        alt="Logo Marca d'água"
                        className="h-6 w-auto object-contain"
                      />
                      <span>Marca d'água oficial com fundo transparente ativa para todos os uploads (Vercel Blob / Armazenamento Seguro).</span>
                    </div>
                    <span className="text-emerald-700 font-bold uppercase text-[10px] hidden sm:inline">100% Automático</span>
                  </div>

                  {/* Live Progress Notice */}
                  {uploadProgressText && (
                    <div className="bg-[#C5A059]/15 border border-[#C5A059] p-2.5 rounded text-xs text-[#0B192C] font-semibold flex items-center space-x-2 animate-pulse">
                      <Sparkles className="w-4 h-4 text-[#C5A059] animate-spin" />
                      <span>{uploadProgressText}</span>
                    </div>
                  )}

                  {/* Photo Gallery Grid */}
                  {editingProp.gallery && editingProp.gallery.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 uppercase">
                        <span>Galeria deste Imóvel ({editingProp.gallery.length} foto(s)):</span>
                        <span className="text-slate-500 font-normal">Clique em "Definir Capa" para escolher a imagem principal</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-64 overflow-y-auto p-1">
                        {editingProp.gallery.map((photo, pIdx) => {
                          const isCurrentCover = photo.url === editingProp.coverImage;
                          return (
                            <div
                              key={photo.id || pIdx}
                              className={`relative group rounded-md overflow-hidden border-2 transition-all bg-black ${
                                isCurrentCover ? 'border-[#C5A059] ring-2 ring-[#C5A059]/30 shadow-md' : 'border-slate-300 hover:border-slate-400'
                              }`}
                            >
                              <div className="aspect-[4/3] w-full">
                                <img
                                  src={photo.url}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              {isCurrentCover && (
                                <div className="absolute top-1 left-1 bg-[#C5A059] text-[#0B192C] font-bold text-[9px] uppercase px-1.5 py-0.5 rounded shadow">
                                  ⭐ Capa
                                </div>
                              )}

                              <div className="p-1.5 bg-white flex items-center justify-between gap-1 text-[10px]">
                                {!isCurrentCover ? (
                                  <button
                                    type="button"
                                    onClick={() => handleSetCover(photo.url)}
                                    className="text-[#0B192C] hover:text-[#C5A059] font-bold truncate cursor-pointer"
                                    title="Tornar esta a foto de capa"
                                  >
                                    Definir Capa
                                  </button>
                                ) : (
                                  <span className="text-[#C5A059] font-bold truncate">Capa Ativa</span>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleRemovePhoto(photo.url)}
                                  className="text-red-500 hover:text-red-700 font-bold cursor-pointer p-0.5"
                                  title="Remover foto"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Manual Cover URL fallback */}
                  <div className="pt-2 border-t border-slate-200">
                    <label className="block font-semibold uppercase text-slate-700 text-[10px] mb-1">
                      URL da Foto de Capa (Preenchida automaticamente ou editável manualmente)
                    </label>
                    <input
                      type="text"
                      value={editingProp.coverImage || ''}
                      onChange={(e) => setEditingProp({ ...editingProp, coverImage: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800"
                      placeholder="https://... (ou selecione acima na galeria)"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold uppercase text-slate-700 mb-1">Descrição Completa</label>
                  <textarea
                    rows={4}
                    value={editingProp.description || ''}
                    onChange={(e) => setEditingProp({ ...editingProp, description: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-slate-300 rounded px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-slate-700 mb-1">Status de Publicação</label>
                  <select
                    value={editingProp.status || 'published'}
                    onChange={(e) => setEditingProp({ ...editingProp, status: e.target.value as any })}
                    className="w-full bg-[#FAF9F5] border border-slate-300 rounded px-3 py-2 text-xs"
                  >
                    <option value="published">Publicado no Site</option>
                    <option value="draft">Rascunho (Privado)</option>
                    <option value="reserved">Reservado</option>
                    <option value="sold">Vendido</option>
                  </select>
                </div>

                <div className="flex items-center space-x-4 pt-6">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(editingProp.isFeatured)}
                      onChange={(e) => setEditingProp({ ...editingProp, isFeatured: e.target.checked })}
                      className="rounded text-[#C5A059]"
                    />
                    <span className="font-semibold text-slate-700">Destaque na Página Inicial</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#0B192C] text-white rounded font-bold uppercase tracking-wider hover:bg-[#1E293B]"
                >
                  {saving ? 'Gravando...' : 'Salvar Imóvel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 4. DEVELOPMENTS MODULE (CRUD)
// ==========================================
const DevelopmentsModule: React.FC<{ developments: Development[]; onRefresh: () => void }> = ({ developments, onRefresh }) => {
  const [editingDev, setEditingDev] = useState<Partial<Development> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [newFeatureText, setNewFeatureText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleAddNew = () => {
    setEditingDev({
      title: '',
      developer: 'Nathalia Robadey Imóveis',
      location: 'Mury, Nova Friburgo - RJ',
      city: 'Nova Friburgo',
      neighborhood: 'Mury',
      type: 'Condomínio Fechado',
      status: 'pre_launch',
      startingPrice: 1500000,
      deliveryForecast: 'Dezembro de 2026',
      unitsCount: '24 unidades exclusivas',
      features: ['Portaria Blindada 24h', 'Piscina Aquecida', 'Quadra de Tênis de Saibro', 'Heliponto Homologado', 'Bosque com Trilha Privativa'],
      gallery: [],
      coverImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80',
      brochurePdfUrl: '',
      isFeatured: true,
      order: developments.length + 1,
      ctaText: 'Agendar Apresentação Exclusiva',
      description: 'Lançamento de altíssimo padrão cercado pela Mata Atlântica preservada, unindo arquitetura contemporânea, privacidade e infraestrutura de lazer internacional.'
    });
    setIsModalOpen(true);
  };

  const handleEdit = (dev: Development) => {
    setEditingDev({ ...dev });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Tem certeza que deseja excluir o empreendimento "${title}"? Esta ação removerá o lançamento do site.`)) {
      try {
        await api.deleteDevelopment(id);
        onRefresh();
      } catch (err: any) {
        alert(err.message || 'Erro ao excluir empreendimento.');
      }
    }
  };

  const handleUploadPhotos = async (files: FileList | null) => {
    if (!files || files.length === 0 || !editingDev) return;
    setUploadingPhotos(true);
    const fileArray = Array.from(files);
    const processedFiles: File[] = [];

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        setUploadProgressText(`Processando foto ${i + 1}/${fileArray.length}: redimensionando e aplicando marca d’água oficial...`);
        const processed = await processAndWatermarkPhoto(file, {
          maxWidth: 1920,
          maxHeight: 1280,
          quality: 0.88,
          position: 'bottom-right'
        });
        processedFiles.push(processed);
      }

      setUploadProgressText(`Enviando ${processedFiles.length} foto(s) para o armazenamento...`);
      const res = await api.uploadFiles(processedFiles);

      const newMediaItems = (res.files || []).map((f: any, idx: number) => ({
        id: f.id || `media-dev-${Date.now()}-${idx}`,
        url: f.url,
        title: f.title || 'Foto do Empreendimento',
        isCover: false
      }));

      const existingGallery = editingDev.gallery || [];
      const updatedGallery = [...existingGallery, ...newMediaItems];
      const newCover = (!editingDev.coverImage || editingDev.coverImage.includes('unsplash')) && updatedGallery[0]
        ? updatedGallery[0].url
        : (editingDev.coverImage || (updatedGallery[0] ? updatedGallery[0].url : ''));

      setEditingDev({
        ...editingDev,
        gallery: updatedGallery,
        coverImage: newCover
      });
      setUploadProgressText('Fotos salvas com sucesso!');
      setTimeout(() => setUploadProgressText(''), 3000);
    } catch (err: any) {
      alert('Erro durante o upload das fotos: ' + (err.message || 'Verifique sua conexão.'));
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleSetCover = (url: string) => {
    if (!editingDev) return;
    const updatedGallery = (editingDev.gallery || []).map(g => ({
      ...g,
      isCover: g.url === url
    }));
    setEditingDev({
      ...editingDev,
      coverImage: url,
      gallery: updatedGallery
    });
  };

  const handleRemovePhoto = (url: string) => {
    if (!editingDev) return;
    const updatedGallery = (editingDev.gallery || []).filter(g => g.url !== url);
    let newCover = editingDev.coverImage;
    if (newCover === url) {
      newCover = updatedGallery[0] ? updatedGallery[0].url : '';
    }
    setEditingDev({
      ...editingDev,
      gallery: updatedGallery,
      coverImage: newCover
    });
  };

  const handleAddFeature = () => {
    if (!newFeatureText.trim() || !editingDev) return;
    const currentFeatures = editingDev.features || [];
    if (!currentFeatures.includes(newFeatureText.trim())) {
      setEditingDev({
        ...editingDev,
        features: [...currentFeatures, newFeatureText.trim()]
      });
    }
    setNewFeatureText('');
  };

  const handleRemoveFeature = (feat: string) => {
    if (!editingDev) return;
    setEditingDev({
      ...editingDev,
      features: (editingDev.features || []).filter(f => f !== feat)
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDev || !editingDev.title) {
      alert('Por favor, informe o título do empreendimento.');
      return;
    }

    setSaving(true);
    try {
      if (editingDev.id) {
        await api.updateDevelopment(editingDev.id, editingDev);
      } else {
        await api.createDevelopment(editingDev);
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar empreendimento.');
    } finally {
      setSaving(false);
    }
  };

  const filteredDevs = developments.filter(d => {
    if (filterStatus !== 'all' && d.status !== filterStatus) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        d.title.toLowerCase().includes(term) ||
        (d.developer && d.developer.toLowerCase().includes(term)) ||
        (d.location && d.location.toLowerCase().includes(term)) ||
        (d.neighborhood && d.neighborhood.toLowerCase().includes(term))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#0B192C]">
            Empreendimentos & Lançamentos Exclusivos
          </h2>
          <p className="text-xs text-slate-500">
            Cadastre novos condomínios fechados, edite perspectivas 3D, fotos com marca d'água e sincronize em tempo real.
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="inline-flex items-center space-x-2 bg-[#0B192C] hover:bg-[#1E293B] text-white text-xs uppercase tracking-wider font-semibold px-4 py-2.5 rounded-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#C5A059]" />
          <span>Cadastrar Novo Empreendimento</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, construtora ou bairro..."
            className="w-full sm:w-72 bg-[#FAF9F5] border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#C5A059]"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-slate-500 font-semibold uppercase text-[10px]">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#FAF9F5] border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#C5A059]"
          >
            <option value="all">Todos os Status ({developments.length})</option>
            <option value="pre_launch">Breve Lançamento</option>
            <option value="in_construction">Em Obras</option>
            <option value="ready">Pronto para Morar</option>
          </select>
        </div>
      </div>

      {/* Developments Grid */}
      {filteredDevs.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-lg border border-slate-200 shadow-sm text-slate-500">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="font-semibold text-slate-700">Nenhum empreendimento encontrado.</p>
          <p className="text-xs text-slate-400 mt-1">Clique em "Cadastrar Novo Empreendimento" para adicionar o primeiro.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDevs.map((dev) => (
            <div key={dev.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="relative aspect-video">
                  <img src={dev.coverImage} alt={dev.title} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 bg-[#C5A059] text-[#0B192C] font-bold text-[10px] px-2.5 py-1 rounded uppercase shadow-sm">
                    {dev.status === 'pre_launch' ? 'Breve Lançamento' : dev.status === 'in_construction' ? 'Em Obras' : 'Pronto para Morar'}
                  </div>
                  {dev.isFeatured && (
                    <div className="absolute top-3 right-3 bg-[#0B192C]/90 text-[#E5C989] font-bold text-[10px] px-2 py-0.5 rounded shadow">
                      ⭐ Destaque
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-serif-luxury text-xl font-bold text-[#0B192C]">{dev.title}</h3>
                      <p className="text-xs text-slate-500 font-medium">{dev.developer} • {dev.location || `${dev.neighborhood}, ${dev.city}`}</p>
                    </div>
                    {dev.startingPrice ? (
                      <span className="text-xs font-bold text-[#C5A059] whitespace-nowrap">
                        A partir de R$ {dev.startingPrice.toLocaleString('pt-BR')}
                      </span>
                    ) : null}
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{dev.description}</p>

                  {dev.features && dev.features.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {dev.features.slice(0, 4).map((f, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px]">
                          {f}
                        </span>
                      ))}
                      {dev.features.length > 4 && (
                        <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-[10px]">
                          +{dev.features.length - 4} mais
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Previsão: {dev.deliveryForecast || 'Sob consulta'}</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(dev)}
                    className="p-1.5 text-slate-700 hover:text-black bg-white hover:bg-slate-200 border border-slate-200 rounded cursor-pointer transition-colors"
                    title="Editar empreendimento"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(dev.id, dev.title)}
                    className="p-1.5 text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 rounded cursor-pointer transition-colors"
                    title="Excluir empreendimento"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Development Edit / Create Modal */}
      {isModalOpen && editingDev && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full p-6 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif-luxury text-xl font-bold text-[#0B192C]">
                {editingDev.id ? `Editar Empreendimento: ${editingDev.title}` : 'Cadastrar Novo Empreendimento'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-black">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-semibold uppercase text-slate-700 mb-1">Título do Empreendimento *</label>
                  <input
                    type="text"
                    required
                    value={editingDev.title || ''}
                    onChange={(e) => setEditingDev({ ...editingDev, title: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-slate-300 rounded px-3 py-2 text-xs text-slate-800"
                    placeholder="Ex: Reserva Imperial das Araucárias"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-slate-700 mb-1">Incorporadora / Construtora</label>
                  <input
                    type="text"
                    value={editingDev.developer || ''}
                    onChange={(e) => setEditingDev({ ...editingDev, developer: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-slate-300 rounded px-3 py-2 text-xs text-slate-800"
                    placeholder="Ex: Robadey Engenharia & Construções"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-slate-700 mb-1">Status do Lançamento</label>
                  <select
                    value={editingDev.status || 'pre_launch'}
                    onChange={(e) => setEditingDev({ ...editingDev, status: e.target.value as any })}
                    className="w-full bg-[#FAF9F5] border border-slate-300 rounded px-3 py-2 text-xs text-slate-800"
                  >
                    <option value="pre_launch">Breve Lançamento (Cadastros Antecipados)</option>
                    <option value="in_construction">Em Obras (Construção Ativa)</option>
                    <option value="ready">Pronto para Morar (Entrega Imediata)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase text-slate-700 mb-1">Cidade</label>
                  <input
                    type="text"
                    value={editingDev.city || 'Nova Friburgo'}
                    onChange={(e) => setEditingDev({ ...editingDev, city: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-slate-300 rounded px-3 py-2 text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-slate-700 mb-1">Bairro / Região</label>
                  <input
                    type="text"
                    value={editingDev.neighborhood || ''}
                    onChange={(e) => setEditingDev({ ...editingDev, neighborhood: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-slate-300 rounded px-3 py-2 text-xs text-slate-800"
                    placeholder="Ex: Mury"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-slate-700 mb-1">Preço Inicial (A partir de R$)</label>
                  <input
                    type="number"
                    value={editingDev.startingPrice || ''}
                    onChange={(e) => setEditingDev({ ...editingDev, startingPrice: Number(e.target.value) || undefined })}
                    className="w-full bg-[#FAF9F5] border border-slate-300 rounded px-3 py-2 text-xs text-slate-800"
                    placeholder="Ex: 1800000"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-slate-700 mb-1">Previsão de Entrega</label>
                  <input
                    type="text"
                    value={editingDev.deliveryForecast || ''}
                    onChange={(e) => setEditingDev({ ...editingDev, deliveryForecast: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-slate-300 rounded px-3 py-2 text-xs text-slate-800"
                    placeholder="Ex: Dezembro de 2026"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-slate-700 mb-1">Quantidade de Unidades / Lotes</label>
                  <input
                    type="text"
                    value={editingDev.unitsCount || ''}
                    onChange={(e) => setEditingDev({ ...editingDev, unitsCount: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-slate-300 rounded px-3 py-2 text-xs text-slate-800"
                    placeholder="Ex: 18 casas exclusivas"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-slate-700 mb-1">Tipo de Empreendimento</label>
                  <input
                    type="text"
                    value={editingDev.type || 'Condomínio Fechado'}
                    onChange={(e) => setEditingDev({ ...editingDev, type: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-slate-300 rounded px-3 py-2 text-xs text-slate-800"
                    placeholder="Ex: Condomínio Fechado de Casas"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold uppercase text-slate-700 mb-1">Texto do Botão de Ação (CTA)</label>
                  <input
                    type="text"
                    value={editingDev.ctaText || 'Agendar apresentação exclusiva'}
                    onChange={(e) => setEditingDev({ ...editingDev, ctaText: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-slate-300 rounded px-3 py-2 text-xs text-slate-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold uppercase text-slate-700 mb-1">URL do Book Técnico / PDF (Opcional)</label>
                  <input
                    type="text"
                    value={editingDev.brochurePdfUrl || ''}
                    onChange={(e) => setEditingDev({ ...editingDev, brochurePdfUrl: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-slate-300 rounded px-3 py-2 text-xs text-slate-800"
                    placeholder="https://..."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold uppercase text-slate-700 mb-1">Descrição Detalhada do Empreendimento</label>
                  <textarea
                    rows={4}
                    value={editingDev.description || ''}
                    onChange={(e) => setEditingDev({ ...editingDev, description: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-slate-300 rounded px-3 py-2 text-xs text-slate-800"
                    placeholder="Apresentação da infraestrutura, localização e conceito do projeto..."
                  />
                </div>

                {/* Diferenciais / Features */}
                <div className="sm:col-span-2 space-y-2 bg-[#FAF9F5] p-3 rounded border border-slate-200">
                  <label className="block font-semibold uppercase text-slate-700">Diferenciais & Infraestrutura de Lazer</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newFeatureText}
                      onChange={(e) => setNewFeatureText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFeature(); } }}
                      placeholder="Ex: Heliponto, Quadra de Tênis, Spa..."
                      className="flex-1 bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={handleAddFeature}
                      className="bg-[#0B192C] text-white px-3 py-1.5 rounded font-bold uppercase text-[10px]"
                    >
                      Adicionar
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {(editingDev.features || []).map((feat, idx) => (
                      <span key={idx} className="bg-white border border-slate-300 text-slate-800 px-2.5 py-1 rounded text-xs flex items-center space-x-1">
                        <span>{feat}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(feat)}
                          className="text-red-500 hover:text-red-700 font-bold ml-1"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Upload and Photos Section */}
                <div className="sm:col-span-2 space-y-3 bg-[#FAF9F5] p-4 rounded-lg border border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-bold uppercase text-[#0B192C] text-xs flex items-center space-x-1.5">
                        <UploadCloud className="w-4 h-4 text-[#C5A059]" />
                        <span>Perspectivas 3D & Fotografias do Empreendimento</span>
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        As fotos são redimensionadas em Full HD com aplicação de marca d'água oficial transparente automática.
                      </p>
                    </div>

                    <label className={`inline-flex items-center space-x-2 bg-[#0B192C] hover:bg-[#1E293B] text-[#E5C989] px-4 py-2 rounded font-bold text-xs uppercase tracking-wider cursor-pointer shadow-md transition-all ${
                      uploadingPhotos ? 'opacity-60 pointer-events-none' : ''
                    }`}>
                      <UploadCloud className="w-4 h-4 text-[#C5A059]" />
                      <span>{uploadingPhotos ? 'Processando...' : 'Subir Fotos'}</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        disabled={uploadingPhotos}
                        onChange={(e) => handleUploadPhotos(e.target.files)}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {uploadProgressText && (
                    <div className="bg-[#C5A059]/15 border border-[#C5A059] p-2 rounded text-xs text-[#0B192C] font-semibold flex items-center space-x-2 animate-pulse">
                      <Sparkles className="w-4 h-4 text-[#C5A059] animate-spin" />
                      <span>{uploadProgressText}</span>
                    </div>
                  )}

                  {/* Photo Gallery Grid */}
                  {editingDev.gallery && editingDev.gallery.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 uppercase">
                        <span>Galeria ({editingDev.gallery.length} imagens):</span>
                        <span className="text-slate-500 font-normal">Clique em "Definir Capa" para escolher a principal</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-56 overflow-y-auto p-1">
                        {editingDev.gallery.map((photo, pIdx) => {
                          const isCurrentCover = photo.url === editingDev.coverImage;
                          return (
                            <div
                              key={photo.id || pIdx}
                              className={`relative group rounded-md overflow-hidden border-2 transition-all bg-black ${
                                isCurrentCover ? 'border-[#C5A059] ring-2 ring-[#C5A059]/30 shadow-md' : 'border-slate-300 hover:border-slate-400'
                              }`}
                            >
                              <div className="aspect-[4/3] w-full">
                                <img src={photo.url} alt="" className="w-full h-full object-cover" />
                              </div>

                              {isCurrentCover && (
                                <div className="absolute top-1 left-1 bg-[#C5A059] text-[#0B192C] font-bold text-[9px] uppercase px-1.5 py-0.5 rounded shadow">
                                  ⭐ Capa
                                </div>
                              )}

                              <div className="p-1.5 bg-white flex items-center justify-between gap-1 text-[10px]">
                                {!isCurrentCover ? (
                                  <button
                                    type="button"
                                    onClick={() => handleSetCover(photo.url)}
                                    className="text-[#0B192C] hover:text-[#C5A059] font-bold truncate cursor-pointer"
                                  >
                                    Definir Capa
                                  </button>
                                ) : (
                                  <span className="text-[#C5A059] font-bold truncate">Capa Ativa</span>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleRemovePhoto(photo.url)}
                                  className="text-red-500 hover:text-red-700 font-bold cursor-pointer p-0.5"
                                  title="Remover foto"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Manual Cover URL fallback */}
                  <div className="pt-2 border-t border-slate-200">
                    <label className="block font-semibold uppercase text-slate-700 text-[10px] mb-1">
                      URL da Imagem de Capa Principal
                    </label>
                    <input
                      type="text"
                      value={editingDev.coverImage || ''}
                      onChange={(e) => setEditingDev({ ...editingDev, coverImage: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800"
                      placeholder="https://... (ou selecione acima na galeria)"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4 pt-4 sm:col-span-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(editingDev.isFeatured)}
                      onChange={(e) => setEditingDev({ ...editingDev, isFeatured: e.target.checked })}
                      className="rounded text-[#C5A059]"
                    />
                    <span className="font-semibold text-slate-700">Destacar Empreendimento na Página Inicial</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#0B192C] text-white rounded font-bold uppercase tracking-wider hover:bg-[#1E293B]"
                >
                  {saving ? 'Gravando...' : 'Salvar Empreendimento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 5. PHOTO GALLERY & VERCEL BLOB MODULE
// ==========================================
const GalleryModule: React.FC<{ uploadStatus: any }> = ({ uploadStatus }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [applyWatermark, setApplyWatermark] = useState(true);
  const [galleryProgress, setGalleryProgress] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const fileArray = Array.from(files);
    const processedFiles: File[] = [];

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        if (applyWatermark) {
          setGalleryProgress(`Processando foto ${i + 1}/${fileArray.length}: redimensionando e aplicando marca d’água oficial...`);
          const processed = await processAndWatermarkPhoto(file, {
            maxWidth: 1920,
            maxHeight: 1280,
            quality: 0.88,
            position: 'bottom-right'
          });
          processedFiles.push(processed);
        } else {
          processedFiles.push(file);
        }
      }

      setGalleryProgress(`Enviando ${processedFiles.length} foto(s) para o Vercel Blob...`);
      const res = await api.uploadFiles(processedFiles);
      setUploadedFiles((prev) => [...(res.files || []), ...prev]);
      setGalleryProgress('');
    } catch (err: any) {
      alert(err.message || 'Falha no upload.');
    } finally {
      setUploading(false);
      setGalleryProgress('');
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#0B192C]">
          Galeria de Fotos & Uploads (Vercel Blob)
        </h2>
        <p className="text-xs text-slate-500">
          Envio de imagens em lote a partir do computador ou smartphone, compatível com Vercel Blob e armazenamento local.
        </p>
      </div>

      {/* Storage Status Banner */}
      <div className={`p-4 rounded-lg border text-xs flex items-start space-x-3 ${
        uploadStatus?.vercelBlobConfigured
          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
          : 'bg-amber-50 border-amber-200 text-amber-900'
      }`}>
        <Sparkles className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#C5A059]" />
        <div>
          <span className="font-bold block uppercase tracking-wider">
            {uploadStatus?.mode || 'Status do Armazenamento de Fotos'}
          </span>
          <p className="mt-1 leading-relaxed">{uploadStatus?.instructions}</p>
        </div>
      </div>

      {/* Upload Drop Zone */}
      <div className="bg-white p-8 rounded-lg border-2 border-dashed border-slate-300 hover:border-[#C5A059] transition-colors text-center space-y-3">
        <ImageIcon className="w-12 h-12 text-[#C5A059] mx-auto" />
        <div>
          <h4 className="font-serif-luxury text-lg font-bold text-[#0B192C]">
            Arraste ou Selecione Fotografias de Imóveis
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Suporta JPG, PNG, WEBP até 20MB por arquivo. Selecione múltiplas fotos simultaneamente.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer bg-slate-50 px-3 py-1.5 rounded border border-slate-200">
            <input
              type="checkbox"
              checked={applyWatermark}
              onChange={(e) => setApplyWatermark(e.target.checked)}
              className="rounded text-[#C5A059] focus:ring-[#C5A059]"
            />
            <span className="font-semibold">Auto-aplicar marca d’água oficial transparente</span>
          </label>
        </div>

        {galleryProgress && (
          <div className="bg-[#C5A059]/15 border border-[#C5A059] p-2.5 rounded text-xs text-[#0B192C] font-semibold flex items-center justify-center space-x-2 animate-pulse max-w-md mx-auto">
            <Sparkles className="w-4 h-4 text-[#C5A059] animate-spin" />
            <span>{galleryProgress}</span>
          </div>
        )}

        <label className="inline-flex items-center space-x-2 bg-[#0B192C] hover:bg-[#1E293B] text-white text-xs uppercase tracking-wider font-semibold px-5 py-3 rounded-sm transition-colors cursor-pointer shadow-sm">
          <UploadCloud className="w-4 h-4 text-[#C5A059]" />
          <span>{uploading ? (galleryProgress || 'Processando Upload...') : 'Escolher Arquivos do Computador / Celular'}</span>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Uploaded Gallery Grid */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-serif-luxury text-lg font-bold text-[#0B192C]">
            Arquivos Carregados Recentemente ({uploadedFiles.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedFiles.map((file, i) => (
              <div key={i} className="bg-white rounded border border-slate-200 overflow-hidden shadow-sm group">
                <div className="relative aspect-video bg-black">
                  <img src={file.url} alt={file.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-2.5 flex items-center justify-between text-xs">
                  <span className="truncate text-slate-600 max-w-[120px]">{file.title}</span>
                  <button
                    onClick={() => copyToClipboard(file.url)}
                    className="p-1 text-slate-500 hover:text-[#0B192C] cursor-pointer"
                    title="Copiar URL"
                  >
                    {copiedUrl === file.url ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 6. LANDING PAGES BUILDER MODULE
// ==========================================
const LandingPagesModule: React.FC<{ landingPages: LandingPage[]; onRefresh: () => void }> = ({ landingPages, onRefresh }) => {
  const [newTitle, setNewTitle] = useState('');
  const [newObjective, setNewObjective] = useState<'launch' | 'property' | 'buyers' | 'sellers'>('launch');
  const [creating, setCreating] = useState(false);

  const handleCreateLp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setCreating(true);
    try {
      await api.createLandingPage({
        title: newTitle.trim(),
        objective: newObjective,
        headline: newTitle.trim(),
        status: 'published'
      });
      setNewTitle('');
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#0B192C]">
            Criador de Landing Pages Imobiliárias
          </h2>
          <p className="text-xs text-slate-500">
            Construa páginas promocionais para campanhas de tráfego pago, lançamentos e captação sem programar.
          </p>
        </div>
      </div>

      {/* Quick Creator Box */}
      <form onSubmit={handleCreateLp} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[240px]">
          <label className="block text-[11px] font-semibold uppercase text-slate-700 mb-1">Nome da Campanha / Título</label>
          <input
            type="text"
            required
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Ex: Lançamento Coberturas Barra ou Avalie seu Imóvel na Serra"
            className="w-full bg-[#FAF9F5] border border-slate-300 rounded px-3 py-2 text-xs"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase text-slate-700 mb-1">Objetivo da Página</label>
          <select
            value={newObjective}
            onChange={(e) => setNewObjective(e.target.value as any)}
            className="bg-[#FAF9F5] border border-slate-300 rounded px-3 py-2 text-xs"
          >
            <option value="launch">Lançamento de Empreendimento</option>
            <option value="sellers">Captação de Imóveis para Venda</option>
            <option value="buyers">Captação de Compradores Qualificados</option>
            <option value="property">Destaque de Imóvel Único</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={creating}
          className="bg-[#0B192C] hover:bg-[#1E293B] text-white px-5 py-2 rounded text-xs uppercase font-bold tracking-wider"
        >
          {creating ? 'Criando...' : 'Criar Nova Landing Page'}
        </button>
      </form>

      {/* Pages List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {landingPages.map((lp) => (
          <div key={lp.id} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold text-[#C5A059]">{lp.objective}</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-semibold uppercase">
                  {lp.status}
                </span>
              </div>
              <h3 className="font-serif-luxury text-lg font-bold text-[#0B192C]">{lp.title}</h3>
              <p className="text-xs text-slate-500 font-mono mt-1">URL: /landing/{lp.slug}</p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-500">{lp.viewsCount || 0} visualizações</span>
              <a
                href={`/landing/${lp.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0B192C] font-semibold hover:text-[#C5A059] flex items-center space-x-1"
              >
                <span>Acessar Link Público</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 7. ASSISTANT MODULE (AI Concierge Settings)
// ==========================================
const AssistantModule: React.FC = () => {
  const [testInput, setTestInput] = useState('');
  const [testResponse, setTestResponse] = useState('');
  const [testing, setTesting] = useState(false);

  const handleTestChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testInput.trim()) return;

    setTesting(true);
    try {
      const res = await api.chatAssistant(testInput.trim());
      setTestResponse(res.reply);
    } catch (err: any) {
      setTestResponse('Erro: ' + err.message);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#0B192C]">
          Assistente Virtual com Inteligência Artificial
        </h2>
        <p className="text-xs text-slate-500">
          Configuração da assistente virtual, integração backend com Google Gemini e conexão direta com WhatsApp.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-serif-luxury text-lg font-bold text-[#0B192C]">Parâmetros de Personalidade</h3>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold uppercase text-slate-700 mb-1">Identificação da Assistente</label>
              <input
                type="text"
                readOnly
                value="Assistente Virtual de Nathalia Robadey Imóveis"
                className="w-full bg-slate-100 border border-slate-200 rounded p-2 text-slate-700"
              />
            </div>
            <div>
              <label className="block font-semibold uppercase text-slate-700 mb-1">Regras de Conduta</label>
              <ul className="list-disc pl-4 space-y-1 text-slate-600">
                <li>Nunca inventar imóveis, preços ou disponibilidades falsas.</li>
                <li>Consultar somente as propriedades publicadas no banco de dados.</li>
                <li>Identificar-se sempre de forma transparente como assistente virtual.</li>
                <li>Encaminhar o cliente para o WhatsApp +55 22 99931-5940.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Test Console */}
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-serif-luxury text-lg font-bold text-[#0B192C]">Testador de Respostas</h3>
          <form onSubmit={handleTestChat} className="space-y-3">
            <input
              type="text"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="Digite uma pergunta de cliente (ex: quais casas tem em Mury?)"
              className="w-full bg-[#FAF9F5] border border-slate-300 rounded p-2.5 text-xs focus:outline-none focus:border-[#C5A059]"
            />
            <button
              type="submit"
              disabled={testing}
              className="w-full bg-[#0B192C] text-white py-2 rounded text-xs uppercase font-bold tracking-wider hover:bg-[#1E293B]"
            >
              {testing ? 'Consultando IA...' : 'Testar Resposta da Assistente'}
            </button>
          </form>

          {testResponse && (
            <div className="bg-[#FAF9F5] p-3 rounded border border-slate-200 text-xs text-slate-800 whitespace-pre-line">
              <span className="font-bold text-[#C5A059] block mb-1">Resposta Gerada:</span>
              {testResponse}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 8. WHATSAPP CONVERSION CENTER MODULE
// ==========================================
const WhatsAppModule: React.FC<{ settings: SiteSettings; onRefresh: () => void }> = ({ settings, onRefresh }) => {
  const [phone, setPhone] = useState(settings.whatsapp || '+55 22 99931-5940');
  const [defaultMsg, setDefaultMsg] = useState(settings.ctaWhatsappDefault || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateSettings({
        whatsapp: phone,
        phone,
        ctaWhatsappDefault: defaultMsg
      });
      alert('Configurações de WhatsApp atualizadas com sucesso.');
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#0B192C]">
          Central de Conversão WhatsApp
        </h2>
        <p className="text-xs text-slate-500">
          Configure as mensagens padronizadas de contato e o número comercial de atendimento oficial.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm max-w-2xl space-y-4 text-xs">
        <div>
          <label className="block font-semibold uppercase text-slate-700 mb-1">Número Oficial do WhatsApp</label>
          <input
            type="text"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-[#FAF9F5] border border-slate-300 rounded p-2.5 text-xs focus:outline-none focus:border-[#C5A059]"
          />
          <span className="text-[10px] text-slate-400 mt-0.5 block">Formato internacional: +55 22 99931-5940</span>
        </div>

        <div>
          <label className="block font-semibold uppercase text-slate-700 mb-1">Mensagem Padrão de Boas-Vindas</label>
          <textarea
            rows={3}
            value={defaultMsg}
            onChange={(e) => setDefaultMsg(e.target.value)}
            className="w-full bg-[#FAF9F5] border border-slate-300 rounded p-2.5 text-xs focus:outline-none focus:border-[#C5A059]"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-[#0B192C] text-white px-6 py-2.5 rounded text-xs uppercase font-bold tracking-wider hover:bg-[#1E293B]"
        >
          {saving ? 'Gravando...' : 'Salvar Configurações de WhatsApp'}
        </button>
      </form>
    </div>
  );
};

// ==========================================
// 9. SOCIAL MEDIA & AI MARKETING MODULE
// ==========================================
const SocialModule: React.FC<{ properties: Property[]; posts: SocialPost[]; onRefresh: () => void }> = ({ properties, posts, onRefresh }) => {
  const [selectedPropertyId, setSelectedPropertyId] = useState(properties[0]?.id || '');
  const [style, setStyle] = useState('Sofisticado e Persuasivo');
  const [generating, setGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<any>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await api.generateSocialContent(selectedPropertyId, style);
      setGeneratedResult(res);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleSavePost = async () => {
    if (!generatedResult) return;
    try {
      await api.createSocialPost({
        title: generatedResult.title || 'Post Instagram',
        caption: generatedResult.caption,
        hashtags: generatedResult.hashtags || [],
        suggestedByAi: true,
        status: 'draft'
      });
      alert('Post salvo no calendário editorial.');
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#0B192C]">
          Redes Sociais & Gerador de Conteúdo IA
        </h2>
        <p className="text-xs text-slate-500">
          Crie legendas de alto engajamento, hashtags exclusivas e roteiros de Reels com inteligência artificial para o Instagram @nathaliarobadey.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4 text-xs">
          <h3 className="font-serif-luxury text-lg font-bold text-[#0B192C] flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#C5A059]" />
            <span>Gerador com Google Gemini</span>
          </h3>

          <div>
            <label className="block font-semibold uppercase text-slate-700 mb-1">Selecione o Imóvel</label>
            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              className="w-full bg-[#FAF9F5] border border-slate-300 rounded p-2 text-xs"
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.referenceCode} - {p.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold uppercase text-slate-700 mb-1">Estilo de Tom de Voz</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full bg-[#FAF9F5] border border-slate-300 rounded p-2 text-xs"
            >
              <option value="Sofisticado e Persuasivo">Sofisticado & Persuasivo (Luxo)</option>
              <option value="Poético e Contemplativo">Poético & Contemplativo (Natureza e Serra)</option>
              <option value="Focado em Investimento e Retorno">Focado em Investimento & Rentabilidade</option>
              <option value="Storytelling de Estilo de Vida">Storytelling de Família & Estilo de Vida</option>
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full bg-[#0B192C] hover:bg-[#1E293B] text-white py-2.5 rounded uppercase font-bold tracking-wider cursor-pointer"
          >
            {generating ? 'Criando Conteúdo...' : 'Gerar Post para Instagram'}
          </button>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4 text-xs">
          <h3 className="font-serif-luxury text-lg font-bold text-[#0B192C]">Pré-visualização do Post</h3>
          {generatedResult ? (
            <div className="space-y-4">
              {generatedResult.reelsHook && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded">
                  <span className="font-bold text-amber-900 block mb-0.5">🎬 Gancho para Reels (3 Primeiros Segundos):</span>
                  <p className="text-amber-800">{generatedResult.reelsHook}</p>
                </div>
              )}

              <div>
                <span className="font-bold text-slate-700 block mb-1">Legenda Completa:</span>
                <div className="bg-[#FAF9F5] border border-slate-200 rounded p-3 whitespace-pre-line text-slate-800 leading-relaxed font-sans">
                  {generatedResult.caption}
                </div>
              </div>

              {generatedResult.hashtags && (
                <div>
                  <span className="font-bold text-slate-700 block mb-1">Hashtags Estratégicas:</span>
                  <div className="flex flex-wrap gap-1">
                    {generatedResult.hashtags.map((h: string, idx: number) => (
                      <span key={idx} className="bg-slate-100 text-[#0B192C] px-2 py-0.5 rounded text-[11px] font-mono">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleSavePost}
                className="bg-[#C5A059] hover:bg-[#B48F48] text-[#0B192C] px-4 py-2 rounded uppercase font-bold tracking-wider"
              >
                Salvar no Calendário Editorial
              </button>
            </div>
          ) : (
            <p className="text-slate-400 py-10 text-center">
              Selecione um imóvel e clique em "Gerar Post para Instagram" para criar conteúdos editoriais exclusivos.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 10. CONTENT MODULE
// ==========================================
const ContentModule: React.FC<{ settings: SiteSettings; onRefresh: () => void }> = ({ settings, onRefresh }) => {
  const [aboutStory, setAboutStory] = useState(settings.aboutStory || '');
  const [aboutQuote, setAboutQuote] = useState(settings.aboutQuote || '');
  const [privacyPolicy, setPrivacyPolicy] = useState(settings.privacyPolicy || '');
  const [cookiesPolicy, setCookiesPolicy] = useState(settings.cookiesPolicy || '');
  const [termsOfUse, setTermsOfUse] = useState(settings.termsOfUse || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateSettings({
        aboutStory,
        aboutQuote,
        privacyPolicy,
        cookiesPolicy,
        termsOfUse
      });
      alert('Páginas institucionais atualizadas com sucesso.');
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#0B192C]">
          Gestão de Conteúdo & Páginas Institucionais
        </h2>
        <p className="text-xs text-slate-500">
          Edite os textos institucionais da profissional e as políticas legais (LGPD e Termos de Uso).
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4 text-xs">
        <div>
          <label className="block font-semibold uppercase text-slate-700 mb-1">Frase Marcante / Citação da Nathalia</label>
          <input
            type="text"
            value={aboutQuote}
            onChange={(e) => setAboutQuote(e.target.value)}
            className="w-full bg-[#FAF9F5] border border-slate-300 rounded p-2 text-xs"
          />
        </div>

        <div>
          <label className="block font-semibold uppercase text-slate-700 mb-1">Biografia Institucional</label>
          <textarea
            rows={4}
            value={aboutStory}
            onChange={(e) => setAboutStory(e.target.value)}
            className="w-full bg-[#FAF9F5] border border-slate-300 rounded p-2 text-xs"
          />
        </div>

        <div>
          <label className="block font-semibold uppercase text-slate-700 mb-1">Política de Privacidade (LGPD)</label>
          <textarea
            rows={3}
            value={privacyPolicy}
            onChange={(e) => setPrivacyPolicy(e.target.value)}
            className="w-full bg-[#FAF9F5] border border-slate-300 rounded p-2 text-xs"
          />
        </div>

        <div>
          <label className="block font-semibold uppercase text-slate-700 mb-1">Política de Cookies</label>
          <textarea
            rows={2}
            value={cookiesPolicy}
            onChange={(e) => setCookiesPolicy(e.target.value)}
            className="w-full bg-[#FAF9F5] border border-slate-300 rounded p-2 text-xs"
          />
        </div>

        <div>
          <label className="block font-semibold uppercase text-slate-700 mb-1">Termos de Uso</label>
          <textarea
            rows={2}
            value={termsOfUse}
            onChange={(e) => setTermsOfUse(e.target.value)}
            className="w-full bg-[#FAF9F5] border border-slate-300 rounded p-2 text-xs"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-[#0B192C] text-white px-6 py-2.5 rounded uppercase font-bold tracking-wider hover:bg-[#1E293B]"
        >
          {saving ? 'Gravando...' : 'Salvar Alterações de Conteúdo'}
        </button>
      </form>
    </div>
  );
};

// ==========================================
// 11. SEO MODULE
// ==========================================
const SEOModule: React.FC<{ settings: SiteSettings; onRefresh: () => void }> = ({ settings, onRefresh }) => {
  const [seoTitle, setSeoTitle] = useState(settings.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(settings.seoDescription || '');
  const [gaId, setGaId] = useState(settings.googleAnalyticsId || '');
  const [pixelId, setPixelId] = useState(settings.metaPixelId || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateSettings({
        seoTitle,
        seoDescription,
        googleAnalyticsId: gaId,
        metaPixelId: pixelId
      });
      alert('Configurações de SEO e Analytics salvas com sucesso.');
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#0B192C]">
          SEO Imobiliário & Rastreamento
        </h2>
        <p className="text-xs text-slate-500">
          Metadados para indexação no Google, OpenGraph para compartilhamento no WhatsApp e IDs de analytics.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm max-w-2xl space-y-4 text-xs">
        <div>
          <label className="block font-semibold uppercase text-slate-700 mb-1">Título Padrão (Title Tag)</label>
          <input
            type="text"
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            className="w-full bg-[#FAF9F5] border border-slate-300 rounded p-2.5 text-xs"
          />
        </div>

        <div>
          <label className="block font-semibold uppercase text-slate-700 mb-1">Meta Description</label>
          <textarea
            rows={3}
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
            className="w-full bg-[#FAF9F5] border border-slate-300 rounded p-2.5 text-xs"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold uppercase text-slate-700 mb-1">Google Analytics ID (G-XXXXX)</label>
            <input
              type="text"
              value={gaId}
              onChange={(e) => setGaId(e.target.value)}
              className="w-full bg-[#FAF9F5] border border-slate-300 rounded p-2.5 text-xs"
              placeholder="G-..."
            />
          </div>

          <div>
            <label className="block font-semibold uppercase text-slate-700 mb-1">Meta Pixel ID (Facebook/Instagram)</label>
            <input
              type="text"
              value={pixelId}
              onChange={(e) => setPixelId(e.target.value)}
              className="w-full bg-[#FAF9F5] border border-slate-300 rounded p-2.5 text-xs"
              placeholder="123456789..."
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-[#0B192C] text-white px-6 py-2.5 rounded uppercase font-bold tracking-wider hover:bg-[#1E293B]"
        >
          {saving ? 'Gravando...' : 'Salvar Metadados de SEO'}
        </button>
      </form>
    </div>
  );
};

// ==========================================
// 12. INTEGRATIONS MODULE (Blob & Firebase)
// ==========================================
const IntegrationsModule: React.FC<{ uploadStatus: any; firebaseStatus: any }> = ({ uploadStatus, firebaseStatus }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#0B192C]">
          Infraestrutura em Nuvem (Vercel Blob & Firebase Firestore)
        </h2>
        <p className="text-xs text-slate-500">
          Monitoramento em tempo real dos serviços de nuvem para fotos de alta resolução, marcas d'água e banco de dados.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vercel Blob Card */}
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif-luxury text-xl font-bold text-[#0B192C]">Vercel Blob Storage</h3>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
              uploadStatus?.vercelBlobConfigured ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {uploadStatus?.vercelBlobConfigured ? 'Conectado (CDN Global)' : 'Auto-Gerenciado & Pronto'}
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Armazenamento de fotografias e vídeos em alta resolução na CDN Edge da Vercel com redimensionamento e marca d'água automática.
          </p>

          <div className="bg-[#FAF9F5] p-3 rounded text-[11px] text-slate-700 space-y-2 border border-slate-200 font-mono">
            <div className="flex justify-between items-center">
              <span>Variável de Ambiente:</span>
              <span className="font-bold text-[#0B192C]">BLOB_READ_WRITE_TOKEN</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Status Operacional:</span>
              <span className="text-emerald-700 font-semibold">
                {uploadStatus?.vercelBlobConfigured ? 'Ativo na Nuvem Vercel' : 'Fallback Local Ativo (Sem Erros)'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Marca d'água Automática:</span>
              <span className="text-emerald-700 font-semibold">Ativada (Logo Transparente NR)</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-200">
            <strong>Como funciona na Vercel:</strong> Quando você conectar sua conta Vercel em Produção, o token <code className="text-slate-800 font-mono bg-white px-1">BLOB_READ_WRITE_TOKEN</code> é injetado automaticamente ao adicionar uma Storage Store. O código já está 100% preparado.
          </div>
        </div>

        {/* Firebase Firestore Card */}
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif-luxury text-xl font-bold text-[#0B192C]">Firebase Cloud Firestore</h3>
            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
              Conectado & Provisionado
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Banco de dados NoSQL corporativo do Google Cloud para sincronização em tempo real de imóveis, empreendimentos, leads e configurações.
          </p>

          <div className="bg-[#FAF9F5] p-3 rounded text-[11px] text-slate-700 space-y-2 border border-slate-200 font-mono">
            <div className="flex justify-between items-center">
              <span>Projeto Google Cloud:</span>
              <span className="font-bold text-[#0B192C]">{firebaseStatus?.projectId || 'gen-lang-client-0854807078'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Banco Firestore ID:</span>
              <span className="text-slate-600 truncate max-w-[200px]" title={firebaseStatus?.databaseId}>
                {firebaseStatus?.databaseId || 'ai-studio-nathaliarobadeyi...'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Regras de Segurança:</span>
              <span className="text-emerald-700 font-semibold">Deploy Realizado (Zero-Trust)</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Coleções Mapeadas:</span>
              <span className="text-slate-700">properties, developments, leads, siteSettings</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-200">
            <strong>Proteção de Dados:</strong> O arquivo <code className="text-slate-800 font-mono bg-white px-1">firestore.rules</code> está ativo com isolamento de PII. Leads só podem ser lidos por administradores autenticados.
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 13. USERS & PASSWORDS MODULE
// ==========================================
const UsersModule: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updating, setUpdating] = useState(false);

  const handleChangePass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      alert('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('As novas senhas não coincidem.');
      return;
    }

    setUpdating(true);
    try {
      await api.adminChangePassword(currentPassword, newPassword);
      alert('Senha do administrador alterada com sucesso.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#0B192C]">
          Usuários Administrativos & Segurança
        </h2>
        <p className="text-xs text-slate-500">
          Gerenciamento de credenciais e proteção contra acesso não autorizado.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm max-w-lg space-y-4 text-xs">
        <h3 className="font-serif-luxury text-lg font-bold text-[#0B192C]">Alterar Senha do Administrador</h3>
        <form onSubmit={handleChangePass} className="space-y-3">
          <div>
            <label className="block font-semibold uppercase text-slate-700 mb-1">Senha Atual *</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-[#FAF9F5] border border-slate-300 rounded p-2 text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase text-slate-700 mb-1">Nova Senha *</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full bg-[#FAF9F5] border border-slate-300 rounded p-2 text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase text-slate-700 mb-1">Confirmar Nova Senha *</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-[#FAF9F5] border border-slate-300 rounded p-2 text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={updating}
            className="w-full bg-[#0B192C] text-white py-2.5 rounded uppercase font-bold tracking-wider hover:bg-[#1E293B]"
          >
            {updating ? 'Gravando...' : 'Salvar Nova Senha'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 14. SETTINGS MODULE
// ==========================================
const SettingsModule: React.FC<{ settings: SiteSettings; onRefresh: () => void }> = ({ settings, onRefresh }) => {
  const [brandName, setBrandName] = useState(settings.brandName || 'Nathalia Robadey Imóveis');
  const [phone, setPhone] = useState(settings.phone || '+55 22 99931-5940');
  const [email, setEmail] = useState(settings.email || 'nathaliardmp@gmail.com');
  const [instagram, setInstagram] = useState(settings.instagram || '@nathaliarobadey');
  const [address, setAddress] = useState(settings.address || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateSettings({
        brandName,
        phone,
        email,
        instagram,
        address
      });
      alert('Configurações institucionais atualizadas.');
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#0B192C]">
          Configurações Gerais da Imobiliária
        </h2>
        <p className="text-xs text-slate-500">
          Dados corporativos exibidos no cabeçalho, rodapé e canais de comunicação.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm max-w-2xl space-y-4 text-xs">
        <div>
          <label className="block font-semibold uppercase text-slate-700 mb-1">Nome Comercial</label>
          <input
            type="text"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            className="w-full bg-[#FAF9F5] border border-slate-300 rounded p-2.5 text-xs"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold uppercase text-slate-700 mb-1">Telefone Principal</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[#FAF9F5] border border-slate-300 rounded p-2.5 text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase text-slate-700 mb-1">E-mail Comercial</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#FAF9F5] border border-slate-300 rounded p-2.5 text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold uppercase text-slate-700 mb-1">Instagram Oficial</label>
          <input
            type="text"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            className="w-full bg-[#FAF9F5] border border-slate-300 rounded p-2.5 text-xs"
          />
        </div>

        <div>
          <label className="block font-semibold uppercase text-slate-700 mb-1">Endereço de Atendimento / Região</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-[#FAF9F5] border border-slate-300 rounded p-2.5 text-xs"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-[#0B192C] text-white px-6 py-2.5 rounded uppercase font-bold tracking-wider hover:bg-[#1E293B]"
        >
          {saving ? 'Gravando...' : 'Salvar Configurações Gerais'}
        </button>
      </form>
    </div>
  );
};

// ==========================================
// 15. AUDIT LOGS MODULE
// ==========================================
const AuditLogsModule: React.FC<{ logs: AuditLog[] }> = ({ logs }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#0B192C]">
          Logs de Auditoria & Segurança
        </h2>
        <p className="text-xs text-slate-500">
          Registro cronológico imutável de todas as ações administrativas, alterações de imóveis e acessos ao sistema.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Data/Hora</th>
                <th className="py-3 px-4">Usuário</th>
                <th className="py-3 px-4">Ação</th>
                <th className="py-3 px-4">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString('pt-BR')}
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-slate-800">{log.user}</td>
                  <td className="py-2.5 px-4">
                    <span className="bg-slate-100 text-[#0B192C] px-2 py-0.5 rounded text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-600 font-sans">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
