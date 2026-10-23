import React, { useState } from 'react';
import { Send, CheckCircle2, ShieldCheck, Home, Search, Mail, Phone, MessageCircle } from 'lucide-react';
import { api } from '../services/api';

interface SellEvaluationFormProps {
  onSuccess?: () => void;
}

export const SellEvaluationForm: React.FC<SellEvaluationFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    propertyType: 'casa',
    city: 'Nova Friburgo',
    neighborhood: '',
    estimatedValue: '',
    message: '',
    consent: true,
    honeypot: '' // Anti-spam hidden bot trap
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.honeypot) return; // Silent bot reject

    setLoading(true);
    try {
      await api.submitLead({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        preferredContact: 'whatsapp',
        type: 'sell_evaluation',
        message: `[AVALIAÇÃO PARA VENDA] Imóvel: ${formData.propertyType} em ${formData.neighborhood}, ${formData.city}. Expectativa de valor: ${formData.estimatedValue || 'Não informada'}. Obs: ${formData.message}`,
        sourcePage: '/vender',
        consent: formData.consent,
        honeypot: formData.honeypot
      });
      setSuccess(true);
      onSuccess?.();
    } catch (err: any) {
      alert(err.message || 'Erro ao enviar solicitação.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white p-8 rounded-lg border border-slate-200 text-center space-y-4 shadow-sm animate-in fade-in">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="font-serif-luxury text-2xl font-bold text-[#0B192C]">Solicitação de Avaliação Recebida</h3>
        <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
          Nathalia Robadey entrará em contato em horário conveniente para dar início ao estudo mercadológico detalhado do seu imóvel com total discrição.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="text-xs font-semibold text-[#C5A059] hover:underline cursor-pointer pt-2"
        >
          Enviar outra solicitação
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-lg border border-slate-200 shadow-sm space-y-4">
      {/* Bot honeypot trap */}
      <input
        type="text"
        name="website_url"
        value={formData.honeypot}
        onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />

      <div className="border-b border-slate-100 pb-4 mb-4">
        <h3 className="font-serif-luxury text-2xl font-semibold text-[#0B192C] flex items-center space-x-2">
          <Home className="w-5 h-5 text-[#C5A059]" />
          <span>Cadastre seu Imóvel para Avaliação</span>
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Atendimento confidencial, produção fotográfica de alto nível e qualificação prévia de compradores.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Nome Completo *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-[#FAF9F5] border border-slate-300 rounded-sm px-3 py-2.5 text-xs focus:border-[#C5A059] focus:outline-none"
            placeholder="Seu nome"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
            WhatsApp / Telefone *
          </label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full bg-[#FAF9F5] border border-slate-300 rounded-sm px-3 py-2.5 text-xs focus:border-[#C5A059] focus:outline-none"
            placeholder="(22) 99931-5940"
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
            className="w-full bg-[#FAF9F5] border border-slate-300 rounded-sm px-3 py-2.5 text-xs focus:border-[#C5A059] focus:outline-none"
            placeholder="seuemail@exemplo.com"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Tipo de Imóvel *
          </label>
          <select
            value={formData.propertyType}
            onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
            className="w-full bg-[#FAF9F5] border border-slate-300 rounded-sm px-3 py-2.5 text-xs focus:border-[#C5A059] focus:outline-none"
          >
            <option value="casa">Casa de Alto Padrão / Condomínio</option>
            <option value="cobertura">Cobertura</option>
            <option value="apartamento">Apartamento</option>
            <option value="sitio">Sítio / Fazenda</option>
            <option value="terreno">Terreno</option>
            <option value="comercial">Imóvel Comercial</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Cidade *
          </label>
          <input
            type="text"
            required
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full bg-[#FAF9F5] border border-slate-300 rounded-sm px-3 py-2.5 text-xs focus:border-[#C5A059] focus:outline-none"
            placeholder="Ex: Nova Friburgo, Rio de Janeiro..."
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Bairro ou Condomínio *
          </label>
          <input
            type="text"
            required
            value={formData.neighborhood}
            onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
            className="w-full bg-[#FAF9F5] border border-slate-300 rounded-sm px-3 py-2.5 text-xs focus:border-[#C5A059] focus:outline-none"
            placeholder="Ex: Mury, Cônego, Centro..."
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
          Expectativa de Preço (Opcional)
        </label>
        <input
          type="text"
          value={formData.estimatedValue}
          onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
          className="w-full bg-[#FAF9F5] border border-slate-300 rounded-sm px-3 py-2.5 text-xs focus:border-[#C5A059] focus:outline-none"
          placeholder="Ex: R$ 2.500.000 ou sob análise"
        />
      </div>

      <div>
        <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
          Detalhes e Diferenciais do Imóvel
        </label>
        <textarea
          rows={3}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full bg-[#FAF9F5] border border-slate-300 rounded-sm px-3 py-2.5 text-xs focus:border-[#C5A059] focus:outline-none"
          placeholder="Metragem aproximada, dormitórios, piscina, acabamentos ou se já está desocupado..."
        />
      </div>

      <div className="flex items-start space-x-2 pt-1">
        <input
          type="checkbox"
          id="consent-sell"
          required
          checked={formData.consent}
          onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
          className="mt-0.5 rounded text-[#C5A059] focus:ring-[#C5A059]"
        />
        <label htmlFor="consent-sell" className="text-[11px] text-slate-600 leading-tight">
          Concordo com o tratamento dos dados acima para realização do estudo de avaliação conforme a Política de Privacidade e LGPD.
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#0B192C] hover:bg-[#1E293B] text-white font-semibold text-xs uppercase tracking-widest py-3.5 rounded-sm transition-all duration-200 cursor-pointer shadow-md"
      >
        {loading ? 'Enviando Solicitação...' : 'Solicitar Avaliação Confidencial'}
      </button>
    </form>
  );
};

export const CustomSearchForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    budget: '',
    location: '',
    bedrooms: '3',
    details: '',
    consent: true,
    honeypot: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.honeypot) return;

    setLoading(true);
    try {
      await api.submitLead({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        preferredContact: 'whatsapp',
        type: 'custom_search',
        message: `[BUSCA PERSONALIZADA] Região: ${formData.location || 'Não especificada'}. Orçamento aproximado: ${formData.budget || 'A definir'}. Quartos: ${formData.bedrooms}. Perfil: ${formData.details}`,
        sourcePage: '/comprar',
        consent: formData.consent,
        honeypot: formData.honeypot
      });
      setSuccess(true);
    } catch (err: any) {
      alert(err.message || 'Erro ao enviar dados.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white p-8 rounded-lg border border-slate-200 text-center space-y-4 shadow-sm animate-in fade-in">
        <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
        <h3 className="font-serif-luxury text-2xl font-bold text-[#0B192C]">Critérios de Busca Registrados</h3>
        <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
          Nathalia Robadey iniciará a busca ativa em seu portfólio exclusivo e rede de contatos para apresentar oportunidades sob medida.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-lg border border-slate-200 shadow-sm space-y-4">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="font-serif-luxury text-xl font-semibold text-[#0B192C] flex items-center space-x-2">
          <Search className="w-5 h-5 text-[#C5A059]" />
          <span>Serviço de Busca Personalizada</span>
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Não encontrou o que procura em nosso site público? Temos acesso a propriedades off-market (fora do mercado tradicional).
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Seu Nome *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-[#FAF9F5] border border-slate-300 rounded-sm px-3 py-2.5 text-xs focus:border-[#C5A059] focus:outline-none"
            placeholder="Nome completo"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
            WhatsApp / Telefone *
          </label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full bg-[#FAF9F5] border border-slate-300 rounded-sm px-3 py-2.5 text-xs focus:border-[#C5A059] focus:outline-none"
            placeholder="(22) 99931-5940"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Região ou Bairro Desejado
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full bg-[#FAF9F5] border border-slate-300 rounded-sm px-3 py-2.5 text-xs focus:border-[#C5A059] focus:outline-none"
            placeholder="Ex: Mury, Cônego, Barra..."
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Faixa de Investimento
          </label>
          <input
            type="text"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            className="w-full bg-[#FAF9F5] border border-slate-300 rounded-sm px-3 py-2.5 text-xs focus:border-[#C5A059] focus:outline-none"
            placeholder="Ex: R$ 1,5M a 3M"
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
          O que é essencial no imóvel?
        </label>
        <textarea
          rows={3}
          value={formData.details}
          onChange={(e) => setFormData({ ...formData, details: e.target.value })}
          className="w-full bg-[#FAF9F5] border border-slate-300 rounded-sm px-3 py-2.5 text-xs focus:border-[#C5A059] focus:outline-none"
          placeholder="Ex: Vista indevassável, piscina aquecida, condomínio com quadra, espaço para home office..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#C5A059] hover:bg-[#B48F48] text-[#0B192C] font-bold text-xs uppercase tracking-widest py-3.5 rounded-sm transition-all duration-200 cursor-pointer shadow-md"
      >
        {loading ? 'Gravando...' : 'Receber Imóveis Selecionados'}
      </button>
    </form>
  );
};
