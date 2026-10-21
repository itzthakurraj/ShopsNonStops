import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { Navbar } from './components/layout/Navbar.tsx';
import { Footer } from './components/layout/Footer.tsx';
import { HeroBanner } from './components/storefront/HeroBanner.tsx';
import { ProductCard } from './components/storefront/ProductCard.tsx';
import { ProductDetailModal } from './components/storefront/ProductDetailModal.tsx';
import { CartDrawer } from './components/storefront/CartDrawer.tsx';
import { CheckoutModal } from './components/storefront/CheckoutModal.tsx';
import { OrderTrackingView } from './components/storefront/OrderTrackingView.tsx';
import { CustomerProfile } from './components/storefront/CustomerProfile.tsx';
import { MarketplaceCatalog } from './components/storefront/MarketplaceCatalog.tsx';
import { StoresDirectory } from './components/storefront/StoresDirectory.tsx';
import { CustomTShirtStudio } from './components/customizer/CustomTShirtStudio.tsx';
import { DigitalVaultView } from './components/storefront/DigitalVaultView.tsx';
import { SellerDashboard } from './components/seller/SellerDashboard.tsx';
import { AdminDashboard } from './components/admin/AdminDashboard.tsx';
import { VirtualTryOnModal } from './components/vto/VirtualTryOnModal.tsx';
import { Order, Product } from './types/index.ts';
import { 
  ArrowRight, 
  Store, 
  ShieldCheck, 
  FileSpreadsheet, 
  Truck, 
  Sparkles, 
  ShoppingBag, 
  Palette, 
  Key, 
  CheckCircle2, 
  FileCode,
  Camera,
  Gift,
  BadgePercent
} from 'lucide-react';

