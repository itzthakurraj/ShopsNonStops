import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { Store, ShieldCheck, FileSpreadsheet, CheckCircle2, ShoppingBag, Send } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setActiveView, switchRole } = useApp();
  const [emailSub, setEmailSub] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailSub.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setEmailSub('');
        setSubscribed(false);
      }, 3000);
    }
  };

  return (
    <footer className="bg-[#000] text-white text-sm mt-20">
      
      {/* Authentic Newsletter Strip from zip: bg-[#342ac8] with text-[#56d879] and button bg-[#56d879] */}
      <div className="md:flex md:justify-between md:items-center sm:px-12 px-4 bg-[#342ac8] py-7">
        <h1 className="lg:text-3xl text-2xl md:mb-0 mb-6 lg:leading-normal font-semibold md:w-2/5 text-left">
          <span className="text-[#56d879] font-bold">Subscribe</span> to get news, <br />
          events and offers
        </h1>

        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <input
            type="email"
            value={emailSub}
            onChange={(e) => setEmailSub(e.target.value)}
            placeholder="Enter your email..."
            required
            className="text-gray-800 sm:w-72 w-full py-2.5 rounded px-3 bg-white focus:outline-none text-xs"
          />
          <button
            type="submit"
            className="bg-[#56d879] hover:bg-teal-500 duration-300 px-5 py-2.5 rounded-md text-white font-semibold text-xs md:w-auto w-full cursor-pointer transition-colors"
          >
            {subscribed ? 'Subscribed!' : 'Submit'}
          </button>
        </form>
      </div>

      {/* Main Footer Body from zip: bg-[#000] with text-gray-400 hover:text-teal-400 */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10 text-left">
          
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-extrabold text-lg">
              <div className="w-8 h-8 rounded-lg bg-[#3321c8] flex items-center justify-center text-white font-black text-sm shadow-md">
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
              <span>Shop<span className="text-[#56d879]">Nonstop</span></span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              The home and elements needed to create beautiful products. Connect with verified independent stores, custom apparel studios, and digital authors.
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs text-[#56d879] font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Multi-Vendor Split Fulfillment &amp; Safe Delivery</span>
            </div>
          </div>

          {/* Marketplace Directory */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-3">Marketplace</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => { setActiveView('marketplace'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-gray-400 hover:text-teal-400 duration-300 cursor-pointer">
                  All Products
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveView('stores'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-gray-400 hover:text-teal-400 duration-300 cursor-pointer">
                  Featured Sellers
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveView('custom-studio'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-gray-400 hover:text-teal-400 duration-300 cursor-pointer">
                  2D Custom T-Shirt Studio
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveView('track-order'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-gray-400 hover:text-teal-400 duration-300 cursor-pointer">
                  Track Delivery
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveView('customer-profile'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-gray-400 hover:text-teal-400 duration-300 cursor-pointer">
                  Order History &amp; Addresses
                </button>
              </li>
            </ul>
          </div>

          {/* Sellers & Vendors */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-3">Sell on ShopNonstop</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => switchRole('seller')} className="text-[#56d879] hover:text-teal-300 duration-300 flex items-center gap-1.5 font-medium cursor-pointer">
                  <Store className="w-3.5 h-3.5" />
                  <span>Open Seller Portal</span>
                </button>
              </li>
              <li>
                <span className="text-gray-500">Standard 10% Platform Fee</span>
              </li>
              <li>
                <span className="text-gray-500">Staff Department Access (RBAC)</span>
              </li>
              <li>
                <span className="text-gray-500">Real-time Payout Ledgers</span>
              </li>
              <li>
                <span className="text-gray-500">Sub-order Delivery Management</span>
              </li>
            </ul>
          </div>

          {/* Operations & Google Sheets */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-3">Operations &amp; Data</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => switchRole('admin')} className="text-amber-400 hover:text-amber-300 duration-300 flex items-center gap-1.5 font-medium cursor-pointer">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Control Center</span>
                </button>
              </li>
              <li>
                <a href="/api/sheets/export/orders" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-teal-400 duration-300 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#56d879]" />
                  <span>Download Orders (CSV)</span>
                </a>
              </li>
              <li>
                <a href="/api/sheets/export/vendors" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-teal-400 duration-300 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#56d879]" />
                  <span>Download Vendor Payouts</span>
                </a>
              </li>
              <li>
                <span className="text-gray-500">Automated Google Sheets Sync</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Payment Badges */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <div>
            © {new Date().getFullYear()} ShopNonstop Marketplace Inc. All rights reserved.
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Accepted Payments:</span>
            <div className="flex items-center gap-1.5 text-gray-300 font-semibold text-[11px]">
              <span className="px-2 py-0.5 bg-slate-900 rounded border border-slate-800">Visa / Mastercard</span>
              <span className="px-2 py-0.5 bg-slate-900 rounded border border-slate-800">PayPal</span>
              <span className="px-2 py-0.5 bg-slate-900 rounded border border-slate-800">Cash on Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
