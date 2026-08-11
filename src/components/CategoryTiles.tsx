import React from 'react';
import { Category, ActivePage } from '../types';

interface CategoryTilesProps {
  categories: Category[];
  onSelectCategory: (categoryName: string) => void;
  setActivePage: (page: ActivePage) => void;
}

export const CategoryTiles: React.FC<CategoryTilesProps> = ({
  categories,
  onSelectCategory,
  setActivePage,
}) => {
  const handleCategoryClick = (catName: string) => {
    onSelectCategory(catName);
    setActivePage('shop');
  };

  return (
    <section className="py-12 bg-[#FFF8EC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="flex justify-between items-center mb-8 border-b border-[#EFE1C8] pb-4">
          <h3 className="text-lg sm:text-xl font-serif font-bold border-l-4 border-[#D4A017] pl-3 uppercase tracking-wider text-[#2A1810]">
            Shop By Category
          </h3>
          <button
            onClick={() => setActivePage('shop')}
            className="text-xs font-bold text-[#9B1C2F] uppercase underline decoration-[#D4A017] underline-offset-4 hover:text-[#7A1522] cursor-pointer"
          >
            View All Products →
          </button>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => handleCategoryClick(cat.name)}
              className="bg-white border border-[#EFE1C8] rounded-sm p-4 text-center group cursor-pointer hover:shadow-lg hover:border-[#D4A017] transition-all"
            >
              <div className="h-36 sm:h-44 w-full bg-[#FBEFCB] rounded-sm mb-3 overflow-hidden relative border border-[#EFE1C8]">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-[#2A1810]/10 group-hover:bg-transparent transition-colors" />
              </div>

              {/* Label */}
              <span className="font-serif font-bold text-base sm:text-lg text-[#2A1810] group-hover:text-[#9B1C2F] transition-colors block">
                {cat.name}
              </span>
              <p className="text-[10px] text-[#7A6A5C] uppercase tracking-wider font-bold mt-1">
                Explore Collection →
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
