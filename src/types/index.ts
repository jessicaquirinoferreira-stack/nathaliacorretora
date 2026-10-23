export type PropertyPurpose = 'venda' | 'aluguel';
export type PropertyType = 'casa' | 'apartamento' | 'cobertura' | 'terreno' | 'sitio' | 'comercial';
export type PropertyStatus = 'published' | 'draft' | 'reserved' | 'sold';

export interface MediaItem {
  id: string;
  url: string;
  pathname?: string;
  title?: string;
  isCover?: boolean;
  size?: number;
  type?: string;
  order?: number;
}

export interface Property {
  id: string;
  title: string;
  slug: string;
  referenceCode: string;
  description: string;
  shortDescription?: string;
  purpose: PropertyPurpose;
  type: PropertyType;
  city: string;
  neighborhood: string;
  address?: string;
  showAddress: boolean;
  price: number;
  priceDisplay?: string;
  condoFee?: number;
  iptu?: number;
  usableArea?: number;
  totalArea?: number;
  bedrooms: number;
  suites: number;
  bathrooms: number;
  parkingSpots: number;
  features: string[];
  gallery: MediaItem[];
  coverImage: string;
  status: PropertyStatus;
  isFeatured: boolean;
  isLaunch?: boolean;
  isOpportunity?: boolean;
  createdAt: string;
  updatedAt: string;
  seoTitle?: string;
  seoDescription?: string;
  virtualTourUrl?: string;
}

export type DevelopmentStatus = 'pre_launch' | 'in_construction' | 'ready';

export interface Development {
  id: string;
  title: string;
  slug: string;
  developer: string;
  location: string;
  city: string;
  neighborhood: string;
  type: string;
  status: DevelopmentStatus;
  startingPrice?: number;
  deliveryForecast?: string;
  unitsCount?: string;
  features: string[];
  gallery: MediaItem[];
  coverImage: string;
  brochurePdfUrl?: string;
  isFeatured: boolean;
  order: number;
  ctaText?: string;
  description: string;
  seoTitle?: string;
  seoDescription?: string;
}

export type LeadType = 
  | 'property_interest' 
  | 'sell_evaluation' 
  | 'custom_search' 
  | 'general_contact' 
  | 'visit_request' 
  | 'whatsapp_click';

export type LeadStatus = 'new' | 'in_progress' | 'contacted' | 'converted' | 'archived';

export interface LeadNote {
  id: string;
  timestamp: string;
  author: string;
  text: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  preferredContact: 'whatsapp' | 'email' | 'phone';
  message?: string;
  type: LeadType;
  propertyId?: string;
  propertyTitle?: string;
  developmentId?: string;
  sourcePage: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  createdAt: string;
  status: LeadStatus;
  notes: LeadNote[];
  consent: boolean;
  tags: string[];
  assignedTo?: string;
  honeypot?: string;
}

export interface LandingPageSection {
  id: string;
  type: 'hero' | 'features' | 'gallery' | 'form' | 'whatsapp_cta' | 'video' | 'location';
  title?: string;
  subtitle?: string;
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  items?: string[];
}

export interface LandingPage {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  objective: 'launch' | 'property' | 'buyers' | 'sellers';
  status: 'draft' | 'published';
  heroImage: string;
  headline: string;
  description: string;
  sections: LandingPageSection[];
  whatsappCtaText: string;
  viewsCount: number;
  leadsCount: number;
  createdAt: string;
  updatedAt: string;
  seoTitle: string;
  seoDescription: string;
}

export interface SiteSettings {
  brandName: string;
  logoUrl: string;
  phone: string;
  whatsapp: string;
  email: string;
  instagram: string;
  address: string;
  ctaWhatsappDefault: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBadge: string;
  aboutStory: string;
  aboutQuote: string;
  aboutExperience: string;
  privacyPolicy: string;
  cookiesPolicy: string;
  termsOfUse: string;
  seoTitle: string;
  seoDescription: string;
  googleAnalyticsId: string;
  metaPixelId: string;
  primaryColor: string;
  goldColor: string;
}

export interface SocialPost {
  id: string;
  platform: 'instagram' | 'facebook' | 'linkedin';
  title: string;
  caption: string;
  hashtags: string[];
  mediaUrl?: string;
  scheduledFor?: string;
  status: 'draft' | 'scheduled' | 'published';
  suggestedByAi?: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
}
