import React, { useState } from 'react';
import { QrCode, Upload, CheckCircle2, ShieldCheck, Truck, Lock, ArrowLeft, AlertCircle } from 'lucide-react';
import { CartItem, Order, PaymentMethod, PaymentSettings, ActivePage } from '../types';
import { createOrder, uploadMediaFile } from '../services/dbService';

interface CheckoutPageProps {
  cart: CartItem[];
  userEmail: string | null;
  userId: string | null;
  paymentSettings: PaymentSettings;
  onOrderSuccess: (order: Order) => void;
  onOpenAuth: () => void;
  setActivePage: (page: ActivePage) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  cart,
  userEmail,
  userId,
  paymentSettings,
  onOrderSuccess,
  onOpenAuth,
  setActivePage,
}) => {
  // If not logged in, prompt user to login
  if (!userEmail) {
    return (
      <div className="py-16 bg-[#FFF8EC] min-h-[70vh] flex items-center justify-center px-4">
        <div className="bg-white border-2 border-[#D4A017] rounded-sm p-8 max-w-md w-full text-center shadow-lg">
          <div className="w-16 h-16 rounded-full bg-[#FBEFCB] text-[#9B1C2F] flex items-center justify-center mx-auto mb-4 border-2 border-[#D4A017]">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#2A1810]">Sign In Required</h2>
          <p className="text-xs text-[#7A6A5C] mt-2 leading-relaxed">
            Please log in or create an account to complete your jewellery order and track your shipping status.
          </p>
          <button
            onClick={onOpenAuth}
            className="mt-6 w-full py-3.5 rounded-sm bg-[#9B1C2F] hover:bg-[#7A1522] text-white font-bold text-xs uppercase tracking-wider border-b-2 border-[#D4A017] shadow-sm cursor-pointer transition-colors"
          >
            Sign In or Register Now
          </button>
        </div>
      </div>
    );
  }

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const shippingFee = subtotal >= 999 ? 0 : 99;
  const totalAmount = subtotal + shippingFee;

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setScreenshotFile(file);
      setScreenshotPreview(URL.createObjectURL(file));
      setErrorMessage(null);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName || !customerPhone || !address || !city || !pincode) {
      setErrorMessage('Please fill in all required shipping address fields.');
      return;
    }

    if (paymentMethod === 'Online (QR Code)' && !screenshotFile) {
      setErrorMessage('Please upload your payment confirmation screenshot before placing the order.');
      return;
    }

    try {
      setIsSubmitting(true);
      let screenshotUrl = '';

      if (paymentMethod === 'Online (QR Code)' && screenshotFile) {
        screenshotUrl = await uploadMediaFile(screenshotFile, 'payment_screenshots');
      }

      const orderData = {
        userId: userId || 'anonymous',
        userEmail: userEmail,
        customerName,
        customerPhone,
        address,
        city,
        pincode,
        items: cart.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.images[0] || '',
        })),
        subtotal,
        shippingFee,
        totalAmount,
        paymentMethod,
        paymentScreenshotUrl: screenshotUrl || '',
        paymentStatus: paymentMethod === 'Online (QR Code)' ? ('Pending Verification' as const) : ('COD' as const),
        orderStatus: 'New' as const,
      };

      const created = await createOrder(orderData);
      onOrderSuccess(created);
    } catch (err: any) {
      console.error('Failed to submit order:', err);
      setErrorMessage(err?.message || 'Failed to place order. Please try again or contact support.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-10 bg-[#FFF8EC] min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <button
          onClick={() => setActivePage('cart')}
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#9B1C2F] hover:underline mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Shopping Bag</span>
        </button>

        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2A1810] mb-8 border-b border-[#EFE1C8] pb-3">
          Checkout & Shipping
        </h1>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-sm bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2 uppercase tracking-wider">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Columns: Shipping & Payment Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Step 1: Shipping Address Form */}
            <div className="bg-white border border-[#EFE1C8] rounded-sm p-6 shadow-2xs space-y-4">
              <h2 className="font-serif text-lg font-bold text-[#2A1810] flex items-center gap-2 border-b border-[#EFE1C8] pb-3 uppercase tracking-wider">
                <span className="w-6 h-6 rounded-full bg-[#9B1C2F] text-white text-xs font-bold flex items-center justify-center border border-[#D4A017]">1</span>
                <span>Shipping Address</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#2A1810] mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-3 min-h-[44px] rounded-sm border-2 border-[#EFE1C8] bg-white focus:outline-hidden focus:border-[#D4A017] text-xs font-medium text-[#2A1810]"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#2A1810] mb-1">Phone Number (WhatsApp) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 9876543210"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3.5 py-3 min-h-[44px] rounded-sm border-2 border-[#EFE1C8] bg-white focus:outline-hidden focus:border-[#D4A017] text-xs font-medium text-[#2A1810]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold uppercase tracking-wider text-[#2A1810] mb-1">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={userEmail || ''}
                    className="w-full px-3.5 py-3 min-h-[44px] rounded-sm border-2 border-[#EFE1C8] bg-gray-100 text-[#7A6A5C] cursor-not-allowed text-xs font-medium"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold uppercase tracking-wider text-[#2A1810] mb-1">Street Address / Landmark *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="House No., Building Name, Street, Landmark"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-sm border-2 border-[#EFE1C8] bg-white focus:outline-hidden focus:border-[#D4A017] text-xs font-medium text-[#2A1810]"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#2A1810] mb-1">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jaipur"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-3 min-h-[44px] rounded-sm border-2 border-[#EFE1C8] bg-white focus:outline-hidden focus:border-[#D4A017] text-xs font-medium text-[#2A1810]"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#2A1810] mb-1">Pincode *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 302001"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full px-3.5 py-3 min-h-[44px] rounded-sm border-2 border-[#EFE1C8] bg-white focus:outline-hidden focus:border-[#D4A017] text-xs font-medium text-[#2A1810]"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method Choice */}
            <div className="bg-white border border-[#EFE1C8] rounded-sm p-6 shadow-2xs space-y-4">
              <h2 className="font-serif text-lg font-bold text-[#2A1810] flex items-center gap-2 border-b border-[#EFE1C8] pb-3 uppercase tracking-wider">
                <span className="w-6 h-6 rounded-full bg-[#9B1C2F] text-white text-xs font-bold flex items-center justify-center border border-[#D4A017]">2</span>
                <span>Payment Method</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Cash on Delivery Option */}
                <label
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-4 rounded-sm border-2 cursor-pointer transition-all flex items-start gap-3 ${
                    paymentMethod === 'COD'
                      ? 'border-[#9B1C2F] bg-[#FBEFCB]/40'
                      : 'border-[#EFE1C8] bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="mt-1 accent-[#9B1C2F]"
                  />
                  <div>
                    <h3 className="font-bold text-xs uppercase tracking-wider text-[#2A1810]">Cash on Delivery (COD)</h3>
                    <p className="text-[11px] text-[#7A6A5C] mt-0.5">
                      Pay cash directly to the delivery agent upon receiving your jewellery package.
                    </p>
                  </div>
                </label>

                {/* Online UPI QR Code Option */}
                <label
                  onClick={() => setPaymentMethod('Online (QR Code)')}
                  className={`p-4 rounded-sm border-2 cursor-pointer transition-all flex items-start gap-3 ${
                    paymentMethod === 'Online (QR Code)'
                      ? 'border-[#9B1C2F] bg-[#FBEFCB]/40'
                      : 'border-[#EFE1C8] bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'Online (QR Code)'}
                    onChange={() => setPaymentMethod('Online (QR Code)')}
                    className="mt-1 accent-[#9B1C2F]"
                  />
                  <div>
                    <h3 className="font-bold text-xs uppercase tracking-wider text-[#2A1810] flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-[#D4A017]" />
                      <span>Online Payment (UPI QR Code)</span>
                    </h3>
                    <p className="text-[11px] text-[#7A6A5C] mt-0.5">
                      Scan UPI QR code, pay total amount & upload transaction screenshot.
                    </p>
                  </div>
                </label>

              </div>

              {/* Online QR Code Payment Panel */}
              {paymentMethod === 'Online (QR Code)' && (
                <div className="mt-4 p-5 rounded-sm bg-[#FFF8EC] border-2 border-[#D4A017] space-y-4">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* QR Code Image */}
                    <div className="bg-white p-3 rounded-sm border border-[#EFE1C8] shadow-xs text-center shrink-0">
                      <img
                        src={paymentSettings.upiQrCodeUrl}
                        alt="Ash Jewellery UPI QR Code"
                        className="w-40 h-40 object-contain mx-auto"
                      />
                      <p className="text-[10px] font-bold text-[#D4A017] mt-1.5 uppercase tracking-wider">
                        UPI ID: {paymentSettings.upiId}
                      </p>
                    </div>

                    {/* Instructions */}
                    <div className="space-y-2 text-xs text-[#2A1810]">
                      <h4 className="font-serif text-base font-bold text-[#9B1C2F]">
                        Scan & Pay ₹{totalAmount.toLocaleString('en-IN')}
                      </h4>
                      <ol className="list-decimal list-inside space-y-1 text-[#7A6A5C]">
                        <li>Open Google Pay, PhonePe, Paytm or any UPI App.</li>
                        <li>Scan the QR code above or pay to UPI ID.</li>
                        <li>Pay the exact order amount: <strong className="text-[#9B1C2F]">₹{totalAmount.toLocaleString('en-IN')}</strong></li>
                        <li>Take a clear screenshot of the completed payment.</li>
                      </ol>
                    </div>
                  </div>

                  {/* Screenshot File Upload */}
                  <div className="pt-3 border-t border-[#EFE1C8]">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2A1810] mb-2">
                      Upload Payment Screenshot * (Required)
                    </label>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleScreenshotChange}
                        className="text-xs text-[#7A6A5C] file:mr-3 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-wider file:bg-[#9B1C2F] file:text-white hover:file:bg-[#7A1522] cursor-pointer"
                      />

                      {screenshotPreview && (
                        <div className="flex items-center gap-2 bg-white p-2 rounded-sm border border-[#EFE1C8]">
                          <img src={screenshotPreview} alt="Preview" className="w-12 h-12 object-cover rounded-sm" />
                          <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1 uppercase tracking-wider">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Screenshot Selected
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}

            </div>

          </div>

          {/* Right Column: Order Review & Place Order Button */}
          <div className="space-y-6">
            <div className="bg-white border-2 border-[#D4A017] rounded-sm p-6 shadow-md space-y-4">
              <h2 className="font-serif text-lg font-bold text-[#2A1810] border-b border-[#EFE1C8] pb-3 uppercase tracking-wider">
                Items in Order
              </h2>

              <div className="max-h-60 overflow-y-auto space-y-3 pr-1 divide-y divide-[#EFE1C8]">
                {cart.map((item) => (
                  <div key={item.product.id} className="pt-2 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-10 h-10 object-cover rounded-sm border border-[#EFE1C8] shrink-0"
                      />
                      <div className="truncate">
                        <p className="font-bold text-[#2A1810] truncate">{item.product.name}</p>
                        <p className="text-[#7A6A5C]">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-[#9B1C2F] shrink-0">
                      ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-[#EFE1C8] space-y-2 text-xs">
                <div className="flex justify-between text-[#7A6A5C] font-semibold">
                  <span>Subtotal</span>
                  <span className="font-bold text-[#2A1810]">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[#7A6A5C] font-semibold">
                  <span>Shipping Fee</span>
                  <span className="font-bold text-emerald-800">{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span>
                </div>
                <div className="pt-2 border-t border-[#EFE1C8] flex justify-between font-bold text-base">
                  <span className="font-serif text-[#2A1810]">Grand Total</span>
                  <span className="font-serif text-[#9B1C2F]">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3.5 rounded-sm bg-[#9B1C2F] hover:bg-[#7A1522] text-white font-bold text-xs uppercase tracking-wider border-b-2 border-[#D4A017] shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                  isSubmitting ? 'opacity-70 cursor-wait' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Placing Order...</span>
                  </>
                ) : (
                  <span>Place Order Now (₹{totalAmount.toLocaleString('en-IN')})</span>
                )}
              </button>

              <div className="text-[10px] font-semibold text-center text-[#7A6A5C] flex items-center justify-center gap-1 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D4A017]" />
                <span>Your details are stored safely in Firestore database</span>
              </div>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
