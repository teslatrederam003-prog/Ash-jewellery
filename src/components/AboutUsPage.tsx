import React from 'react';
import { Sparkles, ShieldCheck, Heart, Award, Users, CheckCircle2 } from 'lucide-react';
import { ActivePage } from '../types';

interface AboutUsPageProps {
  setActivePage: (page: ActivePage) => void;
}

export const AboutUsPage: React.FC<AboutUsPageProps> = ({ setActivePage }) => {
  return (
    <div className="py-12 bg-[#FFF8EC] min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Banner */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#FBEFCB] text-[#9B1C2F] text-xs font-bold uppercase tracking-wider border border-[#D4A017] mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#D4A017]" />
            <span>Our Brand Journey</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#2A1810]">
            About Ash Jewellery
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6A5C] mt-3 leading-relaxed font-medium">
            Crafting artificial and imitation jewellery that captures the regal grandeur of precious metals and gemstones without the exorbitant price tag.
          </p>
        </div>

        {/* Main Brand Story Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="relative aspect-4/3 rounded-sm overflow-hidden border-2 border-[#D4A017] shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=1200"
              alt="Ash Jewellery Artisan Craftsmanship"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2A1810]/70 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="font-serif text-lg font-bold text-[#F0C75E]">
                Master Artisans at Work
              </span>
              <p className="text-[11px] text-[#EFE1C8]">In-house designing and stone setting</p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-[#2A1810] leading-relaxed">
            <h2 className="font-serif text-2xl font-bold text-[#9B1C2F]">
              Handcrafted with Royal Passion
            </h2>
            <p>
              Ash Jewellery was founded with a singular vision: to make every woman feel like royalty during her grandest celebrations and everyday moments. We specialize in handcrafted Kundan chokers, Chandbali earrings, Antique temple sets, and dainty crystal pendants.
            </p>
            <p>
              Unlike mass-manufactured factory trinkets, each piece at Ash Jewellery is designed and polished in-house by experienced craftsmen. We use high-grade copper alloy bases, micro-gold plating, and anti-tarnish protective lacquer coatings to preserve lasting luster.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setActivePage('shop')}
                className="px-6 py-3 rounded-sm bg-[#9B1C2F] hover:bg-[#7A1522] text-white font-bold text-xs uppercase tracking-wider border-b-2 border-[#D4A017] shadow-md transition-colors cursor-pointer"
              >
                Browse Our Collections
              </button>
            </div>
          </div>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
          <div className="bg-white border border-[#EFE1C8] rounded-sm p-6 text-center space-y-2 shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-[#FBEFCB] text-[#9B1C2F] flex items-center justify-center mx-auto mb-2 border-2 border-[#D4A017]">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-base font-bold text-[#2A1810]">In-House Crafting</h3>
            <p className="text-xs text-[#7A6A5C]">
              Every design is conceptualized and assembled in our specialized studio.
            </p>
          </div>

          <div className="bg-white border border-[#EFE1C8] rounded-sm p-6 text-center space-y-2 shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-[#FBEFCB] text-[#9B1C2F] flex items-center justify-center mx-auto mb-2 border-2 border-[#D4A017]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-base font-bold text-[#2A1810]">Affordable Premium</h3>
            <p className="text-xs text-[#7A6A5C]">
              Get the aesthetic look of real Kundan & gold jewellery at accessible prices.
            </p>
          </div>

          <div className="bg-white border border-[#EFE1C8] rounded-sm p-6 text-center space-y-2 shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-[#FBEFCB] text-[#9B1C2F] flex items-center justify-center mx-auto mb-2 border-2 border-[#D4A017]">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-base font-bold text-[#2A1810]">Trusted Quality</h3>
            <p className="text-xs text-[#7A6A5C]">
              Anti-tarnish polish and 100% manual quality inspection before packaging.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
