import React from 'react';
import { ShoppingBag, Trash2, ArrowRight, ShieldCheck, Truck, Sparkles } from 'lucide-react';
import { CartItem, ActivePage } from '../types';

interface CartPageProps {
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  setActivePage: (page: ActivePage) => void;
}

export const CartPage: React.FC<CartPageProps> = ({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  setActivePage,
}) => {
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const freeShippingThreshold = 999;
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  if (cart.length === 0) {
    return (
      <div className="py-16 bg-[#FFF8EC] min-h-[70vh] flex items-center justify-center">
        <div className="bg-white border-2 border-dashed border-[#EFE1C8] rounded-sm p-10 max-w-md mx-auto text-center shadow-xs">
          <div className="w-16 h-16 rounded-full bg-[#FBEFCB] text-[#9B1C2F] border-2 border-[#D4A017] flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#2A1810]">Your Shopping Bag is Empty</h2>
          <p className="text-xs text-[#7A6A5C] mt-2 leading-relaxed">
            Discover our royal Kundan, Chandbali, and handcrafted imitation jewellery collections.
          </p>
          <button
            onClick={() => setActivePage('shop')}
            className="mt-6 px-6 py-3 rounded-sm bg-[#9B1C2F] hover:bg-[#7A1522] text-white text-xs font-bold uppercase tracking-wider border-b-2 border-[#D4A017] shadow-sm cursor-pointer transition-colors"
          >
            Explore Jewellery Catalog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 bg-[#FFF8EC] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#2A1810] mb-6 border-b border-[#EFE1C8] pb-3">
          Your Shopping Bag ({cart.reduce((a, b) => a + b.quantity, 0)} Items)
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Cart Line Items */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Free Shipping Progress Card */}
            <div className="bg-white border border-[#EFE1C8] rounded-sm p-4 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-2">
                <span className="flex items-center gap-1.5 text-[#9B1C2F]">
                  <Truck className="w-4 h-4 text-[#D4A017]" />
                  {amountToFreeShipping === 0
                    ? '🎉 Congratulations! You unlocked FREE Shipping!'
                    : `Add ₹${amountToFreeShipping.toLocaleString('en-IN')} more to get FREE Express Shipping`}
                </span>
                <span className="text-[#7A6A5C]">{Math.round(progressPercent)}%</span>
              </div>
              <div className="w-full bg-[#EFE1C8] h-2 rounded-sm overflow-hidden">
                <div
                  className="bg-[#9B1C2F] h-full transition-all duration-300 rounded-sm"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="bg-white border border-[#EFE1C8] rounded-sm overflow-hidden shadow-2xs divide-y divide-[#EFE1C8]">
              {cart.map((item) => (
                <div key={item.product.id} className="p-4 sm:p-6 flex gap-4 items-center">
                  
                  {/* Thumbnail */}
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-sm border border-[#EFE1C8] shrink-0"
                  />

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-[#D4A017] uppercase tracking-wider">
                      {item.product.category}
                    </span>
                    <h3 className="font-serif text-sm sm:text-base font-bold text-[#2A1810] truncate">
                      {item.product.name}
                    </h3>

                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="font-serif text-sm sm:text-base font-bold text-[#9B1C2F]">
                        ₹{item.product.price.toLocaleString('en-IN')}
                      </span>
                      {item.product.mrp > item.product.price && (
                        <span className="text-xs text-[#7A6A5C] line-through">
                          ₹{item.product.mrp.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    {/* Quantity & Delete */}
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div className="flex items-center border border-[#D4A017] rounded-sm bg-[#FFF8EC] overflow-hidden text-xs font-bold">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center text-[#2A1810] hover:bg-[#FBEFCB] cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 text-[#2A1810]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center text-[#2A1810] hover:bg-[#FBEFCB] cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="p-2 min-h-[44px] text-xs text-red-600 hover:text-red-800 flex items-center gap-1 cursor-pointer font-bold uppercase tracking-wider"
                        aria-label="Remove item from cart"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    </div>

                  </div>

                </div>
              ))}
            </div>

            {/* Clear Cart link */}
            <div className="flex justify-end pt-1">
              <button
                onClick={onClearCart}
                className="text-xs font-bold uppercase tracking-wider text-[#7A6A5C] hover:text-red-600 underline cursor-pointer"
              >
                Clear Entire Bag
              </button>
            </div>

          </div>

          {/* Right Column: Order Summary */}
          <div className="space-y-6">
            <div className="bg-white border-2 border-[#D4A017] rounded-sm p-6 shadow-md space-y-4">
              <h2 className="font-serif text-lg font-bold text-[#2A1810] border-b border-[#EFE1C8] pb-3 uppercase tracking-wider">
                Order Summary
              </h2>

              <div className="space-y-2.5 text-xs sm:text-sm">
                <div className="flex justify-between text-[#7A6A5C] font-semibold">
                  <span>Items Subtotal</span>
                  <span className="font-bold text-[#2A1810]">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between text-[#7A6A5C] font-semibold">
                  <span>Estimated Shipping</span>
                  <span className="font-bold text-emerald-800">
                    {subtotal >= freeShippingThreshold ? 'FREE' : '₹99'}
                  </span>
                </div>

                <div className="pt-3 border-t border-[#EFE1C8] flex justify-between font-bold text-base sm:text-lg">
                  <span className="font-serif text-[#2A1810]">Total Payable</span>
                  <span className="font-serif text-[#9B1C2F]">
                    ₹{(subtotal + (subtotal >= freeShippingThreshold ? 0 : 99)).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActivePage('checkout')}
                className="w-full py-3.5 rounded-sm bg-[#9B1C2F] hover:bg-[#7A1522] text-white font-bold text-xs uppercase tracking-wider border-b-2 border-[#D4A017] shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 text-[#F0C75E]" />
              </button>

              <div className="pt-2 text-[11px] font-semibold text-[#7A6A5C] space-y-2 border-t border-[#EFE1C8]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#D4A017] shrink-0" />
                  <span>Verified QR Code UPI & COD Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#D4A017] shrink-0" />
                  <span>Handcrafted Jewellery with Anti-Tarnish Protection</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
