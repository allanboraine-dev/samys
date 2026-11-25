'use client';

import React, { useState, useMemo } from 'react';
import { ProductCategory } from '@/types';
import { useApp } from '@/context/AppContext';
import { ProductCard } from './ProductCard';
import { Search, Flame, Sparkles, Filter, AlertCircle } from 'lucide-react';

const CATEGORIES: ProductCategory[] = [
  'All',
  "This Week's Specials",
  'Snacks & Chips',
  'Beverages',
  'Groceries & Staples',
  'Sweets & Confectionery',
  'Household',
];

export const CatalogSection: React.FC = () => {
  const { products, mode } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category match
      if (selectedCategory === "This Week's Specials") {
        if (!product.isMonthEndSpecial) {
          return false;
        }
      } else if (selectedCategory !== 'All' && product.category !== selectedCategory) {
        return false;
      }

      // Search match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesBrand = product.brand.toLowerCase().includes(query);
        const matchesCat = product.category.toLowerCase().includes(query);
        const matchesDesc = product.description.toLowerCase().includes(query);
        return matchesName || matchesBrand || matchesCat || matchesDesc;
      }

      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
      {/* Promotional Banner Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-10 mb-6 sm:mb-8 border border-slate-800 shadow-lg min-h-[220px] sm:min-h-[260px] flex items-center">
        <img
          src="/images/sammys-storefront.jpg"
          alt="Samy's Wholesalers Storefront in Kimberley"
          className="absolute inset-0 w-full h-full object-cover object-[center_18%] opacity-95"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-slate-950/15 pointer-events-none" />
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 bg-red-600/90 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider mb-2.5 shadow-sm">
              <Flame className="w-3.5 h-3.5 fill-white" />
              <span>Kimberley Month-End Wholesale Blast</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
              Big Brands. <span className="text-amber-400">Cash & Carry Prices.</span>
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
              Order online for fast-lane collection at Transvaal Road or bulk trader dispatch across Galeshewe, Roodepan, Greenpoint & Kimberley CBD.
            </p>
          </div>

          <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3.5 sm:p-4 text-xs flex flex-col gap-2 shrink-0">
            <div className="flex items-center justify-between gap-4 text-slate-300">
              <span className="font-semibold text-slate-400">Current Mode:</span>
              <span className={`font-black uppercase tracking-wider px-2 py-0.5 rounded text-[11px] ${
                mode === 'retail' ? 'bg-red-600 text-white' : 'bg-amber-500 text-slate-950'
              }`}>
                {mode === 'retail' ? 'Retail Click & Collect' : 'Trader Case & Quotes'}
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              {mode === 'retail' 
                ? '• Single units & packs • Reserve express pickup time slot' 
                : '• Pallets, bales & cases • Instant Pro-Forma quotes'}
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar + Quick Category Pills */}
      <div className="space-y-3 mb-6 sm:mb-8">
        {/* Search */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search maize meal, chips, cold drinks, washing powder, sweets..."
            className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills (Horizontal Scroll on Mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            const isSpecials = cat === "This Week's Specials";

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
                  isSelected
                    ? isSpecials
                      ? 'bg-red-600 text-white shadow-red-200'
                      : 'bg-slate-900 text-white shadow-slate-300'
                    : isSpecials
                    ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {isSpecials && <Flame className={`w-3.5 h-3.5 ${isSelected ? 'fill-white' : 'text-red-600'}`} />}
                {cat === 'All' && <Sparkles className="w-3.5 h-3.5" />}
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-4 text-xs font-semibold text-slate-600">
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>
            Showing <strong className="text-slate-900">{filteredProducts.length}</strong> wholesale items
            {selectedCategory !== 'All' && ` in "${selectedCategory}"`}
          </span>
        </div>
        <span className="text-slate-500 font-normal hidden sm:inline">
          Prices in ZAR (R) • 15% VAT Inclusive
        </span>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center my-8">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="font-bold text-slate-800 text-base">No wholesale items match your search</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search keyword or click &quot;All&quot; to view our full wholesale inventory.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="mt-4 bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-slate-800 transition"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
