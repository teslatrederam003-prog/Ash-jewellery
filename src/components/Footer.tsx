import React from 'react';
import { Phone, MapPin, MessageCircle, Heart, ShieldCheck } from 'lucide-react';
import { ActivePage } from '../types';
import { ASH_LOGO_URL } from '../assets/logo';

interface FooterProps {
  setActivePage: (page: ActivePage) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActivePage }) => {
  return (
    <footer className="bg-[#2A1810] text-[#FFF8EC] border-t-4 border-[#D4A017] pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand & Story */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => {
                setActivePage('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-3 text-left cursor-pointer group bg-transparent border-0 p-0 focus:outline-none focus:ring-2 focus:ring-[#D4A017] rounded-xs"
              title="Return to Home"
              aria-label="Return to Home"
            >
              <img
                src={ASH_LOGO_URL}
                alt="Ash Imitation Jewellery"
                className="h-16 w-auto object-contain filter drop-shadow-sm transition-transform duration-200 group-hover:scale-105"
              />
              <div>
                <h3 className="font-serif text-lg font-bold text-[#D4A017] uppercase tracking-wider group-hover:text-[#FBEFCB] transition-colors">
                  Ash Jewellery
                </h3>
                <p className="text-[9px] text-[#FBEFCB]/70 uppercase tracking-widest font-bold">Imitation Jewellery</p>
              </div>
            </button>
            <p className="text-xs text-[#FBEFCB]/80 leading-relaxed font-sans">
              Exquisite handcrafted imitation & artificial jewellery designed in-house. Experience the grandeur of royal Kundan, Temple, and Antique sets at accessible prices.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#D4A017] font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-[#D4A017]" />
              <span>100% Quality Checked & Anti-Tarnish Finish</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-bold text-[#D4A017] uppercase tracking-wider border-b border-[#D4A017]/30 pb-1">Quick Links</h4>
            <ul className="space-y-2 text-xs font-semibold uppercase tracking-wider text-[#FBEFCB]/80">
              <li>
                <button
                  onClick={() => setActivePage('home')}
                  className="hover:text-[#D4A017] transition-colors cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePage('shop')}
                  className="hover:text-[#D4A017] transition-colors cursor-pointer"
                >
                  Shop Collection
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePage('custom-orders')}
                  className="hover:text-[#D4A017] transition-colors cursor-pointer"
                >
                  Custom Bridal Orders
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePage('about')}
                  className="hover:text-[#D4A017] transition-colors cursor-pointer"
                >
                  Our Story
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePage('contact')}
                  className="hover:text-[#D4A017] transition-colors cursor-pointer"
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-bold text-[#D4A017] uppercase tracking-wider border-b border-[#D4A017]/30 pb-1">Categories</h4>
            <ul className="space-y-2 text-xs font-semibold uppercase tracking-wider text-[#FBEFCB]/80">
              <li>
                <button
                  onClick={() => setActivePage('shop')}
                  className="hover:text-[#D4A017] transition-colors cursor-pointer"
                >
                  Necklaces & Chokers
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePage('shop')}
                  className="hover:text-[#D4A017] transition-colors cursor-pointer"
                >
                  Chandbali & Jhumkas
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePage('shop')}
                  className="hover:text-[#D4A017] transition-colors cursor-pointer"
                >
                  Crystal & Gold Pendants
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePage('shop')}
                  className="hover:text-[#D4A017] transition-colors cursor-pointer"
                >
                  Peacock & Temple Bangles
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Strip */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-bold text-[#D4A017] uppercase tracking-wider border-b border-[#D4A017]/30 pb-1">Reach Us</h4>
            <ul className="space-y-3 text-xs text-[#FBEFCB]/80">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#D4A017] shrink-0 mt-0.5" />
                <div>
                  <p className="leading-snug">Ash Jewellery, Ganeshnagar Line No. 4, Near Maruti Mandir, Bajiprabhu Path Sastha Jawal, Ichalkaranji, Tal- Hatkangale, Dist- Kolhapur - 416115</p>
                  <a
                    href="https://www.google.com/maps/place/16.710121,74.453112/data=!4m6!3m5!1s0!7e2!8m2!3d16.710121!4d74.45311199999999!18m1!1e1?entry=gps&coh=192189&g_ep=CAESBzI2LjI5LjIYACDl7Q0qnwEsOTQyNjc3MjcsOTQyOTIxOTUsOTQyOTk1MzIsMTAwNzk2NDk4LDEwMDc5Nzc2MSwxMDA3OTY1MzUsOTQyODA1NzYsOTQyMDczOTQsOTQyMDc1MDYsOTQyMDg1MDYsOTQyMTg2NTMsOTQyMjk4MzksOTQyNzUxNjgsOTQyNzk2MTksMTAwODE1NjM1LDEwMDgyMDIzNywxMDA4MjI0OTRCAklO&skid=d3660f4e-dbe6-4acb-9268-b7ff6674f7fc"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-[#D4A017] hover:underline font-semibold mt-0.5 inline-block"
                  >
                    Open in Google Maps →
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D4A017] shrink-0" />
                <a href="tel:+918208810579" className="hover:text-[#D4A017] font-semibold">
                  +91 82088 10579
                </a>
              </li>
            </ul>

            {/* Direct WhatsApp Action Button */}
            <a
              href="https://wa.me/918208810579?text=Hi%20Ash%20Jewellery,%20I%20have%20an%20inquiry%20regarding%20your%20jewellery%20collection."
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider border-b-2 border-emerald-500 shadow-2xs transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="border-t border-[#EFE1C8]/20 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#EFE1C8]/60 gap-4">
          <p>© {new Date().getFullYear()} Ash Jewellery. All rights reserved.</p>
          
          <div className="flex items-center gap-4">
            <p className="flex items-center gap-1">
              Handcrafted with <Heart className="w-3.5 h-3.5 text-[#9B1C2F] fill-current" /> for artificial jewellery lovers
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
