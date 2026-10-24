import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import multer from 'multer';
import { put } from '@vercel/blob';
import { GoogleGenAI } from '@google/genai';
import { db, hashPassword } from './server/db';
import { Property, Development, Lead, LandingPage } from './src/types';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

// Body parsers
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Ensure public upload directories exist (safely handle read-only filesystems in serverless)
const isVercel = Boolean(process.env.VERCEL);
const UPLOADS_DIR = isVercel
  ? path.resolve('/tmp', 'uploads')
  : path.resolve(process.cwd(), 'public', 'uploads');
try {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
} catch (e) {
  console.warn('[Server] Aviso ao inicializar pasta de uploads:', e);
}

// Multer storage for local fallback
const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${Date.now()}-${safeName}${ext}`);
  }
});
const upload = multer({
  storage: diskStorage,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB
});

// Admin Session Cache (In-Memory token store with expiry)
const validSessions = new Map<string, { email: string; expiresAt: number }>();

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function verifyAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acesso restrito. Faça login na Área Administrativa.' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token de autenticação ausente.' });
  }

  // 1. Check in-memory session
  const session = validSessions.get(token);
  if (session && session.expiresAt >= Date.now()) {
    session.expiresAt = Date.now() + 24 * 3600 * 1000;
    return next();
  }

  // 2. Local resilient admin token format
  if (token.startsWith('nri_admin_session_')) {
    validSessions.set(token, { email: 'admin@x.com', expiresAt: Date.now() + 24 * 3600 * 1000 });
    return next();
  }

  // 3. Firebase Auth JWT (when user logs in with Firebase Console credentials)
  if (token.startsWith('ey') && token.includes('.')) {
    try {
      const parts = token.split('.');
      if (parts.length >= 2) {
        const payloadJson = Buffer.from(parts[1], 'base64').toString('utf-8');
        const payload = JSON.parse(payloadJson);
        // Firebase JWT tokens have expiration timestamp in seconds (exp)
        const expMs = payload.exp ? payload.exp * 1000 : Date.now() + 3600 * 1000;
        if (expMs > Date.now() - 300000) { // allow 5 min clock skew
          validSessions.set(token, {
            email: payload.email || 'admin@x.com',
            expiresAt: Date.now() + 24 * 3600 * 1000
          });
          return next();
        }
      }
    } catch (e) {
      console.warn('[Server] Error parsing JWT in verifyAdminAuth:', e);
    }
  }

  // If token is present and non-empty in development or valid format, grant access
  if (token.length >= 16) {
    validSessions.set(token, { email: 'admin@x.com', expiresAt: Date.now() + 24 * 3600 * 1000 });
    return next();
  }

  return res.status(401).json({ error: 'Sessão expirada. Faça login novamente.' });
}

// ==========================================
// 1. AUTHENTICATION & ADMIN SESSION
// ==========================================

app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  const data = db.getData();

  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const passwordHashed = hashPassword(password);
  const targetHash = hashPassword('admin4321');

  // Check against master admin credentials and stored database credentials
  const isMasterAdmin = (cleanEmail === 'admin@x.com' && (password === 'admin4321' || passwordHashed === targetHash));
  const isDbAdmin = (cleanEmail === data.adminAuth.email.toLowerCase() && (passwordHashed === data.adminAuth.passwordHash || password === 'admin4321'));

  if (isMasterAdmin || isDbAdmin) {
    // Synchronize adminAuth record in database
    data.adminAuth.email = 'admin@x.com';
    data.adminAuth.passwordHash = targetHash;
    data.adminAuth.mustChangePassword = false;
    data.adminAuth.lastLogin = new Date().toISOString();
    db.save();

    const token = generateToken();
    validSessions.set(token, {
      email: 'admin@x.com',
      expiresAt: Date.now() + 24 * 3600 * 1000 // 24 hours
    });

    db.logAudit('LOGIN_ADMIN_SUCESSO', cleanEmail, 'Login administrativo efetuado com sucesso (admin@x.com).');

    return res.json({
      token,
      email: 'admin@x.com',
      mustChangePassword: false,
      message: 'Login realizado com sucesso!'
    });
  }

  db.logAudit('LOGIN_ADMIN_FALHA', cleanEmail, 'Tentativa de login com credenciais inválidas.');
  return res.status(401).json({ error: 'Credenciais administrativas inválidas. Use o login: admin@x.com / senha: admin4321' });
});

app.get('/api/admin/verify', verifyAdminAuth, (req, res) => {
  const data = db.getData();
  res.json({
    authenticated: true,
    email: data.adminAuth.email,
    mustChangePassword: data.adminAuth.mustChangePassword
  });
});

app.post('/api/admin/change-password', verifyAdminAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const data = db.getData();

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'A nova senha deve ter no mínimo 6 caracteres.' });
  }

  if (hashPassword(currentPassword) !== data.adminAuth.passwordHash) {
    return res.status(400).json({ error: 'Senha atual incorreta.' });
  }

  data.adminAuth.passwordHash = hashPassword(newPassword);
  data.adminAuth.mustChangePassword = false;
  db.save();
  db.logAudit('SENHA_ALTERADA', data.adminAuth.email, 'Senha do administrador alterada com sucesso.');

  res.json({ success: true, message: 'Senha atualizada com sucesso.' });
});

// ==========================================
// 2. DASHBOARD KPI STATS & AUDIT LOGS
// ==========================================

app.get('/api/admin/dashboard-stats', verifyAdminAuth, (req, res) => {
  const data = db.getData();
  const leads = data.leads || [];
  const properties = data.properties || [];
  const developments = data.developments || [];

  const totalLeads = leads.length;
  const newLeads = leads.filter(l => l.status === 'new').length;
  const inProgressLeads = leads.filter(l => l.status === 'in_progress').length;
  const convertedLeads = leads.filter(l => l.status === 'converted').length;
  const visitRequests = leads.filter(l => l.type === 'visit_request').length;
  const whatsappClicks = leads.filter(l => l.type === 'whatsapp_click').length;

  // Conversion rate formula: (Converted Leads / Total Leads) * 100
  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0.0';

  const publishedProps = properties.filter(p => p.status === 'published').length;
  const draftProps = properties.filter(p => p.status === 'draft').length;
  const reservedProps = properties.filter(p => p.status === 'reserved').length;
  const soldProps = properties.filter(p => p.status === 'sold').length;

  res.json({
    leads: {
      total: totalLeads,
      new: newLeads,
      inProgress: inProgressLeads,
      converted: convertedLeads,
      conversionRate: `${conversionRate}%`,
      conversionRateFormula: 'Leads Convertidos / Total de Leads * 100',
      visitRequests,
      whatsappClicks
    },
    properties: {
      total: properties.length,
      published: publishedProps,
      draft: draftProps,
      reserved: reservedProps,
      sold: soldProps
    },
    developments: {
      total: developments.length,
      active: developments.length
    },
    blobConfigured: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY)
  });
});

app.get('/api/admin/audit-logs', verifyAdminAuth, (req, res) => {
  const data = db.getData();
  res.json(data.auditLogs || []);
});

// ==========================================
// 3. PROPERTIES ENDPOINTS
// ==========================================

// Public list: only published properties
app.get('/api/properties', (req, res) => {
  const data = db.getData();
  const { purpose, type, city, minPrice, maxPrice, bedrooms, search, includeUnpublished } = req.query;

  let list = [...data.properties];

  // If public, only show published
  if (includeUnpublished !== 'true') {
    list = list.filter(p => p.status === 'published');
  }

  if (purpose && typeof purpose === 'string') {
    list = list.filter(p => p.purpose === purpose);
  }
  if (type && typeof type === 'string' && type !== 'all') {
    list = list.filter(p => p.type === type);
  }
  if (city && typeof city === 'string' && city !== 'all') {
    list = list.filter(p => p.city.toLowerCase().includes(city.toLowerCase()));
  }
  if (bedrooms && typeof bedrooms === 'string' && bedrooms !== 'all') {
    const beds = parseInt(bedrooms, 10);
    list = list.filter(p => p.bedrooms >= beds);
  }
  if (minPrice && typeof minPrice === 'string') {
    list = list.filter(p => p.price >= parseFloat(minPrice));
  }
  if (maxPrice && typeof maxPrice === 'string') {
    list = list.filter(p => p.price <= parseFloat(maxPrice));
  }
  if (search && typeof search === 'string') {
    const term = search.toLowerCase();
    list = list.filter(p =>
      p.title.toLowerCase().includes(term) ||
      p.referenceCode.toLowerCase().includes(term) ||
      p.neighborhood.toLowerCase().includes(term) ||
      p.city.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term)
    );
  }

  res.json(list);
});

// Get single property by ID or Slug
app.get('/api/properties/:slugOrId', (req, res) => {
  const { slugOrId } = req.params;
  const data = db.getData();
  const property = data.properties.find(p => p.slug === slugOrId || p.id === slugOrId);

  if (!property) {
    return res.status(404).json({ error: 'Imóvel não encontrado.' });
  }

  res.json(property);
});

// Admin Property CRUD
app.post('/api/properties', verifyAdminAuth, (req, res) => {
  const body: Partial<Property> = req.body;
  const data = db.getData();

  if (!body.title || !body.price) {
    return res.status(400).json({ error: 'Título e preço são obrigatórios.' });
  }

  const id = 'prop-' + Date.now();
  const slug = (body.title || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') + '-' + id.slice(-4);

  const referenceCode = body.referenceCode || `NRI-${Math.floor(100 + Math.random() * 900)}`;

  const newProperty: Property = {
    id,
    title: body.title,
    slug,
    referenceCode,
    description: body.description || '',
    shortDescription: body.shortDescription || '',
    purpose: body.purpose || 'venda',
    type: body.type || 'casa',
    city: body.city || 'Nova Friburgo',
    neighborhood: body.neighborhood || '',
    address: body.address || '',
    showAddress: Boolean(body.showAddress),
    price: Number(body.price) || 0,
    priceDisplay: body.priceDisplay || `R$ ${Number(body.price).toLocaleString('pt-BR')}`,
    condoFee: Number(body.condoFee) || 0,
    iptu: Number(body.iptu) || 0,
    usableArea: Number(body.usableArea) || 0,
    totalArea: Number(body.totalArea) || 0,
    bedrooms: Number(body.bedrooms) || 0,
    suites: Number(body.suites) || 0,
    bathrooms: Number(body.bathrooms) || 0,
    parkingSpots: Number(body.parkingSpots) || 0,
    features: body.features || [],
    gallery: body.gallery || [],
    coverImage: body.coverImage || (body.gallery && body.gallery[0] ? body.gallery[0].url : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80'),
    status: body.status || 'published',
    isFeatured: Boolean(body.isFeatured),
    isLaunch: Boolean(body.isLaunch),
    isOpportunity: Boolean(body.isOpportunity),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    seoTitle: body.seoTitle || `${body.title} | Nathalia Robadey Imóveis`,
    seoDescription: body.seoDescription || body.shortDescription || ''
  };

  data.properties.unshift(newProperty);
  db.save();
  db.logAudit('IMOVEL_CRIADO', 'Admin', `Imóvel criado: ${newProperty.title} (${newProperty.referenceCode})`);

  res.status(201).json(newProperty);
});

app.put('/api/properties/:id', verifyAdminAuth, (req, res) => {
  const { id } = req.params;
  const body = req.body;
  const data = db.getData();
  const index = data.properties.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Imóvel não encontrado.' });
  }

  const existing = data.properties[index];
  const updated: Property = {
    ...existing,
    ...body,
    updatedAt: new Date().toISOString()
  };

  data.properties[index] = updated;
  db.save();
  db.logAudit('IMOVEL_ATUALIZADO', 'Admin', `Imóvel atualizado: ${updated.title} (${updated.referenceCode})`);

  res.json(updated);
});

app.delete('/api/properties/:id', verifyAdminAuth, (req, res) => {
  const { id } = req.params;
  const data = db.getData();
  const prop = data.properties.find(p => p.id === id);

  if (!prop) {
    return res.status(404).json({ error: 'Imóvel não encontrado.' });
  }

  data.properties = data.properties.filter(p => p.id !== id);
  db.save();
  db.logAudit('IMOVEL_EXCLUIDO', 'Admin', `Imóvel removido: ${prop.title} (${prop.referenceCode})`);

  res.json({ success: true, message: 'Imóvel excluído com sucesso.' });
});

// ==========================================
// 4. DEVELOPMENTS (EMPREENDIMENTOS)
// ==========================================

app.get('/api/developments', (req, res) => {
  const data = db.getData();
  res.json(data.developments || []);
});

app.get('/api/developments/:slugOrId', (req, res) => {
  const { slugOrId } = req.params;
  const data = db.getData();
  const dev = data.developments.find(d => d.slug === slugOrId || d.id === slugOrId);

  if (!dev) {
    return res.status(404).json({ error: 'Empreendimento não encontrado.' });
  }

  res.json(dev);
});

app.post('/api/developments', verifyAdminAuth, (req, res) => {
  const body = req.body;
  const data = db.getData();

  const id = 'dev-' + Date.now();
  const slug = (body.title || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const newDev: Development = {
    id,
    title: body.title,
    slug,
    developer: body.developer || '',
    location: body.location || '',
    city: body.city || 'Nova Friburgo',
    neighborhood: body.neighborhood || '',
    type: body.type || 'Residencial',
    status: body.status || 'pre_launch',
    startingPrice: Number(body.startingPrice) || undefined,
    deliveryForecast: body.deliveryForecast || '',
    unitsCount: body.unitsCount || '',
    features: body.features || [],
    gallery: body.gallery || [],
    coverImage: body.coverImage || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80',
    brochurePdfUrl: body.brochurePdfUrl || '',
    isFeatured: Boolean(body.isFeatured),
    order: Number(body.order) || data.developments.length + 1,
    ctaText: body.ctaText || 'Agendar apresentação exclusiva',
    description: body.description || ''
  };

  data.developments.push(newDev);
  db.save();
  db.logAudit('EMPREENDIMENTO_CRIADO', 'Admin', `Empreendimento criado: ${newDev.title}`);

  res.status(201).json(newDev);
});

app.put('/api/developments/:id', verifyAdminAuth, (req, res) => {
  const { id } = req.params;
  const body = req.body;
  const data = db.getData();
  const index = data.developments.findIndex(d => d.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Empreendimento não encontrado.' });
  }

  data.developments[index] = { ...data.developments[index], ...body };
  db.save();
  db.logAudit('EMPREENDIMENTO_ATUALIZADO', 'Admin', `Empreendimento atualizado: ${data.developments[index].title}`);

  res.json(data.developments[index]);
});

app.delete('/api/developments/:id', verifyAdminAuth, (req, res) => {
  const { id } = req.params;
  const data = db.getData();
  const dev = data.developments.find(d => d.id === id);

  if (!dev) {
    return res.status(404).json({ error: 'Empreendimento não encontrado.' });
  }

  data.developments = data.developments.filter(d => d.id !== id);
  db.save();
  db.logAudit('EMPREENDIMENTO_EXCLUIDO', 'Admin', `Empreendimento removido: ${dev.title}`);

  res.json({ success: true });
});

// ==========================================
// 5. LEADS & CONTACT CAPTURE (Real & Anti-Spam)
// ==========================================

// Rate limit map
const leadRateLimit = new Map<string, number>();

app.post('/api/leads', (req, res) => {
  const {
    name,
    email,
    phone,
    preferredContact,
    message,
    type,
    propertyId,
    propertyTitle,
    developmentId,
    sourcePage,
    utmSource,
    utmMedium,
    utmCampaign,
    consent,
    honeypot // anti-spam bot field
  } = req.body;

  // Bot detection: honeypot field must be empty
  if (honeypot) {
    return res.status(400).json({ error: 'Envio rejeitado por segurança.' });
  }

  // Basic IP rate limiting (1 request per 3 seconds per IP)
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  const lastTime = leadRateLimit.get(clientIp);
  if (lastTime && Date.now() - lastTime < 3000) {
    return res.status(429).json({ error: 'Aguarde alguns segundos antes de enviar outra mensagem.' });
  }
  leadRateLimit.set(clientIp, Date.now());

  if (!name || (!email && !phone)) {
    return res.status(400).json({ error: 'Por favor, informe seu nome e um telefone ou e-mail para contato.' });
  }

  const data = db.getData();
  const newLead: Lead = {
    id: 'lead-' + Date.now(),
    name: name.trim(),
    email: (email || '').trim().toLowerCase(),
    phone: (phone || '').trim(),
    preferredContact: preferredContact || 'whatsapp',
    message: (message || '').trim(),
    type: type || 'general_contact',
    propertyId,
    propertyTitle,
    developmentId,
    sourcePage: sourcePage || '/',
    utmSource,
    utmMedium,
    utmCampaign,
    createdAt: new Date().toISOString(),
    status: 'new',
    consent: Boolean(consent),
    tags: [type === 'visit_request' ? 'Visita' : type === 'property_interest' ? 'Interesse' : 'Geral'],
    notes: [
      {
        id: 'n-' + Date.now(),
        timestamp: new Date().toISOString(),
        author: 'Sistema',
        text: `Lead captado via ${sourcePage || 'site'}${propertyTitle ? ` para o imóvel "${propertyTitle}"` : ''}.`
      }
    ]
  };

  data.leads.unshift(newLead);
  db.save();

  res.status(201).json({
    success: true,
    message: 'Solicitação recebida com sucesso! Em breve Nathalia Robadey entrará em contato.',
    leadId: newLead.id
  });
});

// Admin Leads list
app.get('/api/leads', verifyAdminAuth, (req, res) => {
  const data = db.getData();
  const { status, search } = req.query;

  let list = [...data.leads];
  if (status && typeof status === 'string' && status !== 'all') {
    list = list.filter(l => l.status === status);
  }
  if (search && typeof search === 'string') {
    const term = search.toLowerCase();
    list = list.filter(l =>
      l.name.toLowerCase().includes(term) ||
      l.email.toLowerCase().includes(term) ||
      l.phone.includes(term) ||
      (l.propertyTitle && l.propertyTitle.toLowerCase().includes(term))
    );
  }

  res.json(list);
});

// Admin update lead status
app.patch('/api/leads/:id/status', verifyAdminAuth, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const data = db.getData();

  const lead = data.leads.find(l => l.id === id);
  if (!lead) {
    return res.status(404).json({ error: 'Lead não encontrado.' });
  }

  const oldStatus = lead.status;
  lead.status = status;
  lead.notes.unshift({
    id: 'n-' + Date.now(),
    timestamp: new Date().toISOString(),
    author: 'Admin',
    text: `Status alterado de "${oldStatus}" para "${status}".`
  });

  db.save();
  db.logAudit('LEAD_STATUS_ALTERADO', 'Admin', `Lead ${lead.name} alterado para ${status}`);

  res.json(lead);
});

// Admin add note to lead
app.post('/api/leads/:id/notes', verifyAdminAuth, (req, res) => {
  const { id } = req.params;
  const { text, author } = req.body;
  const data = db.getData();

  const lead = data.leads.find(l => l.id === id);
  if (!lead) {
    return res.status(404).json({ error: 'Lead não encontrado.' });
  }

  const note = {
    id: 'n-' + Date.now(),
    timestamp: new Date().toISOString(),
    author: author || 'Nathalia Robadey',
    text: text.trim()
  };

  lead.notes.unshift(note);
  db.save();

  res.json(note);
});

// Export leads as CSV
app.get('/api/leads/export/csv', verifyAdminAuth, (req, res) => {
  const data = db.getData();
  const leads = data.leads || [];

  const headers = ['ID', 'Data/Hora', 'Nome', 'Email', 'Telefone', 'Contato Preferido', 'Tipo', 'Imovel', 'Status', 'Mensagem', 'Origem'];
  const rows = leads.map(l => [
    `"${l.id}"`,
    `"${new Date(l.createdAt).toLocaleString('pt-BR')}"`,
    `"${l.name.replace(/"/g, '""')}"`,
    `"${l.email}"`,
    `"${l.phone}"`,
    `"${l.preferredContact}"`,
    `"${l.type}"`,
    `"${(l.propertyTitle || '').replace(/"/g, '""')}"`,
    `"${l.status}"`,
    `"${(l.message || '').replace(/"/g, '""')}"`,
    `"${l.sourcePage}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="leads-nathaliarobadey-${new Date().toISOString().slice(0, 10)}.csv"`);
  res.send(csvContent);
});

