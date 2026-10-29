import { supabase } from '../lib/supabase';
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
  PaymentMethod,
} from '../types';

// ============================================================================
// IMAGE COMPRESSION & SUPABASE STORAGE HELPERS
// ============================================================================

/**
 * Compresses an image file in the browser before upload.
 * Capped to max 1200px dimension and JPEG quality 0.8.
 */
async function compressImageToBlob(file: File, maxDim = 1200, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return resolve(file);
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Canvas rendering context not available for compression'));
        }
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Image compression to JPEG failed'));
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to decode image file'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads media to Supabase Storage:
 * - Admin uploads (products, categories, slides, UPI QR) -> public bucket 'product-images' (returns public URL)
 * - Customer uploads (payment screenshots, inquiry reference photos) -> private bucket 'customer-uploads' (returns storage path)
 * Never stores base64/data URLs in the database.
 */
export async function uploadMediaFile(file: File, folderName: string): Promise<string> {
  const isCustomerUpload = folderName === 'payment_screenshots' || folderName === 'custom_inquiries';
  const bucketName = isCustomerUpload ? 'customer-uploads' : 'product-images';

  const compressedBlob = await compressImageToBlob(file, 1200, 0.8);
  const cleanBase = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `${folderName}/${Date.now()}_${cleanBase}.jpg`;

  const { data, error } = await supabase.storage.from(bucketName).upload(filePath, compressedBlob, {
    contentType: 'image/jpeg',
    upsert: true,
  });

  if (error) {
    console.error(`Supabase storage upload error in bucket "${bucketName}":`, error);
    throw new Error(`Upload failed: ${error.message}`);
  }

  if (isCustomerUpload) {
    // Return relative path for private customer uploads
    return data.path;
  }

  // Return public URL for admin catalog assets
  const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(data.path);
  return urlData.publicUrl;
}

/**
 * Creates a signed URL for private customer uploads (1 hour validity)
 */
export async function getCustomerSignedUrl(pathOrUrl: string): Promise<string> {
  if (!pathOrUrl) return '';
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl;
  }
  try {
    const { data, error } = await supabase.storage.from('customer-uploads').createSignedUrl(pathOrUrl, 3600);
    if (error) {
      console.warn('Error creating signed URL for customer upload:', pathOrUrl, error);
      return '';
    }
    return data?.signedUrl || '';
  } catch (err) {
    console.warn('getCustomerSignedUrl error:', err);
    return '';
  }
}

// ============================================================================
// DATA MAPPING LAYER: snake_case DB columns <-> camelCase App objects
// ============================================================================

export function mapRowToProduct(row: any): Product {
  return {
    id: String(row.id),
    name: row.name || '',
    category: row.category || '',
    price: Number(row.price || 0),
    mrp: Number(row.mrp || row.price || 0),
    occasion: row.occasion || '',
    description: row.description || '',
    stock: Number(row.stock || 0),
    featured: Boolean(row.featured),
    images: Array.isArray(row.images) ? row.images : row.images ? [row.images] : [],
    createdAt: row.created_at ? Number(row.created_at) : undefined,
  };
}

export function mapProductToRow(product: Omit<Product, 'id'> & { id?: string }): any {
  const row: any = {
    name: product.name,
    category: product.category,
    price: product.price,
    mrp: product.mrp,
    occasion: product.occasion,
    description: product.description || '',
    stock: product.stock,
    featured: Boolean(product.featured),
    images: product.images || [],
    created_at: product.createdAt || Date.now(),
  };
  if (product.id) {
    row.id = product.id;
  }
  return row;
}

export function mapRowToCategory(row: any): Category {
  return {
    id: String(row.id),
    name: row.name || '',
    image: row.image || '',
  };
}

export function mapCategoryToRow(cat: { id?: string; name: string; image?: string }): any {
  const row: any = {
    name: cat.name.trim(),
    image: cat.image || '',
    created_at: Date.now(),
  };
  if (cat.id) {
    row.id = cat.id;
  }
  return row;
}

export function mapRowToHeroSlide(row: any): HeroSlide {
  return {
    id: String(row.id),
    headline: row.title || '',
    subheadline: row.subtitle || '',
    image: row.image || '',
    buttonText: row.cta_text || 'Shop Now',
    buttonLink: row.cta_link || 'shop',
    order: Number(row.sort_order || 1),
  };
}

export function mapHeroSlideToRow(slide: Omit<HeroSlide, 'id'> & { id?: string }): any {
  const row: any = {
    title: slide.headline,
    subtitle: slide.subheadline || '',
    image: slide.image,
    cta_text: slide.buttonText || 'Shop Collection',
    cta_link: slide.buttonLink || 'shop',
    sort_order: slide.order || 1,
    data: {},
    created_at: Date.now(),
  };
  if (slide.id) {
    row.id = slide.id;
  }
  return row;
}

export function mapRowToPaymentSettings(row: any): PaymentSettings {
  return {
    upiId: row?.upi_id || '',
    upiQrCodeUrl: row?.qr_code_url || '',
    updatedAt: row?.updated_at ? Number(row.updated_at) : Date.now(),
  };
}

