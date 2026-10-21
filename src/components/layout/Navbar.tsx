import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { 
  ShoppingBag, 
  Search, 
  Store, 
  ShieldCheck, 
  User as UserIcon, 
  Truck, 
  Menu, 
  X, 
  Heart,
  Palette, 
  Key, 
  ChevronDown, 
  ChevronRight,
  UserCheck, 
  Camera, 
  Flame,
  Sparkles
} from 'lucide-react';
import { UserRole } from '../../types/index.ts';

interface NavbarProps {
  onOpenCart: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCart }) => {
  const { 
    activeRole, 
    switchRole, 
    activeView, 
    setActiveView, 
    cartCount, 
    cartTotal,
    wishlist,
    currentUser, 
    currentShop,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    portalMode,
    setPortalMode,
    openVto
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);

  const categories = [
    { label: 'All Categories', value: 'All', icon: '🛒' },
    { label: 'Computers & Laptops', value: 'Electronics', icon: '💻' },
    { label: 'Clothes & Fashion', value: 'Fashion', icon: '👔' },
    { label: 'Home, Decor & Living', value: 'Home & Living', icon: '🛋️' },
    { label: 'Cosmetics & Beauty', value: 'Beauty', icon: '🌿' },
    { label: '2D Custom Studio', value: 'Custom Studio', icon: '🎨' },
    { label: 'Digital Products & PDFs', value: 'Digital Goods', icon: '📥' },
  ];

  const handleNavClick = (view: any, category = 'All') => {
    setActiveView(view);
    setSelectedCategory(category);
    setMobileMenuOpen(false);
    setCategoriesDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWishlistClick = () => {
    setActiveView('marketplace');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white transition-colors shadow-xs">
      {/* 1. Top Announcement & Portal Switcher Bar */}
      <div className="bg-[#0f172a] text-slate-300 text-xs px-4 py-1.5 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="text-[#17dd1f] font-bold uppercase tracking-wider text-[11px] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#17dd1f]" />
              <span>ShopNonstop Platform:</span>
            </span>
            <span className="hidden sm:inline text-slate-300 text-[11px]">
              Multi-Vendor Marketplace • Free Shipping on orders over $100
            </span>
          </div>

          {/* Quick Portal Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wide mr-1">Portal Mode:</span>
            <div className="flex items-center p-0.5 bg-slate-800 rounded-lg border border-slate-700/60 text-[11px] font-semibold">
              <button
                onClick={() => setPortalMode('customer')}
                className={`px-2.5 py-0.5 rounded transition-all ${
                  portalMode === 'customer' ? 'bg-[#3321c8] text-white shadow-xs font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Shopper
              </button>
              <button
                onClick={() => setPortalMode('vendor')}
                className={`px-2.5 py-0.5 rounded transition-all flex items-center gap-1.5 ${
                  portalMode === 'vendor' ? 'bg-[#3321c8] text-white shadow-xs font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Store className="w-3 h-3" />
                <span>Vendor Hub</span>
              </button>
              <button
                onClick={() => setPortalMode('admin')}
                className={`px-2.5 py-0.5 rounded transition-all flex items-center gap-1.5 ${
                  portalMode === 'admin' ? 'bg-amber-600 text-white shadow-xs font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3 h-3" />
                <span>Admin Hub</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Middle Bar: Brand Logo - border-[#3957db] Search - Become Seller Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4 sm:gap-6">
          
          {/* Brand Logo with ShopNonstop signature text and icon */}
          <button
            onClick={() => handleNavClick('home')}
            className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2 shrink-0 hover:opacity-90"
          >
            <div className="w-9 h-9 rounded-lg bg-[#3321c8] flex items-center justify-center text-white font-black text-lg shadow-md">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-slate-900">
              Shop<span className="text-[#3321c8]">Nonstop</span>
            </span>
          </button>

          {/* Authentic Search Box with border-[#3957db] border-[2px] rounded-md */}
          <div className="hidden md:flex items-center flex-1 max-w-xl mx-auto">
            <div className="w-full relative flex items-center bg-white border-2 border-[#3957db] rounded-md overflow-hidden">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  if (activeView !== 'marketplace') setActiveView('marketplace');
                }}
                className="bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 border-r border-slate-200 outline-none cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Search Product..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeView !== 'marketplace') setActiveView('marketplace');
                }}
                className="w-full h-[40px] px-3 text-xs bg-transparent text-slate-900 outline-none placeholder:text-slate-400 font-medium"
              />

              <button
                onClick={() => {
                  if (activeView !== 'marketplace') setActiveView('marketplace');
                }}
                className="px-4 h-[40px] bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shrink-0 flex items-center justify-center cursor-pointer"
                aria-label="Search"
              >
                <Search className="w-5 h-5 text-slate-700" />
              </button>
            </div>
          </div>

          {/* Right Action: Become Seller Button with exact styles.button: w-[150px] bg-black h-[50px] rounded-xl */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => handleNavClick('seller-dashboard')}
              className="w-[150px] h-[46px] bg-black text-white hover:bg-slate-800 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <span>{portalMode === 'vendor' ? 'Go Dashboard' : 'Become Seller'}</span>
              <ChevronRight className="w-4 h-4 text-white" />
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Authentic Navigation Bar from zip: bg-[#3321c8] h-[70px] */}
      <div className="bg-[#3321c8] h-[64px] hidden md:flex items-center shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between">
          
          <div className="flex items-center gap-6">
            {/* "All Categories" white box: relative h-[54px] w-[240px] bg-white rounded-t-md */}
            <div className="relative">
              <button
                onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
                className="h-[54px] w-[240px] flex justify-between items-center px-4 bg-white font-sans text-sm font-bold text-slate-900 rounded-t-md shadow-sm select-none cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Menu className="w-5 h-5 text-slate-800" />
                  <span>All Categories</span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-600" />
              </button>

              {/* Collapsible DropDown menu */}
              {categoriesDropdownOpen && (
                <div 
                  className="absolute top-full left-0 w-[240px] bg-white text-slate-800 shadow-2xl border border-slate-200 rounded-b-md z-50 py-2 divide-y divide-slate-100 animate-in fade-in"
                  onClick={() => setCategoriesDropdownOpen(false)}
                >
                  <button
                    onClick={() => handleNavClick('marketplace', 'All')}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs font-semibold text-slate-900"
                  >
                    All Products
                  </button>
                  <button
                    onClick={() => handleNavClick('marketplace', 'Electronics')}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs font-medium text-slate-700"
                  >
                    💻 Computers &amp; Laptops
                  </button>
                  <button
                    onClick={() => handleNavClick('marketplace', 'Fashion')}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs font-medium text-slate-700"
                  >
                    👔 Clothes &amp; Garments
                  </button>
                  <button
                    onClick={() => handleNavClick('marketplace', 'Home & Living')}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs font-medium text-slate-700"
                  >
                    🛋️ Home, Decor &amp; Ceramics
                  </button>
                  <button
                    onClick={() => handleNavClick('marketplace', 'Beauty')}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs font-medium text-slate-700"
                  >
                    🌿 Cosmetics &amp; Body Care
                  </button>
                  <button
                    onClick={() => handleNavClick('custom-studio')}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs font-bold text-[#3321c8]"
                  >
                    🎨 2D Custom Studio
                  </button>
                  <button
                    onClick={() => handleNavClick('digital-vault')}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs font-bold text-indigo-600"
                  >
                    📥 Digital Vault (eBooks, PDFs)
                  </button>
                </div>
              )}
            </div>

            {/* Nav links from zip: inactive is text-white, active is text-[#17dd1f] */}
            <nav className="flex items-center gap-2 lg:gap-3 text-xs font-semibold">
              <button
                onClick={() => handleNavClick('home')}
                className={`px-3 py-1.5 transition-colors cursor-pointer ${
                  activeView === 'home' ? 'text-[#17dd1f] font-bold' : 'text-white hover:text-[#17dd1f]'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => handleNavClick('marketplace')}
                className={`px-3 py-1.5 transition-colors cursor-pointer ${
                  activeView === 'marketplace' ? 'text-[#17dd1f] font-bold' : 'text-white hover:text-[#17dd1f]'
                }`}
              >
                Best Selling
              </button>
              <button
                onClick={() => handleNavClick('stores')}
                className={`px-3 py-1.5 transition-colors cursor-pointer ${
                  activeView === 'stores' ? 'text-[#17dd1f] font-bold' : 'text-white hover:text-[#17dd1f]'
                }`}
              >
                Products
              </button>
              <button
                onClick={() => handleNavClick('custom-studio')}
                className={`px-3 py-1.5 transition-colors flex items-center gap-1 cursor-pointer ${
                  activeView === 'custom-studio' ? 'text-[#17dd1f] font-bold' : 'text-white hover:text-[#17dd1f]'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Custom Studio</span>
              </button>
              <button
                onClick={() => openVto()}
                className="px-3 py-1.5 transition-colors flex items-center gap-1.5 text-[#17dd1f] hover:text-white font-bold cursor-pointer"
                title="Virtual Try-On camera dressing room"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Virtual Try-On</span>
              </button>
              <button
                onClick={() => handleNavClick('digital-vault')}
                className={`px-3 py-1.5 transition-colors flex items-center gap-1 cursor-pointer ${
                  activeView === 'digital-vault' ? 'text-[#17dd1f] font-bold' : 'text-white hover:text-[#17dd1f]'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>Digital Goods</span>
              </button>
              <button
                onClick={() => handleNavClick('track-order')}
                className={`px-3 py-1.5 transition-colors flex items-center gap-1 cursor-pointer ${
                  activeView === 'track-order' ? 'text-[#17dd1f] font-bold' : 'text-white hover:text-[#17dd1f]'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Track Order</span>
              </button>
            </nav>
          </div>

          {/* Right Action Icons from zip: Heart, Cart with bg-[#3bc177] badge, and User Avatar */}
          <div className="flex items-center gap-5">
            {/* Wishlist Heart Icon with bg-[#3bc177] badge */}
            <div
              className="relative cursor-pointer"
              onClick={handleWishlistClick}
              title="View Wishlist"
            >
              <Heart className="w-6 h-6 text-white/90 hover:text-white transition-colors" />
              <span className="absolute -top-1.5 -right-2 rounded-full bg-[#3bc177] w-4 h-4 flex items-center justify-center text-white font-mono text-[11px] font-bold leading-tight shadow-xs">
                {wishlist.length}
              </span>
            </div>

            {/* Shopping Cart Icon with bg-[#3bc177] badge */}
            <div
              className="relative cursor-pointer"
              onClick={onOpenCart}
              title="View Cart"
            >
              <ShoppingBag className="w-6 h-6 text-white/90 hover:text-white transition-colors" />
              <span className="absolute -top-1.5 -right-2 rounded-full bg-[#3bc177] w-4 h-4 flex items-center justify-center text-white font-mono text-[11px] font-bold leading-tight shadow-xs">
                {cartCount}
              </span>
            </div>

            {/* User Profile Avatar / Icon */}
            <div
              className="relative cursor-pointer"
              onClick={() => handleNavClick('customer-profile')}
              title="My Account"
            >
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover border-2 border-white/80"
                />
              ) : (
                <UserIcon className="w-6 h-6 text-white/90 hover:text-white transition-colors" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4 shadow-lg">
          <div className="space-y-1 text-xs">
            <input
              type="text"
              placeholder="Search Product..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeView !== 'marketplace') setActiveView('marketplace');
              }}
              className="w-full px-3 py-2 bg-slate-100 rounded-md border-2 border-[#3957db] outline-none"
            />
          </div>

          <div className="flex flex-col gap-1 text-xs font-semibold text-slate-700">
            <button onClick={() => handleNavClick('home')} className="text-left py-2 px-3 hover:bg-slate-50 rounded-lg">
              Home Storefront
            </button>
            <button onClick={() => handleNavClick('marketplace')} className="text-left py-2 px-3 hover:bg-slate-50 rounded-lg">
              Best Selling &amp; Products
            </button>
            <button onClick={() => handleNavClick('custom-studio')} className="text-left py-2 px-3 hover:bg-slate-50 rounded-lg text-[#3321c8]">
              🎨 2D Custom Studio
            </button>
            <button onClick={() => openVto()} className="text-left py-2 px-3 hover:bg-slate-50 rounded-lg text-[#17dd1f] font-bold flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-[#17dd1f]" />
              <span>Virtual Try-On Fitting Room</span>
            </button>
            <button onClick={() => handleNavClick('digital-vault')} className="text-left py-2 px-3 hover:bg-slate-50 rounded-lg text-indigo-600">
              📥 Digital Products (PDF Vault)
            </button>
            <button onClick={() => handleNavClick('stores')} className="text-left py-2 px-3 hover:bg-slate-50 rounded-lg">
              Browse Seller Stores
            </button>
            <button onClick={() => handleNavClick('track-order')} className="text-left py-2 px-3 hover:bg-slate-50 rounded-lg flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-[#3321c8]" />
              <span>Track Orders Live</span>
            </button>
            <button onClick={() => handleNavClick('customer-profile')} className="text-left py-2 px-3 hover:bg-slate-50 rounded-lg">
              My Profile &amp; Order History
            </button>
          </div>

          <div className="pt-3 border-t border-slate-200">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Switch Portal:</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => { switchRole('customer'); setPortalMode('customer'); setMobileMenuOpen(false); }}
                className={`py-2 rounded-lg font-bold border ${portalMode === 'customer' ? 'bg-[#3321c8] text-white' : 'bg-slate-50'}`}
              >
                Shopper
              </button>
              <button
                onClick={() => { switchRole('seller'); setPortalMode('vendor'); setMobileMenuOpen(false); }}
                className={`py-2 rounded-lg font-bold border ${portalMode === 'vendor' ? 'bg-[#3321c8] text-white' : 'bg-slate-50'}`}
              >
                Seller Portal
              </button>
              <button
                onClick={() => { switchRole('employee_admin'); setPortalMode('admin'); setMobileMenuOpen(false); }}
                className={`py-2 rounded-lg font-bold border ${activeRole === 'employee_admin' ? 'bg-indigo-600 text-white' : 'bg-slate-50'}`}
              >
                Staff Admin
              </button>
              <button
                onClick={() => { switchRole('admin'); setPortalMode('admin'); setMobileMenuOpen(false); }}
                className={`py-2 rounded-lg font-bold border ${portalMode === 'admin' && activeRole === 'admin' ? 'bg-amber-600 text-white' : 'bg-slate-50'}`}
              >
                Super Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
