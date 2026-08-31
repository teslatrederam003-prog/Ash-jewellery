import React from 'react';
import { Sparkles, Heart, Clock, Gem, Users, Compass, CheckCircle2, MessageCircle } from 'lucide-react';
import { ActivePage } from '../types';
import { ASH_LOGO_URL } from '../assets/logo';

interface AboutUsPageProps {
  setActivePage: (page: ActivePage) => void;
}

export const AboutUsPage: React.FC<AboutUsPageProps> = ({ setActivePage }) => {
  return (
    <div className="py-12 sm:py-16 bg-[#FFF8EC] min-h-screen text-[#2A1810]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        
        {/* Top Hero / Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FBEFCB] text-[#9B1C2F] text-xs font-bold uppercase tracking-widest border border-[#D4A017] shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#D4A017]" />
            <span>Behind the Craft</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#2A1810] tracking-tight">
            Our Story
          </h1>

          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#D4A017] to-transparent mx-auto" />

          <p className="font-serif text-lg sm:text-xl text-[#9B1C2F] italic font-medium leading-snug">
            From One Dream to Another — Crafted with Love, Every Step of the Way.
          </p>
        </div>

        {/* Center Logo Accent Card */}
        <div className="bg-white border-2 border-[#D4A017] rounded-sm p-6 sm:p-10 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FBEFCB]/40 rounded-bl-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#FBEFCB]/40 rounded-tr-full pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 mb-8 pb-8 border-b border-[#EFE1C8]">
            <img
              src={ASH_LOGO_URL}
              alt="Ash Imitation Jewellery"
              className="h-24 sm:h-28 w-auto object-contain shrink-0 filter drop-shadow-sm"
            />
            <div className="text-center sm:text-left space-y-2">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2A1810]">
                Every beautiful journey begins with a simple dream.
              </h2>
              <p className="text-xs sm:text-sm text-[#7A6A5C] leading-relaxed">
                Behind every piece we design is the story of two people dedicated to handcrafted artistry and personal customer care.
              </p>
            </div>
          </div>

          {/* Story Narrative Sections */}
          <div className="space-y-10 text-sm sm:text-base leading-relaxed text-[#3D2619]">
            
            {/* 2020 Beginnings */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="bg-[#9B1C2F] text-white text-xs font-bold px-3 py-1 rounded-sm uppercase tracking-wider border border-[#D4A017]">
                  2020
                </span>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#9B1C2F]">
                  The First Spark
                </h3>
              </div>
              <p>
                For us, that dream began in <strong>2020</strong> — not with jewellery, but with cakes.
              </p>
              <p className="text-[#5A4537]">
                We started our cake business with little more than a passion to create something of our own. Every order taught us something new — how to understand what people truly want, how to turn an idea into something personal, and most importantly, how much trust a customer places in the hands of a small business.
              </p>
              <p className="text-[#5A4537]">
                Years passed, and with every customer, every custom request, and every creation, we grew.
              </p>
            </div>

            {/* 2026 Chapter */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <span className="bg-[#D4A017] text-[#2A1810] text-xs font-bold px-3 py-1 rounded-sm uppercase tracking-wider border border-[#9B1C2F]">
                  2026
                </span>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#9B1C2F]">
                  A New Chapter in Jewellery
                </h3>
              </div>
              <p>
                Then came <strong>2026</strong>, and with it, a new chapter. Our love for creativity led us into the world of jewellery.
              </p>
              <p className="text-[#5A4537]">
                What started as an idea slowly became <strong>ASH Jewellery</strong> — a place where we could bring together our experience of understanding customers with our passion for creating beautiful pieces.
              </p>
            </div>

            {/* Husband and Wife Team Callout */}
            <div className="bg-[#FFF8EC] border-l-4 border-[#D4A017] p-5 sm:p-6 rounded-r-sm space-y-3 shadow-2xs">
              <div className="flex items-center gap-2 text-[#9B1C2F] font-bold text-sm">
                <Heart className="w-4 h-4 text-[#9B1C2F] fill-[#9B1C2F]" />
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#9B1C2F]">
                  More Than Jewellery. Something Personal.
                </h3>
              </div>
              <p className="font-medium text-[#2A1810]">
                We are a <strong>husband-and-wife team</strong>, working together behind every creation.
              </p>
              <p className="text-xs sm:text-sm text-[#5A4537]">
                From the moment you tell us what you are looking for, to the moment your jewellery is ready, we personally take care of the details. We listen to your requirements, understand your vision, and work towards creating something that feels truly yours.
              </p>
              <p className="text-xs sm:text-sm text-[#5A4537]">
                Our journey into jewellery began with local customised orders. Each piece we created brought new confidence, new ideas, and new stories.
              </p>
            </div>

            {/* Inspiring Quote */}
            <div className="text-center py-4 px-6 bg-gradient-to-r from-[#2A1810] via-[#9B1C2F] to-[#2A1810] text-[#FFF8EC] rounded-sm border-2 border-[#D4A017] shadow-sm space-y-2">
              <p className="font-serif text-base sm:text-lg italic font-bold text-[#FBEFCB]">
                &ldquo;If we can create something special for one customer, why not share that experience with many more?&rdquo;
              </p>
              <p className="text-xs text-[#EFE1C8]">
                That thought became the reason behind our website — taking ASH Jewellery beyond our local beginnings to customers across <strong>India and beyond</strong>.
              </p>
            </div>

            {/* Made for Your Moments */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2">
                <Gem className="w-5 h-5 text-[#D4A017]" />
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#9B1C2F]">
                  Made for Your Moments
                </h3>
              </div>
              <p>
                We believe jewellery is never <em>just</em> jewellery.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="flex items-start gap-2.5 p-3 bg-[#FFF8EC] border border-[#EFE1C8] rounded-sm">
                  <CheckCircle2 className="w-4 h-4 text-[#D4A017] shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-[#3D2619]">The piece you choose for your wedding day.</span>
                </div>
                <div className="flex items-start gap-2.5 p-3 bg-[#FFF8EC] border border-[#EFE1C8] rounded-sm">
                  <CheckCircle2 className="w-4 h-4 text-[#D4A017] shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-[#3D2619]">The sparkle you wear for a festival.</span>
                </div>
                <div className="flex items-start gap-2.5 p-3 bg-[#FFF8EC] border border-[#EFE1C8] rounded-sm">
                  <CheckCircle2 className="w-4 h-4 text-[#D4A017] shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-[#3D2619]">The gift that carries a special memory.</span>
                </div>
                <div className="flex items-start gap-2.5 p-3 bg-[#FFF8EC] border border-[#EFE1C8] rounded-sm">
                  <CheckCircle2 className="w-4 h-4 text-[#D4A017] shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-[#3D2619]">Simply something you choose because it feels like <strong>you</strong>.</span>
                </div>
              </div>

              <p className="text-[#5A4537] pt-2">
                That's why we don't believe in creating jewellery just for the sake of making a product. We create it with <strong>your occasion, your style, and your vision</strong> in mind.
              </p>
              <p className="text-[#5A4537]">
                Whether you fall in love with one of our designs or have something completely different in your imagination, we are here to help bring that idea to life.
              </p>
            </div>

            {/* And This Is Only the Beginning */}
            <div className="space-y-3 pt-2">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#9B1C2F]">
                And This Is Only the Beginning...
              </h3>
              <p>
                From a small dream in 2020, to a new chapter in jewellery in 2026, our journey has always been about one thing — <strong>creating something meaningful with our own hands and our whole heart.</strong>
              </p>
              <p className="text-[#5A4537]">
                ASH Jewellery is still growing, still learning, and still dreaming bigger. And as we move forward, we want you to be a part of that journey.
              </p>
              <p className="text-[#5A4537]">
                Because behind every piece we create is not just a business. <strong>There are two people who care deeply about what they make, the customers they serve, and the trust placed in them.</strong>
              </p>
            </div>

            {/* Heartfelt Sign-Off Card */}
            <div className="bg-[#FBEFCB]/60 border border-[#D4A017] p-6 sm:p-8 rounded-sm text-center space-y-4 pt-6">
              <div className="space-y-1 text-xs sm:text-sm font-medium text-[#2A1810]">
                <p>Thank you for choosing ASH Jewellery.</p>
                <p>Thank you for trusting us with your special moments.</p>
                <p>And thank you for becoming a part of our story.</p>
              </div>

              <div className="pt-2">
                <h4 className="font-serif text-xl sm:text-2xl font-bold text-[#9B1C2F] tracking-wide">
                  ASH Jewellery
                </h4>
                <p className="text-xs sm:text-sm font-bold text-[#D4A017] uppercase tracking-widest mt-1">
                  Customised with Love. Crafted with Care. Made for You.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <button
                  onClick={() => setActivePage('shop')}
                  className="px-6 py-2.5 rounded-sm bg-[#9B1C2F] hover:bg-[#7A1522] text-white font-bold text-xs uppercase tracking-wider border border-[#D4A017] shadow-sm transition-colors cursor-pointer"
                >
                  Explore Collections
                </button>
                <button
                  onClick={() => setActivePage('custom-orders')}
                  className="px-6 py-2.5 rounded-sm bg-white hover:bg-[#FFF8EC] text-[#2A1810] font-bold text-xs uppercase tracking-wider border border-[#D4A017] shadow-xs transition-colors cursor-pointer"
                >
                  Request Custom Design
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