export function mapPaymentSettingsToRow(settings: PaymentSettings): any {
  return {
    id: 'default',
    upi_id: settings.upiId || '',
    qr_code_url: settings.upiQrCodeUrl || '',
    data: {},
    updated_at: Date.now(),
  };
}

export function mapRowToOrder(row: any): Order {
  const customer = row.customer || {};
  return {
    id: String(row.id),
    userId: row.user_id || customer.userId || '',
    userEmail: customer.userEmail || '',
    customerName: customer.customerName || '',
    customerPhone: customer.customerPhone || '',
    address: customer.address || '',
    city: customer.city || '',
    pincode: customer.pincode || '',
    items: row.items || [],
    subtotal: Number(customer.subtotal || row.total || 0),
    shippingFee: Number(customer.shippingFee || 0),
    totalAmount: Number(row.total || 0),
    paymentMethod: (customer.paymentMethod as PaymentMethod) || 'COD',
    paymentScreenshotUrl: row.payment_screenshot_url || '',
    paymentStatus: (row.payment_status as PaymentStatus) || 'Pending Verification',
    orderStatus: (row.order_status as OrderStatus) || 'New',
    createdAt: Number(row.created_at || Date.now()),
  };
}

export function mapOrderToRow(order: Omit<Order, 'id' | 'createdAt'> & { id?: string; createdAt?: number }): any {
  const isValidUuid = (str?: string) =>
    Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str));

  return {
    ...(order.id ? { id: order.id } : {}),
    user_id: isValidUuid(order.userId) ? order.userId : null,
    customer: {
      userId: order.userId,
      userEmail: order.userEmail,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      address: order.address,
      city: order.city,
      pincode: order.pincode,
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      paymentMethod: order.paymentMethod,
    },
    items: order.items,
    total: order.totalAmount,
    payment_screenshot_url: order.paymentScreenshotUrl || null,
    order_status: order.orderStatus,
    payment_status: order.paymentStatus,
    data: {},
    created_at: order.createdAt || Date.now(),
  };
}

export function mapRowToCustomInquiry(row: any): CustomInquiry {
  const details = row.details || {};
  return {
    id: String(row.id),
    name: details.name || '',
    phone: details.phone || '',
    occasion: details.occasion || '',
    budget: details.budget || '',
    details: details.details || '',
    referenceImageUrl: row.reference_image_url || '',
    referenceImages: Array.isArray(row.reference_images)
      ? row.reference_images
      : row.reference_image_url
      ? [row.reference_image_url]
      : [],
    status: (row.status as InquiryStatus) || 'New',
    createdAt: Number(row.created_at || Date.now()),
  };
}

export function mapCustomInquiryToRow(
  inquiry: Omit<CustomInquiry, 'id' | 'createdAt' | 'status'> & { id?: string; createdAt?: number; status?: InquiryStatus }
): any {
  return {
    ...(inquiry.id ? { id: inquiry.id } : {}),
    user_id: null,
    details: {
      name: inquiry.name,
      phone: inquiry.phone,
      occasion: inquiry.occasion,
      budget: inquiry.budget,
      details: inquiry.details,
    },
    reference_image_url: inquiry.referenceImageUrl || null,
    reference_images: inquiry.referenceImages || [],
    status: inquiry.status || 'New',
    created_at: inquiry.createdAt || Date.now(),
  };
}

// ============================================================================
// DATABASE CRUD OPERATIONS (SUPABASE)
// ============================================================================

// --- Products ---
export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error('fetchProducts error:', error);
    throw error;
  }
  return (data || []).map(mapRowToProduct);
}

export async function saveProduct(product: Omit<Product, 'id'> & { id?: string }): Promise<Product> {
  const row = mapProductToRow(product);
  if (product.id) {
    const { data, error } = await supabase.from('products').update(row).eq('id', product.id).select().single();
    if (error) throw new Error(error.message);
    return mapRowToProduct(data);
  } else {
    const { data, error } = await supabase.from('products').insert(row).select().single();
    if (error) throw new Error(error.message);
    return mapRowToProduct(data);
  }
}

export async function removeProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// --- Categories ---
export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('*').order('name', { ascending: true });
  if (error) {
    console.error('fetchCategories error:', error);
    throw error;
  }
  return (data || []).map(mapRowToCategory);
}

export async function saveCategory(category: { id?: string; name: string; image?: string }): Promise<Category> {
  const row = mapCategoryToRow(category);
  if (category.id) {
    const { data, error } = await supabase.from('categories').update(row).eq('id', category.id).select().single();
    if (error) throw new Error(error.message);
    return mapRowToCategory(data);
  } else {
    const { data, error } = await supabase.from('categories').insert(row).select().single();
    if (error) throw new Error(error.message);
    return mapRowToCategory(data);
  }
}

