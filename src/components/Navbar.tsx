import React, { useState } from 'react';
import { ShoppingBag, User, Menu, X, Sparkles, Search, ShieldCheck } from 'lucide-react';
import { ActivePage } from '../types';
import { ASH_LOGO_URL } from '../assets/logo';

interface NavbarProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  cartCount: number;
  userEmail: string | null;
  isAdmin: boolean;
  onOpenAuth: () => void;
  onLogout: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  setActivePage,
  cartCount,
  userEmail,
  isAdmin,
  onOpenAuth,
  onLogout,
  searchQuery,
  setSearchQuery,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const navLinks: { label: string; page: ActivePage }[] = [
    { label: 'Home', page: 'home' },
    { label: 'Shop', page: 'shop' },
    { label: 'Custom Orders', page: 'custom-orders' },
    { label: 'About Us', page: 'about' },
    { label: 'Contact Us', page: 'contact' },
  ];

  const handleNavClick = (page: ActivePage) => {
    setActivePage(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#EFE1C8] shadow-xs">
      {/* Top Banner */}
      <div className="bg-[#9B1C2F] text-[#FBEFCB] text-[11px] py-1.5 px-4 text-center font-bold tracking-wider uppercase flex items-center justify-center gap-2 border-b border-[#D4A017]/30">
        <Sparkles className="w-3.5 h-3.5 text-[#D4A017]" />
        <span>Free Express Shipping across India on orders above ₹999</span>
        <Sparkles className="w-3.5 h-3.5 text-[#D4A017]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <button
            type="button"
            className="flex items-center cursor-pointer group py-1 bg-transparent border-0 p-0 focus:outline-none focus:ring-2 focus:ring-[#D4A017] rounded-xs"
            onClick={() => {
              handleNavClick('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            title="Ash Imitation Jewellery - Return to Home"
            aria-label="Ash Imitation Jewellery - Return to Home"
          >
            <img
              src={ASH_LOGO_URL}
              alt="Ash Imitation Jewellery Logo"
              className="h-16 sm:h-18 w-auto max-h-18 object-contain transition-transform duration-200 group-hover:scale-105"
            />
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = activePage === link.page;
              return (
                <button
                  key={link.page}
                  onClick={() => handleNavClick(link.page)}
                  className={`text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer relative py-1.5 ${
                    isActive
                      ? 'text-[#9B1C2F] border-b-2 border-[#9B1C2F]'
                      : 'text-[#7A6A5C] hover:text-[#9B1C2F]'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Search Input toggle */}
            <div className="relative">
              {searchOpen ? (
                <div className="flex items-center bg-white border-2 border-[#D4A017] rounded-sm px-3 py-1 shadow-xs">
                  <Search className="w-4 h-4 text-[#7A6A5C] mr-2" />
                  <input
                    type="text"
                    placeholder="Search jewellery..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (activePage !== 'shop') setActivePage('shop');
                    }}
                    autoFocus
                    className="w-32 sm:w-48 text-xs text-[#2A1810] focus:outline-hidden"
                  />
                  <button
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="text-xs text-[#7A6A5C] hover:text-[#9B1C2F] ml-1 font-bold"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setSearchOpen(true);
                    if (activePage !== 'shop') setActivePage('shop');
                  }}
                  className="p-2 text-[#2A1810] hover:text-[#9B1C2F] hover:bg-[#FBEFCB]/50 rounded-sm transition-colors cursor-pointer"
                  title="Search products"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Cart Button */}
            <button
              onClick={() => handleNavClick('cart')}
              className="relative p-2 text-[#2A1810] hover:text-[#9B1C2F] hover:bg-[#FBEFCB]/50 rounded-sm transition-colors cursor-pointer"
              title="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#9B1C2F] text-white border border-[#D4A017] text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Account / Auth */}
            {userEmail ? (
              <div className="relative group">
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-white border border-[#D4A017] hover:bg-[#FBEFCB]/30 text-xs font-bold text-[#2A1810] uppercase tracking-wider shadow-2xs transition-colors cursor-pointer"
                >
                  <User className="w-4 h-4 text-[#9B1C2F]" />
                  <span className="max-w-[100px] truncate hidden sm:inline">{userEmail.split('@')[0]}</span>
                </button>

                {/* Account Dropdown */}
                <div className="absolute right-0 mt-1 w-48 bg-white border-2 border-[#D4A017] rounded-sm shadow-xl py-2 hidden group-hover:block z-50">
                  <div className="px-4 py-2 border-b border-[#EFE1C8] text-xs text-[#7A6A5C]">
                    Logged in as:
                    <p className="font-semibold text-[#2A1810] truncate">{userEmail}</p>
                  </div>
                  <button
                    onClick={() => handleNavClick('my-orders')}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-[#2A1810] hover:bg-[#FFF8EC] hover:text-[#9B1C2F] cursor-pointer uppercase tracking-wider"
                  >
                    My Orders
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => handleNavClick('admin')}
                      className="w-full text-left px-4 py-2 text-xs text-[#9B1C2F] font-bold hover:bg-[#FBEFCB] flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-[#D4A017]" />
                      Admin Panel
                    </button>
                  )}
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 cursor-pointer border-t border-[#EFE1C8] font-bold uppercase tracking-wider"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="bg-[#9B1C2F] text-white px-5 py-2 rounded-sm text-xs font-bold hover:bg-[#7A1522] border-b-2 border-[#D4A017] uppercase tracking-wider cursor-pointer shadow-xs transition-all"
              >
                Sign In
              </button>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-[#2A1810] hover:text-[#9B1C2F] cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-[#EFE1C8] px-4 pt-3 pb-6 space-y-2 shadow-lg">
          {navLinks.map((link) => (
            <button
              key={link.page}
              onClick={() => handleNavClick(link.page)}
              className={`block w-full text-left py-3 px-4 rounded-sm text-xs font-bold uppercase tracking-wider min-h-[44px] flex items-center ${
                activePage === link.page
                  ? 'bg-[#FBEFCB] text-[#9B1C2F] border-l-4 border-[#9B1C2F]'
                  : 'text-[#2A1810] hover:bg-[#FFF8EC]'
              }`}
            >
              {link.label}
            </button>
          ))}

          {userEmail ? (
            <>
              <button
                onClick={() => handleNavClick('my-orders')}
                className={`block w-full text-left py-3 px-4 rounded-sm text-xs font-bold uppercase tracking-wider min-h-[44px] flex items-center ${
                  activePage === 'my-orders' ? 'bg-[#FBEFCB] text-[#9B1C2F]' : 'text-[#2A1810] hover:bg-[#FFF8EC]'
                }`}
              >
                My Orders
              </button>

              {isAdmin && (
                <button
                  onClick={() => handleNavClick('admin')}
                  className="block w-full text-left py-3 px-4 rounded-sm text-xs font-bold bg-[#9B1C2F] text-[#FBEFCB] flex items-center justify-between uppercase tracking-wider border-b-2 border-[#D4A017] min-h-[44px]"
                >
                  <span>Admin Panel</span>
                  <ShieldCheck className="w-4 h-4 text-[#F0C75E]" />
                </button>
              )}

              <div className="pt-2 border-t border-[#EFE1C8] flex items-center justify-between px-2">
                <span className="text-xs font-medium text-[#7A6A5C] truncate max-w-[200px]">{userEmail}</span>
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs font-bold text-red-600 hover:underline uppercase tracking-wider py-2 px-3 min-h-[44px] flex items-center"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="pt-2 border-t border-[#EFE1C8]">
              <button
                onClick={() => {
                  onOpenAuth();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-3 bg-[#9B1C2F] text-white font-bold text-xs uppercase tracking-wider rounded-sm border-b-2 border-[#D4A017] shadow-xs min-h-[44px] flex items-center justify-center"
              >
                Sign In to Account
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