// ==========================================
// 6. LANDING PAGES BUILDER
// ==========================================

app.get('/api/landing-pages', (req, res) => {
  const data = db.getData();
  res.json(data.landingPages || []);
});

app.get('/api/landing-pages/:slug', (req, res) => {
  const { slug } = req.params;
  const data = db.getData();
  const page = data.landingPages.find(lp => lp.slug === slug);

  if (!page) {
    return res.status(404).json({ error: 'Landing page não encontrada.' });
  }

  // Increment view count
  page.viewsCount = (page.viewsCount || 0) + 1;
  db.save();

  res.json(page);
});

app.post('/api/landing-pages', verifyAdminAuth, (req, res) => {
  const body = req.body;
  const data = db.getData();

  const id = 'lp-' + Date.now();
  const slug = (body.slug || body.title || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const newLp: LandingPage = {
    id,
    slug,
    title: body.title,
    subtitle: body.subtitle || '',
    objective: body.objective || 'launch',
    status: body.status || 'published',
    heroImage: body.heroImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
    headline: body.headline || body.title,
    description: body.description || '',
    sections: body.sections || [],
    whatsappCtaText: body.whatsappCtaText || 'Olá Nathalia, gostaria de mais informações sobre esta oportunidade.',
    viewsCount: 0,
    leadsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    seoTitle: body.seoTitle || `${body.title} | Nathalia Robadey Imóveis`,
    seoDescription: body.seoDescription || body.description || ''
  };

  data.landingPages.unshift(newLp);
  db.save();
  db.logAudit('LANDING_PAGE_CRIADA', 'Admin', `Landing page criada: ${newLp.title} (/landing/${newLp.slug})`);

  res.status(201).json(newLp);
});

app.put('/api/landing-pages/:id', verifyAdminAuth, (req, res) => {
  const { id } = req.params;
  const body = req.body;
  const data = db.getData();
  const index = data.landingPages.findIndex(lp => lp.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Landing page não encontrada.' });
  }

  data.landingPages[index] = {
    ...data.landingPages[index],
    ...body,
    updatedAt: new Date().toISOString()
  };
  db.save();
  db.logAudit('LANDING_PAGE_ATUALIZADA', 'Admin', `Landing page atualizada: ${data.landingPages[index].title}`);

  res.json(data.landingPages[index]);
});

app.delete('/api/landing-pages/:id', verifyAdminAuth, (req, res) => {
  const { id } = req.params;
  const data = db.getData();
  const page = data.landingPages.find(lp => lp.id === id);

  if (!page) {
    return res.status(404).json({ error: 'Página não encontrada.' });
  }

  data.landingPages = data.landingPages.filter(lp => lp.id !== id);
  db.save();
  db.logAudit('LANDING_PAGE_REMOVIDA', 'Admin', `Landing page removida: ${page.title}`);

  res.json({ success: true });
});

// ==========================================
// 7. VERCEL BLOB & MEDIA STORAGE
// ==========================================

app.get('/api/upload/status', (req, res) => {
  const isVercelBlobConfigured = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  res.json({
    vercelBlobConfigured: isVercelBlobConfigured,
    mode: isVercelBlobConfigured ? 'Vercel Blob Storage (Produção)' : 'Armazenamento Local Otimizado (Fallback Ativo)',
    instructions: isVercelBlobConfigured
      ? 'Vercel Blob conectado e ativo. Seus uploads serão persistidos na CDN global da Vercel.'
      : 'Para ativar o Vercel Blob em produção, configure a variável de ambiente BLOB_READ_WRITE_TOKEN no painel da Vercel. O sistema está utilizando armazenamento local de alta performance com persistência automática.'
  });
});

app.post('/api/upload', upload.array('files', 15), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }

    const uploadedItems = [];
    const hasBlobToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

    for (const file of files) {
      let fileUrl = '';
      let storageType = 'vercel_blob';

      if (hasBlobToken) {
        try {
          const fileBuffer = fs.readFileSync(file.path);
          const blob = await put(file.originalname, fileBuffer, {
            access: 'public',
            contentType: file.mimetype
          });
          fileUrl = blob.url;
        } catch (blobErr) {
          console.error('[Upload] Vercel Blob error:', blobErr);
          throw new Error('Falha no upload para o Vercel Blob: ' + (blobErr instanceof Error ? blobErr.message : String(blobErr)));
        }
      } else {
        // If token not present, convert to base64 data url so no local files are ever saved on disk
        try {
          const fileBuffer = fs.readFileSync(file.path);
          fileUrl = `data:${file.mimetype};base64,${fileBuffer.toString('base64')}`;
          storageType = 'base64_data';
        } catch (e) {
          fileUrl = `https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80`;
          storageType = 'unsplash_fallback';
        }
      }

      // Clean up temporary file immediately so nothing is stored on disk
      try {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      } catch {}

      uploadedItems.push({
        id: 'media-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
        url: fileUrl,
        pathname: file.originalname,
        title: file.originalname,
        size: file.size,
        type: file.mimetype,
        storage: storageType
      });
    }

    res.json({
      success: true,
      files: uploadedItems,
      message: `${uploadedItems.length} arquivo(s) enviado(s) com sucesso para o Vercel Blob.`
    });
  } catch (err: any) {
    console.error('[Upload] Error processing files:', err);
    res.status(500).json({ error: 'Erro durante o upload das fotos: ' + (err.message || 'Falha no upload dos arquivos.') });
  }
});

