import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
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

// Storage Upload Helper
export async function uploadMediaFile(file: File, folderName: string): Promise<string> {
  const readFileAsDataUrl = (inputFile: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (!result) return resolve('');

        // If file is already small (< 400KB), return immediately
        if (inputFile.size < 400 * 1024) {
          return resolve(result);
        }

        // Compress large image via canvas
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1920;

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
            resolve(canvas.toDataURL('image/jpeg', 0.82));
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

  const storageTask = (async () => {
    const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const storageRef = ref(storage, `${folderName}/${filename}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  })();

  const timeoutTask = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Firebase Storage upload timeout')), 2000);
  });

  try {
    const downloadUrl = await Promise.race([storageTask, timeoutTask]);
    if (downloadUrl) return downloadUrl;
  } catch (error) {
    console.warn('Firebase Storage upload timed out or failed; falling back to instant local image processing:', error);
  }

  return await readFileAsDataUrl(file);
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

function getDeletedIds(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function addDeletedId(key: string, id: string) {
  try {
    const set = getDeletedIds(key);
    set.add(id);
    localStorage.setItem(key, JSON.stringify(Array.from(set)));
  } catch (e) {
    console.error('Failed to add deleted ID:', e);
  }
}

function removeDeletedId(key: string, id: string) {
  try {
    const set = getDeletedIds(key);
    set.delete(id);
    localStorage.setItem(key, JSON.stringify(Array.from(set)));
  } catch (e) {
    console.error('Failed to remove deleted ID:', e);
  }
}

function getLocalProducts(): Product[] | null {
  try {
    const raw = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveLocalProducts(products: Product[]) {
  try {
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
  } catch (e) {
    console.error('Failed to save local products:', e);
  }
}

function getLocalCategories(): Category[] | null {
  try {
    const raw = localStorage.getItem(LOCAL_CATEGORIES_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveLocalCategories(categories: Category[]) {
  try {
    localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(categories));
  } catch (e) {
    console.error('Failed to save local categories:', e);
  }
}

function getLocalHeroSlides(): HeroSlide[] | null {
  try {
    const raw = localStorage.getItem(LOCAL_HERO_SLIDES_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveLocalHeroSlides(slides: HeroSlide[]) {
  try {
    localStorage.setItem(LOCAL_HERO_SLIDES_KEY, JSON.stringify(slides));
  } catch (e) {
    console.error('Failed to save local hero slides:', e);
  }
}

// Synchronous Instant Getters (0ms Load Time)
export function getInstantInitialProducts(): Product[] {
  const deletedIds = getDeletedIds(DELETED_PRODUCTS_KEY);
  const localProds = getLocalProducts();
  const base = localProds && localProds.length > 0 ? localProds : INITIAL_PRODUCTS;
  return base.filter((p) => !deletedIds.has(p.id));
}

export function getInstantInitialCategories(): Category[] {
  const deletedIds = getDeletedIds(DELETED_CATEGORIES_KEY);
  const localCats = getLocalCategories();
  const base = localCats && localCats.length > 0 ? localCats : INITIAL_CATEGORIES;
  return base.filter((c) => !deletedIds.has(c.id));
}

export function getInstantInitialHeroSlides(): HeroSlide[] {
  const deletedIds = getDeletedIds(DELETED_HERO_SLIDES_KEY);
  const localSlides = getLocalHeroSlides();
  const base = localSlides && localSlides.length > 0 ? localSlides : INITIAL_HERO_SLIDES;
  return base.filter((s) => !deletedIds.has(s.id)).sort((a, b) => a.order - b.order);
}

export function getInstantInitialPaymentSettings(): PaymentSettings {
  try {
    const raw = localStorage.getItem(LOCAL_PAYMENT_SETTINGS_KEY);
    return raw ? JSON.parse(raw) : INITIAL_PAYMENT_SETTINGS;
  } catch {
    return INITIAL_PAYMENT_SETTINGS;
  }
}

function getLocalOrders(): Order[] {
  try {
    const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalOrder(order: Order) {
  try {
    const existing = getLocalOrders();
    const updated = [order, ...existing.filter((o) => o.id !== order.id)];
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save local order:', e);
  }
}

function getLocalInquiries(): CustomInquiry[] {
  try {
    const raw = localStorage.getItem(LOCAL_INQUIRIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalInquiry(inquiry: CustomInquiry) {
  try {
    const existing = getLocalInquiries();
    const updated = [inquiry, ...existing.filter((i) => i.id !== inquiry.id)];
    localStorage.setItem(LOCAL_INQUIRIES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save local inquiry:', e);
  }
}

// Seed Initial Data (Non-blocking background sync)
export async function seedDatabaseIfEmpty() {
  const seeded = localStorage.getItem('ash_jewellery_has_seeded');
  if (seeded) return;

  try {
    const [prodSnap, catSnap, slideSnap, paymentSnap] = await Promise.all([
      getDocs(collection(db, 'products')),
      getDocs(collection(db, 'categories')),
      getDocs(collection(db, 'heroSlides')),
      getDoc(doc(db, 'paymentSettings', 'default')),
    ]);

    const seedPromises: Promise<any>[] = [];

    if (prodSnap.empty) {
      console.log('Seeding initial products into Firestore...');
      for (const prod of INITIAL_PRODUCTS) {
        seedPromises.push(setDoc(doc(db, 'products', prod.id), cleanFirestoreData(prod)));
      }
    }

    if (catSnap.empty) {
      console.log('Seeding initial categories into Firestore...');
      for (const cat of INITIAL_CATEGORIES) {
        seedPromises.push(setDoc(doc(db, 'categories', cat.id), cleanFirestoreData(cat)));
      }
    }

    if (slideSnap.empty) {
      console.log('Seeding initial hero slides into Firestore...');
      for (const slide of INITIAL_HERO_SLIDES) {
        seedPromises.push(setDoc(doc(db, 'heroSlides', slide.id), cleanFirestoreData(slide)));
      }
    }

    if (!paymentSnap.exists()) {
      console.log('Seeding initial payment settings into Firestore...');
      seedPromises.push(
        setDoc(doc(db, 'paymentSettings', 'default'), cleanFirestoreData({
          ...INITIAL_PAYMENT_SETTINGS,
          updatedAt: Date.now(),
        }))
      );
    }

    if (seedPromises.length > 0) {
      await Promise.all(seedPromises);
    }
    localStorage.setItem('ash_jewellery_has_seeded', 'true');
  } catch (error) {
    console.warn('Firestore seed skipped or unavailable:', error);
  }
}

// Helper to clean objects of undefined properties for Firestore
function cleanFirestoreData<T extends Record<string, any>>(obj: T): Record<string, any> {
  const cleaned: Record<string, any> = {};
  Object.entries(obj).forEach(([key, val]) => {
    if (val !== undefined && val !== null) {
      cleaned[key] = val;
    } else if (val === '') {
      cleaned[key] = '';
    }
  });
  return cleaned;
}

// Products
export async function fetchProducts(): Promise<Product[]> {
  const deletedIds = getDeletedIds(DELETED_PRODUCTS_KEY);
  const localProds = getLocalProducts();
  try {
    const querySnapshot = await getDocs(collection(db, 'products'));
    let prods: Product[];
    if (querySnapshot.empty) {
      prods = localProds !== null ? localProds : INITIAL_PRODUCTS;
    } else {
      prods = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product));
    }
    const filtered = prods.filter((p) => !deletedIds.has(p.id));
    saveLocalProducts(filtered);
    return filtered;
  } catch (error) {
    console.warn('Firestore fetchProducts unavailable, using fallback:', error);
    const fallback = localProds !== null ? localProds : INITIAL_PRODUCTS;
    const filtered = fallback.filter((p) => !deletedIds.has(p.id));
    saveLocalProducts(filtered);
    return filtered;
  }
}

export async function saveProduct(product: Omit<Product, 'id'> & { id?: string }): Promise<Product> {
  let savedProduct: Product;
  if (product.id) {
    savedProduct = product as Product;
    removeDeletedId(DELETED_PRODUCTS_KEY, product.id);
    try {
      const docRef = doc(db, 'products', product.id);
      await updateDoc(docRef, cleanFirestoreData(product));
    } catch (e) {
      console.warn('Firestore saveProduct update failed:', e);
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
    } catch (e) {
      console.warn('Firestore saveProduct set failed:', e);
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

  deleteDoc(doc(db, 'products', id)).catch((e) => {
    console.warn('Firestore removeProduct failed:', e);
  });
}

// Categories
export async function fetchCategories(): Promise<Category[]> {
  const deletedIds = getDeletedIds(DELETED_CATEGORIES_KEY);
  const localCats = getLocalCategories();
  try {
    const querySnapshot = await getDocs(collection(db, 'categories'));
    let cats: Category[];
    if (querySnapshot.empty) {
      cats = localCats !== null ? localCats : INITIAL_CATEGORIES;
    } else {
      cats = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Category));
    }
    const filtered = cats.filter((c) => !deletedIds.has(c.id));
    saveLocalCategories(filtered);
    return filtered;
  } catch (error) {
    console.warn('Error fetching categories, returning local:', error);
    const fallback = localCats !== null ? localCats : INITIAL_CATEGORIES;
    const filtered = fallback.filter((c) => !deletedIds.has(c.id));
    saveLocalCategories(filtered);
    return filtered;
  }
}

export async function saveCategory(category: { name: string; image: string }): Promise<Category> {
  const newDocRef = doc(collection(db, 'categories'));
  const newCat: Category = {
    id: newDocRef.id,
    name: category.name,
    image: category.image,
  };
  removeDeletedId(DELETED_CATEGORIES_KEY, newCat.id);
  try {
    await setDoc(newDocRef, cleanFirestoreData(newCat));
  } catch (e) {
    console.warn('Firestore saveCategory failed:', e);
  }

  const current = getLocalCategories() || INITIAL_CATEGORIES;
  const updated = [...current.filter((c) => c.id !== newCat.id), newCat];
  saveLocalCategories(updated);

  return newCat;
}

export async function removeCategory(id: string): Promise<void> {
  addDeletedId(DELETED_CATEGORIES_KEY, id);

  const current = getLocalCategories() || INITIAL_CATEGORIES;
  const updated = current.filter((c) => c.id !== id);
  saveLocalCategories(updated);

  deleteDoc(doc(db, 'categories', id)).catch((e) => {
    console.warn('Firestore removeCategory failed:', e);
  });
}

// Hero Slides
export async function fetchHeroSlides(): Promise<HeroSlide[]> {
  const deletedIds = getDeletedIds(DELETED_HERO_SLIDES_KEY);
  const localSlides = getLocalHeroSlides();
  try {
    const querySnapshot = await getDocs(collection(db, 'heroSlides'));
    let slides: HeroSlide[];
    if (querySnapshot.empty) {
      slides = localSlides !== null ? localSlides : INITIAL_HERO_SLIDES;
    } else {
      slides = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as HeroSlide));
    }
    const filtered = slides.filter((s) => !deletedIds.has(s.id)).sort((a, b) => a.order - b.order);
    saveLocalHeroSlides(filtered);
    return filtered;
  } catch (error) {
    console.warn('Error fetching hero slides, returning local or initial:', error);
    const fallback = localSlides !== null ? localSlides : INITIAL_HERO_SLIDES;
    const filtered = fallback.filter((s) => !deletedIds.has(s.id)).sort((a, b) => a.order - b.order);
    saveLocalHeroSlides(filtered);
    return filtered;
  }
}

export async function saveHeroSlide(slide: Omit<HeroSlide, 'id'> & { id?: string }): Promise<HeroSlide> {
  let savedSlide: HeroSlide;
  if (slide.id) {
    savedSlide = slide as HeroSlide;
    removeDeletedId(DELETED_HERO_SLIDES_KEY, slide.id);
    try {
      const docRef = doc(db, 'heroSlides', slide.id);
      await updateDoc(docRef, cleanFirestoreData(slide));
    } catch (e) {
      console.warn('Firestore saveHeroSlide update failed:', e);
    }
  } else {
    const newDocRef = doc(collection(db, 'heroSlides'));
    savedSlide = {
      ...slide,
      id: newDocRef.id,
    };
    try {
      await setDoc(newDocRef, cleanFirestoreData(savedSlide));
    } catch (e) {
      console.warn('Firestore saveHeroSlide set failed:', e);
    }
  }

  const current = getLocalHeroSlides() || INITIAL_HERO_SLIDES;
  const updated = current.filter((s) => s.id !== savedSlide.id);
  updated.push(savedSlide);
  const sorted = updated.sort((a, b) => a.order - b.order);
  saveLocalHeroSlides(sorted);

  return savedSlide;
}

export async function removeHeroSlide(id: string): Promise<void> {
  addDeletedId(DELETED_HERO_SLIDES_KEY, id);

  const current = getLocalHeroSlides() || INITIAL_HERO_SLIDES;
  const updated = current.filter((s) => s.id !== id);
  saveLocalHeroSlides(updated);

  deleteDoc(doc(db, 'heroSlides', id)).catch((e) => {
    console.warn('Firestore removeHeroSlide failed:', e);
  });
}

// Orders
export async function createOrder(orderData: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
  const newDocRef = doc(collection(db, 'orders'));
  const newOrder: Order = {
    ...orderData,
    paymentScreenshotUrl: orderData.paymentScreenshotUrl || '',
    id: newDocRef.id,
    createdAt: Date.now(),
  };

  // Always save local backup
  saveLocalOrder(newOrder);

  try {
    await setDoc(newDocRef, cleanFirestoreData(newOrder));
  } catch (error) {
    console.warn('Firestore setDoc failed for order, saved locally as fallback:', error);
  }
  return newOrder;
}

export async function fetchAllOrders(): Promise<Order[]> {
  const localOrders = getLocalOrders();
  try {
    const querySnapshot = await getDocs(collection(db, 'orders'));
    const fsOrders = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Order));
    
    const orderMap = new Map<string, Order>();
    localOrders.forEach(o => orderMap.set(o.id, o));
    fsOrders.forEach(o => orderMap.set(o.id, o));
    
    const combined = Array.from(orderMap.values());
    return combined.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch (error) {
    console.warn('Error fetching all orders from Firestore, returning local orders:', error);
    return localOrders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }
}

export async function fetchCustomerOrders(userEmail: string): Promise<Order[]> {
  const localOrders = getLocalOrders().filter(o => o.userEmail === userEmail);
  try {
    const q = query(collection(db, 'orders'), where('userEmail', '==', userEmail));
    const querySnapshot = await getDocs(q);
    const fsOrders = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Order));
    
    const orderMap = new Map<string, Order>();
    localOrders.forEach(o => orderMap.set(o.id, o));
    fsOrders.forEach(o => orderMap.set(o.id, o));
    
    const combined = Array.from(orderMap.values());
    return combined.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch (error) {
    console.warn('Error fetching customer orders, returning local orders:', error);
    return localOrders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  const localOrders = getLocalOrders();
  const order = localOrders.find(o => o.id === orderId);
  if (order) {
    order.orderStatus = status;
    saveLocalOrder(order);
  }
  try {
    const docRef = doc(db, 'orders', orderId);
    await updateDoc(docRef, { orderStatus: status });
  } catch (error) {
    console.warn('Firestore updateOrderStatus failed:', error);
  }
}

export async function updatePaymentVerification(orderId: string, status: PaymentStatus): Promise<void> {
  const localOrders = getLocalOrders();
  const order = localOrders.find(o => o.id === orderId);
  if (order) {
    order.paymentStatus = status;
    saveLocalOrder(order);
  }
  try {
    const docRef = doc(db, 'orders', orderId);
    await updateDoc(docRef, { paymentStatus: status });
  } catch (error) {
    console.warn('Firestore updatePaymentVerification failed:', error);
  }
}

// Custom Inquiries
export async function createCustomInquiry(inquiryData: Omit<CustomInquiry, 'id' | 'createdAt' | 'status'>): Promise<CustomInquiry> {
  const newDocRef = doc(collection(db, 'customInquiries'));
  const firstImage = inquiryData.referenceImageUrl || (inquiryData.referenceImages && inquiryData.referenceImages[0]) || '';
  const imagesList = inquiryData.referenceImages && inquiryData.referenceImages.length > 0
    ? inquiryData.referenceImages
    : (firstImage ? [firstImage] : []);

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
  } catch (error) {
    console.warn('Firestore setDoc failed for custom inquiry:', error);
  }
  return newInquiry;
}

export async function fetchCustomInquiries(): Promise<CustomInquiry[]> {
  const localInquiries = getLocalInquiries();
  try {
    const querySnapshot = await getDocs(collection(db, 'customInquiries'));
    const fsInquiries = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CustomInquiry));
    
    const inqMap = new Map<string, CustomInquiry>();
    localInquiries.forEach(i => inqMap.set(i.id, i));
    fsInquiries.forEach(i => inqMap.set(i.id, i));
    
    const combined = Array.from(inqMap.values());
    return combined.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch (error) {
    console.warn('Error fetching custom inquiries:', error);
    return localInquiries.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }
}

export async function updateInquiryStatus(inquiryId: string, status: InquiryStatus): Promise<void> {
  const localInquiries = getLocalInquiries();
  const inq = localInquiries.find(i => i.id === inquiryId);
  if (inq) {
    inq.status = status;
    saveLocalInquiry(inq);
  }
  try {
    const docRef = doc(db, 'customInquiries', inquiryId);
    await updateDoc(docRef, { status });
  } catch (error) {
    console.warn('Firestore updateInquiryStatus failed:', error);
  }
}

// Payment Settings
export async function fetchPaymentSettings(): Promise<PaymentSettings> {
  try {
    const docSnap = await getDoc(doc(db, 'paymentSettings', 'default'));
    if (docSnap.exists()) {
      const data = docSnap.data() as PaymentSettings;
      try {
        localStorage.setItem(LOCAL_PAYMENT_SETTINGS_KEY, JSON.stringify(data));
      } catch (e) {
        console.warn('Failed to cache payment settings:', e);
      }
      return data;
    }
    return getInstantInitialPaymentSettings();
  } catch (error) {
    console.warn('Error fetching payment settings, using local or initial:', error);
    return getInstantInitialPaymentSettings();
  }
}

export async function savePaymentSettings(settings: PaymentSettings): Promise<void> {
  try {
    localStorage.setItem(LOCAL_PAYMENT_SETTINGS_KEY, JSON.stringify(settings));
    await setDoc(doc(db, 'paymentSettings', 'default'), cleanFirestoreData({
      ...settings,
      updatedAt: Date.now(),
    }));
  } catch (error) {
    console.warn('Firestore savePaymentSettings failed:', error);
  }
}
