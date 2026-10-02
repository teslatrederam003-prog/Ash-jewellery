import React, { useState, useEffect, Suspense, lazy } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { AlertCircle } from 'lucide-react';
import { auth } from './lib/firebase';
import {
  Product,
  Category,
  HeroSlide,
  CartItem,
  Order,
  PaymentSettings,
  ActivePage,
} from './types';
import {
  fetchProducts,
  fetchCategories,
  fetchHeroSlides,
  fetchPaymentSettings,
  subscribeProducts,
  subscribeCategories,
  subscribeHeroSlides,
  subscribePaymentSettings,
  subscribeSyncStatus,
  getInstantInitialProducts,
  getInstantInitialCategories,
  getInstantInitialHeroSlides,
  getInstantInitialPaymentSettings,
} from './services/dbService';

// Eagerly loaded components for instant homepage render
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HeroBanner } from './components/HeroBanner';
import { CategoryTiles } from './components/CategoryTiles';
import { ProductCard } from './components/ProductCard';
import { AuthModal } from './components/AuthModal';

// Code-split pages: loaded on-demand to drastically reduce initial JS payload
const ShopPage = lazy(() => import('./components/ShopPage').then((m) => ({ default: m.ShopPage })));
const CartPage = lazy(() => import('./components/CartPage').then((m) => ({ default: m.CartPage })));
const CheckoutPage = lazy(() => import('./components/CheckoutPage').then((m) => ({ default: m.CheckoutPage })));
const MyOrdersPage = lazy(() => import('./components/MyOrdersPage').then((m) => ({ default: m.MyOrdersPage })));
const CustomOrderPage = lazy(() => import('./components/CustomOrderPage').then((m) => ({ default: m.CustomOrderPage })));
const AboutUsPage = lazy(() => import('./components/AboutUsPage').then((m) => ({ default: m.AboutUsPage })));
const ContactUsPage = lazy(() => import('./components/ContactUsPage').then((m) => ({ default: m.ContactUsPage })));
const AdminPanel = lazy(() => import('./components/AdminPanel').then((m) => ({ default: m.AdminPanel })));
const ProductDetailModal = lazy(() => import('./components/ProductDetailModal').then((m) => ({ default: m.ProductDetailModal })));
const OrderConfirmationModal = lazy(() => import('./components/OrderConfirmationModal').then((m) => ({ default: m.OrderConfirmationModal })));

