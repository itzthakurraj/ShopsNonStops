import React, { useState } from 'react';
import { Product } from '../../types/index.ts';
import { useApp } from '../../context/AppContext.tsx';
import { ShoppingBag, Star, Check, Store, Camera, Heart, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { 
    addToCart, 
    viewProductDetails, 
    openVto, 
    wishlist, 
    toggleWishlist, 
    isWishlisted 
  } = useApp();
  
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    viewProductDetails(product);
  };

  const hasDiscount = Boolean(product.discountPrice && product.discountPrice < product.price);
  const displayPrice = hasDiscount ? product.discountPrice : product.price;
  const wishlisted = isWishlisted(product.id);
  const soldCount = product.salesCount || Math.floor((product.price * 3) % 45) + 14;

  const isWearable = (
    product.category.toLowerCase().includes('fashion') ||
    product.category.toLowerCase().includes('custom') ||
    product.title.toLowerCase().includes('shirt') ||
    product.title.toLowerCase().includes('tee') ||
    product.title.toLowerCase().includes('hoodie') ||
    product.title.toLowerCase().includes('jacket')
  );

  return (
    <div
      onClick={() => viewProductDetails(product)}
      className="group w-full bg-white rounded-lg shadow-sm hover:shadow-md p-3 relative cursor-pointer border border-slate-100 flex flex-col justify-between transition-all"
    >
      {/* Product Image Showcase */}
      <div className="relative w-full h-[170px] flex items-center justify-center overflow-hidden mb-2">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'}
          alt={product.title}
          referrerPolicy="no-referrer"
          className="w-full h-[170px] object-contain group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        {/* Side Options Stack from zip: Heart top-2 right-2, Eye top-10, Cart/Bag top-18, Camera top-26 */}
        <div className="absolute right-1 top-1 flex flex-col gap-2 z-10">
          {/* Wishlist Heart Icon: red if wishlisted, #333 if not */}
          <button
            onClick={handleToggleWishlist}
            className="p-1.5 rounded-full bg-white/80 hover:bg-white shadow-xs transition-colors"
            title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-label="Wishlist toggle"
          >
            <Heart className={`w-[20px] h-[20px] ${wishlisted ? 'fill-red-600 text-red-600' : 'text-[#333]'}`} />
          </button>

          {/* Quick View Eye Icon */}
          <button
            onClick={handleQuickView}
            className="p-1.5 rounded-full bg-white/80 hover:bg-white shadow-xs transition-colors text-[#333] hover:text-[#3321c8]"
            title="Quick view"
            aria-label="Quick View"
          >
            <Eye className="w-[20px] h-[20px]" />
          </button>

          {/* Add to Cart Icon button */}
          <button
            onClick={handleAdd}
            className="p-1.5 rounded-full bg-white/80 hover:bg-white shadow-xs transition-colors text-[#444] hover:text-[#3321c8]"
            title="Add to cart"
            aria-label="Add to cart"
          >
            <ShoppingBag className="w-[20px] h-[20px]" />
          </button>

          {/* Virtual Try-On Camera for Apparel */}
          {isWearable && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                openVto(product);
              }}
              className="p-1.5 rounded-full bg-[#3321c8] hover:bg-blue-800 text-white shadow-xs transition-transform hover:scale-105"
              title="Virtual Try-On with Camera"
              aria-label="Virtual Try-On"
            >
              <Camera className="w-[18px] h-[18px]" />
            </button>
          )}
        </div>
      </div>

      {/* Content Area with exact typography from zip styles.js */}
      <div className="flex flex-col flex-1 justify-between text-left">
        <div>
          {/* Shop Name from styles.js: text-[15px] text-blue-400 */}
          <h5 className="pt-1 text-[13px] sm:text-[14px] text-blue-500 font-medium hover:underline truncate">
            {product.shopName}
          </h5>

          {/* Product Title: pb-2 font-[500] text-[#333] */}
          <h4 className="pb-2 font-[500] text-sm text-[#333] line-clamp-2 leading-snug group-hover:text-[#3321c8] transition-colors">
            {product.title}
          </h4>

          {/* Star Ratings */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="text-xs font-bold text-slate-700 tabular-nums">{product.rating.toFixed(1)}</span>
            <span className="text-[11px] text-slate-400">({product.numReviews})</span>
          </div>
        </div>

        {/* Price & Sold Row from zip: styles.productDiscountPrice & styles.price & text-[#68d284] */}
        <div className="py-2 flex items-center justify-between border-t border-slate-100">
          <div className="flex items-center">
            {/* Discount Price: font-bold text-[18px] text-[#333] font-Roboto */}
            <h5 className="font-bold text-[17px] text-[#333] tabular-nums">
              ${displayPrice?.toFixed(2)}
            </h5>

            {/* Strikethrough Price: font-[500] text-[15px] text-[#d55b45] pl-2 line-through */}
            {hasDiscount && (
              <h4 className="font-[500] text-[14px] text-[#d55b45] pl-2 line-through tabular-nums">
                ${product.price.toFixed(2)}
              </h4>
            )}
          </div>

          {/* Sold Count from zip: font-[400] text-[15px] text-[#68d284] */}
          <span className="font-[500] text-[13px] text-[#68d284] tabular-nums">
            {soldCount} sold
          </span>
        </div>

        {/* Quick Add Button with zip styles.cart_button: bg-[#f63b60] */}
        <div className="pt-2">
          <button
            onClick={handleAdd}
            disabled={product.stock === 0}
            className={`w-full h-[36px] rounded-[18px] text-xs font-[600] flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs ${
              added
                ? 'bg-[#3bc177] text-white'
                : product.stock === 0
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-[#f63b60] hover:bg-[#e02b50] text-white'
            }`}
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Item Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 text-white" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
