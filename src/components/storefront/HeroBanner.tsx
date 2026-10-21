import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { 
  ArrowRight, 
  Palette, 
  Flame,
  Camera,
  ShoppingBag,
  Sparkles
} from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const { 
    setSelectedCategory, 
    setActiveView, 
    products,
    events,
    openVto
  } = useApp();

  // Countdown timer calculation matching CountDown.jsx in zip
  const [timeLeft, setTimeLeft] = useState({
    days: 12,
    hours: 6,
    minutes: 34,
    seconds: 48,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const categories = [
    { name: 'All', icon: '✦', label: 'All Items', count: products.length },
    { name: 'Electronics', icon: '💻', label: 'Computers & Audio', count: products.filter(p => p.category === 'Electronics').length },
    { name: 'Fashion', icon: '👔', label: 'Fashion & Apparel', count: products.filter(p => p.category === 'Fashion').length },
    { name: 'Home & Living', icon: '🛋️', label: 'Home & Decor', count: products.filter(p => p.category === 'Home & Living').length },
    { name: 'Beauty', icon: '🌿', label: 'Cosmetics', count: products.filter(p => p.category === 'Beauty').length },
    { name: 'Custom Studio', icon: '🎨', label: 'Custom Apparel', count: products.filter(p => p.productType === 'customizable').length },
    { name: 'Digital Goods', icon: '📥', label: 'Digital PDFs', count: products.filter(p => p.productType === 'digital').length },
  ];

  return (
    <div className="relative bg-[#f5f5f5] border-b border-slate-200/80 pb-10 pt-8 sm:pt-12 overflow-hidden text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Hero Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Heading and Text matching Hero.jsx */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#3321c8]/20 text-[#3321c8] text-xs font-bold rounded-full shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#3321c8]" />
              <span>ShopNonstop Verified Multi-Vendor Hub</span>
            </div>

            {/* Heading matching Hero.jsx font and color: text-[#3d3a3a] font-[600] capitalize */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-[600] text-[#3d3a3a] tracking-tight leading-[1.15] capitalize">
              Best items from verified makers, custom studios &amp; digital authors.
            </h1>

            {/* Paragraph matching Hero.jsx font-[400] text-[#000000ba] */}
            <p className="text-sm sm:text-base text-[#000000ba] max-w-xl leading-relaxed">
              Discover unique artisan creations, try on shirts with your live camera, personalize merchandise in real-time 2D, or instantly download digital books and software kits.
            </p>

            {/* Buttons from zip styles.js: button: 'w-[150px] bg-black h-[50px] rounded-xl' */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setActiveView('marketplace');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-[150px] h-[48px] bg-black text-white hover:bg-slate-800 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-white" />
                <span>Shop Now</span>
              </button>

              <button
                onClick={() => {
                  setActiveView('custom-studio');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-5 h-[48px] bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold shadow-2xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Palette className="w-4 h-4 text-[#3321c8]" />
                <span>2D Custom Studio</span>
              </button>

              <button
                onClick={() => openVto()}
                className="px-4 h-[48px] bg-white hover:bg-emerald-50 text-slate-800 border border-emerald-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
                title="Virtual Try-On camera fitting room"
              >
                <Camera className="w-4 h-4 text-[#3bc177]" />
                <span>Virtual Try-On</span>
              </button>
            </div>
          </div>

          {/* Right Column: Flash Event Countdown Card matching CountDown.jsx text-[#475ad2] */}
          <div className="lg:col-span-5 relative">
            <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-md border border-slate-200/80 space-y-4 text-left relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-wider">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>Flash Deal of the Day</span>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-[#3321c8] text-white shadow-xs">
                  {events[0]?.discountTag || 'Save 30% Off'}
                </span>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-bold text-[#333] leading-snug">
                  {events[0]?.title || 'Global Tech & Audio Creators Expo'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {events[0]?.description || 'Exclusive manufacturer discounts on studio audio, mechanical keyboards, and workstation gear.'}
                </p>
              </div>

              {/* Countdown numbers matching CountDown.jsx in zip: text-[#475ad2] */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-2xl font-black text-[#475ad2] tabular-nums">{timeLeft.days}</span>
                  <span className="block text-[10px] text-slate-500 uppercase font-semibold">Days</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-2xl font-black text-[#475ad2] tabular-nums">{timeLeft.hours}</span>
                  <span className="block text-[10px] text-slate-500 uppercase font-semibold">Hours</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-2xl font-black text-[#475ad2] tabular-nums">{timeLeft.minutes}</span>
                  <span className="block text-[10px] text-slate-500 uppercase font-semibold">Mins</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-2xl font-black text-[#f63b60] tabular-nums">{timeLeft.seconds}</span>
                  <span className="block text-[10px] text-slate-500 uppercase font-semibold">Secs</span>
                </div>
              </div>

              {/* Sold Progress Bar matching zip: text-[#68d284] & bg-[#3321c8] */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Sold: <strong className="text-slate-900">32</strong> / 60 Units</span>
                  <span className="text-[#68d284] font-bold">53% Claimed</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                  <div className="bg-[#3321c8] h-full rounded-full w-[53%]" />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                <span className="text-blue-500 font-medium">Store: Apex Audio Tech</span>
                <button
                  onClick={() => {
                    setSelectedCategory('Electronics');
                    setActiveView('marketplace');
                  }}
                  className="text-xs font-bold text-[#3321c8] hover:text-[#17dd1f] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Explore Deal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Category Horizontal Strip */}
        <div className="mt-10 pt-6 border-t border-slate-200/80 flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
            Departments:
          </span>
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => {
                if (cat.name === 'Custom Studio') setActiveView('custom-studio');
                else if (cat.name === 'Digital Goods') setActiveView('digital-vault');
                else {
                  setSelectedCategory(cat.name);
                  setActiveView('marketplace');
                }
              }}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-200 hover:border-[#3321c8] hover:text-[#3321c8] hover:shadow-xs transition-all shrink-0 flex items-center gap-2 shadow-2xs cursor-pointer"
            >
              <span className="text-base">{cat.icon}</span>
              <span>{cat.label}</span>
              <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full tabular-nums font-bold">
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
