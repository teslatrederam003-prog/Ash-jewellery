import React, { useState, useMemo } from 'react';
import { Filter, ArrowUpDown, Sparkles, SlidersHorizontal } from 'lucide-react';
import { Product, Category } from '../types';
import { ProductCard } from './ProductCard';

interface ShopPageProps {
  products: Product[];
  categories: Category[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  loading: boolean;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  products,
  categories,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  onSelectProduct,
  onAddToCart,
  loading,
}) => {
  const [sortOption, setSortOption] = useState<'featured' | 'lowToHigh' | 'highToLow'>('featured');

  // Filter & Sort logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesCat =
          selectedCategory === 'All' ||
          p.category.toLowerCase() === selectedCategory.toLowerCase();
        const matchesQuery =
          !searchQuery ||
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesQuery;
      })
      .sort((a, b) => {
        if (sortOption === 'lowToHigh') return a.price - b.price;
        if (sortOption === 'highToLow') return b.price - a.price;
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [products, selectedCategory, searchQuery, sortOption]);

  return (
    <div className="py-8 bg-[#FFF8EC] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title Banner */}
        <div className="bg-white rounded-sm p-6 sm:p-10 text-[#2A1810] mb-8 border border-[#EFE1C8] shadow-sm relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#D4A017 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="relative z-10 max-w-2xl">
            <span className="text-xs font-bold text-[#D4A017] uppercase tracking-widest flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Ash Jewellery Catalog
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#2A1810]">
              {selectedCategory === 'All' ? 'All Jewellery Collections' : `${selectedCategory} Collection`}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[#7A6A5C] leading-relaxed">
              Handcrafted Kundan, Chandbali, Temple & Bridal jewellery created for your cherished occasions.
            </p>
          </div>
        </div>

        {/* Filters & Sorting Bar */}
        <div className="bg-white border border-[#EFE1C8] rounded-sm p-4 mb-8 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-4 py-2.5 min-h-[44px] rounded-sm text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer border-b-2 flex items-center justify-center ${
                selectedCategory === 'All'
                  ? 'bg-[#9B1C2F] text-white border-[#D4A017]'
                  : 'bg-[#FFF8EC] text-[#2A1810] hover:bg-[#FBEFCB] border-[#EFE1C8]'
              }`}
            >
              All Designs
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-4 py-2.5 min-h-[44px] rounded-sm text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer border-b-2 flex items-center justify-center ${
                  selectedCategory.toLowerCase() === cat.name.toLowerCase()
                    ? 'bg-[#9B1C2F] text-white border-[#D4A017]'
                    : 'bg-[#FFF8EC] text-[#2A1810] hover:bg-[#FBEFCB] border-[#EFE1C8]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-1.5 text-xs text-[#7A6A5C] font-bold uppercase tracking-wider">
              <ArrowUpDown className="w-4 h-4 text-[#D4A017]" />
              <span>Sort By:</span>
            </div>
            <select
              value={sortOption}
              onChange={(e: any) => setSortOption(e.target.value)}
              className="px-3 py-2.5 min-h-[44px] rounded-sm border-2 border-[#EFE1C8] bg-white text-xs font-bold text-[#2A1810] focus:outline-hidden focus:border-[#D4A017] cursor-pointer uppercase tracking-wider"
            >
              <option value="featured">Featured & Popular</option>
              <option value="lowToHigh">Price: Low to High</option>
              <option value="highToLow">Price: High to Low</option>
            </select>
          </div>

        </div>

        {/* Loading Spinner State */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-10 h-10 border-4 border-[#9B1C2F] border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-xs font-semibold text-[#7A6A5C]">Loading jewellery collections...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          /* Empty State */
          <div className="bg-white border-2 border-dashed border-[#EFE1C8] rounded-3xl p-12 text-center max-w-lg mx-auto my-12">
            <div className="w-16 h-16 rounded-full bg-[#FBEFCB] text-[#9B1C2F] flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#2A1810]">No Products Found</h3>
            <p className="text-xs text-[#7A6A5C] mt-2">
              We couldn't find any designs matching your selected filters or search query.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="mt-6 px-6 py-2.5 rounded-full bg-[#9B1C2F] text-[#FFF8EC] text-xs font-semibold border border-[#D4A017] cursor-pointer hover:bg-[#7A1522]"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectProduct={onSelectProduct}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
