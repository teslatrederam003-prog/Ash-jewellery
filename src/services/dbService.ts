import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import {
  Product,
  Category,
  HeroSlide,
  Order,
  CustomInquiry,
  PaymentSettings,
  OrderStatus,
  PaymentStatus,
  InquiryStatus,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_HERO_SLIDES,
  INITIAL_PRODUCTS,
  INITIAL_PAYMENT_SETTINGS,
} from '../data/initialData';

// Sync Connection Status Notifier
type SyncStatusListener = (isDegraded: boolean) => void;
const syncStatusListeners = new Set<SyncStatusListener>();

export function subscribeSyncStatus(listener: SyncStatusListener): () => void {
  syncStatusListeners.add(listener);
  return () => syncStatusListeners.delete(listener);
}

function notifySyncStatus(isDegraded: boolean) {
  syncStatusListeners.forEach((listener) => {
    try {
      listener(isDegraded);
    } catch {
      // ignore
    }
  });
}

/**
 * Storage Upload Helper
 * Primary path: Firebase Storage with realistic 20-second timeout.
 * Resilient fallback: When cloud storage is unavailable or offline, compress to a small
 * thumbnail (< 20KB) so documents never approach Firestore's 1MB limit.
 */
export async function uploadMediaFile(file: File, folderName: string): Promise<string> {
  const readThumbnailAsDataUrl = (inputFile: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (!result) return resolve('');

        // DEGRADED / OFFLINE FALLBACK:
        // When cloud storage is unreachable, cap resolution and compress heavily to guarantee
        // ultra-compact size (< 20KB) and preserve Firestore document integrity.
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          const maxDim = 400; // Thumbnail-capped dimension
          const quality = 0.55;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', quality));
          } else {
            resolve(result);
          }
        };
        img.onerror = () => resolve(result);
        img.src = result;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(inputFile);
    });
  };

  // Primary Path: Firebase Cloud Storage with realistic 20-second timeout
  const storageTask = (async () => {
    const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const storageRef = ref(storage, `${folderName}/${filename}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  })();

  const timeoutTask = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Firebase Storage upload timeout (20s)')), 20000);
  });

  try {
    const downloadUrl = await Promise.race([storageTask, timeoutTask]);
    if (downloadUrl) return downloadUrl;
  } catch (error) {
    console.warn('Firebase Storage upload unavailable, falling back to thumbnail data URL:', error);
  }

  return await readThumbnailAsDataUrl(file);
}

// Local Storage Fallback Keys
const LOCAL_ORDERS_KEY = 'ash_jewellery_local_orders';
const LOCAL_INQUIRIES_KEY = 'ash_jewellery_local_inquiries';
const LOCAL_PRODUCTS_KEY = 'ash_jewellery_local_products';
const LOCAL_CATEGORIES_KEY = 'ash_jewellery_local_categories';
const LOCAL_HERO_SLIDES_KEY = 'ash_jewellery_local_hero_slides';
const LOCAL_PAYMENT_SETTINGS_KEY = 'ash_jewellery_local_payment_settings';

const DELETED_PRODUCTS_KEY = 'ash_jewellery_deleted_products';
const DELETED_CATEGORIES_KEY = 'ash_jewellery_deleted_categories';
const DELETED_HERO_SLIDES_KEY = 'ash_jewellery_deleted_hero_slides';

function safeGetLocalStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetLocalStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn('Failed to set localStorage key:', key, e);
  }
}

function getDeletedIds(key: string): Set<string> {
  const raw = safeGetLocalStorage(key);
  if (!raw) return new Set();
  try {
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function addDeletedId(key: string, id: string): void {
  const set = getDeletedIds(key);
  set.add(id);
  safeSetLocalStorage(key, JSON.stringify(Array.from(set)));
}

function removeDeletedId(key: string, id: string): void {
  const set = getDeletedIds(key);
  set.delete(id);
  safeSetLocalStorage(key, JSON.stringify(Array.from(set)));
}

export function getLocalProducts(): Product[] | null {
  const raw = safeGetLocalStorage(LOCAL_PRODUCTS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveLocalProducts(products: Product[]): void {
  safeSetLocalStorage(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
}

export function getLocalCategories(): Category[] | null {
  const raw = safeGetLocalStorage(LOCAL_CATEGORIES_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveLocalCategories(categories: Category[]): void {
  safeSetLocalStorage(LOCAL_CATEGORIES_KEY, JSON.stringify(categories));
}

export function getLocalHeroSlides(): HeroSlide[] | null {
  const raw = safeGetLocalStorage(LOCAL_HERO_SLIDES_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveLocalHeroSlides(slides: HeroSlide[]): void {
  safeSetLocalStorage(LOCAL_HERO_SLIDES_KEY, JSON.stringify(slides));
}

export function getLocalOrders(): Order[] {
  const raw = safeGetLocalStorage(LOCAL_ORDERS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveLocalOrder(order: Order): void {
  const current = getLocalOrders();
  const filtered = current.filter((o) => o.id !== order.id);
  safeSetLocalStorage(LOCAL_ORDERS_KEY, JSON.stringify([order, ...filtered]));
}

export function getLocalInquiries(): CustomInquiry[] {
  const raw = safeGetLocalStorage(LOCAL_INQUIRIES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveLocalInquiry(inquiry: CustomInquiry): void {
  const current = getLocalInquiries();
  const filtered = current.filter((i) => i.id !== inquiry.id);
  safeSetLocalStorage(LOCAL_INQUIRIES_KEY, JSON.stringify([inquiry, ...filtered]));
}

// Instant cache helpers for zero-flash initial render
export function getInstantInitialProducts(): Product[] {
  const deletedIds = getDeletedIds(DELETED_PRODUCTS_KEY);
  const local = getLocalProducts();
  if (local && local.length > 0) {
    return local.filter((p) => !deletedIds.has(p.id));
  }
  return INITIAL_PRODUCTS.filter((p) => !deletedIds.has(p.id));
}

export function getInstantInitialCategories(): Category[] {
  const deletedIds = getDeletedIds(DELETED_CATEGORIES_KEY);
  const local = getLocalCategories();
  if (local && local.length > 0) {
    return local.filter((c) => !deletedIds.has(c.id) && !deletedIds.has(c.name.toLowerCase()));
  }
  return INITIAL_CATEGORIES.filter((c) => !deletedIds.has(c.id) && !deletedIds.has(c.name.toLowerCase()));
}

export function getInstantInitialHeroSlides(): HeroSlide[] {
  const deletedIds = getDeletedIds(DELETED_HERO_SLIDES_KEY);
  const local = getLocalHeroSlides();
  if (local && local.length > 0) {
    return local.filter((s) => !deletedIds.has(s.id));
  }
  return INITIAL_HERO_SLIDES.filter((s) => !deletedIds.has(s.id));
}

export function getInstantInitialPaymentSettings(): PaymentSettings {
  const raw = safeGetLocalStorage(LOCAL_PAYMENT_SETTINGS_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_PAYMENT_SETTINGS;
    }
  }
  return INITIAL_PAYMENT_SETTINGS;
}

// Data Sanitization
function cleanFirestoreData(data: Record<string, any>): Record<string, any> {
  const cleaned: Record<string, any> = {};
  Object.keys(data).forEach((key) => {
    if (data[key] !== undefined) {
      cleaned[key] = data[key];
    }
  });
  return cleaned;
}

// ==================== PRODUCTS ====================

export async function fetchProducts(): Promise<Product[]> {
  const deletedIds = getDeletedIds(DELETED_PRODUCTS_KEY);
  const localProds = getLocalProducts();
  try {
    const querySnapshot = await getDocs(collection(db, 'products'));
    let prods: Product[];
    if (querySnapshot.empty) {
      prods = localProds && localProds.length > 0 ? localProds : INITIAL_PRODUCTS;
    } else {
      prods = querySnapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Product));
    }
    const filtered = prods.filter((p) => !deletedIds.has(p.id));
    if (filtered.length > 0) {
      saveLocalProducts(filtered);
    }
    notifySyncStatus(false);
    return filtered;
  } catch (error) {
    console.warn('Firestore fetchProducts unavailable, using fallback:', error);
    notifySyncStatus(true);
    const fallback = localProds && localProds.length > 0 ? localProds : INITIAL_PRODUCTS;
    return fallback.filter((p) => !deletedIds.has(p.id));
  }
}

export function subscribeProducts(callback: (products: Product[]) => void): () => void {
  let unsub: (() => void) | null = null;
  let retryCount = 0;
  let retryTimeout: ReturnType<typeof setTimeout> | null = null;
  let isCancelled = false;

  const startListening = () => {
    if (isCancelled) return;
    try {
      const deletedIds = getDeletedIds(DELETED_PRODUCTS_KEY);
      unsub = onSnapshot(
        collection(db, 'products'),
        (snapshot) => {
          retryCount = 0;
          notifySyncStatus(false);
          const prods = snapshot.docs
            .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Product))
            .filter((p) => !deletedIds.has(p.id));
          if (prods.length > 0) {
            saveLocalProducts(prods);
            callback(prods);
          } else if (snapshot.empty) {
            const local = getLocalProducts();
            callback(local && local.length > 0 ? local : INITIAL_PRODUCTS);
          }
        },
        async (error) => {
          console.warn('Realtime products subscription error:', error);
          // 1. One-time fetch attempt as recovery path
          try {
            const recoveryDocs = await fetchProducts();
            if (recoveryDocs && recoveryDocs.length > 0) {
              callback(recoveryDocs);
              notifySyncStatus(false);
            }
          } catch {
            notifySyncStatus(true);
          }

          // 2. Exponential backoff retry for subscription
          if (retryCount < 3 && !isCancelled) {
            retryCount++;
            const delay = Math.min(2000 * Math.pow(2, retryCount - 1), 10000);
            console.info(`Retrying products subscription (attempt ${retryCount}) in ${delay}ms...`);
            retryTimeout = setTimeout(() => {
              if (unsub) unsub();
              startListening();
            }, delay);
          } else {
            notifySyncStatus(true);
          }
        }
      );
    } catch (err) {
      console.warn('Failed to attach realtime products subscription:', err);
      notifySyncStatus(true);
    }
  };

  startListening();

  return () => {
    isCancelled = true;
    if (retryTimeout) clearTimeout(retryTimeout);
    if (unsub) unsub();
  };
}

export async function saveProduct(product: Omit<Product, 'id'> & { id?: string }): Promise<Product> {
  let savedProduct: Product;
  if (product.id) {
    savedProduct = product as Product;
    removeDeletedId(DELETED_PRODUCTS_KEY, product.id);
    const docRef = doc(db, 'products', product.id);
    try {
      await setDoc(docRef, cleanFirestoreData(savedProduct), { merge: true });
    } catch (err: any) {
      console.error('Firestore saveProduct update error:', err);
      throw new Error(err?.message || 'Failed to update product in database');
    }
  } else {
    const newDocRef = doc(collection(db, 'products'));
    savedProduct = {
      ...product,
      id: newDocRef.id,
      createdAt: Date.now(),
    };
    try {
      await setDoc(newDocRef, cleanFirestoreData(savedProduct));
    } catch (err: any) {
      console.error('Firestore saveProduct create error:', err);
      throw new Error(err?.message || 'Failed to create product in database');
    }
  }

  const current = getLocalProducts() || INITIAL_PRODUCTS;
  const updated = [savedProduct, ...current.filter((p) => p.id !== savedProduct.id)];
  saveLocalProducts(updated);

  return savedProduct;
}

export async function removeProduct(id: string): Promise<void> {
  addDeletedId(DELETED_PRODUCTS_KEY, id);

  const current = getLocalProducts() || INITIAL_PRODUCTS;
  const updated = current.filter((p) => p.id !== id);
  saveLocalProducts(updated);

  try {
    await deleteDoc(doc(db, 'products', id));
  } catch (err: any) {
    console.error('Firestore removeProduct error:', err);
    throw new Error(err?.message || 'Failed to delete product from database');
  }
}

// ==================== CATEGORIES ====================

export async function fetchCategories(): Promise<Category[]> {
  const deletedIds = getDeletedIds(DELETED_CATEGORIES_KEY);
  const localCats = getLocalCategories();
  try {
    const querySnapshot = await getDocs(collection(db, 'categories'));
    let cats: Category[];
    if (querySnapshot.empty) {
      cats = localCats && localCats.length > 0 ? localCats : INITIAL_CATEGORIES;
    } else {
      cats = querySnapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Category));
    }
    const filtered = cats.filter((c) => !deletedIds.has(c.id) && !deletedIds.has(c.name.toLowerCase()));
    if (filtered.length > 0) {
      saveLocalCategories(filtered);
    }
    notifySyncStatus(false);
    return filtered;
  } catch (error) {
    console.warn('Error fetching categories, returning fallback:', error);
    notifySyncStatus(true);
    const fallback = localCats && localCats.length > 0 ? localCats : INITIAL_CATEGORIES;
    return fallback.filter((c) => !deletedIds.has(c.id) && !deletedIds.has(c.name.toLowerCase()));
  }
}

export function subscribeCategories(callback: (categories: Category[]) => void): () => void {
  let unsub: (() => void) | null = null;
  let retryCount = 0;
  let retryTimeout: ReturnType<typeof setTimeout> | null = null;
  let isCancelled = false;

  const startListening = () => {
    if (isCancelled) return;
    try {
      const deletedIds = getDeletedIds(DELETED_CATEGORIES_KEY);
      unsub = onSnapshot(
        collection(db, 'categories'),
        (snapshot) => {
          retryCount = 0;
          notifySyncStatus(false);
          const cats = snapshot.docs
            .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Category))
            .filter((c) => !deletedIds.has(c.id) && !deletedIds.has(c.name.toLowerCase()));
          if (cats.length > 0) {
            saveLocalCategories(cats);
            callback(cats);
          } else if (snapshot.empty) {
            const local = getLocalCategories();
            callback(local && local.length > 0 ? local : INITIAL_CATEGORIES);
          }
        },
        async (error) => {
          console.warn('Realtime categories subscription error:', error);
          try {
            const recoveryDocs = await fetchCategories();
            if (recoveryDocs && recoveryDocs.length > 0) {
              callback(recoveryDocs);
              notifySyncStatus(false);
            }
          } catch {
            notifySyncStatus(true);
          }

          if (retryCount < 3 && !isCancelled) {
            retryCount++;
            const delay = Math.min(2000 * Math.pow(2, retryCount - 1), 10000);
            retryTimeout = setTimeout(() => {
              if (unsub) unsub();
              startListening();
            }, delay);
          } else {
            notifySyncStatus(true);
          }
        }
      );
    } catch (err) {
      console.warn('Failed to attach realtime categories subscription:', err);
      notifySyncStatus(true);
    }
  };

  startListening();

  return () => {
    isCancelled = true;
    if (retryTimeout) clearTimeout(retryTimeout);
    if (unsub) unsub();
  };
}

export async function saveCategory(category: { id?: string; name: string; image?: string }): Promise<Category> {
  const catId = category.id || doc(collection(db, 'categories')).id;
  const newCat: Category = {
    id: catId,
    name: category.name.trim(),
    image: category.image || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800',
  };
  removeDeletedId(DELETED_CATEGORIES_KEY, newCat.id);
  removeDeletedId(DELETED_CATEGORIES_KEY, newCat.name.toLowerCase());

  try {
    await setDoc(doc(db, 'categories', newCat.id), cleanFirestoreData(newCat), { merge: true });
  } catch (err: any) {
    console.error('Firestore saveCategory error:', err);
    throw new Error(err?.message || 'Failed to save category to database');
  }

  const current = getLocalCategories() || INITIAL_CATEGORIES;
  const updated = [...current.filter((c) => c.id !== newCat.id && c.name.toLowerCase() !== newCat.name.toLowerCase()), newCat];
  saveLocalCategories(updated);

  return newCat;
}

export async function removeCategory(id: string, name?: string): Promise<void> {
  addDeletedId(DELETED_CATEGORIES_KEY, id);
  if (name) {
    addDeletedId(DELETED_CATEGORIES_KEY, name.toLowerCase());
  }

  const current = getLocalCategories() || INITIAL_CATEGORIES;
  const updated = current.filter((c) => c.id !== id && (!name || c.name.toLowerCase() !== name.toLowerCase()));
  saveLocalCategories(updated);

  try {
    await deleteDoc(doc(db, 'categories', id));
  } catch (err: any) {
    console.error('Firestore removeCategory error:', err);
    throw new Error(err?.message || 'Failed to delete category from database');
  }
}

// ==================== HERO SLIDES ====================

export async function fetchHeroSlides(): Promise<HeroSlide[]> {
  const deletedIds = getDeletedIds(DELETED_HERO_SLIDES_KEY);
  const localSlides = getLocalHeroSlides();
  try {
    const querySnapshot = await getDocs(collection(db, 'heroSlides'));
    let slides: HeroSlide[];
    if (querySnapshot.empty) {
      slides = localSlides && localSlides.length > 0 ? localSlides : INITIAL_HERO_SLIDES;
    } else {
      slides = querySnapshot.docs
        .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as HeroSlide))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }
    const filtered = slides.filter((s) => !deletedIds.has(s.id)).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    if (filtered.length > 0) {
      saveLocalHeroSlides(filtered);
    }
    notifySyncStatus(false);
    return filtered;
  } catch (error) {
    console.warn('Error fetching hero slides, returning local or initial:', error);
    notifySyncStatus(true);
    const fallback = localSlides && localSlides.length > 0 ? localSlides : INITIAL_HERO_SLIDES;
    return fallback.filter((s) => !deletedIds.has(s.id)).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }
}

export function subscribeHeroSlides(callback: (slides: HeroSlide[]) => void): () => void {
  let unsub: (() => void) | null = null;
  let retryCount = 0;
  let retryTimeout: ReturnType<typeof setTimeout> | null = null;
  let isCancelled = false;

  const startListening = () => {
    if (isCancelled) return;
    try {
      const deletedIds = getDeletedIds(DELETED_HERO_SLIDES_KEY);
      unsub = onSnapshot(
        collection(db, 'heroSlides'),
        (snapshot) => {
          retryCount = 0;
          notifySyncStatus(false);
          const slides = snapshot.docs
            .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as HeroSlide))
            .filter((s) => !deletedIds.has(s.id))
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
          if (slides.length > 0) {
            saveLocalHeroSlides(slides);
            callback(slides);
          } else if (snapshot.empty) {
            const local = getLocalHeroSlides();
            callback(local && local.length > 0 ? local : INITIAL_HERO_SLIDES);
          }
        },
        async (error) => {
          console.warn('Realtime hero slides subscription error:', error);
          try {
            const recoveryDocs = await fetchHeroSlides();
            if (recoveryDocs && recoveryDocs.length > 0) {
              callback(recoveryDocs);
              notifySyncStatus(false);
            }
          } catch {
            notifySyncStatus(true);
          }

          if (retryCount < 3 && !isCancelled) {
            retryCount++;
            const delay = Math.min(2000 * Math.pow(2, retryCount - 1), 10000);
            retryTimeout = setTimeout(() => {
              if (unsub) unsub();
              startListening();
            }, delay);
          } else {
            notifySyncStatus(true);
          }
        }
      );
    } catch (err) {
      console.warn('Failed to attach realtime hero slides subscription:', err);
      notifySyncStatus(true);
    }
  };

  startListening();

  return () => {
    isCancelled = true;
    if (retryTimeout) clearTimeout(retryTimeout);
    if (unsub) unsub();
  };
}

export async function saveHeroSlide(slide: Omit<HeroSlide, 'id'> & { id?: string }): Promise<HeroSlide> {
  let savedSlide: HeroSlide;
  if (slide.id) {
    savedSlide = slide as HeroSlide;
    removeDeletedId(DELETED_HERO_SLIDES_KEY, slide.id);
    const docRef = doc(db, 'heroSlides', slide.id);
    try {
      await setDoc(docRef, cleanFirestoreData(slide), { merge: true });
    } catch (err: any) {
      console.error('Firestore saveHeroSlide error:', err);
      throw new Error(err?.message || 'Failed to update hero slide');
    }
  } else {
    const newDocRef = doc(collection(db, 'heroSlides'));
    savedSlide = {
      ...slide,
      id: newDocRef.id,
    };
    try {
      await setDoc(newDocRef, cleanFirestoreData(savedSlide));
    } catch (err: any) {
      console.error('Firestore saveHeroSlide error:', err);
      throw new Error(err?.message || 'Failed to create hero slide');
    }
  }

  const current = getLocalHeroSlides() || INITIAL_HERO_SLIDES;
  const updated = current.filter((s) => s.id !== savedSlide.id);
  updated.push(savedSlide);
  const sorted = updated.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  saveLocalHeroSlides(sorted);

  return savedSlide;
}

export async function removeHeroSlide(id: string): Promise<void> {
  addDeletedId(DELETED_HERO_SLIDES_KEY, id);

  const current = getLocalHeroSlides() || INITIAL_HERO_SLIDES;
  const updated = current.filter((s) => s.id !== id);
  saveLocalHeroSlides(updated);

  try {
    await deleteDoc(doc(db, 'heroSlides', id));
  } catch (err: any) {
    console.error('Firestore removeHeroSlide error:', err);
    throw new Error(err?.message || 'Failed to delete hero slide');
  }
}

// ==================== ORDERS ====================

export async function createOrder(orderData: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
  const newDocRef = doc(collection(db, 'orders'));
  const newOrder: Order = {
    ...orderData,
    paymentScreenshotUrl: orderData.paymentScreenshotUrl || '',
    id: newDocRef.id,
    createdAt: Date.now(),
  };

  // Keep local backup for resilience
  saveLocalOrder(newOrder);

  try {
    await setDoc(newDocRef, cleanFirestoreData(newOrder));
  } catch (err: any) {
    console.error('Firestore createOrder setDoc failed:', err);
    throw new Error(err?.message || 'Failed to place order in database. Please try again.');
  }

  return newOrder;
}

export async function fetchAllOrders(): Promise<Order[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'orders'));
    const fsOrders = querySnapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Order));
    // Firestore is single source of truth
    return fsOrders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch (error) {
    console.warn('Error fetching all orders from Firestore, using local fallback:', error);
    const localOrders = getLocalOrders();
    return localOrders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }
}

export async function fetchCustomerOrders(userEmail: string): Promise<Order[]> {
  try {
    const q = query(collection(db, 'orders'), where('userEmail', '==', userEmail));
    const querySnapshot = await getDocs(q);
    const fsOrders = querySnapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Order));
    // Firestore is single source of truth
    return fsOrders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch (error) {
    console.warn('Error fetching customer orders, using local fallback:', error);
    const localOrders = getLocalOrders().filter((o) => o.userEmail === userEmail);
    return localOrders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  const localOrders = getLocalOrders();
  const order = localOrders.find((o) => o.id === orderId);
  if (order) {
    order.orderStatus = status;
    saveLocalOrder(order);
  }

  try {
    const docRef = doc(db, 'orders', orderId);
    await updateDoc(docRef, { orderStatus: status });
  } catch (err: any) {
    console.error('Firestore updateOrderStatus failed:', err);
    throw new Error(err?.message || 'Failed to update order status');
  }
}

export async function updatePaymentVerification(orderId: string, status: PaymentStatus): Promise<void> {
  const localOrders = getLocalOrders();
  const order = localOrders.find((o) => o.id === orderId);
  if (order) {
    order.paymentStatus = status;
    saveLocalOrder(order);
  }

  try {
    const docRef = doc(db, 'orders', orderId);
    await updateDoc(docRef, { paymentStatus: status });
  } catch (err: any) {
    console.error('Firestore updatePaymentVerification failed:', err);
    throw new Error(err?.message || 'Failed to update payment status');
  }
}

// ==================== CUSTOM INQUIRIES ====================

export async function createCustomInquiry(
  inquiryData: Omit<CustomInquiry, 'id' | 'createdAt' | 'status'>
): Promise<CustomInquiry> {
  const newDocRef = doc(collection(db, 'customInquiries'));
  const firstImage =
    inquiryData.referenceImageUrl || (inquiryData.referenceImages && inquiryData.referenceImages[0]) || '';
  const imagesList =
    inquiryData.referenceImages && inquiryData.referenceImages.length > 0
      ? inquiryData.referenceImages
      : firstImage
      ? [firstImage]
      : [];

  const newInquiry: CustomInquiry = {
    ...inquiryData,
    referenceImageUrl: firstImage,
    referenceImages: imagesList,
    id: newDocRef.id,
    status: 'New',
    createdAt: Date.now(),
  };

  saveLocalInquiry(newInquiry);

  try {
    await setDoc(newDocRef, cleanFirestoreData(newInquiry));
  } catch (err: any) {
    console.error('Firestore createCustomInquiry setDoc failed:', err);
    throw new Error(err?.message || 'Failed to submit custom inquiry');
  }

  return newInquiry;
}

export async function fetchCustomInquiries(): Promise<CustomInquiry[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'customInquiries'));
    const fsInquiries = querySnapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as CustomInquiry));
    return fsInquiries.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch (error) {
    console.warn('Error fetching custom inquiries from Firestore, using local fallback:', error);
    const localInquiries = getLocalInquiries();
    return localInquiries.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }
}

export async function updateInquiryStatus(inquiryId: string, status: InquiryStatus): Promise<void> {
  const localInquiries = getLocalInquiries();
  const inq = localInquiries.find((i) => i.id === inquiryId);
  if (inq) {
    inq.status = status;
    saveLocalInquiry(inq);
  }

  try {
    const docRef = doc(db, 'customInquiries', inquiryId);
    await updateDoc(docRef, { status });
  } catch (err: any) {
    console.error('Firestore updateInquiryStatus failed:', err);
    throw new Error(err?.message || 'Failed to update inquiry status');
  }
}

// ==================== PAYMENT SETTINGS ====================

export async function fetchPaymentSettings(): Promise<PaymentSettings> {
  try {
    const docSnap = await getDoc(doc(db, 'paymentSettings', 'default'));
    if (docSnap.exists()) {
      const data = docSnap.data() as PaymentSettings;
      safeSetLocalStorage(LOCAL_PAYMENT_SETTINGS_KEY, JSON.stringify(data));
      notifySyncStatus(false);
      return data;
    }
    return getInstantInitialPaymentSettings();
  } catch (error) {
    console.warn('Error fetching payment settings, using local or initial:', error);
    notifySyncStatus(true);
    return getInstantInitialPaymentSettings();
  }
}

export function subscribePaymentSettings(callback: (settings: PaymentSettings) => void): () => void {
  let unsub: (() => void) | null = null;
  let retryCount = 0;
  let retryTimeout: ReturnType<typeof setTimeout> | null = null;
  let isCancelled = false;

  const startListening = () => {
    if (isCancelled) return;
    try {
      unsub = onSnapshot(
        doc(db, 'paymentSettings', 'default'),
        (snapshot) => {
          retryCount = 0;
          notifySyncStatus(false);
          if (snapshot.exists()) {
            const data = snapshot.data() as PaymentSettings;
            safeSetLocalStorage(LOCAL_PAYMENT_SETTINGS_KEY, JSON.stringify(data));
            callback(data);
          }
        },
        async (error) => {
          console.warn('Realtime payment settings subscription notice:', error);
          try {
            const recoverySettings = await fetchPaymentSettings();
            if (recoverySettings) {
              callback(recoverySettings);
              notifySyncStatus(false);
            }
          } catch {
            notifySyncStatus(true);
          }

          if (retryCount < 3 && !isCancelled) {
            retryCount++;
            const delay = Math.min(2000 * Math.pow(2, retryCount - 1), 10000);
            retryTimeout = setTimeout(() => {
              if (unsub) unsub();
              startListening();
            }, delay);
          } else {
            notifySyncStatus(true);
          }
        }
      );
    } catch (err) {
      console.warn('Failed to attach realtime payment settings subscription:', err);
      notifySyncStatus(true);
    }
  };

  startListening();

  return () => {
    isCancelled = true;
    if (retryTimeout) clearTimeout(retryTimeout);
    if (unsub) unsub();
  };
}

export async function savePaymentSettings(settings: PaymentSettings): Promise<void> {
  safeSetLocalStorage(LOCAL_PAYMENT_SETTINGS_KEY, JSON.stringify(settings));
  try {
    await setDoc(doc(db, 'paymentSettings', 'default'), cleanFirestoreData({
      ...settings,
      updatedAt: Date.now(),
    }));
  } catch (err: any) {
    console.error('Firestore savePaymentSettings failed:', err);
    throw new Error(err?.message || 'Failed to save payment settings to database');
  }
}

export async function seedDatabaseIfEmpty(): Promise<void> {
  // Safe helper if manual seeding is needed
}
