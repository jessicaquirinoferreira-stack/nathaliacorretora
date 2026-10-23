import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  getDocFromServer,
  serverTimestamp 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Property, Development, Lead, SiteSettings } from '../types';

// Operation types for error reporting per Firebase skill requirements
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

// 1. Initialize Firebase App and Services
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
// CRITICAL per skill instructions: getFirestore must receive the specific firestoreDatabaseId
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);

export const googleProvider = new GoogleAuthProvider();

// Error handler enforcing JSON error serialization per Firebase Integration Skill
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test on boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Please check your Firebase configuration or network status.");
      return false;
    }
    // Expected to fail with missing document, which confirms connectivity
    return true;
  }
}

// ==========================================
// FIRESTORE HIGH-LEVEL HELPER REPOSITORIES
// ==========================================

export const firestoreService = {
  // Check if Firebase is configured
  isConfigured(): boolean {
    return Boolean(firebaseConfig && firebaseConfig.projectId && firebaseConfig.apiKey);
  },

  // Leads
  async saveLead(lead: Partial<Lead>): Promise<string> {
    const leadId = lead.id || `lead-${Date.now()}`;
    const leadPath = `leads/${leadId}`;
    try {
      const docRef = doc(db, 'leads', leadId);
      await setDoc(docRef, {
        id: leadId,
        name: lead.name || 'Cliente Interessado',
        email: lead.email || '',
        phone: lead.phone || '',
        preferredContact: lead.preferredContact || 'whatsapp',
        message: lead.message || '',
        type: lead.type || 'property_interest',
        propertyId: lead.propertyId || '',
        propertyTitle: lead.propertyTitle || '',
        sourcePage: lead.sourcePage || '/',
        status: lead.status || 'new',
        createdAt: new Date().toISOString(),
        serverCreatedAt: serverTimestamp(),
      });
      return leadId;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, leadPath);
    }
  },

  async getLeads(): Promise<Lead[]> {
    const leadsPath = 'leads';
    try {
      const q = query(collection(db, leadsPath), limit(100));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => d.data() as Lead);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, leadsPath);
    }
  },

  // Properties
  async getProperties(): Promise<Property[]> {
    const path = 'properties';
    try {
      const snapshot = await getDocs(collection(db, path));
      return snapshot.docs.map(d => d.data() as Property);
    } catch (err) {
      console.warn('[Firestore] Fallback to backend properties due to rules or empty set');
      return [];
    }
  },

  async saveProperty(property: Property): Promise<void> {
    const path = `properties/${property.id}`;
    try {
      await setDoc(doc(db, 'properties', property.id), {
        ...property,
        syncedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.warn('[Firestore] Error saving property to Firestore:', err);
    }
  },

  async deleteProperty(propertyId: string): Promise<void> {
    const path = `properties/${propertyId}`;
    try {
      await deleteDoc(doc(db, 'properties', propertyId));
    } catch (err) {
      console.warn('[Firestore] Error deleting property from Firestore:', err);
    }
  },

  // Developments
  async getDevelopments(): Promise<Development[]> {
    const path = 'developments';
    try {
      const snapshot = await getDocs(collection(db, path));
      return snapshot.docs.map(d => d.data() as Development);
    } catch (err) {
      return [];
    }
  },

  async saveDevelopment(dev: Development): Promise<void> {
    try {
      await setDoc(doc(db, 'developments', dev.id), {
        ...dev,
        syncedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.warn('[Firestore] Error saving development to Firestore:', err);
    }
  },

  // Site Settings
  async getSettings(): Promise<SiteSettings | null> {
    try {
      const snap = await getDoc(doc(db, 'siteSettings', 'global'));
      return snap.exists() ? (snap.data() as SiteSettings) : null;
    } catch (err) {
      return null;
    }
  },

  async saveSettings(settings: SiteSettings): Promise<void> {
    try {
      await setDoc(doc(db, 'siteSettings', 'global'), settings, { merge: true });
    } catch (err) {
      console.warn('[Firestore] Error saving settings to Firestore:', err);
    }
  },

  // Auth helper with Google
  async loginWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (err) {
      console.error('[Firebase Auth] Error signing in with Google:', err);
      throw err;
    }
  },

  async logout() {
    await signOut(auth);
  }
};
