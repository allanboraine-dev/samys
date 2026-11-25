'use client';

import React from 'react';
import { Product } from '@/types';
import { useApp } from '@/context/AppContext';
import { ProductImage } from './ProductImage';
import { Plus, Check, Flame, TrendingDown, PackageCheck } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { mode, addToCart, cart } = useApp();

  const currentCartQuantity = cart
    .filter((item) => item.product.id === product.id && item.mode === mode)
    .reduce((sum, item) => sum + item.quantity, 0);

  // Per-unit breakdown in trader mode
  const perUnitTraderPrice = (
    product.traderCasePrice / product.caseUnitsCount
  ).toFixed(2);

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
      <div>
        {/* Fixed Aspect Ratio Image Container */}
        <div className="relative aspect-square w-full overflow-hidden rounded-t-2xl bg-slate-100 border-b border-slate-100">
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            category={product.category}
          />

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
            {product.isMonthEndSpecial && (
              <span className="inline-flex items-center gap-1 bg-red-600 text-white font-extrabold text-[10px] sm:text-xs px-2 py-0.5 rounded-md shadow uppercase tracking-wide">
                <Flame className="w-3 h-3 fill-white" />
                Month-End Special
              </span>
            )}
            {product.badge && !product.isMonthEndSpecial && (
              <span className="inline-flex items-center bg-slate-900/90 backdrop-blur-sm text-amber-400 font-bold text-[10px] px-2 py-0.5 rounded shadow">
                {product.badge}
              </span>
            )}
          </div>

          {/* Stock Indicator */}
          {!product.inStock ? (
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center z-20">
              <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Out of Stock
              </span>
            </div>
          ) : (
            typeof product.stockQuantity === 'number' &&
            product.stockQuantity <= 10 && (
              <div className="absolute bottom-2.5 left-2.5 z-10">
                <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded shadow uppercase tracking-wide">
                  Only {product.stockQuantity} left
                </span>
              </div>
            )
          )}
        </div>

        {/* Product Details */}
        <div className="p-3.5 sm:p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
            <span className="uppercase tracking-wider font-bold text-slate-400 text-[10px]">
              {product.brand}
            </span>
            <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {product.category}
            </span>
          </div>

          <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-1 mt-1">
            {product.description}
          </p>

          {/* Pricing Section (Dynamically switches between Retail & Trader) */}
          <div className="mt-3 pt-3 border-t border-slate-100 min-h-[4rem] flex flex-col justify-center">
            {mode === 'retail' ? (
              /* Retail Mode */
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                    R{product.retailPrice.toFixed(2)}
                  </span>
                  {product.retailOldPrice && (
                    <span className="text-xs sm:text-sm text-slate-400 line-through font-semibold">
                      R{product.retailOldPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                  <span>Unit:</span>
                  <span className="font-semibold text-slate-700">{product.retailUnit}</span>
                </div>
              </div>
            ) : (
              /* Trader Bulk Mode */
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl sm:text-2xl font-black text-amber-600 tracking-tight">
                    R{product.traderCasePrice.toFixed(2)}
                  </span>
                  {product.traderOldCasePrice && (
                    <span className="text-xs sm:text-sm text-slate-400 line-through font-semibold">
                      R{product.traderOldCasePrice.toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-0.5 flex-wrap gap-1">
                  <span className="text-[11px] font-semibold text-slate-700 bg-amber-50 text-amber-900 px-1.5 py-0.5 rounded border border-amber-200">
                    {product.caseUnit}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-0.5">
                    <TrendingDown className="w-3 h-3" />
                    R{perUnitTraderPrice}/unit
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-3.5 sm:p-4 pt-0">
        <button
          onClick={() => addToCart(product, 1)}
          disabled={!product.inStock}
          className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm ${
            !product.inStock
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : mode === 'retail'
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800'
          }`}
        >
          {currentCartQuantity > 0 ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>
                {mode === 'retail' ? '+ Add Unit' : '+ Add Case'}{' '}
                <span className="opacity-90">({currentCartQuantity} in cart)</span>
              </span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>{mode === 'retail' ? '+ Add Unit' : '+ Add Case'}</span>
            </>
          )}
        </button>

        {mode === 'trader' && (
          <div className="mt-1.5 text-center text-[10px] text-slate-500 font-medium flex items-center justify-center gap-1">
            <PackageCheck className="w-3 h-3 text-slate-400" />
            <span>Eligible for Pallet & Dispatch Lane</span>
          </div>
        )}
      </div>
    </div>
  );
};
