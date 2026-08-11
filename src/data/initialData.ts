import { Product, Category, HeroSlide, PaymentSettings } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-necklaces',
    name: 'Necklaces',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'cat-earrings',
    name: 'Earrings',
    image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'cat-pendants',
    name: 'Pendants',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'cat-bangles',
    name: 'Bangles',
    image: 'https://images.unsplash.com/photo-1611591475170-438dcb9a8932?auto=format&fit=crop&q=80&w=800',
  },
];

export const INITIAL_HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=1600',
    headline: 'Royal Festive & Bridal Jewellery',
    subheadline: 'Handcrafted artificial pieces that radiate timeless royal elegance',
    buttonText: 'Explore Collection',
    buttonLink: 'shop',
    order: 1,
  },
  {
    id: 'slide-2',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=1600',
    headline: 'Everyday Sparkle & Subtle Elegance',
    subheadline: 'Lightweight pendants & earrings for modern fashion',
    buttonText: 'Shop Pendants',
    buttonLink: 'shop',
    order: 2,
  },
  {
    id: 'slide-3',
    image: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&q=80&w=1600',
    headline: 'Custom Bridal & Statement Sets',
    subheadline: 'Designed in-house to match your special occasion attire',
    buttonText: 'Request Custom Order',
    buttonLink: 'custom-orders',
    order: 3,
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Kundan Royal Choker Necklace Set',
    category: 'Necklaces',
    price: 2499,
    mrp: 3999,
    occasion: 'Bridal',
    description: 'Exquisite Kundan choker necklace set adorned with ruby-red stones and faux pearls. Comes with matching jhumka earrings and maang tikka.',
    stock: 12,
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800',
    ],
    featured: true,
  },
  {
    id: 'prod-2',
    name: 'Chandbali Gold-Plated Drop Earrings',
    category: 'Earrings',
    price: 899,
    mrp: 1499,
    occasion: 'Festive',
    description: 'Traditional Chandbali style earrings crafted with intricate gold polish, pearl drops, and ruby red gem accentuation.',
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=800',
    ],
    featured: true,
  },
  {
    id: 'prod-3',
    name: 'Antique Peacock Gold Bangle Pair',
    category: 'Bangles',
    price: 1299,
    mrp: 1999,
    occasion: 'Festive',
    description: 'Set of two heavy openable gold-plated bangles featuring hand-engraved peacock motifs and subtle red enamel work.',
    stock: 18,
    images: [
      'https://images.unsplash.com/photo-1611591475170-438dcb9a8932?auto=format&fit=crop&q=80&w=800',
    ],
    featured: true,
  },
  {
    id: 'prod-4',
    name: 'Solitaire Crystal Drop Pendant Chain',
    category: 'Pendants',
    price: 649,
    mrp: 999,
    occasion: 'Everyday Wear',
    description: 'Minimalist gold chain with a brilliant tear-drop crystal pendant. Anti-tarnish finish suitable for daily wear.',
    stock: 30,
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800',
    ],
    featured: false,
  },
  {
    id: 'prod-5',
    name: 'Heritage Emerald Temple Necklace',
    category: 'Necklaces',
    price: 3199,
    mrp: 4999,
    occasion: 'Bridal',
    description: 'South Indian temple style long necklace showcasing Goddess motifs, emerald green stones, and cluster pearls.',
    stock: 8,
    images: [
      'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&q=80&w=800',
    ],
    featured: true,
  },
  {
    id: 'prod-6',
    name: 'Traditional Jhumka Earrings with Pearl Strings',
    category: 'Earrings',
    price: 749,
    mrp: 1199,
    occasion: 'Festive',
    description: 'Classic domed jhumkas with attached ear-chain pearl strings (kaan chain) for festive weddings and celebrations.',
    stock: 20,
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800',
    ],
    featured: false,
  },
  {
    id: 'prod-7',
    name: 'Floral Meenakari Kada Bangle Set',
    category: 'Bangles',
    price: 1499,
    mrp: 2299,
    occasion: 'Party',
    description: 'Vibrant set of 4 Meenakari work glass & metal kadas featuring hand-painted floral motifs and ruby stones.',
    stock: 15,
    images: [
      'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&q=80&w=800',
    ],
    featured: false,
  },
  {
    id: 'prod-8',
    name: 'Cubic Zirconia Rose Gold Heart Pendant',
    category: 'Pendants',
    price: 899,
    mrp: 1399,
    occasion: 'Everyday Wear',
    description: 'Delicate rose gold-plated heart pendant encrusted with AAA cubic zirconia diamonds. Tarnish-resistant polish.',
    stock: 22,
    images: [
      'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&q=80&w=800',
    ],
    featured: true,
  },
];

export const INITIAL_PAYMENT_SETTINGS: PaymentSettings = {
  upiQrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=ashjewellery@upi&pn=Ash%20Jewellery&cu=INR',
  upiId: 'ashjewellery@upi',
};