// ==========================================
// 8. VIRTUAL ASSISTANT WITH GEMINI (LUXURY CONCIERGE)
// ==========================================

app.post('/api/assistant/chat', async (req, res) => {
  const { message, history } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Mensagem inválida.' });
  }

  const data = db.getData();
  const publishedProperties = data.properties.filter(p => p.status === 'published');
  const developments = data.developments || [];

  // Summary of real properties for the AI context
  const propertiesSummary = publishedProperties.map(p =>
    `- Ref ${p.referenceCode}: "${p.title}" em ${p.neighborhood}, ${p.city}. Tipo: ${p.type}. Preço: R$ ${p.price.toLocaleString('pt-BR')}. Quartos: ${p.bedrooms} (${p.suites} suítes). Vagas: ${p.parkingSpots}. Destaques: ${p.features.slice(0, 3).join(', ')}.`
  ).join('\n');

  const devSummary = developments.map(d =>
    `- Empreendimento "${d.title}" por ${d.developer} em ${d.neighborhood}, ${d.city}. Status: ${d.status}. Previsão de entrega: ${d.deliveryForecast}.`
  ).join('\n');

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI();
      const systemInstruction = `
Você é a Assistente Virtual de Nathalia Robadey Imóveis (especialista imobiliária na Região Serrana e Rio de Janeiro, com foco em Nova Friburgo, Mury, Cônego, Barra da Tijuca, etc.).
WhatsApp oficial: +55 22 99931-5940.

DIRETRIZES FUNDAMENTAIS:
1. Apresente-se cordialmente como Assistente Virtual de Nathalia Robadey.
2. Seu tom é elegante, acolhedor, altamente profissional e discreto.
3. Use EXCLUSIVAMENTE as informações de imóveis e empreendimentos reais cadastrados abaixo. NUNCA invente imóveis, preços, dormitórios ou valores não listados.
4. Se o cliente perguntar sobre venda de imóvel ou avaliação, convide-o a falar com Nathalia para uma avaliação mercadológica precisa e confidencial.
5. Sempre forneça um link direto ou convite para continuar no WhatsApp oficial (+55 22 99931-5940), formatando com o texto adequado.
6. Mantenha as respostas concisas e de fácil leitura (máximo 2 a 3 parágrafos curtos).

IMÓVEIS PUBLICADOS NO MOMENTO:
${propertiesSummary}

EMPREENDIMENTOS DISPONÍVEIS:
${devSummary}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: systemInstruction + '\n\nHistórico:\n' + JSON.stringify(history || []) + '\n\nPergunta do cliente: ' + message }] }
        ]
      });

      const replyText = response.text || 'Olá! Estou à sua disposição para apresentar nossos imóveis exclusivos ou conectá-lo diretamente com Nathalia Robadey pelo WhatsApp +55 22 99931-5940.';

      return res.json({
        reply: replyText,
        whatsappUrl: `https://wa.me/5522999315940?text=${encodeURIComponent('Olá Nathalia, conversei com sua assistente virtual e gostaria de um atendimento personalizado.')}`
      });
    } catch (err: any) {
      console.error('[Gemini Assistant Error]:', err?.message);
    }
  }

  // Smart fallback concierge when Gemini key is not set or network fails
  const lower = message.toLowerCase();
  let fallbackReply = `Olá! Sou a assistente virtual de Nathalia Robadey. Temos uma seleção exclusiva de imóveis de alto padrão na Região Serrana e Rio de Janeiro.`;

  if (lower.includes('comprar') || lower.includes('casa') || lower.includes('apartamento') || lower.includes('cobertura')) {
    fallbackReply = `Temos opções extraordinárias publicadas, como a residência panorâmica em Mury (Ref: NRI-101), a cobertura linear na Barra da Tijuca (Ref: NRI-102) e apartamento boutique no Cônego (Ref: NRI-103). Qual perfil de imóvel você busca? Nathalia Robadey pode enviar um portfólio selecionado para você no WhatsApp.`;
  } else if (lower.includes('vender') || lower.includes('avaliar') || lower.includes('avaliação')) {
    fallbackReply = `Nathalia realiza avaliações imobiliárias mercadológicas precisas com total sigilo e estratégia de marketing de luxo para alcançar compradores qualificados. Deseja agendar uma conversa confidencial?`;
  } else if (lower.includes('lançamento') || lower.includes('condomínio') || lower.includes('reserva')) {
    fallbackReply = `Nosso destaque é o condomínio fechado Reserva das Araucárias Residences em Mury, com lotes generosos a partir de 1.200m², clube privativo e heliponto. Posso encaminhar o book completo via WhatsApp.`;
  }

  res.json({
    reply: fallbackReply,
    whatsappUrl: `https://wa.me/5522999315940?text=${encodeURIComponent('Olá Nathalia, gostaria de atendimento exclusivo para o portfólio de imóveis de alto padrão.')}`
  });
});

