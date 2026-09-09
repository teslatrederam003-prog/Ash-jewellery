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
      <div className="relative min-h-[360px] h-[62vh] sm:h-[480px] lg:h-[560px] max-h-[580px] w-full bg-[#1A100C]">
        <img
          src={currentSlide.image}
          alt={currentSlide.headline}
          className="w-full h-full object-cover object-center opacity-100 sm:opacity-90 transition-opacity duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A100C]/90 via-[#1A100C]/25 to-black/10 sm:bg-gradient-to-r sm:from-[#2A1810]/85 sm:via-[#2A1810]/45 sm:to-transparent pointer-events-none" />

        {/* Content Box */}
        <div className="absolute inset-0 z-20 flex items-end pb-8 sm:items-center sm:pb-0 pointer-events-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-12 w-full pointer-events-auto">
            <div className="max-w-xl space-y-2 sm:space-y-4 p-0 sm:p-8 bg-transparent sm:bg-[#2A1810]/75 sm:backdrop-blur-xs border-0 sm:border sm:border-[#D4A017]/40 rounded-none sm:rounded-sm shadow-none sm:shadow-xl text-white">
              
              <span className="text-[#F0C75E] font-serif italic text-xs sm:text-lg font-medium block drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]">
                Premium Artificial Collections
              </span>

              <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold leading-tight text-[#FFF8EC] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                {currentSlide.headline}
              </h2>

              {currentSlide.subheadline && (
                <p className="text-xs sm:text-sm text-[#EFE1C8] font-sans leading-relaxed line-clamp-2 sm:line-clamp-none drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]">
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
                  className="bg-[#9B1C2F] text-white px-5 sm:px-9 py-2.5 sm:py-3.5 min-h-[44px] rounded-sm text-xs font-bold uppercase tracking-widest border-b-4 border-[#D4A017] hover:bg-[#7A1522] transition-all shadow-lg cursor-pointer inline-flex items-center gap-2"
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
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 min-w-[38px] min-h-[38px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center p-2 rounded-full sm:rounded-sm bg-black/40 hover:bg-[#9B1C2F] text-white sm:bg-white/90 sm:hover:bg-[#9B1C2F] sm:text-[#2A1810] sm:hover:text-white border border-[#D4A017]/60 shadow-md transition-colors cursor-pointer backdrop-blur-xs"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 min-w-[38px] min-h-[38px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center p-2 rounded-full sm:rounded-sm bg-black/40 hover:bg-[#9B1C2F] text-white sm:bg-white/90 sm:hover:bg-[#9B1C2F] sm:text-[#2A1810] sm:hover:text-white border border-[#D4A017]/60 shadow-md transition-colors cursor-pointer backdrop-blur-xs"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Indicator Dots */}
        {slides.length > 1 && (
          <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
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