const MainContent: React.FC = () => {
  const { 
    activeView, 
    setActiveView, 
    products, 
    shops, 
    selectedProduct, 
    setSelectedCategory,
    viewOrderTracking,
    portalMode,
    openVto
  } = useApp();

  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);

  React.useEffect(() => {
    if (selectedProduct && activeView === 'pdp') {
      setActiveModalProduct(selectedProduct);
    }
  }, [selectedProduct, activeView]);

  const handleOrderSuccess = (order: Order) => {
    setCheckoutOpen(false);
    if (order.hasDigitalItems) {
      setActiveView('digital-vault');
    } else {
      viewOrderTracking(order.id);
    }
  };

  const featuredProducts = products.filter((p) => p.featured).slice(0, 6);
  const digitalHighlights = products.filter((p) => p.productType === 'digital').slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Top Dual-Tier Navigation */}
      <Navbar onOpenCart={() => setCartOpen(true)} />

      {/* Main Viewport Routing */}
      <main className="flex-1">
        {portalMode === 'vendor' ? (
          <SellerDashboard />
        ) : portalMode === 'admin' ? (
          <AdminDashboard />
        ) : (
          <>
            {activeView === 'home' && (
              <div className="space-y-14">
                {/* Hero Banner with Flash Event Countdown */}
                <HeroBanner />

                {/* ShopNonstop Signature 4-Item Feature Trust Strip */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20">
                  <div className="bg-white rounded-xl border border-slate-200/90 shadow-md p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="flex items-center gap-3.5 text-left">
                      <div className="w-11 h-11 rounded-lg bg-indigo-50 text-[#3321c8] flex items-center justify-center shrink-0">
                        <Truck className="w-5 h-5 text-[#3321c8]" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Free Express Delivery</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">On all orders over $100</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3.5 text-left">
                      <div className="w-11 h-11 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <Gift className="w-5 h-5 text-amber-500" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Daily Surprise Deals</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">Save up to 30% off daily</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3.5 text-left">
                      <div className="w-11 h-11 rounded-lg bg-emerald-50 text-[#3bc177] flex items-center justify-center shrink-0">
                        <BadgePercent className="w-5 h-5 text-[#3bc177]" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Affordable Maker Prices</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">Factory direct from vendors</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3.5 text-left">
                      <div className="w-11 h-11 rounded-lg bg-slate-100 text-slate-900 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5 text-slate-800" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">100% Secure Payments</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">Protected checkout &amp; sync</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 1: Featured Marketplace Products */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left pt-2">
                  <div className="flex items-end justify-between mb-8">
                    <div>
                      <div className="text-xs font-bold text-[#3321c8] uppercase tracking-wider mb-1">
                        Curated Collection
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-[600] text-[#3d3a3a] tracking-tight">
                        Best Selling Marketplace Goods
                      </h2>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCategory('All');
                        setActiveView('marketplace');
                      }}
                      className="text-xs font-bold text-[#3321c8] hover:text-[#17dd1f] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>View All ({products.length})</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </section>

            {/* Section 2: Interactive 2D T-Shirt Customizer Spotlight Banner */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
              <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-4 max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
                    <Palette className="w-3.5 h-3.5 text-blue-400" />
                    <span>Personalized Merchandise Studio</span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                    Design & Order Custom T-Shirts with Live 2D Visual Preview
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Pick your garment color, add custom typography with custom fonts, upload your own brand logo or artwork, and see the front/back preview in real time. Screen-printed in 240 GSM organic cotton.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setActiveView('custom-studio');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-6 py-3 bg-white text-slate-900 hover:bg-blue-50 rounded-xl text-xs font-extrabold shadow-md transition-all flex items-center gap-2"
                    >
                      <Palette className="w-4 h-4 text-blue-600" />
                      <span>Launch 2D Custom Studio</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="w-48 sm:w-64 aspect-4/5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-4 flex flex-col items-center justify-center text-center shadow-2xl shrink-0">
                  <div className="w-24 h-24 rounded-full bg-slate-900/80 border-2 border-white/40 flex items-center justify-center text-3xl shadow-inner mb-3">
                    👕
                  </div>
                  <div className="text-xs font-bold text-white uppercase tracking-wider">Live 2D Canvas</div>
                  <div className="text-[11px] text-slate-300 mt-1">Multi-Color • Custom Text • Logo Upload</div>
                </div>
              </div>
            </section>

            {/* Section 2.5: Virtual Try-On Dressing Room Spotlight */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
              <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-3xl p-8 sm:p-10 shadow-xl border border-emerald-900/40 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-4 max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                    <Camera className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Virtual Try-On &amp; Dressing Room</span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                    Try On Shirts &amp; Merchandise Online with Camera
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Snap a photo or activate your live webcam to preview apparel with interactive size adjustments. Protected with automated content safety guardrails preventing unclad/nude uploads.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => openVto()}
                      className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Open Virtual Dressing Room</span>
                    </button>
                  </div>
                </div>

                <div className="shrink-0 p-6 bg-slate-900/80 rounded-2xl border border-emerald-500/20 text-center max-w-xs shadow-2xl">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-3">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <div className="text-sm font-bold text-white">Safe &amp; Clad-Only Fitting</div>
                  <div className="text-xs text-slate-400 mt-1 leading-normal">
                    Real-time skin ratio inspection ensures private, safe, and family-friendly apparel fitting.
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: Digital Products & PDF Vault Highlight */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
                    Instant Downloadable Assets
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Digital Books, PDFs & Design Kits
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Zero shipping delays. Receive instant PDF downloads and cryptographic license keys upon payment.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveView('digital-vault');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                >
                  <span>Open Digital Vault</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {digitalHighlights.map((dp) => (
                  <div key={dp.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="aspect-16/10 rounded-xl overflow-hidden bg-slate-900 mb-3 relative">
                        <img src={dp.images[0]} alt="" className="w-full h-full object-cover" />
                        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-bold rounded">
                          Instant Download
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 line-clamp-2">{dp.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">{dp.description}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-base font-bold text-slate-900 tabular-nums">
                        ${dp.discountPrice ? dp.discountPrice.toFixed(2) : dp.price.toFixed(2)}
                      </span>
                      <button
                        onClick={() => {
                          setActiveView('digital-vault');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-xs flex items-center gap-1"
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>Get Download</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 4: Verified Vendor Stores Spotlight */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
              <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <div>
                    <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
                      Independent Sellers
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                      Explore Top Rated Shops
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Each vendor operates an independent storefront with individual customer ratings and dedicated fulfillment.
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveView('stores')}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shrink-0"
                  >
                    View All Stores
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {shops.map((shop) => (
                    <div
                      key={shop.id}
                      onClick={() => {
                        setSelectedCategory('All');
                        setActiveView('marketplace');
                      }}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 hover:border-slate-300 hover:bg-white hover:shadow-xs transition-all cursor-pointer space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={shop.avatar}
                          alt={shop.name}
                          className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{shop.name}</h4>
                          <div className="text-[11px] text-amber-500 font-semibold flex items-center gap-1 mt-0.5">
                            <span>★ {shop.rating}</span>
                            <span className="text-slate-400">({shop.reviewCount})</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                        {shop.description}
                      </p>

                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
                        <span>{products.filter((p) => p.shopId === shop.id).length} Products</span>
                        <span className="text-blue-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                          <span>Visit</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* View 2: Marketplace Catalog */}
        {activeView === 'marketplace' && <MarketplaceCatalog />}

        {/* View 3: Stores Directory */}
        {activeView === 'stores' && <StoresDirectory />}

        {/* View 4: Live Order Tracking */}
        {activeView === 'track-order' && <OrderTrackingView />}

        {/* View 5: Customer Profile */}
        {activeView === 'customer-profile' && <CustomerProfile />}

        {/* View 6: 2D Custom Merchandise Studio */}
        {activeView === 'custom-studio' && <CustomTShirtStudio />}

        {/* View 7: Digital Goods & PDF Vault */}
        {activeView === 'digital-vault' && <DigitalVaultView />}

        {/* View 8: Seller Dashboard */}
        {activeView === 'seller-dashboard' && <SellerDashboard />}

        {/* View 9: Super Admin & Employee Admin Center */}
        {activeView === 'admin-center' && <AdminDashboard />}
          </>
        )}
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onProceedToCheckout={() => setCheckoutOpen(true)}
      />

      {/* Multi-Vendor Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Product Detail Modal (PDP) */}
      {activeModalProduct && (
        <ProductDetailModal
          product={activeModalProduct}
          onClose={() => setActiveModalProduct(null)}
          onOpenCart={() => setCartOpen(true)}
        />
      )}

      {/* Virtual Try-On Dressing Room Modal */}
      <VirtualTryOnModal />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
