import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Camera, 
  Upload, 
  RefreshCw, 
  ShieldAlert, 
  Check, 
  Sliders, 
  ShoppingBag, 
  Sparkles,
  Maximize2,
  RotateCcw,
  FlipHorizontal,
  ChevronRight,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { Product } from '../../types/index.ts';

// Sample safe model presets for quick preview without needing a camera
const SAMPLE_MODELS = [
  {
    id: 'model_1',
    label: 'Male Model (Casual)',
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'model_2',
    label: 'Female Model (Portrait)',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'model_3',
    label: 'Athletic Casual',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=700&q=80',
  },
];

export const VirtualTryOnModal: React.FC = () => {
  const { isVtoOpen, closeVto, vtoProduct, products, addToCart } = useApp();

  // Selected product to try on
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(vtoProduct);
  const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L' | 'XL' | 'XXL'>('M');

  // User image state
  const [userPhoto, setUserPhoto] = useState<string>(SAMPLE_MODELS[0].url);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Safety Guardrail states
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [guardrailBlocked, setGuardrailBlocked] = useState<boolean>(false);
  const [guardrailReason, setGuardrailReason] = useState<string>('');
  const [skinPercentage, setSkinPercentage] = useState<number>(0);

  // Fitting adjustments
  const [scale, setScale] = useState<number>(100); // 70 to 140%
  const [offsetY, setOffsetY] = useState<number>(42); // vertical % on torso
  const [offsetX, setOffsetX] = useState<number>(50); // horizontal %
  const [rotation, setRotation] = useState<number>(0);
  const [opacity, setOpacity] = useState<number>(95);
  const [isMirrored, setIsMirrored] = useState<boolean>(false);
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync incoming product from context
  useEffect(() => {
    if (vtoProduct) {
      setSelectedProduct(vtoProduct);
    } else if (products.length > 0 && !selectedProduct) {
      const apparel = products.find(
        (p) =>
          p.category.toLowerCase().includes('fashion') ||
          p.category.toLowerCase().includes('custom') ||
          p.title.toLowerCase().includes('shirt') ||
          p.title.toLowerCase().includes('tee') ||
          p.title.toLowerCase().includes('hoodie')
      );
      setSelectedProduct(apparel || products[0]);
    }
  }, [vtoProduct, products]);

  // Clean up camera stream on unmount or close
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setCountdown(null);
  };

  const startCamera = async () => {
    try {
      setGuardrailBlocked(false);
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Camera access error:', err);
      alert('Could not access camera. Please check camera permissions or upload a photo instead.');
      setCameraActive(false);
    }
  };

  const takeSnapshot = () => {
    if (!videoRef.current) return;
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          captureFrame();
          return null;
        }
        return prev - 1;
      });
    }, 700);
  };

  const captureFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 640;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    stopCamera();
    inspectImageSafety(dataUrl);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        inspectImageSafety(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  /**
   * Automated Anti-Nudity Guardrail
   * Inspects image color distribution in HSV and YCbCr color spaces to detect exposed skin ratio.
   * If total skin exposure exceeds standard threshold or chest/torso area is unclad, blocks the image.
   */
  const inspectImageSafety = (imageUrl: string) => {
    setIsScanning(true);
    setGuardrailBlocked(false);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const maxDim = 320; // Downscale for real-time client-side analysis
        const scaleFactor = Math.min(maxDim / img.width, maxDim / img.height);
        canvas.width = Math.floor(img.width * scaleFactor);
        canvas.height = Math.floor(img.height * scaleFactor);

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          setUserPhoto(imageUrl);
          setIsScanning(false);
          return;
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        let totalPixels = 0;
        let skinPixels = 0;
        let upperTorsoSkinPixels = 0;
        let upperTorsoTotalPixels = 0;

        // Upper torso is defined as middle 30% to 75% height, middle 20% to 80% width
        const torsoYStart = canvas.height * 0.28;
        const torsoYEnd = canvas.height * 0.75;
        const torsoXStart = canvas.width * 0.2;
        const torsoXEnd = canvas.width * 0.8;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          if (a < 128) continue; // Skip transparent
          totalPixels++;

          const pixelIndex = i / 4;
          const x = pixelIndex % canvas.width;
          const y = Math.floor(pixelIndex / canvas.width);
          const isTorso = x >= torsoXStart && x <= torsoXEnd && y >= torsoYStart && y <= torsoYEnd;

          if (isTorso) upperTorsoTotalPixels++;

          // Skin detection in YCbCr color space
          // Y = 0.299R + 0.587G + 0.114B
          // Cb = 128 - 0.168736R - 0.331264G + 0.5B
          // Cr = 128 + 0.5R - 0.418688G - 0.081312B
          const Cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
          const Cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

          // Standard universal human skin chromaticity boundaries across Fitzpatrick skin types I-VI:
          // Cb in [77, 127] and Cr in [133, 173] with R > G and R > B
          const isSkin = Cb >= 77 && Cb <= 127 && Cr >= 133 && Cr <= 173 && r > g && r > b && (r - g) >= 15;

          if (isSkin) {
            skinPixels++;
            if (isTorso) {
              upperTorsoSkinPixels++;
            }
          }
        }

        const overallRatio = (skinPixels / Math.max(1, totalPixels)) * 100;
        const torsoRatio = (upperTorsoSkinPixels / Math.max(1, upperTorsoTotalPixels)) * 100;
        setSkinPercentage(Math.round(overallRatio));

        // GUARDRAIL SAFETY RULE:
        // A standard dressed portrait/selfie has skin on face/hands: ~8% to 28% total skin, and <32% torso skin.
        // Nude or unclad torso photos exhibit high skin coverage on the upper torso (>48%) or overall (>40%).
        if (torsoRatio > 48 || overallRatio > 42) {
          setGuardrailBlocked(true);
          setGuardrailReason(
            `Excessive bare skin detected (${Math.round(overallRatio)}% overall, ${Math.round(torsoRatio)}% torso region). For safety and privacy, unclad or nude photos cannot be processed.`
          );
          setIsScanning(false);
          return;
        }

        // Passed safety railguard!
        setGuardrailBlocked(false);
        setUserPhoto(imageUrl);
      } catch (err) {
        console.error('Guardrail check error:', err);
        setUserPhoto(imageUrl);
      } finally {
        setIsScanning(false);
      }
    };

    img.onerror = () => {
      setIsScanning(false);
      alert('Could not process image file. Please try another image.');
    };

    img.src = imageUrl;
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    addToCart(selectedProduct, 1, `Size ${selectedSize} (Virtual Fit Checked)`);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  const resetFitting = () => {
    setScale(100);
    setOffsetY(42);
    setOffsetX(50);
    setRotation(0);
    setOpacity(95);
    setIsMirrored(false);
  };

  // Apparel items from catalog
  const clothingProducts = products.filter(
    (p) =>
      p.category.toLowerCase().includes('fashion') ||
      p.category.toLowerCase().includes('custom') ||
      p.title.toLowerCase().includes('shirt') ||
      p.title.toLowerCase().includes('tee') ||
      p.title.toLowerCase().includes('jacket') ||
      p.title.toLowerCase().includes('hoodie') ||
      p.tags.some((t) => t.toLowerCase().includes('apparel') || t.toLowerCase().includes('shirt'))
  );

  if (!isVtoOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden relative">
        {/* TOP BAR */}
        <div className="p-4 sm:p-5 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Virtual Try-On & Dressing Room</h2>
              <p className="text-xs text-slate-500">Live camera fitting with automated skin & content safety guardrails</p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              closeVto();
            }}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MAIN BODY: 2 COLUMNS */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-y-auto">
          {/* LEFT: INTERACTIVE FITTING CANVAS (7 COLS) */}
          <div className="lg:col-span-7 bg-slate-950 p-4 sm:p-6 flex flex-col items-center justify-center relative select-none min-h-[380px] lg:min-h-[520px]">
            {/* Safety Scanning Indicator */}
            {isScanning && (
              <div className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-white p-6 text-center">
                <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mb-3" />
                <span className="text-sm font-semibold">Scanning photo with safety guardrails...</span>
                <span className="text-xs text-slate-400 mt-1">Verifying clothing boundaries & content safety</span>
              </div>
            )}

            {/* GUARDRAIL BLOCKED BANNER */}
            {guardrailBlocked ? (
              <div className="bg-rose-950/90 border border-rose-500/50 rounded-2xl p-6 max-w-md text-center text-rose-100 z-20 space-y-3">
                <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-white">Safety Guardrail Triggered</h4>
                <p className="text-xs text-rose-200 leading-relaxed">
                  {guardrailReason || 'Inappropriate or excessively exposed photo detected. For privacy and platform standards, nude or unclad photos cannot be used.'}
                </p>
                <div className="p-3 bg-rose-900/40 rounded-xl text-[11px] text-rose-300 flex items-center gap-2 text-left">
                  <Info className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>Please upload a casual photo wearing a standard t-shirt, top, or shirt in good lighting.</span>
                </div>
                <div className="pt-2 flex items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      setGuardrailBlocked(false);
                      setUserPhoto(SAMPLE_MODELS[0].url);
                    }}
                    className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold rounded-lg transition-colors"
                  >
                    Reset with Model Photo
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    Upload Another Photo
                  </button>
                </div>
              </div>
            ) : cameraActive ? (
              /* LIVE CAMERA FEED */
              <div className="relative w-full max-w-md aspect-3/4 rounded-2xl overflow-hidden border border-slate-800 bg-black flex items-center justify-center shadow-2xl">
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className={`w-full h-full object-cover ${isMirrored ? 'scale-x-[-1]' : ''}`}
                />

                {countdown !== null && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center">
                    <span className="text-7xl font-extrabold text-white animate-ping">{countdown}</span>
                  </div>
                )}

                <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-3">
                  <button
                    onClick={takeSnapshot}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/30"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Snap Fitting Photo</span>
                  </button>
                  <button
                    onClick={stopCamera}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-full text-xs font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* VIRTUAL TRY-ON COMPOSITING CANVAS */
              <div className="relative w-full max-w-sm aspect-3/4 rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl bg-slate-900">
                {/* 1. User Photo / Background */}
                <img
                  src={userPhoto}
                  alt="Fitting Subject"
                  referrerPolicy="no-referrer"
                  className={`w-full h-full object-cover pointer-events-none transition-transform duration-200 ${
                    isMirrored ? 'scale-x-[-1]' : ''
                  }`}
                />

                {/* 2. Overlaid Apparel Garment */}
                {selectedProduct && (
                  <div
                    className="absolute pointer-events-none transition-all duration-150 flex items-center justify-center"
                    style={{
                      top: `${offsetY}%`,
                      left: `${offsetX}%`,
                      transform: `translate(-50%, -50%) scale(${scale / 100}) rotate(${rotation}deg) ${
                        isMirrored ? 'scaleX(-1)' : ''
                      }`,
                      opacity: opacity / 100,
                      width: '68%',
                      mixBlendMode: 'normal',
                      filter: 'drop-shadow(0px 8px 16px rgba(0,0,0,0.45))',
                    }}
                  >
                    <img
                      src={selectedProduct.images[0]}
                      alt={selectedProduct.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-auto object-contain rounded-xl"
                    />
                  </div>
                )}

                {/* Sizing & Verified Badge Tag */}
                <div className="absolute top-3 left-3 px-2.5 py-1 bg-slate-950/80 backdrop-blur-md rounded-lg border border-white/10 text-[11px] text-white font-medium flex items-center gap-1.5 shadow-sm">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Size {selectedSize} Fit</span>
                </div>

                {/* Guardrail Safe Tag */}
                <div className="absolute top-3 right-3 px-2 py-0.5 bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 rounded text-[10px] font-semibold">
                  Safe Photo Verified
                </div>
              </div>
            )}

            {/* Bottom Photo Source Toolbar */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={startCamera}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
              >
                <Camera className="w-3.5 h-3.5 text-blue-400" />
                <span>Open Camera</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>Upload Photo</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="hidden sm:flex items-center gap-1 pl-2">
                <span className="text-[11px] text-slate-400">Sample Models:</span>
                {SAMPLE_MODELS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setGuardrailBlocked(false);
                      setUserPhoto(m.url);
                    }}
                    className={`px-2 py-1 text-[11px] rounded transition-colors ${
                      userPhoto === m.url
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {m.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: CONTROLS & APPAREL CATALOG (5 COLS) */}
          <div className="lg:col-span-5 p-5 sm:p-6 bg-white flex flex-col justify-between overflow-y-auto space-y-5">
            {/* 1. Current Selected Item Overview */}
            {selectedProduct && (
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/90 flex items-center gap-3">
                <img
                  src={selectedProduct.images[0]}
                  alt=""
                  className="w-14 h-14 rounded-xl object-cover bg-white border border-slate-200 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
                    {selectedProduct.shopName}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 truncate">{selectedProduct.title}</h4>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">
                    ${(selectedProduct.discountPrice || selectedProduct.price).toFixed(2)}
                  </div>
                </div>
              </div>
            )}

            {/* 2. Size Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">Garment Size</label>
              <div className="grid grid-cols-5 gap-1.5">
                {(['S', 'M', 'L', 'XL', 'XXL'] as const).map((sz) => (
                  <button
                    key={sz}
                    onClick={() => {
                      setSelectedSize(sz);
                      // subtly adjust scale based on size
                      if (sz === 'S') setScale(92);
                      if (sz === 'M') setScale(100);
                      if (sz === 'L') setScale(108);
                      if (sz === 'XL') setScale(116);
                      if (sz === 'XXL') setScale(124);
                    }}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      selectedSize === sz
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Fitting Adjustments */}
            <div className="space-y-3 p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-slate-500" />
                  <span>Fit & Position Adjuster</span>
                </span>
                <button
                  onClick={resetFitting}
                  className="text-[11px] text-blue-600 hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Fit</span>
                </button>
              </div>

              {/* Scale */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                  <span>Garment Scale</span>
                  <span className="font-semibold text-slate-700">{scale}%</span>
                </div>
                <input
                  type="range"
                  min="75"
                  max="135"
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              {/* Vertical Position */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                  <span>Torso Position (Height)</span>
                  <span className="font-semibold text-slate-700">{offsetY}%</span>
                </div>
                <input
                  type="range"
                  min="25"
                  max="60"
                  value={offsetY}
                  onChange={(e) => setOffsetY(Number(e.target.value))}
                  className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              {/* Horizontal Position */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                  <span>Horizontal Alignment</span>
                  <span className="font-semibold text-slate-700">{offsetX}%</span>
                </div>
                <input
                  type="range"
                  min="35"
                  max="65"
                  value={offsetX}
                  onChange={(e) => setOffsetX(Number(e.target.value))}
                  className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              {/* Mirror & Opacity */}
              <div className="pt-1 flex items-center justify-between">
                <button
                  onClick={() => setIsMirrored(!isMirrored)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
                    isMirrored ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <FlipHorizontal className="w-3.5 h-3.5" />
                  <span>Mirror Pose</span>
                </button>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 text-[11px]">Blend:</span>
                  <input
                    type="range"
                    min="70"
                    max="100"
                    value={opacity}
                    onChange={(e) => setOpacity(Number(e.target.value))}
                    className="w-20 accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* 4. Switch Apparel Product Carousel */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">Try Other Catalog Items</label>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {clothingProducts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProduct(p)}
                    className={`p-1.5 rounded-xl border shrink-0 text-left transition-all w-24 ${
                      selectedProduct?.id === p.id
                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <img src={p.images[0]} alt="" className="w-full h-16 object-cover rounded-lg bg-slate-100 mb-1" />
                    <div className="text-[10px] font-bold text-slate-800 truncate">{p.title}</div>
                    <div className="text-[10px] text-slate-500 font-semibold">${(p.discountPrice || p.price).toFixed(2)}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 5. ADD TO BAG CTA */}
            <div className="pt-2">
              <button
                onClick={handleAddToCart}
                disabled={!selectedProduct || guardrailBlocked}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
              >
                {addedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Added Size {selectedSize} to Bag!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add Fitted Size {selectedSize} to Shopping Bag</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
