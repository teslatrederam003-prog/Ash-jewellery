import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
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
  seedDatabaseIfEmpty,
  getInstantInitialProducts,
  getInstantInitialCategories,
  getInstantInitialHeroSlides,
  getInstantInitialPaymentSettings,
} from './services/dbService';

// Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HeroBanner } from './components/HeroBanner';
import { CategoryTiles } from './components/CategoryTiles';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ShopPage } from './components/ShopPage';
import { CartPage } from './components/CartPage';
import { CheckoutPage } from './components/CheckoutPage';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { AuthModal } from './components/AuthModal';
import { MyOrdersPage } from './components/MyOrdersPage';
import { CustomOrderPage } from './components/CustomOrderPage';
import { AboutUsPage } from './components/AboutUsPage';
import { ContactUsPage } from './components/ContactUsPage';
import { AdminPanel } from './components/AdminPanel';

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
  const [loading, setLoading] = useState(false); // Instant initial load without spinner

  // Cart State
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('ash_jewellery_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Selected product & Order confirmation
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Save cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('ash_jewellery_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [cart]);

  // Auth Listener - syncs with Firebase and maintains active persistent sessions
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
        setUserId(user.uid);
        if (user.email) {
          localStorage.setItem('ash_jewellery_local_user_email', user.email);
          localStorage.setItem('ash_jewellery_local_user_id', user.uid);
        }
      } else {
        // Fallback for custom/admin auth or before token re-verification
        const savedEmail = localStorage.getItem('ash_jewellery_local_user_email');
        const savedId = localStorage.getItem('ash_jewellery_local_user_id');
        if (savedEmail) {
          setUserEmail(savedEmail);
          setUserId(savedId || 'local-' + savedEmail);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Background Data Synchronization (Stale-While-Revalidate pattern)
  const loadStorefrontData = async () => {
    try {
      // Run seed in non-blocking background task
      seedDatabaseIfEmpty().catch((err) => console.warn('Background seed notice:', err));

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
    } catch (err) {
      console.error('Error in background data sync:', err);
    }
  };

  useEffect(() => {
    loadStorefrontData();
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
      handleRemoveCartItem(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleBuyNow = (product: Product, quantity: number) => {
    handleAddToCart(product, quantity);
    setSelectedProduct(null);
    setActivePage('checkout');
  };

  const handleOrderSuccess = (order: Order) => {
    setConfirmedOrder(order);
    handleClearCart();
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('ash_jewellery_local_user_email');
      localStorage.removeItem('ash_jewellery_local_user_id');
      await signOut(auth);
    } catch (e) {
      console.warn('Signout failed:', e);
    }
    setUserEmail(null);
    setUserId(null);
    setActivePage('home');
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Featured products for homepage
  const featuredProducts = products.filter((p) => p.featured).slice(0, 8);

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8EC] text-[#2A1810]">
      
      {/* Navbar */}
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        cartCount={cartCount}
        userEmail={userEmail}
        isAdmin={isAdmin}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1">
        
        {/* PAGE 1: HOME */}
        {activePage === 'home' && (
          <div className="space-[#EFE1C8]">
            <HeroBanner slides={heroSlides} setActivePage={setActivePage} />

            <CategoryTiles
              categories={categories}
              onSelectCategory={(catName) => setSelectedCategory(catName)}
              setActivePage={setActivePage}
            />

            {/* Featured Products Grid */}
            <section className="py-12 bg-[#FFF8EC]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                  <div>
                    <p className="text-xs font-semibold text-[#D4A017] uppercase tracking-widest">
                      Handcrafted Masterpieces
                    </p>
                    <h2 className="font-serif text-3xl font-bold text-[#2A1810]">
                      Featured Designs
                    </h2>
                  </div>

                  <button
                    onClick={() => setActivePage('shop')}
                    className="px-5 py-2 rounded-full bg-[#9B1C2F] text-[#FFF8EC] text-xs font-semibold border border-[#D4A017] hover:bg-[#7A1522] cursor-pointer"
                  >
                    View All {products.length} Products →
                  </button>
                </div>

                {loading ? (
                  <div className="py-12 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-[#9B1C2F] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {(featuredProducts.length > 0 ? featuredProducts : products.slice(0, 8)).map(
                      (product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onSelectProduct={(p) => setSelectedProduct(p)}
                          onAddToCart={(p, e) => handleAddToCart(p, 1, e)}
                        />
                      )
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* Brand Story Highlight Banner */}
            <section className="py-12 bg-gradient-to-r from-[#2A1810] via-[#9B1C2F] to-[#2A1810] text-[#FFF8EC] border-y-2 border-[#D4A017]">
              <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
                <h3 className="font-serif text-2xl sm:text-4xl font-bold text-[#FBEFCB]">
                  From One Dream to Another — Crafted with Love
                </h3>
                <p className="text-xs sm:text-sm text-[#EFE1C8] leading-relaxed max-w-2xl mx-auto">
                  A husband-and-wife team creating meaningful jewellery with our own hands and whole heart. Customized with love, crafted with care, and made for your moments.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setActivePage('about');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-6 py-2.5 rounded-full bg-[#D4A017] hover:bg-[#F0C75E] text-[#2A1810] font-bold text-xs shadow-md transition-colors cursor-pointer"
                  >
                    Read Our Full Story
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* PAGE 2: SHOP */}
        {activePage === 'shop' && (
          <ShopPage
            products={products}
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSelectProduct={(p) => setSelectedProduct(p)}
            onAddToCart={(p, e) => handleAddToCart(p, 1, e)}
            loading={loading}
          />
        )}

        {/* PAGE 3: CART */}
        {activePage === 'cart' && (
          <CartPage
            cart={cart}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveCartItem}
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
            onRefreshStorefront={loadStorefrontData}
          />
        )}

      </main>

      {/* Footer */}
      <Footer setActivePage={setActivePage} />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(p, q) => handleAddToCart(p, q)}
        onBuyNow={(p, q) => handleBuyNow(p, q)}
      />

      {/* Order Confirmation Success Modal */}
      <OrderConfirmationModal
        order={confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
        setActivePage={setActivePage}
      />

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
