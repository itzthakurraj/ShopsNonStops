import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { ProductCard } from './ProductCard.tsx';
import { Search, SlidersHorizontal, ArrowUpDown, Store, X, Heart } from 'lucide-react';

export const MarketplaceCatalog: React.FC = () => {
  const { 
    products, 
    shops, 
    selectedCategory, 
    setSelectedCategory, 
    searchQuery, 
    setSearchQuery,
    wishlist 
  } = useApp();

  const [selectedShopId, setSelectedShopId] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');
  const [priceMax, setPriceMax] = useState<number>(300);
  const [onlyWishlist, setOnlyWishlist] = useState<boolean>(false);

  const categories = ['All', 'Electronics', 'Fashion', 'Home & Living', 'Beauty'];

  // Filtering
  let filtered = products.filter((p) => {
    // Wishlist filter
    if (onlyWishlist && !wishlist.includes(p.id)) {
      return false;
    }
    // Category match
    if (selectedCategory !== 'All' && p.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }
    // Shop filter
    if (selectedShopId !== 'all' && p.shopId !== selectedShopId) {
      return false;
    }
    // Price filter
    const activePrice = p.discountPrice || p.price;
    if (activePrice > priceMax) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchShop = p.shopName.toLowerCase().includes(q);
      const matchTags = p.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchShop && !matchTags) return false;
    }
    return true;
  });

  // Sorting
  filtered.sort((a, b) => {
    const priceA = a.discountPrice || a.price;
    const priceB = b.discountPrice || b.price;
    if (sortBy === 'price-low') return priceA - priceB;
    if (sortBy === 'price-high') return priceB - priceA;
    if (sortBy === 'rating') return b.rating - a.rating;
    // default featured
    return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
  });

  const clearFilters = () => {
    setSelectedCategory('All');
    setSelectedShopId('all');
    setSearchQuery('');
    setPriceMax(300);
    setOnlyWishlist(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">
      {/* Catalog Title & Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Marketplace Catalog</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Showing {filtered.length} products across {selectedCategory === 'All' ? 'all departments' : selectedCategory}
            {onlyWishlist && <span className="text-rose-500 font-bold ml-1.5">(Wishlist Items Only)</span>}
          </p>
        </div>

        {/* Search & Sort Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search catalog or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:border-[#3957db] focus:ring-1 focus:ring-blue-100 outline-none"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer"
            >
              <option value="featured">Featured First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Filter Sidebar */}
        <div className="lg:col-span-3 space-y-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#3957db]" />
              <span>Filters</span>
            </h3>
            {(selectedCategory !== 'All' || selectedShopId !== 'all' || searchQuery || onlyWishlist) && (
              <button
                onClick={clearFilters}
                className="text-xs text-[#3957db] hover:text-[#1e3bb3] font-bold"
              >
                Reset All
              </button>
            )}
          </div>

          {/* Wishlist Quick Toggle */}
          <div className="pt-1">
            <button
              onClick={() => setOnlyWishlist(!onlyWishlist)}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-between border transition-all ${
                onlyWishlist
                  ? 'bg-rose-50 text-rose-600 border-rose-300'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <Heart className={`w-3.5 h-3.5 ${onlyWishlist ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                <span>My Wishlist ({wishlist.length})</span>
              </span>
              <span className="text-[10px] uppercase font-bold">{onlyWishlist ? 'Active' : 'Show'}</span>
            </button>
          </div>

          {/* Department / Category Filter */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-800 block">Department</span>
            <div className="flex flex-col gap-1 text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                    selectedCategory === cat
                      ? 'bg-blue-50 text-[#3957db] font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{cat}</span>
                  {selectedCategory === cat && <span className="w-2 h-2 rounded-full bg-[#3957db]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Seller / Store Filter */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-800 block">Vendor Store</span>
            <div className="flex flex-col gap-1 text-xs">
              <button
                onClick={() => setSelectedShopId('all')}
                className={`text-left px-3 py-2 rounded-lg transition-colors ${
                  selectedShopId === 'all'
                    ? 'bg-blue-50 text-[#3957db] font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                All Independent Sellers
              </button>
              {shops.map((shop) => (
                <button
                  key={shop.id}
                  onClick={() => setSelectedShopId(shop.id)}
                  className={`text-left px-3 py-2 rounded-lg transition-colors truncate flex items-center justify-between ${
                    selectedShopId === shop.id
                      ? 'bg-blue-50 text-[#3957db] font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{shop.name}</span>
                  <span className="text-[10px] text-amber-500 shrink-0 ml-1 font-semibold">★ {shop.rating}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Max Price Slider */}
          <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-800">Max Price</span>
              <span className="font-bold text-slate-900 tabular-nums">${priceMax}</span>
            </div>
            <input
              type="range"
              min="20"
              max="300"
              step="10"
              value={priceMax}
              onChange={(e) => setPriceMax(Number(e.target.value))}
              className="w-full accent-[#3957db] cursor-pointer"
            />
          </div>
        </div>

        {/* Right 9-Columns: Product Grid */}
        <div className="lg:col-span-9">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No matching products found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try widening your price range, clearing search filters, or exploring another department.
              </p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-[#3957db] hover:bg-[#1e3bb3] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
