export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  mrp: number;
  occasion: string;
  description: string;
  stock: number;
  images: string[];
  featured: boolean;
  createdAt?: number;
}

export interface Category {
  id: string;
  name: string;
  image: string;
}

export interface HeroSlide {
  id: string;
  image: string;
  headline: string;
  subheadline?: string;
  buttonText: string;
  buttonLink: string;
  order: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export type PaymentMethod = 'COD' | 'Online (QR Code)';
export type PaymentStatus = 'Pending Verification' | 'Verified' | 'COD';
export type OrderStatus = 'New' | 'Processing' | 'Shipped' | 'Delivered';

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  customerName: string;
  customerPhone: string;
  address: string;
  city: string;
  pincode: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentScreenshotUrl?: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: number;
}

export type InquiryStatus = 'New' | 'Contacted' | 'In Progress' | 'Completed' | 'Closed';

export interface CustomInquiry {
  id: string;
  name: string;
  phone: string;
  occasion: string;
  budget: string;
  details: string;
  referenceImageUrl?: string;
  referenceImages?: string[];
  status: InquiryStatus;
  createdAt: number;
}

export interface PaymentSettings {
  upiQrCodeUrl: string;
  upiId: string;
}

export type ActivePage =
  | 'home'
  | 'shop'
  | 'product-detail'
  | 'about'
  | 'custom-orders'
  | 'contact'
  | 'cart'
  | 'checkout'
  | 'auth'
  | 'my-orders'
  | 'admin';
