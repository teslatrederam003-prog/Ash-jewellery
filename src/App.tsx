import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import { supabase } from './lib/supabase';
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
  checkIsAdmin,
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

  // Auth & Admin state - evaluated dynamically via Supabase Auth & is_admin RPC
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Catalog Data States - initialized empty (NO hardcoded placeholder/demo data)
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    upiId: '',
    upiQrCodeUrl: '',
    updatedAt: 0,
  });

  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [catalogError, setCatalogError] = useState(false);

  // Selected Category filter for Shop page
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Selected Product for quick view / detail modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Cart State - persisted ONLY in localStorage
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

  // Supabase Auth State & Admin Resolution
  useEffect(() => {
    const syncUserAndAdmin = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const savedAdmin = localStorage.getItem('ash_jewellery_admin_user');
        const activeEmail = session?.user?.email || savedAdmin || null;

        if (activeEmail) {
          setUserEmail(activeEmail);
          setUserId(session?.user?.id || 'admin-5c73324f');
          const isAdm = await checkIsAdmin(activeEmail);
          setIsAdmin(isAdm);
        } else {
          setUserEmail(null);
          setUserId(null);
          setIsAdmin(false);
        }
      } catch (err) {
        console.warn('Auth sync error:', err);
      }
    };

    syncUserAndAdmin();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const savedAdmin = localStorage.getItem('ash_jewellery_admin_user');
      const activeEmail = session?.user?.email || savedAdmin || null;

      if (activeEmail) {
        setUserEmail(activeEmail);
        setUserId(session?.user?.id || 'admin-5c73324f');
        const isAdm = await checkIsAdmin(activeEmail);
        setIsAdmin(isAdm);
      } else {
        setUserEmail(null);
        setUserId(null);
        setIsAdmin(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Single one-time catalog fetch on page load + Supabase Realtime synchronization
  const loadCatalog = async () => {
    setLoadingCatalog(true);
    setCatalogError(false);
    try {
      const [pList, cList, hList, paySet] = await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchHeroSlides(),
        fetchPaymentSettings(),
      ]);
      setProducts(pList);
      setCategories(cList);
      setHeroSlides(hList);
      setPaymentSettings(paySet);
    } catch (err) {
      console.error('Failed to load collection:', err);
      setCatalogError(true);
    } finally {
      setLoadingCatalog(false);
    }
  };

  useEffect(() => {
    loadCatalog();

    // Subscribe to Supabase Realtime changes for catalog tables
    const channel = supabase
      .channel('catalog-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, async () => {
        try {
          const prods = await fetchProducts();
          setProducts(prods);
        } catch (e) {
          console.warn('Realtime product refresh error:', e);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, async () => {
        try {
          const cats = await fetchCategories();
          setCategories(cats);
        } catch (e) {
          console.warn('Realtime category refresh error:', e);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hero_slides' }, async () => {
        try {
          const slides = await fetchHeroSlides();
          setHeroSlides(slides);
        } catch (e) {
          console.warn('Realtime slide refresh error:', e);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payment_settings' }, async () => {
        try {
          const pay = await fetchPaymentSettings();
          setPaymentSettings(pay);
        } catch (e) {
          console.warn('Realtime payment settings refresh error:', e);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign out error:', err);
    }
    localStorage.removeItem('ash_jewellery_admin_user');
    setUserEmail(null);
    setUserId(null);
    setIsAdmin(false);
    if (activePage === 'admin' || activePage === 'my-orders') {
      setActivePage('home');
    }
  };

  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#FFF8EC] text-[#2A1810] flex flex-col font-sans selection:bg-[#9B1C2F] selection:text-white">
      
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
            
            {/* Catalog Loading Error Notice */}
            {catalogError ? (
              <div className="max-w-xl mx-auto my-12 p-8 bg-white border-2 border-[#D4A017] rounded-sm text-center shadow-lg">
                <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto mb-3">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#2A1810]">Couldn't load the collection. Please refresh.</h3>
                <p className="text-xs text-[#7A6A5C] mt-1 mb-6">We were unable to reach the store server. Please try again.</p>
                <button
                  onClick={loadCatalog}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-sm bg-[#9B1C2F] text-white font-bold text-xs uppercase tracking-wider border border-[#D4A017] hover:bg-[#7D1626] transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Retry</span>
                </button>
              </div>
            ) : loadingCatalog && products.length === 0 ? (
              <div className="min-h-[50vh] flex flex-col items-center justify-center py-24">
                <div className="w-10 h-10 border-3 border-[#D4A017] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-xs uppercase tracking-widest font-bold text-[#9B1C2F]">Loading Collection...</p>
              </div>
            ) : (
              <>
                {/* Hero Slider */}
                {heroSlides.length > 0 && <HeroBanner slides={heroSlides} setActivePage={setActivePage} />}

                {/* Curated Categories */}
                {categories.length > 0 && (
                  <CategoryTiles
                    categories={categories}
                    onSelectCategory={(catName) => {
                      setSelectedCategory(catName);
                      setActivePage('shop');
                    }}
                  />
                )}

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
                    {products.length > 0 && (
                      <button
                        onClick={() => setActivePage('shop')}
                        className="text-xs font-bold uppercase tracking-wider text-[#9B1C2F] hover:text-[#D4A017] transition-colors border-b-2 border-transparent hover:border-[#D4A017] pb-0.5 cursor-pointer"
                      >
                        View All &rarr;
                      </button>
                    )}
                  </div>

                  {products.length > 0 ? (
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
                  ) : (
                    <div className="py-16 text-center bg-white border border-[#EFE1C8] rounded-sm p-8">
                      <Sparkles className="w-8 h-8 text-[#D4A017] mx-auto mb-3" />
                      <h3 className="font-serif text-lg font-bold text-[#2A1810]">Collection Coming Soon</h3>
                      <p className="text-xs text-[#7A6A5C] mt-1 max-w-md mx-auto">
                        New handcrafted jewellery pieces are being prepared. In the meantime, you can place a custom order inquiry.
                      </p>
                      <button
                        onClick={() => setActivePage('custom-orders')}
                        className="mt-5 px-6 py-2.5 rounded-sm bg-[#9B1C2F] text-white font-bold text-xs uppercase tracking-wider border border-[#D4A017] hover:bg-[#7D1626] transition-colors cursor-pointer"
                      >
                        Custom Orders
                      </button>
                    </div>
                  )}
                </section>
              </>
            )}
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
              isAdmin={isAdmin}
              onOpenAuth={() => setAuthModalOpen(true)}
              setActivePage={setActivePage}
              onRefreshStorefront={loadCatalog}
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
        onSuccess={async (email, uid) => {
          setUserEmail(email);
          if (uid) setUserId(uid);
          const isAdm = await checkIsAdmin(email);
          setIsAdmin(isAdm);
          if (isAdm) {
            setActivePage('admin');
          }
        }}
      />

    </div>
  );
}
