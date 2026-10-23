import { Property, Development, Lead, LandingPage, SiteSettings, SocialPost, AuditLog } from '../types';
import { firestoreService } from './firebase';

const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('nri_admin_token');
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('nri_admin_token', token);
  } else {
    localStorage.removeItem('nri_admin_token');
  }
}

function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  // Properties
  async getProperties(params?: Record<string, string>): Promise<Property[]> {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/properties${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error('Falha ao buscar imóveis.');
    return res.json();
  },

  async getProperty(slugOrId: string): Promise<Property> {
    const res = await fetch(`${API_BASE}/properties/${slugOrId}`);
    if (!res.ok) throw new Error('Imóvel não encontrado.');
    return res.json();
  },

  async createProperty(property: Partial<Property>): Promise<Property> {
    const res = await fetch(`${API_BASE}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(property)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Falha ao criar imóvel.');
    }
    const created = await res.json();
    try {
      await firestoreService.saveProperty(created);
    } catch (e) {
      console.warn('[Firestore] Deferred sync for property:', e);
    }
    return created;
  },

  async updateProperty(id: string, property: Partial<Property>): Promise<Property> {
    const res = await fetch(`${API_BASE}/properties/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(property)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Falha ao atualizar imóvel.');
    }
    const updated = await res.json();
    try {
      await firestoreService.saveProperty(updated);
    } catch (e) {
      console.warn('[Firestore] Deferred sync for property update:', e);
    }
    return updated;
  },

  async deleteProperty(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/properties/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    if (!res.ok) throw new Error('Falha ao excluir imóvel.');
    try {
      await firestoreService.deleteProperty(id);
    } catch (e) {
      console.warn('[Firestore] Deferred delete in Firestore:', e);
    }
  },

  // Developments
  async getDevelopments(): Promise<Development[]> {
    const res = await fetch(`${API_BASE}/developments`);
    if (!res.ok) throw new Error('Falha ao carregar empreendimentos.');
    return res.json();
  },

  async getDevelopment(slugOrId: string): Promise<Development> {
    const res = await fetch(`${API_BASE}/developments/${slugOrId}`);
    if (!res.ok) throw new Error('Empreendimento não encontrado.');
    return res.json();
  },

  async createDevelopment(dev: Partial<Development>): Promise<Development> {
    const res = await fetch(`${API_BASE}/developments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(dev)
    });
    if (!res.ok) throw new Error('Falha ao criar empreendimento.');
    const created = await res.json();
    try {
      await firestoreService.saveDevelopment(created);
    } catch (e) {
      console.warn('[Firestore] Deferred sync for development:', e);
    }
    return created;
  },

  async updateDevelopment(id: string, dev: Partial<Development>): Promise<Development> {
    const res = await fetch(`${API_BASE}/developments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(dev)
    });
    if (!res.ok) throw new Error('Falha ao atualizar empreendimento.');
    const updated = await res.json();
    try {
      await firestoreService.saveDevelopment(updated);
    } catch (e) {
      console.warn('[Firestore] Deferred sync for development update:', e);
    }
    return updated;
  },

  async deleteDevelopment(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/developments/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    if (!res.ok) throw new Error('Falha ao excluir empreendimento.');
  },

  // Leads
  async submitLead(lead: Partial<Lead>): Promise<{ success: boolean; message: string; leadId: string }> {
    const res = await fetch(`${API_BASE}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao enviar dados.');
    }
    const result = await res.json();
    try {
      await firestoreService.saveLead({ ...lead, id: result.leadId });
    } catch (e) {
      console.warn('[Firestore] Lead mirrored locally, Firestore direct sync deferred:', e);
    }
    return result;
  },

  async getLeads(params?: Record<string, string>): Promise<Lead[]> {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/leads${query ? `?${query}` : ''}`, {
      headers: authHeaders()
    });
    if (!res.ok) throw new Error('Falha ao obter lista de leads.');
    return res.json();
  },

  async updateLeadStatus(id: string, status: string): Promise<Lead> {
    const res = await fetch(`${API_BASE}/leads/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Falha ao atualizar status do lead.');
    return res.json();
  },

  async addLeadNote(id: string, text: string): Promise<any> {
    const res = await fetch(`${API_BASE}/leads/${id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ text })
    });
    if (!res.ok) throw new Error('Falha ao salvar nota.');
    return res.json();
  },

  // Landing pages
  async getLandingPages(): Promise<LandingPage[]> {
    const res = await fetch(`${API_BASE}/landing-pages`);
    if (!res.ok) throw new Error('Falha ao carregar landing pages.');
    return res.json();
  },

  async getLandingPage(slug: string): Promise<LandingPage> {
    const res = await fetch(`${API_BASE}/landing-pages/${slug}`);
    if (!res.ok) throw new Error('Landing page não encontrada.');
    return res.json();
  },

  async createLandingPage(page: Partial<LandingPage>): Promise<LandingPage> {
    const res = await fetch(`${API_BASE}/landing-pages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(page)
    });
    if (!res.ok) throw new Error('Falha ao criar landing page.');
    return res.json();
  },

  async updateLandingPage(id: string, page: Partial<LandingPage>): Promise<LandingPage> {
    const res = await fetch(`${API_BASE}/landing-pages/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(page)
    });
    if (!res.ok) throw new Error('Falha ao atualizar landing page.');
    return res.json();
  },

  async deleteLandingPage(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/landing-pages/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    if (!res.ok) throw new Error('Falha ao excluir landing page.');
  },

  // Media Upload
  async uploadFiles(files: File[]): Promise<any> {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Falha no upload dos arquivos.');
    return res.json();
  },

  async getUploadStatus(): Promise<{ vercelBlobConfigured: boolean; mode: string; instructions: string }> {
    const res = await fetch(`${API_BASE}/upload/status`);
    return res.json();
  },

  // Assistant & AI
  async chatAssistant(message: string, history: any[] = []): Promise<{ reply: string; whatsappUrl: string }> {
    const res = await fetch(`${API_BASE}/assistant/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history })
    });
    if (!res.ok) throw new Error('Erro na comunicação com a assistente.');
    return res.json();
  },

  async generateSocialContent(propertyId: string, promptStyle?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/social/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ propertyId, promptStyle })
    });
    if (!res.ok) throw new Error('Falha ao gerar conteúdo para rede social.');
    return res.json();
  },

  async getSocialPosts(): Promise<SocialPost[]> {
    const res = await fetch(`${API_BASE}/social/posts`);
    return res.json();
  },

  async createSocialPost(post: Partial<SocialPost>): Promise<SocialPost> {
    const res = await fetch(`${API_BASE}/social/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(post)
    });
    return res.json();
  },

  // Settings & Status
  async getSettings(): Promise<SiteSettings> {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error('Falha ao carregar configurações.');
    return res.json();
  },

  async updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(settings)
    });
    if (!res.ok) throw new Error('Falha ao atualizar configurações.');
    return res.json();
  },

  // Admin Auth & Stats
  async adminLogin(email: string, password: string): Promise<{ token: string; email: string; mustChangePassword: boolean }> {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Credenciais inválidas.');
    }
    const data = await res.json();
    setAuthToken(data.token);
    return data;
  },

  async adminVerify(): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/verify`, {
      headers: authHeaders()
    });
    if (!res.ok) throw new Error('Não autenticado.');
    return res.json();
  },

  async adminChangePassword(currentPassword: string, newPassword: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Falha ao alterar senha.');
    }
    return res.json();
  },

  async getDashboardStats(): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/dashboard-stats`, {
      headers: authHeaders()
    });
    if (!res.ok) throw new Error('Falha ao carregar estatísticas.');
    return res.json();
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch(`${API_BASE}/admin/audit-logs`, {
      headers: authHeaders()
    });
    if (!res.ok) return [];
    return res.json();
  },

  async getFirebaseStatus(): Promise<any> {
    const res = await fetch(`${API_BASE}/firebase/status`);
    return res.json();
  }
};
