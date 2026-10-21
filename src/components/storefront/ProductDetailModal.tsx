import React, { useState } from 'react';
import { Product } from '../../types/index.ts';
import { useApp } from '../../context/AppContext.tsx';
import { 
  X, 
  Star, 
  Store, 
  ShoppingBag, 
  Truck, 
  ShieldCheck, 
  Check, 
  Plus, 
  Minus,
  ExternalLink,
  MessageSquare,
  Camera
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onOpenCart: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose, onOpenCart }) => {
  const { addToCart, shops, submitReview, setActiveView, setSelectedCategory, openVto } = useApp();
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdded, setIsAdded] = useState(false);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  if (!product) return null;

  const shop = shops.find((s) => s.id === product.shopId);
  const hasDiscount = Boolean(product.discountPrice && product.discountPrice < product.price);
  const activePrice = hasDiscount ? product.discountPrice : product.price;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    onClose();
    onOpenCart();
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    setSubmittingReview(true);
    try {
      await submitReview(product.id, reviewRating, reviewComment.trim());
      setReviewComment('');
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden relative max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-slate-700 bg-white/80 hover:bg-slate-100 rounded-full transition-colors border border-slate-200"
          aria-label="Close product view"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Left 6-Columns: Gallery */}
            <div className="md:col-span-6 space-y-4">
              <div className="aspect-4/3 w-full bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
                <img
                  src={product.images[selectedImage] || product.images[0]}
                  alt={product.title}
                  className="w-full h-full object-cover object-center"
                />
              </div>

              {/* Thumbnails if multiple */}
              {product.images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                        selectedImage === idx ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Vendor Profile Card */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={shop?.avatar || product.shopAvatar || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=150&q=80'}
                      alt={product.shopName}
                      className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                    />
                    <div>
                      <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{product.shopName}</span>
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="text-xs text-slate-500">
                        {shop ? `${shop.rating} ★ Rating (${shop.reviewCount} orders)` : 'Verified Marketplace Seller'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedCategory(product.category);
                      setActiveView('marketplace');
                      onClose();
                    }}
                    className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors flex items-center gap-1"
                  >
                    <span>Store</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2">
                  {shop?.description || 'Independent artisan seller on ShopNonstop with direct fulfillment.'}
                </p>

                <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Shipment origin: {shop?.address || 'Verified warehouse'}</span>
                  <span className="text-emerald-700 font-medium">Ships within 24 hours</span>
                </div>
              </div>
            </div>

            {/* Right 6-Columns: Contiguous Purchase Module */}
            <div className="md:col-span-6 space-y-5 text-left">
              <div>
                <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
                  {product.category} {product.subCategory ? `· ${product.subCategory}` : ''}
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                  {product.title}
                </h1>
                
                {/* Rating line */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-slate-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-700 tabular-nums">{product.rating.toFixed(1)}</span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-500">{product.numReviews} Verified Buyer Reviews</span>
                </div>
              </div>

              {/* Price & Stock Display */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
                    ${activePrice?.toFixed(2)}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm text-slate-400 line-through tabular-nums">
                      ${product.price.toFixed(2)}
                    </span>
                  )}
                  {hasDiscount && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      Save ${(product.price - (product.discountPrice || 0)).toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <span className="font-medium text-slate-700">
                      {product.stock > 0 ? `In Stock (${product.stock} units available)` : 'Currently Out of Stock'}
                    </span>
                  </div>
                  <span>SKU: {product.id.slice(0, 10).toUpperCase()}</span>
                </div>
              </div>

              {/* Quantity Selector & CTAs */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-semibold text-slate-700">Quantity</span>
                  <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="p-2 text-slate-500 hover:text-slate-800 disabled:opacity-40"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-4 text-xs font-bold text-slate-900 tabular-nums">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      disabled={quantity >= product.stock}
                      className="p-2 text-slate-500 hover:text-slate-800 disabled:opacity-40"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className={`py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      isAdded
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Added to Cart!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleBuyNow}
                    disabled={product.stock === 0}
                    className="py-3 px-4 rounded-xl text-xs font-bold bg-[#3957db] hover:bg-[#1e3bb3] text-white shadow-md shadow-blue-500/20 transition-all text-center"
                  >
                    Buy Now
                  </button>
                </div>

                {(product.category.toLowerCase().includes('fashion') ||
                  product.category.toLowerCase().includes('custom') ||
                  product.title.toLowerCase().includes('shirt') ||
                  product.title.toLowerCase().includes('tee') ||
                  product.title.toLowerCase().includes('hoodie') ||
                  product.title.toLowerCase().includes('jacket')) && (
                  <button
                    onClick={() => {
                      onClose();
                      openVto(product);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold border border-emerald-500/40 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 flex items-center justify-center gap-2 transition-colors mt-2"
                  >
                    <Camera className="w-4 h-4 text-emerald-600" />
                    <span>Try On with Camera (Virtual Dressing Room)</span>
                  </button>
                )}
              </div>

              {/* Product Description */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">About this item</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Technical Specifications / Attributes */}
              {product.attributes && product.attributes.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Specifications</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {product.attributes.map((attr, idx) => (
                      <div key={idx} className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-slate-400 block text-[11px]">{attr.name}</span>
                        <span className="font-semibold text-slate-700">{attr.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Delivery info */}
              <div className="flex items-center gap-2 p-3 bg-blue-50/50 rounded-lg border border-blue-100 text-xs text-blue-900">
                <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Orders split seamlessly per vendor with live step-by-step courier tracking.</span>
              </div>
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="mt-10 pt-8 border-t border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span>Customer Reviews ({product.numReviews})</span>
              </h3>
            </div>

            {/* Submit Review Form */}
            <form onSubmit={handleReviewSubmit} className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Write a verified review</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="p-0.5 text-amber-500 hover:scale-110 transition-transform"
                    >
                      <Star className={`w-4 h-4 ${star <= reviewRating ? 'fill-current' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                rows={2}
                placeholder="Share your experience with this item and seller delivery..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                required
              />

              <div className="flex items-center justify-between">
                {reviewSuccess ? (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Review published successfully!</span>
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400">Reviews help independent sellers grow.</span>
                )}
                <button
                  type="submit"
                  disabled={submittingReview || !reviewComment.trim()}
                  className="px-4 py-1.5 bg-slate-900 text-white hover:bg-blue-600 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40"
                >
                  {submittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
