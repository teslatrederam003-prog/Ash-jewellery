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
    id: 'cat-bridal',
    name: 'Bridal Sets',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800',
  },
];

export const INITIAL_HERO_SLIDES: HeroSlide[] = [
  {
    id: 'hero-1',
    headline: 'Handcrafted Heritage Jewellery',
    subheadline: 'Timeless Kundan, Polki & Temple bridal adornments.',
    image: 'https://images.unsplash.com/photo-1611591475817-48f88753235d?auto=format&fit=crop&q=80&w=1600',
    buttonText: 'Explore Collections',
    buttonLink: 'shop',
    order: 1,
  },
  {
    id: 'hero-2',
    headline: 'Royal Bridal & Festive Splendor',
    subheadline: 'Crafted with precision for life’s most cherished celebrations.',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=1600',
    buttonText: 'Custom Bridal Inquiry',
    buttonLink: 'custom-orders',
    order: 2,
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-placeholder-1',
    name: 'Royal Heritage Kundan Choker Set',
    category: 'Necklaces',
    price: 3499,
    mrp: 4999,
    occasion: 'Bridal',
    description: 'Exquisitely handcrafted Kundan choker embellished with faux pearls and micro-meenakari detailing.',
    stock: 12,
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800',
    ],
  },
  {
    id: 'prod-placeholder-2',
    name: 'Classic Gold-Plated Chandbali Earrings',
    category: 'Earrings',
    price: 1299,
    mrp: 1899,
    occasion: 'Festive',
    description: 'Traditional crescent moon earrings featuring cluster bead drops and high-luster gold finish.',
    stock: 20,
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=800',
    ],
  },
  {
    id: 'prod-placeholder-3',
    name: 'Artisan Temple Bridal Necklace',
    category: 'Bridal Sets',
    price: 4999,
    mrp: 6999,
    occasion: 'Bridal',
    description: 'Majestic handcrafted antique-finish temple necklace with matching jhumkas.',
    stock: 8,
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800',
    ],
  },
];

export const INITIAL_PAYMENT_SETTINGS: PaymentSettings = {
  upiQrCodeUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=600',
  upiId: 'ashjewellery@upi',
  updatedAt: Date.now(),
};
