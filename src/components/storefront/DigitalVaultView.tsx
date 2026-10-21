import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { 
  FileText, 
  Download, 
  Key, 
  Check, 
  Copy, 
  FileCode, 
  ExternalLink, 
  BookOpen, 
  Sparkles, 
  ShieldCheck, 
  ShoppingBag,
  Store
} from 'lucide-react';
import { Product } from '../../types/index.ts';

export const DigitalVaultView: React.FC = () => {
  const { products, orders, currentUser, addToCart, downloadDigitalProduct, viewProductDetails } = useApp();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Digital products in marketplace
  const digitalProducts = products.filter((p) => p.productType === 'digital');

  // Customer's purchased digital items across all suborders
  const userOrders = orders.filter((o) => o.userId === currentUser?.id || o.customerEmail === currentUser?.email);
  const purchasedDigitalItems = userOrders.flatMap((o) =>
    o.subOrders.flatMap((so) =>
      so.items
        .filter((it) => it.productType === 'digital' || it.licenseKey || it.digitalAsset)
        .map((it) => ({
          orderId: o.id,
          orderDate: o.createdAt,
          vendor: so.shopName,
          ...it,
        }))
    )
  );

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-left">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 text-xs font-bold mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Instant Digital Delivery Vault</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Digital Goods, eBooks & License Keys
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Instant fulfillment upon payment confirmation. Access PDFs, source code packs, and verified cryptographic licenses.
          </p>
        </div>
      </div>

      {/* SECTION 1: CUSTOMER'S UNLOCKED VAULT */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white">My Purchased Digital Downloads & Licenses</h2>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Permanently archived for customer {currentUser?.email || 'customer@example.com'}.
            </p>
          </div>
          <span className="text-xs font-bold bg-white/10 px-3 py-1 rounded-full text-amber-300 border border-white/20">
            {purchasedDigitalItems.length} Unlocked Assets
          </span>
        </div>

        {purchasedDigitalItems.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-2">
            <FileText className="w-10 h-10 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-600">No digital items purchased yet.</p>
            <p className="text-slate-400 max-w-sm mx-auto">
              Purchase any eBook, architecture guide, or UI system below to instantly unlock download links and commercial license keys.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {purchasedDigitalItems.map((item, idx) => (
              <div key={idx} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-start gap-4">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-50"
                  />
                  <div className="space-y-1 text-xs">
                    <span className="font-bold text-sm text-slate-900 block">{item.title}</span>
                    <div className="text-slate-500 flex items-center gap-2">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <Store className="w-3 h-3 text-slate-400" />
                        <span>{item.vendor}</span>
                      </span>
                      <span>·</span>
                      <span className="font-mono">Order {item.orderId}</span>
                      <span>·</span>
                      <span>Purchased {new Date(item.orderDate).toLocaleDateString()}</span>
                    </div>

                    {/* License Key Box */}
                    {item.licenseKey && (
                      <div className="mt-2 inline-flex items-center gap-2 p-1.5 px-3 bg-amber-50/70 border border-amber-200/80 rounded-lg text-xs">
                        <Key className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="text-slate-500">License:</span>
                        <span className="font-mono font-bold text-slate-800">{item.licenseKey}</span>
                        <button
                          onClick={() => handleCopyKey(item.licenseKey!)}
                          className="ml-1 p-1 hover:bg-amber-100 rounded text-amber-700 transition-colors"
                          title="Copy license key"
                        >
                          {copiedKey === item.licenseKey ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Instant Download Action Button */}
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => downloadDigitalProduct(item.productId, item.digitalAsset?.fileName)}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download {item.digitalAsset?.fileType?.toUpperCase() || 'File'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: DIGITAL PRODUCTS STORE CATALOG */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Available Digital Products & Guides</h2>
          <p className="text-xs text-slate-500">
            Instant checkout with automated download generation and zero shipping fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {digitalProducts.map((p) => {
            const hasDiscount = Boolean(p.discountPrice && p.discountPrice < p.price);
            const activePrice = hasDiscount ? p.discountPrice : p.price;

            return (
              <div 
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-16/10 rounded-xl overflow-hidden bg-slate-900 relative mb-4">
                    <img
                      src={p.images[0]}
                      alt={p.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-bold rounded shadow-xs uppercase tracking-wider">
                      Instant Delivery
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="text-slate-400 font-medium">By {p.shopName} · {p.subCategory}</div>
                    <h3 className="font-bold text-sm text-slate-900 leading-snug line-clamp-2">
                      {p.title}
                    </h3>
                    <p className="text-slate-600 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                  </div>

                  {/* Format tag */}
                  <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
                    <FileCode className="w-3.5 h-3.5 text-blue-600" />
                    <span>{p.digitalAsset?.fileName || 'Verified Digital Package'}</span>
                    <span>({p.digitalAsset?.fileSize || 'Instant PDF'})</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-base font-bold text-slate-900 tabular-nums">
                      ${activePrice?.toFixed(2)}
                    </span>
                    {hasDiscount && (
                      <span className="text-xs text-slate-400 line-through tabular-nums ml-1.5">
                        ${p.price.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => viewProductDetails(p)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => addToCart(p, 1)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Buy</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