function PageLoadingFallback() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center py-20 bg-[#FFF8EC]">
      <div className="w-10 h-10 border-3 border-[#D4A017] border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-xs uppercase tracking-widest font-bold text-[#9B1C2F]">Loading...</p>
    </div>
  );
}

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>('home');

  // Auth state - initialized immediately from persistent storage so refresh keeps login active
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    try {
      return localStorage.getItem('ash_jewellery_local_user_email') || null;
    } catch {
      return null;
    }
  });
  const [userId, setUserId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('ash_jewellery_local_user_id') || null;
    } catch {
      return null;
    }
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const isAdmin = Boolean(userEmail && userEmail.toLowerCase() === 'admin@ashjewellery.com');

  // Firestore Data State - Instant 0-second cache-first initial render
  const [products, setProducts] = useState<Product[]>(() => getInstantInitialProducts());
  const [categories, setCategories] = useState<Category[]>(() => getInstantInitialCategories());
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(() => getInstantInitialHeroSlides());
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(() => getInstantInitialPaymentSettings());

  // Real-time synchronization status banner
  const [isSyncDegraded, setIsSyncDegraded] = useState(false);

  // Selected Category filter for Shop page
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Selected Product for quick view / detail modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Cart State - persisted in localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('ash_jewellery_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Confirmed Order for success modal
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Sync Cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ash_jewellery_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('Failed to save cart to localStorage:', e);
    }
  }, [cart]);

  // Firebase Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
        setUserId(user.uid);
        try {
          localStorage.setItem('ash_jewellery_local_user_email', user.email || '');
          localStorage.setItem('ash_jewellery_local_user_id', user.uid);
        } catch {
          // ignore
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Listen to Firestore connection degradation
  useEffect(() => {
    return subscribeSyncStatus((degraded) => {
      setIsSyncDegraded(degraded);
    });
  }, []);

  // Realtime Live Data Synchronization
  useEffect(() => {
    const unsubProds = subscribeProducts((prods) => {
      if (prods && prods.length > 0) setProducts(prods);
    });
    const unsubCats = subscribeCategories((cats) => {
      if (cats && cats.length > 0) setCategories(cats);
    });
    const unsubSlides = subscribeHeroSlides((slides) => {
      if (slides && slides.length > 0) setHeroSlides(slides);
    });
    const unsubPay = subscribePaymentSettings((pay) => {
      if (pay) setPaymentSettings(pay);
    });

    return () => {
      unsubProds();
      unsubCats();
      unsubSlides();
      unsubPay();
    };
  }, []);

  const refreshStorefront = async () => {
    try {
      const [pList, cList, hList, paySet] = await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchHeroSlides(),
        fetchPaymentSettings(),
      ]);
      if (pList && pList.length > 0) setProducts(pList);
      if (cList && cList.length > 0) setCategories(cList);
      if (hList && hList.length > 0) setHeroSlides(hList);
      if (paySet) setPaymentSettings(paySet);
    } catch (e) {
      console.warn('Manual refresh notice:', e);
    }
  };

  // Cart Handlers
  const handleAddToCart = (product: Product, quantity: number = 1, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prevCart, { product, quantity }];
    });
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleBuyNow = (product: Product, quantity: number = 1) => {
    handleAddToCart(product, quantity);
    setActivePage('checkout');
  };

  const handleOrderSuccess = (order: Order) => {
    handleClearCart();
    setConfirmedOrder(order);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    setUserEmail(null);
    setUserId(null);
    try {
      localStorage.removeItem('ash_jewellery_local_user_email');
      localStorage.removeItem('ash_jewellery_local_user_id');
    } catch {
      // ignore
    }
    if (activePage === 'admin' || activePage === 'my-orders') {
      setActivePage('home');
    }
  };

  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#FFF8EC] text-[#2A1810] flex flex-col font-sans selection:bg-[#9B1C2F] selection:text-white">
      
      {/* Resilient Connection Status Warning Banner */}
      {isSyncDegraded && (
        <div className="bg-[#FFF3CD] border-b border-[#FFEEBA] text-[#856404] px-4 py-2.5 text-xs font-semibold flex items-center justify-between shadow-2xs z-50">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#856404] shrink-0" />
            <span>Having trouble loading the latest products — showing a previous version.</span>
          </div>
          <button
            onClick={() => {
              setIsSyncDegraded(false);
              refreshStorefront();
            }}
            className="ml-4 px-3 py-1 rounded-sm bg-[#856404] text-white text-[11px] font-bold uppercase tracking-wider hover:bg-[#6c5103] transition-colors cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Navigation */}
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        cartCount={cartTotalItems}
        userEmail={userEmail}
        isAdmin={isAdmin}
        onOpenAuth={() => setAuthModalOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Main Content Areas */}
      <main className="flex-1">
        
        {/* PAGE 1: HOME */}
        {activePage === 'home' && (
          <div className="space-y-12 sm:space-y-16 pb-16">
            {/* Hero Slider */}
            <HeroBanner slides={heroSlides} setActivePage={setActivePage} />

            {/* Curated Categories */}
            <CategoryTiles
              categories={categories}
              onSelectCategory={(catName) => {
                setSelectedCategory(catName);
                setActivePage('shop');
              }}
            />

            {/* Featured Collection Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8 border-b border-[#EFE1C8] pb-4">
                <div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2A1810]">
                    Featured Adornments
                  </h2>
                  <p className="text-xs uppercase tracking-widest text-[#9B1C2F] mt-1 font-semibold">
                    Handpicked Masterpieces for the Discerning Bride
                  </p>
                </div>
                <button
                  onClick={() => setActivePage('shop')}
                  className="text-xs font-bold uppercase tracking-wider text-[#9B1C2F] hover:text-[#D4A017] transition-colors border-b-2 border-transparent hover:border-[#D4A017] pb-0.5 cursor-pointer"
                >
                  View All &rarr;
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {products
                  .filter((p) => p.featured)
                  .slice(0, 8)
                  .map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onSelect={(p) => setSelectedProduct(p)}
                      onAddToCart={(p, e) => handleAddToCart(p, 1, e)}
                    />
                  ))}
              </div>
            </section>
          </div>
        )}

        {/* Code-split Suspense container for deeper routes */}
        <Suspense fallback={<PageLoadingFallback />}>
          
          {/* PAGE 2: SHOP */}
          {activePage === 'shop' && (
            <ShopPage
              products={products}
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              onSelectProduct={(p) => setSelectedProduct(p)}
              onAddToCart={(p, e) => handleAddToCart(p, 1, e)}
            />
          )}

          {/* PAGE 3: CART */}
          {activePage === 'cart' && (
            <CartPage
              cart={cart}
              onUpdateQuantity={handleUpdateCartQuantity}
              onRemoveItem={handleRemoveFromCart}
              onClearCart={handleClearCart}
              setActivePage={setActivePage}
            />
          )}

          {/* PAGE 4: CHECKOUT */}
          {activePage === 'checkout' && (
            <CheckoutPage
              cart={cart}
              userEmail={userEmail}
              userId={userId}
              paymentSettings={paymentSettings}
              onOrderSuccess={handleOrderSuccess}
              onOpenAuth={() => setAuthModalOpen(true)}
              setActivePage={setActivePage}
            />
          )}

          {/* PAGE 5: MY ORDERS */}
          {activePage === 'my-orders' && (
            <MyOrdersPage
              userEmail={userEmail}
              setActivePage={setActivePage}
              onOpenAuth={() => setAuthModalOpen(true)}
            />
          )}

          {/* PAGE 6: CUSTOM ORDERS */}
          {activePage === 'custom-orders' && <CustomOrderPage />}

          {/* PAGE 7: ABOUT US */}
          {activePage === 'about' && <AboutUsPage setActivePage={setActivePage} />}

          {/* PAGE 8: CONTACT US */}
          {activePage === 'contact' && <ContactUsPage />}

          {/* PAGE 9: ADMIN PANEL */}
          {activePage === 'admin' && (
            <AdminPanel
              userEmail={userEmail}
              onOpenAuth={() => setAuthModalOpen(true)}
              setActivePage={setActivePage}
              onRefreshStorefront={refreshStorefront}
            />
          )}

        </Suspense>

      </main>

      {/* Footer */}
      <Footer setActivePage={setActivePage} />

      {/* Lazy Modals in Suspense */}
      <Suspense fallback={null}>
        {/* Product Detail Modal */}
        {selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={(p, q) => handleAddToCart(p, q)}
            onBuyNow={(p, q) => handleBuyNow(p, q)}
          />
        )}

        {/* Order Confirmation Success Modal */}
        {confirmedOrder && (
          <OrderConfirmationModal
            order={confirmedOrder}
            onClose={() => setConfirmedOrder(null)}
            setActivePage={setActivePage}
          />
        )}
      </Suspense>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(email, uid) => {
          setUserEmail(email);
          if (uid) setUserId(uid);
        }}
      />

    </div>
  );
}
