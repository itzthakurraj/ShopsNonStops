import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { 
  Palette, 
  Type, 
  Upload, 
  RotateCw, 
  Check, 
  ShoppingBag, 
  Sparkles, 
  Layers, 
  Sliders, 
  Eye, 
  Store
} from 'lucide-react';
import { CustomDesignSpec, Product } from '../../types/index.ts';

const SHIRT_COLORS = [
  { name: 'Pitch Black', hex: '#111827', textColor: '#FFFFFF' },
  { name: 'Crisp White', hex: '#FFFFFF', textColor: '#111827' },
  { name: 'Heather Grey', hex: '#94A3B8', textColor: '#0F172A' },
  { name: 'Midnight Navy', hex: '#1E293B', textColor: '#FFFFFF' },
  { name: 'Forest Green', hex: '#14532D', textColor: '#FFFFFF' },
  { name: 'Crimson Red', hex: '#991B1B', textColor: '#FFFFFF' },
  { name: 'Warm Sand', hex: '#E2E8F0', textColor: '#0F172A' },
];

const FONTS = [
  { name: 'Plus Jakarta Sans (Modern)', value: "'Plus Jakarta Sans', sans-serif" },
  { name: 'JetBrains Mono (Tech/Code)', value: "'JetBrains Mono', monospace" },
  { name: 'DM Sans (Clean)', value: "'DM Sans', sans-serif" },
  { name: 'Impact / Streetwear', value: "Impact, sans-serif" },
  { name: 'Georgia (Classic Editorial)', value: "Georgia, serif" },
];

