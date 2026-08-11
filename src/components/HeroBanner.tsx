import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { HeroSlide, ActivePage } from '../types';

interface HeroBannerProps {
  slides: HeroSlide[];
  setActivePage: (page: ActivePage) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ slides, setActivePage }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!slides || slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides]);

  if (!slides || slides.length === 0) return null;

  const currentSlide = slides[currentIndex] || slides[0];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  return (
    <section className="relative overflow-hidden bg-white border-b border-[#EFE1C8] text-[#2A1810]">
      {/* Background radial gold grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none z-10"
        style={{
          backgroundImage: 'radial-gradient(#D4A017 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Background Image Container */}
      <div className="relative h-[340px] sm:h-[480px] lg:h-[560px] w-full bg-[#1A100C]">
        <img
          src={currentSlide.image}
          alt={currentSlide.headline}
          className="w-full h-full object-cover object-center opacity-85 transition-opacity duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#2A1810]/85 via-[#2A1810]/50 to-transparent" />

        {/* Content Box */}
        <div className="absolute inset-0 z-20 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-12 w-full">
            <div className="max-w-xl space-y-2.5 sm:space-y-4 p-4 sm:p-8 bg-[#2A1810]/85 sm:bg-[#2A1810]/75 backdrop-blur-xs border border-[#D4A017]/40 rounded-sm shadow-xl text-white">
              
              <span className="text-[#D4A017] font-serif italic text-xs sm:text-lg font-medium block">
                Premium Artificial Collections
              </span>

              <h2 className="font-serif text-xl sm:text-4xl lg:text-5xl font-bold leading-tight text-[#FFF8EC]">
                {currentSlide.headline}
              </h2>

              {currentSlide.subheadline && (
                <p className="text-[11px] sm:text-sm text-[#EFE1C8] font-sans leading-relaxed line-clamp-2 sm:line-clamp-none">
                  {currentSlide.subheadline}
                </p>
              )}

              <div className="pt-1 sm:pt-2">
                <button
                  onClick={() => {
                    if (currentSlide.buttonLink === 'custom-orders') {
                      setActivePage('custom-orders');
                    } else {
                      setActivePage('shop');
                    }
                  }}
                  className="bg-[#9B1C2F] text-white px-5 sm:px-9 py-2.5 sm:py-3.5 min-h-[44px] rounded-sm text-xs font-bold uppercase tracking-widest border-b-4 border-[#D4A017] hover:bg-[#7A1522] transition-all shadow-md cursor-pointer inline-flex items-center gap-2"
                >
                  <span>{currentSlide.buttonText || 'Explore Collection'}</span>
                  <span className="text-[#F0C75E]">→</span>
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        {slides.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 min-w-[44px] min-h-[44px] flex items-center justify-center p-2.5 rounded-sm bg-white/90 hover:bg-[#9B1C2F] text-[#2A1810] hover:text-white border border-[#D4A017] shadow-sm transition-colors cursor-pointer"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 min-w-[44px] min-h-[44px] flex items-center justify-center p-2.5 rounded-sm bg-white/90 hover:bg-[#9B1C2F] text-[#2A1810] hover:text-white border border-[#D4A017] shadow-sm transition-colors cursor-pointer"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Indicator Dots */}
        {slides.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentIndex === idx
                    ? 'w-8 bg-[#9B1C2F] border border-[#D4A017]'
                    : 'w-2 bg-[#7A6A5C]/40 hover:bg-[#7A6A5C]/80'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