export async function removeCategory(id: string, _name?: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// --- Hero Slides ---
export async function fetchHeroSlides(): Promise<HeroSlide[]> {
  const { data, error } = await supabase.from('hero_slides').select('*').order('sort_order', { ascending: true });
  if (error) {
    console.error('fetchHeroSlides error:', error);
    throw error;
  }
  return (data || []).map(mapRowToHeroSlide);
}

export async function saveHeroSlide(slide: Omit<HeroSlide, 'id'> & { id?: string }): Promise<HeroSlide> {
  const row = mapHeroSlideToRow(slide);
  if (slide.id) {
    const { data, error } = await supabase.from('hero_slides').update(row).eq('id', slide.id).select().single();
    if (error) throw new Error(error.message);
    return mapRowToHeroSlide(data);
  } else {
    const { data, error } = await supabase.from('hero_slides').insert(row).select().single();
    if (error) throw new Error(error.message);
    return mapRowToHeroSlide(data);
  }
}

export async function removeHeroSlide(id: string): Promise<void> {
  const { error } = await supabase.from('hero_slides').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// --- Payment Settings ---
export async function fetchPaymentSettings(): Promise<PaymentSettings> {
  const { data, error } = await supabase.from('payment_settings').select('*').eq('id', 'default').maybeSingle();
  if (error) {
    console.error('fetchPaymentSettings error:', error);
    throw error;
  }
  if (!data) {
    return {
      upiId: '',
      upiQrCodeUrl: '',
      updatedAt: Date.now(),
    };
  }
  return mapRowToPaymentSettings(data);
}

export async function savePaymentSettings(settings: PaymentSettings): Promise<void> {
  const row = mapPaymentSettingsToRow(settings);
  const { error } = await supabase.from('payment_settings').upsert(row, { onConflict: 'id' });
  if (error) throw new Error(error.message);
}

// --- Orders ---
export async function createOrder(orderData: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
  const id = 'ORD-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
  const row = mapOrderToRow({ ...orderData, id, createdAt: Date.now() });
  const { data, error } = await supabase.from('orders').insert(row).select().single();
  if (error) throw new Error(error.message || 'Failed to submit order');
  return mapRowToOrder(data);
}

export async function fetchAllOrders(): Promise<Order[]> {
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message || 'Failed to fetch orders');
  return (data || []).map(mapRowToOrder);
}

export async function fetchCustomerOrders(userEmail: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .filter('customer->>userEmail', 'eq', userEmail)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message || 'Failed to fetch customer orders');
  return (data || []).map(mapRowToOrder);
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  const { error } = await supabase.from('orders').update({ order_status: status }).eq('id', orderId);
  if (error) throw new Error(error.message || 'Failed to update order status');
}

export async function updatePaymentVerification(orderId: string, status: PaymentStatus): Promise<void> {
  const { error } = await supabase.from('orders').update({ payment_status: status }).eq('id', orderId);
  if (error) throw new Error(error.message || 'Failed to update payment status');
}

// --- Custom Inquiries ---
export async function createCustomInquiry(
  inquiryData: Omit<CustomInquiry, 'id' | 'createdAt' | 'status'>
): Promise<CustomInquiry> {
  const id = 'INQ-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
  const row = mapCustomInquiryToRow({ ...inquiryData, id, createdAt: Date.now(), status: 'New' });
  const { data, error } = await supabase.from('custom_inquiries').insert(row).select().single();
  if (error) throw new Error(error.message || 'Failed to submit custom inquiry');
  return mapRowToCustomInquiry(data);
}

export async function fetchCustomInquiries(): Promise<CustomInquiry[]> {
  const { data, error } = await supabase.from('custom_inquiries').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message || 'Failed to fetch inquiries');
  return (data || []).map(mapRowToCustomInquiry);
}

export async function updateInquiryStatus(inquiryId: string, status: InquiryStatus): Promise<void> {
  const { error } = await supabase.from('custom_inquiries').update({ status }).eq('id', inquiryId);
  if (error) throw new Error(error.message || 'Failed to update inquiry status');
}

// ============================================================================
// AUTH & ADMIN AUTHORIZATION
// ============================================================================

/**
 * Checks whether the current user is an admin.
 * Only ashjewellery09@gmail.com / ashjwellery09@gmail.com is granted admin access.
 */
export async function checkIsAdmin(userEmail?: string | null): Promise<boolean> {
  const cleanEmail = (userEmail || '').trim().toLowerCase();
  const isAdminEmail = (email: string) =>
    email === 'ashjewellery09@gmail.com' || email === 'ashjwellery09@gmail.com';

  if (cleanEmail) {
    return isAdminEmail(cleanEmail);
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    const sessionEmail = session?.user?.email?.trim().toLowerCase();
    if (sessionEmail && isAdminEmail(sessionEmail)) {
      return true;
    }

    if (typeof window !== 'undefined') {
      const savedAdmin = localStorage.getItem('ash_jewellery_admin_user');
      if (savedAdmin && isAdminEmail(savedAdmin.trim().toLowerCase())) {
        return true;
      }
    }

    const { data, error } = await supabase.rpc('is_admin');
    if (!error && Boolean(data) && sessionEmail && isAdminEmail(sessionEmail)) {
      return true;
    }
    return false;
  } catch (err) {
    console.warn('checkIsAdmin error:', err);
    return false;
  }
}
