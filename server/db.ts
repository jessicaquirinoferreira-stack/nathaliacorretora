import fs from 'fs';
import path from 'path';
import { Property, Development, Lead, LandingPage, SiteSettings, SocialPost, AuditLog } from '../src/types';
import { INITIAL_PROPERTIES, INITIAL_DEVELOPMENTS, INITIAL_LANDING_PAGES, INITIAL_SETTINGS, INITIAL_SOCIAL_POSTS } from '../src/data/initialData';

const isVercel = Boolean(process.env.VERCEL);
const DATA_DIR = isVercel ? path.resolve('/tmp', 'nri_data') : path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');
const BUNDLED_DB_FILE = path.resolve(process.cwd(), 'data', 'db.json');

export interface DatabaseSchema {
  settings: SiteSettings;
  properties: Property[];
  developments: Development[];
  leads: Lead[];
  landingPages: LandingPage[];
  socialPosts: SocialPost[];
  auditLogs: AuditLog[];
  adminAuth: {
    email: string;
    passwordHash: string; // SHA-256
    mustChangePassword: boolean;
    lastLogin?: string;
  };
}

import crypto from 'crypto';

// Simple deterministic hash for admin passwords
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function getInitialDatabase(): DatabaseSchema {
  return {
    settings: INITIAL_SETTINGS,
    properties: INITIAL_PROPERTIES,
    developments: INITIAL_DEVELOPMENTS,
    landingPages: INITIAL_LANDING_PAGES,
    socialPosts: INITIAL_SOCIAL_POSTS,
    leads: [
      {
        id: 'lead-1',
        name: 'Carlos Eduardo Silveira',
        email: 'carlossilveira@exemplo.com.br',
        phone: '+55 22 99881-2233',
        preferredContact: 'whatsapp',
        type: 'property_interest',
        propertyId: 'prop-001',
        propertyTitle: 'Residência Arquitetônica Panorâmica no Vale dos Cristais',
        sourcePage: '/imovel/residencia-arquitetonica-panoramica-vale-dos-cristais',
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        status: 'new',
        consent: true,
        tags: ['Alto Padrão', 'Região Serrana', 'Financiamento Próprio'],
        notes: [
          {
            id: 'n1',
            timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
            author: 'Sistema',
            text: 'Lead recebido através da página do imóvel NRI-101.'
          }
        ]
      },
      {
        id: 'lead-2',
        name: 'Dra. Mariana Vasconcellos',
        email: 'marianavasconcellos@exemplo.com',
        phone: '+55 21 99772-5544',
        preferredContact: 'whatsapp',
        type: 'visit_request',
        propertyId: 'prop-002',
        propertyTitle: 'Cobertura Linear Marítima com Terraço Panorâmico',
        sourcePage: '/imovel/cobertura-linear-maritima-com-terraco-panoramico',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        status: 'in_progress',
        consent: true,
        tags: ['Cobertura', 'Vista Mar', 'Visita Solicitada'],
        notes: [
          {
            id: 'n2',
            timestamp: new Date(Date.now() - 3600000 * 20).toISOString(),
            author: 'Nathalia Robadey',
            text: 'Contato inicial realizado pelo WhatsApp. Agendamento de visita para sábado às 11h confirmado.'
          }
        ]
      }
    ],
    auditLogs: [
      {
        id: 'log-1',
        timestamp: new Date().toISOString(),
        action: 'SISTEMA_INICIALIZADO',
        user: 'Sistema',
        details: 'Banco de dados e curadoria inicial inicializados com sucesso.'
      }
    ],
    adminAuth: {
      email: 'admin@x.com',
      // Hash of initial password 'admin4321'
      passwordHash: hashPassword('admin4321'),
      mustChangePassword: false
    }
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      const fileToRead = fs.existsSync(DB_FILE) 
        ? DB_FILE 
        : (fs.existsSync(BUNDLED_DB_FILE) ? BUNDLED_DB_FILE : null);

      if (fileToRead) {
        const raw = fs.readFileSync(fileToRead, 'utf-8');
        const parsed = JSON.parse(raw);
        const merged: DatabaseSchema = {
          ...getInitialDatabase(),
          ...parsed,
          settings: { ...INITIAL_SETTINGS, ...(parsed.settings || {}) },
          adminAuth: {
            email: 'admin@x.com',
            passwordHash: hashPassword('admin4321'),
            mustChangePassword: false,
            lastLogin: parsed.adminAuth?.lastLogin || new Date().toISOString()
          }
        };
        // Persist the ensured admin credentials to disk
        this.saveDirect(merged);
        return merged;
      }
    } catch (err) {
      console.error('[DB] Failed to load data, using default:', err);
    }

    const initial = getInitialDatabase();
    this.saveDirect(initial);
    return initial;
  }

  private saveDirect(data: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.warn('[DB] Non-fatal notice writing db.json (running in memory/serverless):', err);
    }
  }

  public save() {
    this.saveDirect(this.data);
  }

  public getData(): DatabaseSchema {
    return this.data;
  }

  public logAudit(action: string, user: string, details: string) {
    const log: AuditLog = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString(),
      action,
      user,
      details
    };
    this.data.auditLogs.unshift(log);
    if (this.data.auditLogs.length > 200) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 200);
    }
    this.save();
  }
}

export const db = new Database();
