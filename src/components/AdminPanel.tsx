import React, { useState, useEffect } from 'react';
import {
  Package,
  Grid,
  Image as ImageIcon,
  ShoppingBag,
  QrCode,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Eye,
  X,
  Upload,
  Sparkles,
  Search,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
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
  ActivePage,
} from '../types';
import { ASH_LOGO_URL } from '../assets/logo';
import {
  fetchProducts,
  saveProduct,
  removeProduct,
  fetchCategories,
  saveCategory,
  removeCategory,
  fetchHeroSlides,
  saveHeroSlide,
  removeHeroSlide,
  fetchAllOrders,
  updateOrderStatus,
  updatePaymentVerification,
  fetchCustomInquiries,
  updateInquiryStatus,
  fetchPaymentSettings,
  savePaymentSettings,
  uploadMediaFile,
} from '../services/dbService';

interface AdminPanelProps {
  userEmail: string | null;
  onOpenAuth: () => void;
  setActivePage: (page: ActivePage) => void;
  onRefreshStorefront?: () => void;
}

type AdminTab = 'products' | 'categories' | 'hero' | 'orders' | 'payment-settings';

export const AdminPanel: React.FC<AdminPanelProps> = ({
  userEmail,
  onOpenAuth,
  setActivePage,
  onRefreshStorefront,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('products');

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inquiries, setInquiries] = useState<CustomInquiry[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    upiQrCodeUrl: '',
    upiId: '',
  });

  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals & Forms State
  // 1. Product Form Modal
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [uploadingProdImage, setUploadingProdImage] = useState(false);

  // 2. Category Form Modal
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [catName, setCatName] = useState('');
  const [catImage, setCatImage] = useState('');
  const [uploadingCatImage, setUploadingCatImage] = useState(false);

  // 3. Hero Slide Modal
  const [heroModalOpen, setHeroModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Partial<HeroSlide> | null>(null);
  const [uploadingSlideImage, setUploadingSlideImage] = useState(false);

  // 4. Order Payment Screenshot / Reference Image Preview Modal
  const [previewScreenshotUrl, setPreviewScreenshotUrl] = useState<string | null>(null);
  const [previewModalTitle, setPreviewModalTitle] = useState<string>('Uploaded Payment Screenshot');

  // Filter for products/orders
  const [prodSearch, setProdSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [pList, cList, hList, oList, iList, paySet] = await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchHeroSlides(),
        fetchAllOrders(),
        fetchCustomInquiries(),
        fetchPaymentSettings(),
      ]);

      setProducts(pList);
      setCategories(cList);
      setHeroSlides(hList);
      setOrders(oList);
      setInquiries(iList);
      setPaymentSettings(paySet);
    } catch (err: any) {
      console.error('Error loading admin data:', err);
      setFeedback({ type: 'error', message: 'Failed to fetch admin data from Firestore.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  // Check login & admin email authorization
  const isAdminUser = Boolean(userEmail && userEmail.toLowerCase() === 'admin@ashjewellery.com');

  if (!userEmail || !isAdminUser) {
    return (
      <div className="py-16 bg-[#FFF8EC] min-h-[70vh] flex items-center justify-center px-4">
        <div className="bg-white border-2 border-[#D4A017] rounded-sm p-8 max-w-md w-full text-center shadow-lg">
          <div className="w-12 h-12 rounded-full bg-[#9B1C2F] text-white flex items-center justify-center mx-auto mb-3 border-2 border-[#D4A017]">
            <Package className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#2A1810]">Admin Portal Access</h2>
          <p className="text-xs font-medium text-[#7A6A5C] mt-2">
            {!userEmail
              ? 'Please sign in with the admin credentials to access store management.'
              : 'Access Restricted. Only the administrator account (admin@ashjewellery.com) can access this portal.'}
          </p>
          {!userEmail && (
            <button
              onClick={onOpenAuth}
              className="mt-6 w-full py-3 rounded-sm bg-[#9B1C2F] hover:bg-[#7A1522] text-white font-bold text-xs uppercase tracking-wider border-b-2 border-[#D4A017] cursor-pointer shadow-md"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    );
  }

  // --- PRODUCT ACTIONS ---
  const handleOpenAddProduct = () => {
    setEditingProduct({
      name: '',
      category: categories[0]?.name || 'Necklaces',
      price: 999,
      mrp: 1499,
      occasion: 'Festive',
      description: '',
      stock: 10,
      featured: false,
    });
    setProductImages([]);
    setProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductImages(prod.images || []);
    setProductModalOpen(true);
  };

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        setUploadingProdImage(true);
        const url = await uploadMediaFile(e.target.files[0], 'products');
        setProductImages((prev) => [...prev, url]);
      } catch (err: any) {
        showToast('Image upload failed', 'error');
      } finally {
        setUploadingProdImage(false);
      }
    }
  };

  const handleRemoveProductImage = (index: number) => {
    setProductImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct?.price) return;

    try {
      const saved = await saveProduct({
        ...editingProduct,
        name: editingProduct.name,
        category: editingProduct.category || 'Necklaces',
        price: Number(editingProduct.price),
        mrp: Number(editingProduct.mrp || editingProduct.price),
        occasion: editingProduct.occasion || 'Festive',
        description: editingProduct.description || '',
        stock: Number(editingProduct.stock || 0),
        images: productImages.length > 0 ? productImages : ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800'],
        featured: Boolean(editingProduct.featured),
      } as any);

      showToast(`Product "${saved.name}" saved successfully!`);
      setProductModalOpen(false);
      loadAllAdminData();
      if (onRefreshStorefront) onRefreshStorefront();
    } catch (err: any) {
      showToast('Failed to save product: ' + err.message, 'error');
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    try {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      await removeProduct(id);
      showToast(`Product "${name}" deleted.`);
      await loadAllAdminData();
      if (onRefreshStorefront) onRefreshStorefront();
    } catch (err: any) {
      showToast('Failed to delete product: ' + (err.message || 'Error'), 'error');
    }
  };

  // --- CATEGORY ACTIONS ---
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName || !catImage) return;

    try {
      await saveCategory({ name: catName, image: catImage });
      showToast(`Category "${catName}" added!`);
      setCategoryModalOpen(false);
      setCatName('');
      setCatImage('');
      await loadAllAdminData();
      if (onRefreshStorefront) onRefreshStorefront();
    } catch (err: any) {
      showToast('Failed to add category', 'error');
    }
  };

  const handleCatImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        setUploadingCatImage(true);
        const url = await uploadMediaFile(e.target.files[0], 'categories');
        setCatImage(url);
      } catch (err: any) {
        showToast('Image upload failed', 'error');
      } finally {
        setUploadingCatImage(false);
      }
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    try {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      await removeCategory(id);
      showToast(`Category "${name}" removed.`);
      await loadAllAdminData();
      if (onRefreshStorefront) onRefreshStorefront();
    } catch (err: any) {
      showToast('Failed to delete category: ' + (err.message || 'Error'), 'error');
    }
  };

  // --- HERO SLIDE ACTIONS ---
  const handleSaveHeroSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlide?.headline || !editingSlide?.image) return;

    try {
      await saveHeroSlide({
        id: editingSlide.id,
        image: editingSlide.image,
        headline: editingSlide.headline,
        subheadline: editingSlide.subheadline || '',
        buttonText: editingSlide.buttonText || 'Shop Collection',
        buttonLink: editingSlide.buttonLink || 'shop',
        order: Number(editingSlide.order || 1),
      });
      showToast('Hero slide saved!');
      setHeroModalOpen(false);
      await loadAllAdminData();
      if (onRefreshStorefront) onRefreshStorefront();
    } catch (err: any) {
      showToast('Failed to save hero slide', 'error');
    }
  };

  const handleSlideImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        setUploadingSlideImage(true);
        const url = await uploadMediaFile(file, 'hero_slides');
        if (url) {
          setEditingSlide((prev) => ({ ...prev, image: url }));
          showToast('Hero banner wallpaper loaded successfully!');
        } else {
          showToast('Failed to process image file.', 'error');
        }
      } catch (err: any) {
        showToast('Slide image upload failed: ' + (err.message || 'Error'), 'error');
      } finally {
        setUploadingSlideImage(false);
      }
    }
  };

  const handleDeleteHeroSlide = async (id: string) => {
    try {
      setHeroSlides((prev) => prev.filter((s) => s.id !== id));
      await removeHeroSlide(id);
      showToast('Hero slide deleted.');
      await loadAllAdminData();
      if (onRefreshStorefront) onRefreshStorefront();
    } catch (err: any) {
      showToast('Failed to delete slide: ' + (err.message || 'Error'), 'error');
    }
  };

  // --- ORDERS ACTIONS ---
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, status);
      showToast(`Order status updated to "${status}"`);
      loadAllAdminData();
    } catch (err: any) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleVerifyPayment = async (orderId: string) => {
    try {
      await updatePaymentVerification(orderId, 'Verified');
      showToast('Payment verified successfully!');
      loadAllAdminData();
    } catch (err: any) {
      showToast('Failed to verify payment', 'error');
    }
  };

  const handleUpdateInquiryStatus = async (inquiryId: string, status: InquiryStatus) => {
    try {
      await updateInquiryStatus(inquiryId, status);
      showToast(`Inquiry status updated to "${status}"`);
      loadAllAdminData();
    } catch (err: any) {
      showToast('Failed to update inquiry status', 'error');
    }
  };

  // --- PAYMENT SETTINGS ACTIONS ---
  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        showToast('Uploading UPI QR Code...');
        const url = await uploadMediaFile(e.target.files[0], 'payment_settings');
        setPaymentSettings((prev) => ({ ...prev, upiQrCodeUrl: url }));
        showToast('QR Code image uploaded.');
      } catch (err) {
        showToast('QR Upload failed', 'error');
      }
    }
  };

  const handleSavePaymentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await savePaymentSettings(paymentSettings);
      showToast('Payment QR Code & UPI settings saved successfully!');
    } catch (err: any) {
      showToast('Failed to save payment settings', 'error');
    }
  };

  return (
    <div className="py-8 bg-[#FFF8EC] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Toast Feedback Banner */}
        {feedback && (
          <div
            className={`fixed top-20 right-6 z-50 p-4 rounded-sm shadow-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-800 text-white border-emerald-500'
                : 'bg-red-800 text-white border-red-500'
            }`}
          >
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Admin Header */}
        <div className="bg-white border-2 border-[#D4A017] rounded-sm p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                setActivePage('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="cursor-pointer group bg-transparent border-0 p-0 focus:outline-none focus:ring-2 focus:ring-[#D4A017] rounded-xs"
              title="Return to Storefront Home"
              aria-label="Return to Storefront Home"
            >
              <img
                src={ASH_LOGO_URL}
                alt="Ash Imitation Jewellery"
                className="h-14 sm:h-16 w-auto object-contain shrink-0 transition-transform duration-200 group-hover:scale-105"
              />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-[#9B1C2F] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-sm uppercase tracking-wider border border-[#D4A017]">
                  ADMIN CONTROL PANEL
                </span>
                <span className="text-xs font-semibold text-[#7A6A5C]">{userEmail}</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2A1810] mt-1">
                Ash Jewellery Management
              </h1>
            </div>
          </div>

          <button
            onClick={() => setActivePage('shop')}
            className="px-4 py-2 rounded-sm bg-[#FFF8EC] hover:bg-[#FBEFCB] text-[#9B1C2F] border border-[#EFE1C8] text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Storefront</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-[#EFE1C8]">
          {[
            { id: 'products', label: 'Products', icon: Package, count: products.length },
            { id: 'categories', label: 'Categories', icon: Grid, count: categories.length },
            { id: 'hero', label: 'Hero Slides', icon: ImageIcon, count: heroSlides.length },
            { id: 'orders', label: 'Orders & Inquiries', icon: ShoppingBag, count: orders.length },
            { id: 'payment-settings', label: 'Payment QR Settings', icon: QrCode },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`flex items-center gap-2 px-4 py-3 min-h-[44px] rounded-sm text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#9B1C2F] text-white border-2 border-[#D4A017] shadow-xs'
                    : 'bg-white text-[#2A1810] hover:bg-[#FFF8EC] border border-[#EFE1C8]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#F0C75E]' : 'text-[#D4A017]'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-sm text-[10px] font-bold ${
                      isActive ? 'bg-[#7A1522] text-[#FBEFCB]' : 'bg-[#FFF8EC] text-[#7A6A5C]'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-sm border border-[#EFE1C8]">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-[#7A6A5C] absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Filter products..."
                  value={prodSearch}
                  onChange={(e) => setProdSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 min-h-[44px] rounded-sm border-2 border-[#EFE1C8] bg-white text-xs font-medium focus:outline-hidden focus:border-[#D4A017]"
                />
              </div>

              <button
                onClick={handleOpenAddProduct}
                className="w-full sm:w-auto px-5 py-3 min-h-[44px] rounded-sm bg-[#9B1C2F] text-white text-xs font-bold uppercase tracking-wider border-b-2 border-[#D4A017] shadow-xs cursor-pointer hover:bg-[#7A1522] flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-[#F0C75E]" />
                <span>Add New Product</span>
              </button>
            </div>

            {/* Mobile Card List View (< md) */}
            <div className="block md:hidden space-y-3">
              {products
                .filter(
                  (p) =>
                    p.name.toLowerCase().includes(prodSearch.toLowerCase()) ||
                    p.category.toLowerCase().includes(prodSearch.toLowerCase())
                )
                .map((prod) => (
                  <div key={prod.id} className="bg-white border border-[#EFE1C8] rounded-sm p-4 shadow-2xs space-y-3">
                    <div className="flex items-start gap-3">
                      <img
                        src={prod.images[0] || ''}
                        alt={prod.name}
                        className="w-16 h-16 object-cover rounded-sm border border-[#EFE1C8] shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-bold text-[#D4A017] uppercase tracking-wider">
                            {prod.category}
                          </span>
                          {prod.featured && (
                            <span className="bg-[#D4A017] text-[#2A1810] text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                              Featured
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-[#2A1810] text-sm leading-snug truncate mt-0.5">
                          {prod.name}
                        </h3>
                        <p className="text-[10px] text-[#7A6A5C] font-semibold">{prod.occasion}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#EFE1C8] text-xs">
                      <div>
                        <span className="font-serif font-bold text-[#9B1C2F] text-sm">
                          ₹{prod.price.toLocaleString('en-IN')}
                        </span>
                        {prod.mrp > prod.price && (
                          <span className="text-[10px] text-[#7A6A5C] line-through ml-1.5">
                            ₹{prod.mrp.toLocaleString('en-IN')}
                          </span>
                        )}
                        <div className="mt-1">
                          <span
                            className={`px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-wider ${
                              prod.stock > 0
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-red-100 text-red-800 border border-red-300'
                            }`}
                          >
                            {prod.stock > 0 ? `${prod.stock} in stock` : 'Out of Stock'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditProduct(prod)}
                          className="px-3 py-2 min-h-[44px] min-w-[44px] rounded-sm bg-[#FFF8EC] text-[#2A1810] hover:text-[#9B1C2F] border border-[#EFE1C8] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id, prod.name)}
                          className="px-3 py-2 min-h-[44px] min-w-[44px] rounded-sm bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Desktop Table View (>= md) */}
            <div className="hidden md:block bg-white border border-[#EFE1C8] rounded-sm overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#2A1810]">
                  <thead className="bg-[#FFF8EC] text-[#7A6A5C] font-bold border-b border-[#EFE1C8] uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4">Item</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price / MRP</th>
                      <th className="p-4">Stock</th>
                      <th className="p-4">Featured</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFE1C8]">
                    {products
                      .filter(
                        (p) =>
                          p.name.toLowerCase().includes(prodSearch.toLowerCase()) ||
                          p.category.toLowerCase().includes(prodSearch.toLowerCase())
                      )
                      .map((prod) => (
                        <tr key={prod.id} className="hover:bg-[#FFF8EC]/50 transition-colors">
                          <td className="p-4 flex items-center gap-3">
                            <img
                              src={prod.images[0] || ''}
                              alt={prod.name}
                              className="w-12 h-12 object-cover rounded-sm border border-[#EFE1C8] shrink-0"
                            />
                            <div>
                              <p className="font-bold text-[#2A1810] line-clamp-1">{prod.name}</p>
                              <p className="text-[10px] text-[#7A6A5C] font-semibold">{prod.occasion}</p>
                            </div>
                          </td>
                          <td className="p-4 font-bold text-[#D4A017] uppercase tracking-wider">{prod.category}</td>
                          <td className="p-4">
                            <span className="font-serif font-bold text-[#9B1C2F]">
                              ₹{prod.price.toLocaleString('en-IN')}
                            </span>
                            {prod.mrp > prod.price && (
                              <span className="text-[10px] text-[#7A6A5C] line-through ml-1.5">
                                ₹{prod.mrp.toLocaleString('en-IN')}
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${
                                prod.stock > 0
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-red-100 text-red-800 border border-red-300'
                              }`}
                            >
                              {prod.stock > 0 ? `${prod.stock} in stock` : 'Out of Stock'}
                            </span>
                          </td>
                          <td className="p-4">
                            {prod.featured ? (
                              <span className="bg-[#D4A017] text-[#2A1810] text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                                Yes
                              </span>
                            ) : (
                              <span className="text-gray-400 font-bold">No</span>
                            )}
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => handleOpenEditProduct(prod)}
                              className="p-1.5 rounded-sm bg-[#FFF8EC] text-[#2A1810] hover:text-[#9B1C2F] border border-[#EFE1C8] cursor-pointer min-w-[36px] min-h-[36px] inline-flex items-center justify-center"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.id, prod.name)}
                              className="p-1.5 rounded-sm bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 cursor-pointer min-w-[36px] min-h-[36px] inline-flex items-center justify-center"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CATEGORIES TAB */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-sm border border-[#EFE1C8]">
              <h2 className="font-serif text-lg font-bold text-[#2A1810]">Category List</h2>
              <button
                onClick={() => setCategoryModalOpen(true)}
                className="px-4 py-2 rounded-sm bg-[#9B1C2F] text-white text-xs font-bold uppercase tracking-wider border-b-2 border-[#D4A017] cursor-pointer hover:bg-[#7A1522] flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-[#F0C75E]" />
                <span>Add Category</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white border border-[#EFE1C8] rounded-sm overflow-hidden shadow-2xs p-4 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-12 h-12 object-cover rounded-sm border border-[#EFE1C8] shrink-0"
                    />
                    <h3 className="font-serif text-sm font-bold text-[#2A1810] truncate">{cat.name}</h3>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                    className="p-1.5 rounded-sm bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: HERO SLIDES TAB */}
        {activeTab === 'hero' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-sm border border-[#EFE1C8]">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#2A1810]">Homepage Hero Slides</h2>
                <p className="text-xs font-medium text-[#7A6A5C]">Manage the rotating banner slides shown on Homepage</p>
              </div>
              <button
                onClick={() => {
                  setEditingSlide({
                    headline: '',
                    subheadline: '',
                    buttonText: 'Shop Collection',
                    buttonLink: 'shop',
                    order: heroSlides.length + 1,
                    image: '',
                  });
                  setHeroModalOpen(true);
                }}
                className="px-4 py-2 rounded-sm bg-[#9B1C2F] text-white text-xs font-bold uppercase tracking-wider border-b-2 border-[#D4A017] cursor-pointer hover:bg-[#7A1522] flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-[#F0C75E]" />
                <span>Add Hero Slide</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {heroSlides.map((slide) => (
                <div
                  key={slide.id}
                  className="bg-white border-2 border-[#EFE1C8] rounded-sm overflow-hidden shadow-2xs flex flex-col justify-between"
                >
                  <div className="aspect-16/9 w-full relative bg-[#2A1810]">
                    <img src={slide.image} alt={slide.headline} className="w-full h-full object-cover opacity-80" />
                    <span className="absolute top-2 left-2 bg-[#9B1C2F] text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider border border-[#D4A017]">
                      Slide #{slide.order}
                    </span>
                  </div>

                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif text-base font-bold text-[#2A1810]">{slide.headline}</h3>
                      <p className="text-xs text-[#7A6A5C] line-clamp-2 mt-1">{slide.subheadline}</p>
                    </div>

                    <div className="pt-3 border-t border-[#EFE1C8] flex items-center justify-between text-xs">
                      <span className="text-[#9B1C2F] font-bold uppercase tracking-wider">{slide.buttonText}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingSlide(slide);
                            setHeroModalOpen(true);
                          }}
                          className="p-1.5 rounded-sm bg-[#FFF8EC] border border-[#EFE1C8] text-[#2A1810] hover:text-[#9B1C2F] cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteHeroSlide(slide.id)}
                          className="p-1.5 rounded-sm bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ORDERS & CUSTOM INQUIRIES TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-8">
            
            {/* Store Orders Section */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-sm border border-[#EFE1C8]">
                <div>
                  <h2 className="font-serif text-lg font-bold text-[#2A1810]">Customer Checkout Orders</h2>
                  <p className="text-xs font-medium text-[#7A6A5C]">View orders, verify payment screenshots, and update status</p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-[#7A6A5C] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by name, email, order ID..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-sm border-2 border-[#EFE1C8] bg-white text-xs font-medium focus:outline-hidden focus:border-[#D4A017]"
                  />
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-[#EFE1C8] rounded-sm p-8 text-center text-xs font-medium text-[#7A6A5C]">
                  No orders placed yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {orders
                    .filter(
                      (o) =>
                        o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
                        o.userEmail.toLowerCase().includes(orderSearch.toLowerCase()) ||
                        o.id.toLowerCase().includes(orderSearch.toLowerCase())
                    )
                    .map((order) => (
                      <div
                        key={order.id}
                        className="bg-white border-2 border-[#EFE1C8] rounded-sm p-6 shadow-2xs space-y-4 hover:border-[#D4A017] transition-colors"
                      >
                        {/* Header */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EFE1C8] pb-3 text-xs">
                          <div>
                            <span className="font-bold text-[#2A1810] text-sm">{order.customerName}</span>
                            <span className="text-[#7A6A5C] ml-2 font-medium">({order.userEmail})</span>
                            <p className="text-[10px] text-[#7A6A5C] mt-0.5">
                              Phone: <strong className="text-[#2A1810]">{order.customerPhone}</strong> | Date:{' '}
                              {order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-serif font-bold text-base text-[#9B1C2F]">
                              ₹{order.totalAmount.toLocaleString('en-IN')}
                            </span>

                            {/* Order Status Updater */}
                            <select
                              value={order.orderStatus}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                              className="px-3 py-1.5 rounded-sm border-2 border-[#D4A017] bg-white text-xs font-bold uppercase tracking-wider text-[#2A1810] cursor-pointer"
                            >
                              <option value="New">New Order</option>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                            </select>
                          </div>
                        </div>

                        {/* Items + Payment Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          
                          {/* Items Column */}
                          <div className="md:col-span-2 space-y-2">
                            <p className="font-bold uppercase tracking-wider text-[#7A6A5C]">Ordered Items:</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2 bg-[#FFF8EC] p-2 rounded-sm border border-[#EFE1C8]">
                                  <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-sm border" />
                                  <div className="truncate">
                                    <p className="font-bold text-[#2A1810] truncate">{item.name}</p>
                                    <p className="text-[#7A6A5C] font-semibold">Qty: {item.quantity} × ₹{item.price}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <p className="text-[11px] text-[#7A6A5C] mt-1 font-medium">
                              <strong className="text-[#2A1810]">Address:</strong> {order.address}, {order.city} - {order.pincode}
                            </p>
                          </div>

                          {/* Payment Verification Column */}
                          <div className="bg-[#FFF8EC] p-4 rounded-sm border border-[#EFE1C8] flex flex-col justify-between space-y-2">
                            <div>
                              <p className="font-bold text-[#2A1810] mb-1">
                                Method: <span className="text-[#9B1C2F] uppercase tracking-wider">{order.paymentMethod}</span>
                              </p>

                              <p className="text-[11px] text-[#7A6A5C] font-semibold">
                                Payment Status:{' '}
                                <strong
                                  className={
                                    order.paymentStatus === 'Verified'
                                      ? 'text-emerald-800 font-bold uppercase tracking-wider'
                                      : 'text-amber-800 font-bold uppercase tracking-wider'
                                  }
                                >
                                  {order.paymentStatus}
                                </strong>
                              </p>
                            </div>

                            {/* Screenshot preview button for online payment */}
                            {order.paymentScreenshotUrl ? (
                              <div className="space-y-2 pt-2 border-t border-[#EFE1C8]">
                                <button
                                  onClick={() => {
                                    setPreviewModalTitle(`Payment Screenshot for Order #${order.id.slice(-6)}`);
                                    setPreviewScreenshotUrl(order.paymentScreenshotUrl || null);
                                  }}
                                  className="w-full py-1.5 rounded-sm bg-white border border-[#D4A017] text-[#9B1C2F] text-[11px] font-bold uppercase tracking-wider cursor-pointer hover:bg-[#FBEFCB] flex items-center justify-center gap-1"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>View Payment Screenshot</span>
                                </button>

                                {order.paymentStatus === 'Pending Verification' && (
                                  <button
                                    onClick={() => handleVerifyPayment(order.id)}
                                    className="w-full py-2 rounded-sm bg-emerald-800 hover:bg-emerald-900 text-white text-[11px] font-bold uppercase tracking-wider cursor-pointer transition-colors border-b-2 border-emerald-500 shadow-2xs"
                                  >
                                    ✓ Mark Payment Verified
                                  </button>
                                )}
                              </div>
                            ) : (
                              <p className="text-[10px] text-[#7A6A5C] font-medium">Cash on Delivery order (No screenshot uploaded)</p>
                            )}
                          </div>

                        </div>

                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Custom Order Inquiries Section */}
            <div className="space-y-4 pt-6 border-t-2 border-[#EFE1C8]">
              <div className="bg-white p-4 rounded-sm border border-[#EFE1C8]">
                <h2 className="font-serif text-lg font-bold text-[#2A1810]">Custom Order Inquiries</h2>
                <p className="text-xs font-medium text-[#7A6A5C]">Requests submitted via Custom Orders page</p>
              </div>

              {inquiries.length === 0 ? (
                <div className="bg-white border border-[#EFE1C8] rounded-sm p-6 text-center text-xs text-[#7A6A5C] font-medium">
                  No custom inquiries received yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {inquiries.map((inq) => (
                    <div key={inq.id} className="bg-white border border-[#EFE1C8] rounded-sm p-5 space-y-3 shadow-2xs">
                      <div className="flex justify-between items-start text-xs border-b border-[#EFE1C8] pb-2">
                        <div>
                          <h3 className="font-bold text-[#2A1810] text-sm">{inq.name}</h3>
                          <p className="text-[#7A6A5C] font-medium">{inq.phone}</p>
                        </div>
                        <select
                          value={inq.status}
                          onChange={(e) => handleUpdateInquiryStatus(inq.id, e.target.value as InquiryStatus)}
                          className="px-2.5 py-1 rounded-sm border border-[#D4A017] bg-[#FFF8EC] text-[11px] font-bold uppercase tracking-wider text-[#2A1810] cursor-pointer"
                        >
                          <option value="New">New Inquiry</option>
                          <option value="Contacted">Contacted</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </div>

                      <div className="text-xs space-y-1 text-[#2A1810]">
                        <p><strong>Occasion:</strong> {inq.occasion}</p>
                        <p><strong>Budget:</strong> {inq.budget}</p>
                        <p className="text-[#7A6A5C] font-medium bg-[#FFF8EC] p-2 rounded-sm border border-[#EFE1C8] mt-1">
                          "{inq.details}"
                        </p>

                        {/* Customer Reference Photos Section */}
                        {((inq.referenceImages && inq.referenceImages.length > 0) || inq.referenceImageUrl) ? (
                          <div className="pt-2 border-t border-[#EFE1C8] space-y-1.5">
                            <p className="text-[11px] font-bold text-[#2A1810] flex items-center gap-1">
                              <ImageIcon className="w-3.5 h-3.5 text-[#D4A017]" />
                              <span>Reference Photos Attached:</span>
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {(inq.referenceImages && inq.referenceImages.length > 0
                                ? inq.referenceImages
                                : [inq.referenceImageUrl!]
                              ).map((refImg, rIdx) => (
                                <div
                                  key={rIdx}
                                  onClick={() => {
                                    setPreviewModalTitle(`Reference Photo #${rIdx + 1} from ${inq.name}`);
                                    setPreviewScreenshotUrl(refImg);
                                  }}
                                  className="relative group w-14 h-14 rounded-sm border-2 border-[#D4A017] overflow-hidden bg-[#FFF8EC] cursor-pointer shadow-2xs hover:opacity-90 transition-opacity"
                                  title="Click to view fullsize"
                                >
                                  <img
                                    src={refImg}
                                    alt={`Reference ${rIdx + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-[#2A1810]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Eye className="w-3.5 h-3.5 text-white" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-[10px] text-[#7A6A5C] italic pt-1">No reference photos attached</p>
                        )}
                      </div>

                      <a
                        href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(
                          inq.name
                        )},%20this%20is%20Ash%20Jewellery%20regarding%20your%20custom%20order%20inquiry.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-emerald-800 font-bold hover:underline uppercase tracking-wider"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Reply to Customer on WhatsApp</span>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 5: PAYMENT QR SETTINGS */}
        {activeTab === 'payment-settings' && (
          <div className="bg-white border-2 border-[#D4A017] rounded-sm p-6 sm:p-10 shadow-md max-w-2xl mx-auto space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#2A1810]">Checkout UPI QR Code Settings</h2>
              <p className="text-xs font-medium text-[#7A6A5C] mt-1">
                Upload or update your business UPI QR Code image and UPI ID. Customers see this at checkout when paying online.
              </p>
            </div>

            <form onSubmit={handleSavePaymentSettings} className="space-y-6 text-xs">
              
              {/* Preview Box */}
              <div className="p-4 bg-[#FFF8EC] border border-[#EFE1C8] rounded-sm text-center space-y-3">
                <p className="font-bold text-[#2A1810] uppercase tracking-wider">Current Active Checkout QR Code Preview:</p>
                {paymentSettings.upiQrCodeUrl ? (
                  <img
                    src={paymentSettings.upiQrCodeUrl}
                    alt="Current UPI QR Code"
                    className="w-48 h-48 object-contain mx-auto border-2 border-[#D4A017] rounded-sm bg-white p-2 shadow-xs"
                  />
                ) : (
                  <div className="w-48 h-48 border-2 border-dashed border-[#EFE1C8] rounded-sm flex items-center justify-center mx-auto text-[#7A6A5C] font-medium">
                    No QR Code Uploaded
                  </div>
                )}
              </div>

              {/* Upload input */}
              <div>
                <label className="block font-bold text-[#2A1810] mb-1 uppercase tracking-wider">Upload New UPI QR Code Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleQrUpload}
                  className="text-xs text-[#7A6A5C] file:mr-3 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-xs file:font-bold file:bg-[#9B1C2F] file:text-white hover:file:bg-[#7A1522] cursor-pointer uppercase file:tracking-wider"
                />
              </div>

              {/* UPI ID field */}
              <div>
                <label className="block font-bold text-[#2A1810] mb-1 uppercase tracking-wider">Business UPI ID (VPA)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ashjewellery@upi"
                  value={paymentSettings.upiId}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, upiId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-sm border-2 border-[#EFE1C8] bg-white focus:outline-hidden focus:border-[#D4A017] font-medium text-[#2A1810]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-sm bg-[#9B1C2F] hover:bg-[#7A1522] text-white font-bold text-xs sm:text-sm uppercase tracking-wider border-b-2 border-[#D4A017] shadow-md transition-colors cursor-pointer"
              >
                Save Payment Settings
              </button>
            </form>
          </div>
        )}

      </div>

      {/* --- MODAL 1: ADD/EDIT PRODUCT MODAL --- */}
      {productModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2A1810]/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white border-2 border-[#D4A017] rounded-sm shadow-2xl p-6 sm:p-8 my-8">
            <button
              onClick={() => setProductModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-sm bg-white border border-[#EFE1C8] text-[#2A1810] hover:text-[#9B1C2F] cursor-pointer font-bold"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="font-serif text-2xl font-bold text-[#2A1810] mb-6">
              {editingProduct.id ? 'Edit Jewellery Product' : 'Add New Jewellery Product'}
            </h2>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#2A1810] mb-1 uppercase tracking-wider">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kundan Royal Choker Set"
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-sm border-2 border-[#EFE1C8] bg-white focus:outline-hidden focus:border-[#D4A017] font-medium text-[#2A1810]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#2A1810] mb-1 uppercase tracking-wider">Category *</label>
                  <select
                    value={editingProduct.category || 'Necklaces'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-sm border-2 border-[#EFE1C8] bg-white focus:outline-hidden focus:border-[#D4A017] cursor-pointer font-medium text-[#2A1810]"
                  >
                    <option value="Necklaces">Necklaces</option>
                    <option value="Earrings">Earrings</option>
                    <option value="Pendants">Pendants</option>
                    <option value="Bangles">Bangles</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#2A1810] mb-1 uppercase tracking-wider">Occasion Tag</label>
                  <select
                    value={editingProduct.occasion || 'Bridal'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, occasion: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-sm border-2 border-[#EFE1C8] bg-white focus:outline-hidden focus:border-[#D4A017] cursor-pointer font-medium text-[#2A1810]"
                  >
                    <option value="Bridal">Bridal</option>
                    <option value="Festive">Festive</option>
                    <option value="Everyday Wear">Everyday Wear</option>
                    <option value="Party">Party</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#2A1810] mb-1 uppercase tracking-wider">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-sm border-2 border-[#EFE1C8] bg-white focus:outline-hidden focus:border-[#D4A017] font-medium text-[#2A1810]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#2A1810] mb-1 uppercase tracking-wider">MRP (₹)</label>
                  <input
                    type="number"
                    value={editingProduct.mrp || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, mrp: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-sm border-2 border-[#EFE1C8] bg-white focus:outline-hidden focus:border-[#D4A017] font-medium text-[#2A1810]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#2A1810] mb-1 uppercase tracking-wider">Stock Quantity</label>
                  <input
                    type="number"
                    value={editingProduct.stock || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-sm border-2 border-[#EFE1C8] bg-white focus:outline-hidden focus:border-[#D4A017] font-medium text-[#2A1810]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#2A1810] mb-1 uppercase tracking-wider">Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-sm border-2 border-[#EFE1C8] bg-white focus:outline-hidden focus:border-[#D4A017] font-medium text-[#2A1810]"
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block font-bold text-[#2A1810] mb-1 uppercase tracking-wider">Product Photos (Upload to Storage)</label>
                <div className="flex items-center gap-3 mb-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProductImageUpload}
                    disabled={uploadingProdImage}
                    className="text-xs text-[#7A6A5C] file:mr-2 file:py-1.5 file:px-3 file:rounded-sm file:border-0 file:text-xs file:font-bold file:bg-[#9B1C2F] file:text-white cursor-pointer uppercase file:tracking-wider"
                  />
                  {uploadingProdImage && <span className="text-xs text-[#D4A017] font-bold animate-pulse">Uploading...</span>}
                </div>

                {/* Thumbnails preview */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {productImages.map((imgUrl, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-sm overflow-hidden border border-[#EFE1C8] group">
                      <img src={imgUrl} alt="Prod" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveProductImage(i)}
                        className="absolute top-0.5 right-0.5 p-1 bg-red-600 text-white rounded-full opacity-80 group-hover:opacity-100 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={Boolean(editingProduct.featured)}
                  onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.checked })}
                  className="accent-[#9B1C2F] w-4 h-4 cursor-pointer"
                />
                <label htmlFor="featured" className="font-bold text-[#2A1810] cursor-pointer">
                  Feature this design on Homepage
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[#EFE1C8]">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-5 py-2.5 rounded-sm bg-white text-[#2A1810] font-bold uppercase tracking-wider border border-[#EFE1C8] hover:bg-[#FFF8EC] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-sm bg-[#9B1C2F] hover:bg-[#7A1522] text-white font-bold uppercase tracking-wider border-b-2 border-[#D4A017] shadow-sm cursor-pointer"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: ADD CATEGORY MODAL --- */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2A1810]/70 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white border-2 border-[#D4A017] rounded-sm shadow-2xl p-6">
            <button
              onClick={() => setCategoryModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-sm bg-white border border-[#EFE1C8] text-[#2A1810] font-bold"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="font-serif text-xl font-bold text-[#2A1810] mb-4">Add Category</h2>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#2A1810] mb-1 uppercase tracking-wider">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anklets"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-sm border-2 border-[#EFE1C8] bg-white font-medium text-[#2A1810]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#2A1810] mb-1 uppercase tracking-wider">Category Photo *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCatImageUpload}
                  className="text-xs text-[#7A6A5C] file:mr-2 file:py-1.5 file:px-3 file:rounded-sm file:bg-[#9B1C2F] file:text-white uppercase file:tracking-wider file:font-bold"
                />
                {uploadingCatImage && <p className="text-[#D4A017] mt-1 font-bold">Uploading photo...</p>}
                {catImage && (
                  <img src={catImage} alt="Cat" className="w-20 h-20 object-cover rounded-sm mt-2 border" />
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-sm bg-white text-[#2A1810] border border-[#EFE1C8] font-bold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-sm bg-[#9B1C2F] text-white font-bold uppercase tracking-wider border-b-2 border-[#D4A017]"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: HERO SLIDE MODAL --- */}
      {heroModalOpen && editingSlide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2A1810]/70 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white border-2 border-[#D4A017] rounded-sm shadow-2xl p-6">
            <button
              onClick={() => setHeroModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-sm bg-white border border-[#EFE1C8] text-[#2A1810] font-bold"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="font-serif text-xl font-bold text-[#2A1810] mb-4">Edit Hero Slide</h2>

            <form onSubmit={handleSaveHeroSlide} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#2A1810] mb-1 uppercase tracking-wider">Headline *</label>
                <input
                  type="text"
                  required
                  placeholder="Royal Festive & Bridal Jewellery"
                  value={editingSlide.headline || ''}
                  onChange={(e) => setEditingSlide({ ...editingSlide, headline: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-sm border-2 border-[#EFE1C8] bg-white font-medium text-[#2A1810]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#2A1810] mb-1 uppercase tracking-wider">Subheadline</label>
                <input
                  type="text"
                  placeholder="Handcrafted artificial pieces..."
                  value={editingSlide.subheadline || ''}
                  onChange={(e) => setEditingSlide({ ...editingSlide, subheadline: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-sm border-2 border-[#EFE1C8] bg-white font-medium text-[#2A1810]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#2A1810] mb-1 uppercase tracking-wider">Banner Wallpaper / Image *</label>
                <div className="space-y-2">
                  <div>
                    <span className="text-[11px] font-semibold text-[#7A6A5C] block mb-1">Option 1: Upload Local Image File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSlideImageUpload}
                      disabled={uploadingSlideImage}
                      className="text-xs text-[#7A6A5C] file:mr-2 file:py-1.5 file:px-3 file:rounded-sm file:bg-[#9B1C2F] file:text-white uppercase file:tracking-wider file:font-bold cursor-pointer"
                    />
                    {uploadingSlideImage && <p className="text-[#D4A017] text-xs mt-1 font-bold animate-pulse">Uploading wallpaper...</p>}
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-[#7A6A5C] block mb-1">Option 2: Or Paste Direct Image Web URL</span>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={editingSlide.image || ''}
                      onChange={(e) => setEditingSlide({ ...editingSlide, image: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-sm border-2 border-[#EFE1C8] bg-white font-medium text-[#2A1810]"
                    />
                  </div>
                </div>

                {editingSlide.image && (
                  <div className="mt-3">
                    <p className="text-[10px] font-bold text-[#7A6A5C] uppercase mb-1">Active Wallpaper Preview:</p>
                    <img src={editingSlide.image} alt="Slide Wallpaper Preview" className="w-full h-32 object-cover rounded-sm border-2 border-[#D4A017]" />
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setHeroModalOpen(false)}
                  className="px-4 py-2 rounded-sm bg-white text-[#2A1810] border border-[#EFE1C8] font-bold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-sm bg-[#9B1C2F] text-white font-bold uppercase tracking-wider border-b-2 border-[#D4A017]"
                >
                  Save Slide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 4: FULLSIZE IMAGE PREVIEW MODAL --- */}
      {previewScreenshotUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2A1810]/80 backdrop-blur-xs">
          <div className="relative max-w-2xl w-full bg-white rounded-sm p-4 overflow-hidden border-2 border-[#D4A017] shadow-2xl">
            <button
              onClick={() => setPreviewScreenshotUrl(null)}
              className="absolute top-4 right-4 p-2 rounded-sm bg-white border border-[#EFE1C8] text-[#2A1810] font-bold shadow-md cursor-pointer hover:text-[#9B1C2F]"
            >
              <X className="w-5 h-5" />
            </button>
            <p className="text-xs font-bold text-[#2A1810] mb-2 px-2 uppercase tracking-wider">{previewModalTitle}:</p>
            <div className="bg-[#FFF8EC] p-2 rounded-sm border border-[#EFE1C8]">
              <img
                src={previewScreenshotUrl}
                alt={previewModalTitle}
                className="max-h-[80vh] w-auto object-contain rounded-sm mx-auto"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