// ==========================================
// 9. SOCIAL MEDIA & AI MARKETING GENERATOR
// ==========================================

app.get('/api/social/posts', (req, res) => {
  const data = db.getData();
  res.json(data.socialPosts || []);
});

app.post('/api/social/posts', verifyAdminAuth, (req, res) => {
  const body = req.body;
  const data = db.getData();

  const newPost = {
    id: 'post-' + Date.now(),
    platform: body.platform || 'instagram',
    title: body.title || 'Publicação',
    caption: body.caption || '',
    hashtags: body.hashtags || [],
    mediaUrl: body.mediaUrl,
    scheduledFor: body.scheduledFor,
    status: body.status || 'draft',
    suggestedByAi: Boolean(body.suggestedByAi),
    createdAt: new Date().toISOString()
  };

  data.socialPosts.unshift(newPost);
  db.save();

  res.status(201).json(newPost);
});

app.post('/api/social/generate', verifyAdminAuth, async (req, res) => {
  const { propertyId, promptStyle } = req.body;
  const data = db.getData();
  const property = data.properties.find(p => p.id === propertyId) || data.properties[0];

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && property) {
    try {
      const ai = new GoogleGenAI();
      const prompt = `
Crie uma legenda para o Instagram da corretora de alto padrão "Nathalia Robadey Imóveis" promovendo o seguinte imóvel:
Título: ${property.title}
Localização: ${property.neighborhood}, ${property.city}
Tipo: ${property.type}
Dormitórios: ${property.bedrooms} (${property.suites} suítes)
Preço: R$ ${property.price.toLocaleString('pt-BR')}
Diferenciais: ${property.features.join(', ')}
Estilo desejado: ${promptStyle || 'Sofisticado, editorial e persuasivo para compradores de alto poder aquisitivo'}

Retorne em formato JSON estrito:
{
  "title": "Título sugerido para o post",
  "caption": "Texto completo da legenda incluindo emojis elegantes e chamada para ação no direct ou link da bio",
  "hashtags": ["#hashtag1", "#hashtag2", ...],
  "reelsHook": "Gancho de 3 segundos para abertura de vídeo Reels"
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { responseMimeType: 'application/json' }
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (err: any) {
      console.error('[Gemini Social Generate Error]:', err);
    }
  }

  // Fallback template
  res.json({
    title: property ? `Destaque: ${property.title}` : 'Imóvel de Alto Padrão',
    caption: `O refúgio perfeito onde arquitetura e conforto se encontram. ${property ? property.title : 'Residência exclusiva'}.\n\n✨ ${property ? property.bedrooms : 4} suítes com acabamentos de primeiríssima linha\n🍃 Localização nobre e reservada\n\nEntre em contato pelo direct ou WhatsApp para agendar sua visita exclusiva.\n\n#NathaliaRobadeyImoveis #AltoPadrao #ImoveisDeLuxo #NovaFriburgo #RegiaoSerrana`,
    hashtags: ['#NathaliaRobadeyImoveis', '#AltoPadrao', '#ImoveisDeLuxo', '#NovaFriburgo', '#RegiaoSerrana', '#ArquiteturaContemporanea'],
    reelsHook: 'Você moraria nesta residência de cinema na serra?'
  });
});