const SAMPLE_BADGES = [
  { name: 'Mountain Peak', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=300&q=80' },
  { name: 'Geometric Sun', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80' },
  { name: 'Neon Cyber', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=300&q=80' },
];

export const CustomTShirtStudio: React.FC = () => {
  const { products, addToCart, setActiveView } = useApp();

  const customTeeProduct = products.find((p) => p.id === 'prod_custom_tee_240gsm') || products[0];

  const [selectedColor, setSelectedColor] = useState(SHIRT_COLORS[0]);
  const [viewSide, setViewSide] = useState<'front' | 'back'>('front');
  const [customText, setCustomText] = useState('STUDIO ARCHITECTURE');
  const [selectedFont, setSelectedFont] = useState(FONTS[0].value);
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [fontSize, setFontSize] = useState<number>(18);
  const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L' | 'XL' | 'XXL'>('L');
  const [uploadedGraphic, setUploadedGraphic] = useState<string | null>(SAMPLE_BADGES[0].url);
  const [graphicScale, setGraphicScale] = useState<number>(75);
  const [addedNotice, setAddedNotice] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedGraphic(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddToCart = () => {
    const designSpec: CustomDesignSpec = {
      baseColor: selectedColor.name,
      customText,
      textColor,
      fontFamily: selectedFont,
      fontSize,
      graphicUrl: uploadedGraphic || undefined,
      printPosition: viewSide,
      apparelSize: selectedSize,
    };

    addToCart(customTeeProduct, 1, `Custom - ${selectedSize} - ${selectedColor.name}`, designSpec);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2500);
  };

  const calculatedPrice = customTeeProduct.discountPrice || customTeeProduct.price;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">
      {/* Studio Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-50 text-blue-800 text-xs font-bold mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Interactive 2D Apparel Studio</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Custom T-Shirt & Merchandise Designer
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Craft your bespoke heavy-cotton garment with real-time text, color picker, graphic placement, and vendor fulfillment by LuxeThreads Atelier.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('marketplace')}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            ← Back to Marketplace
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7-Cols: Interactive 2D Visual T-Shirt Mockup */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center relative min-h-[500px]">
          
          {/* Controls Bar above T-shirt */}
          <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Viewing:</span>
              <div className="flex items-center p-0.5 bg-slate-100 rounded-lg">
                <button
                  onClick={() => setViewSide('front')}
                  className={`px-3 py-1 rounded-md font-semibold transition-all ${
                    viewSide === 'front' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  Front Chest
                </button>
                <button
                  onClick={() => setViewSide('back')}
                  className={`px-3 py-1 rounded-md font-semibold transition-all ${
                    viewSide === 'back' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  Back Print
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-500">
              <span>Color: </span>
              <span className="font-bold text-slate-800">{selectedColor.name}</span>
            </div>
          </div>

          {/* 2D T-Shirt Canvas Rendering Container */}
          <div className="relative w-72 sm:w-96 aspect-4/5 flex items-center justify-center">
            {/* SVG T-Shirt Silhouette */}
            <svg
              viewBox="0 0 400 480"
              className="w-full h-full drop-shadow-md transition-colors duration-300"
              style={{ filter: selectedColor.hex === '#FFFFFF' ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.06))' : 'drop-shadow(0 8px 12px rgba(0,0,0,0.15))' }}
            >
              {/* T-Shirt Path */}
              <path
                d="M130,40 L160,70 Q200,85 240,70 L270,40 L370,110 L330,170 L290,140 L290,440 L110,440 L110,140 L70,170 L30,110 Z"
                fill={selectedColor.hex}
                stroke={selectedColor.hex === '#FFFFFF' ? '#CBD5E1' : '#0F172A'}
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              {/* Collar detail */}
              <path
                d="M160,70 Q200,95 240,70 Q200,80 160,70"
                fill="none"
                stroke={selectedColor.hex === '#FFFFFF' ? '#94A3B8' : 'rgba(255,255,255,0.3)'}
                strokeWidth="2"
              />
              {/* Sleeve stitch lines */}
              <line x1="110" y1="140" x2="70" y2="170" stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" strokeDasharray="3 3" />
              <line x1="290" y1="140" x2="330" y2="170" stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" strokeDasharray="3 3" />
            </svg>

            {/* Print Area Overlay (Bounding Box) */}
            <div className="absolute top-[28%] w-44 sm:w-56 h-48 border border-dashed border-blue-400/40 rounded-lg p-2 flex flex-col items-center justify-center text-center overflow-hidden pointer-events-none">
              
              {/* Custom Uploaded Graphic or Badge */}
              {uploadedGraphic && (
                <div 
                  className="mb-2 transition-all duration-200 overflow-hidden rounded-md shadow-xs"
                  style={{ width: `${graphicScale}px`, height: `${graphicScale}px` }}
                >
                  <img
                    src={uploadedGraphic}
                    alt="Custom Print"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {/* Custom Text Overlay */}
              {customText && (
                <div
                  className="font-bold tracking-wider uppercase px-2 transition-all select-none"
                  style={{
                    fontFamily: selectedFont,
                    color: textColor,
                    fontSize: `${fontSize}px`,
                    textShadow: selectedColor.hex === '#FFFFFF' ? '0 1px 2px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.6)',
                  }}
                >
                  {customText}
                </div>
              )}

              {viewSide === 'back' && (
                <div className="absolute bottom-2 text-[9px] text-slate-400 font-mono">
                  [ Back Neckline Area ]
                </div>
              )}
            </div>
          </div>

          {/* Quality Guarantee Strip */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between w-full text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Store className="w-3.5 h-3.5 text-blue-600" />
              <span>Fulfilled by LuxeThreads Atelier</span>
            </span>
            <span className="text-emerald-700 font-semibold">240 GSM Pre-Shrunk Organic Cotton</span>
          </div>
        </div>

        {/* Right 5-Cols: Customizer Control Panel */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          
          {/* Base Shirt Color Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-blue-600" />
                <span>Base Garment Color</span>
              </span>
              <span className="text-slate-500 font-medium">{selectedColor.name}</span>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              {SHIRT_COLORS.map((col) => (
                <button
                  key={col.name}
                  onClick={() => {
                    setSelectedColor(col);
                    // Default contrasting text color
                    if (col.hex === '#FFFFFF') setTextColor('#111827');
                    else setTextColor('#FFFFFF');
                  }}
                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center ${
                    selectedColor.name === col.name ? 'border-blue-600 ring-2 ring-blue-100 scale-105' : 'border-slate-300'
                  }`}
                  style={{ backgroundColor: col.hex }}
                  title={col.name}
                >
                  {selectedColor.name === col.name && (
                    <Check className={`w-4 h-4 ${col.hex === '#FFFFFF' ? 'text-slate-900' : 'text-white'}`} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Text Editor */}
          <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-blue-600" />
              <span>Custom Text & Lettering</span>
            </span>

            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Enter your custom typography..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-semibold text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500"
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Font Family</label>
                <select
                  value={selectedFont}
                  onChange={(e) => setSelectedFont(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                >
                  {FONTS.map((f) => (
                    <option key={f.name} value={f.value}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Text Color</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-7 h-7 rounded border border-slate-200 cursor-pointer p-0"
                  />
                  <span className="font-mono text-slate-700 uppercase">{textColor}</span>
                </div>
              </div>
            </div>

            {/* Font Size Slider */}
            <div>
              <div className="flex justify-between items-center text-[11px] text-slate-500 mb-1">
                <span>Text Size</span>
                <span className="font-mono font-bold text-slate-800">{fontSize}px</span>
              </div>
              <input
                type="range"
                min="12"
                max="32"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Logo / Graphic Upload */}
          <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                <span>Upload Logo or Graphic</span>
              </span>
              {uploadedGraphic && (
                <button
                  onClick={() => setUploadedGraphic(null)}
                  className="text-red-600 hover:text-red-700 font-semibold"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Choose Image file...</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <span className="text-[11px] text-slate-400 truncate">PNG, JPG, SVG supported</span>
            </div>

            {/* Sample Badges */}
            <div>
              <span className="text-[11px] text-slate-400 block mb-1">Or choose sample artist badge:</span>
              <div className="flex items-center gap-2">
                {SAMPLE_BADGES.map((b) => (
                  <button
                    key={b.name}
                    onClick={() => setUploadedGraphic(b.url)}
                    className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 hover:border-blue-500 transition-colors shrink-0"
                    title={b.name}
                  >
                    <img src={b.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {uploadedGraphic && (
              <div>
                <div className="flex justify-between items-center text-[11px] text-slate-500 mb-1">
                  <span>Graphic Print Scale</span>
                  <span className="font-mono font-bold text-slate-800">{graphicScale}px</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="120"
                  value={graphicScale}
                  onChange={(e) => setGraphicScale(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Size Selector */}
          <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
            <span className="font-bold text-slate-800 block">Select Garment Size</span>
            <div className="flex items-center gap-2">
              {(['S', 'M', 'L', 'XL', 'XXL'] as const).map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  className={`w-10 h-9 rounded-lg font-bold transition-all ${
                    selectedSize === sz
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Price & Add to Cart Action */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
            <div>
              <span className="text-[11px] text-slate-400 block">Custom Tee Price</span>
              <span className="text-2xl font-black text-slate-900 tabular-nums">
                ${calculatedPrice.toFixed(2)}
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              className={`px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm ${
                addedNotice
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {addedNotice ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Custom Tee Added!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add Custom Tee to Bag</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
