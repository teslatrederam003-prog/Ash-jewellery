import React from 'react';
import { ShoppingBag, Eye, Star } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  onAddToCart,
}) => {
  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  return (
    <div
      onClick={() => onSelectProduct(product)}
      className="bg-white border border-[#EFE1C8] rounded-sm p-3.5 sm:p-4 hover:shadow-lg hover:border-[#D4A017] transition-all group cursor-pointer flex flex-col justify-between"
    >
      {/* Top Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#FBEFCB] rounded-sm mb-3 border border-[#EFE1C8]">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {discount > 0 && (
            <span className="bg-[#9B1C2F] text-white text-[10px] font-bold px-2 py-0.5 rounded-sm border-b-2 border-[#D4A017] uppercase tracking-wider">
              {discount}% OFF
            </span>
          )}
          {product.featured && (
            <span className="bg-[#D4A017] text-[#2A1810] text-[10px] font-bold px-2 py-0.5 rounded-sm flex items-center gap-1 shadow-2xs uppercase tracking-wider">
              <Star className="w-2.5 h-2.5 fill-current text-[#2A1810]" />
              Featured
            </span>
          )}
        </div>

        {/* Quick View overlay */}
        <div className="absolute inset-0 bg-[#2A1810]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="bg-white text-[#9B1C2F] text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-sm shadow-md flex items-center gap-1.5 border-b-2 border-[#D4A017]">
            <Eye className="w-3.5 h-3.5" />
            Quick View
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 flex flex-col justify-between space-y-2">
        <div>
          <div className="flex items-center justify-between text-[10px] text-[#7A6A5C] uppercase tracking-wider font-bold mb-1">
            <span>{product.category}</span>
            {product.occasion && (
              <span className="text-[#D4A017] font-bold">{product.occasion}</span>
            )}
          </div>

          <h3 className="font-serif text-sm sm:text-base font-bold text-[#2A1810] line-clamp-2 group-hover:text-[#9B1C2F] transition-colors leading-snug">
            {product.name}
          </h3>
        </div>

        <div className="pt-2 border-t border-[#EFE1C8] flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-base sm:text-lg font-bold text-[#9B1C2F]">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.mrp > product.price && (
                <span className="text-xs text-[#7A6A5C] line-through">
                  ₹{product.mrp.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <p className="text-[10px] text-emerald-800 font-bold uppercase tracking-tight">
              {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </p>
          </div>

          <button
            onClick={(e) => onAddToCart(product, e)}
            disabled={product.stock <= 0}
            className={`px-3 py-2.5 min-h-[44px] min-w-[44px] rounded-sm text-xs font-bold uppercase tracking-wider border-b-2 border-[#D4A017] shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              product.stock > 0
                ? 'bg-[#9B1C2F] hover:bg-[#7A1522] text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed border-none'
            }`}
            title="Add to Cart"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