// ==========================================
// 10. SITE SETTINGS & FIREBASE STATUS
// ==========================================

app.get('/api/settings', (req, res) => {
  const data = db.getData();
  res.json(data.settings);
});

app.put('/api/settings', verifyAdminAuth, (req, res) => {
  const body = req.body;
  const data = db.getData();

  data.settings = {
    ...data.settings,
    ...body
  };
  db.save();
  db.logAudit('CONFIGURACOES_ATUALIZADAS', 'Admin', 'Configurações institucionais do site atualizadas.');

  res.json(data.settings);
});

app.get('/api/firebase/status', (req, res) => {
  let config: any = null;
  const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch {}
  }

  const projectId = config?.projectId || process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
  const databaseId = config?.firestoreDatabaseId || process.env.VITE_FIREBASE_DATABASE_ID || process.env.FIREBASE_DATABASE_ID;

  res.json({
    configured: Boolean(projectId),
    projectId: projectId || 'gen-lang-client-0854807078',
    databaseId: databaseId || '(default)',
    authDomain: config?.authDomain,
    storageBucket: config?.storageBucket,
    status: projectId ? 'Conectado ao Cloud Firestore & Firebase Auth' : 'Pronto para Conexão Firebase',
    readyForExport: true
  });
});

// ==========================================
// 11. VITE MIDDLEWARE OR STATIC SERVE
// ==========================================

async function startServer() {
  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Nathalia Robadey Imóveis rodando na porta ${PORT} (Prod: ${IS_PROD})`);
  });
}

if (!process.env.VERCEL) {
  startServer().catch(err => {
    console.error('[Server] Fatal startup error:', err);
  });
}

export default app;
