import React, { useState } from 'react';
import { X, ShoppingBag, Truck, ShieldCheck, Heart, Sparkles, Check } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);

  if (!product) return null;

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800'];

  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#2A1810]/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white border-2 border-[#D4A017] rounded-sm shadow-2xl overflow-hidden my-auto max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-sm bg-white border border-[#EFE1C8] text-[#2A1810] hover:text-[#9B1C2F] hover:bg-[#FFF8EC] shadow-xs cursor-pointer font-bold"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Left Column: Image Gallery */}
          <div className="p-4 sm:p-6 bg-[#FFF8EC] flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#EFE1C8]">
            <div className="aspect-square w-full rounded-sm overflow-hidden border border-[#EFE1C8] shadow-xs relative bg-white">
              <img
                src={images[selectedImageIndex] || images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {discount > 0 && (
                <span className="absolute top-3 left-3 bg-[#9B1C2F] text-white border-b-2 border-[#D4A017] text-xs font-bold px-2.5 py-1 rounded-sm uppercase tracking-wider shadow-xs">
                  SAVE {discount}%
                </span>
              )}
            </div>

            {/* Thumbnail Row */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 mt-4 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-14 h-14 min-w-[48px] min-h-[48px] rounded-sm overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                      selectedImageIndex === idx
                        ? 'border-[#9B1C2F] ring-2 ring-[#D4A017]'
                        : 'border-[#EFE1C8] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Info & Actions */}
          <div className="p-5 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-[#D4A017] uppercase tracking-wider mb-1">
                <span>{product.category}</span>
                {product.occasion && <span>{product.occasion} Wear</span>}
              </div>

              <h2 className="font-serif text-xl sm:text-3xl font-bold text-[#2A1810]">
                {product.name}
              </h2>

              {/* Price Row */}
              <div className="mt-3 sm:mt-4 flex flex-wrap items-baseline gap-2 sm:gap-3">
                <span className="font-serif text-2xl sm:text-3xl font-bold text-[#9B1C2F]">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.mrp > product.price && (
                  <span className="text-sm sm:text-base text-[#7A6A5C] line-through font-medium">
                    ₹{product.mrp.toLocaleString('en-IN')}
                  </span>
                )}
                <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-sm border border-emerald-300 uppercase tracking-wider">
                  Taxes Included
                </span>
              </div>

              {/* Description */}
              <p className="mt-3 text-xs sm:text-sm text-[#7A6A5C] leading-relaxed">
                {product.description}
              </p>

              {/* Quantity Selector */}
              <div className="mt-5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2A1810] mb-2">
                  Select Quantity:
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border-2 border-[#D4A017] rounded-sm bg-white overflow-hidden">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-sm font-bold text-[#2A1810] hover:bg-[#FBEFCB] cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-4 text-sm font-bold text-[#2A1810]">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-sm font-bold text-[#2A1810] hover:bg-[#FBEFCB] cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-[#7A6A5C] font-semibold">
                    ({product.stock} available)
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              {addedNotice && (
                <div className="p-2.5 rounded-sm bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2 uppercase tracking-wider">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Added {quantity} item(s) to your cart!</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className="px-4 py-3 min-h-[48px] rounded-sm bg-[#FFF8EC] hover:bg-[#FBEFCB] text-[#9B1C2F] font-bold text-xs uppercase tracking-wider border-2 border-[#9B1C2F] transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>

                <button
                  onClick={() => onBuyNow(product, quantity)}
                  disabled={product.stock <= 0}
                  className="px-4 py-3 min-h-[48px] rounded-sm bg-[#9B1C2F] hover:bg-[#7A1522] text-white font-bold text-xs uppercase tracking-wider border-b-2 border-[#D4A017] shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-[#F0C75E]" />
                  <span>Buy Now</span>
                </button>
              </div>

              {/* Guarantees */}
              <div className="pt-3 border-t border-[#EFE1C8] grid grid-cols-2 gap-2 text-[11px] font-bold uppercase tracking-wider text-[#7A6A5C]">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#D4A017]" />
                  <span>Free Shipping &gt; ₹999</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D4A017]" />
                  <span>Safe COD / UPI Payment</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
