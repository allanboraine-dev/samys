'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { 
  ShoppingCart, 
  Store, 
  Briefcase, 
  MapPin, 
  Phone, 
  Layers, 
  FileText 
} from 'lucide-react';

export const Header: React.FC = () => {
  const { mode, setMode, cartTotalCount, setIsCartOpen } = useApp();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-md border-b border-slate-800">
      {/* Top Banner Notice: Kimberley Location */}
      <div className="bg-slate-950 text-slate-300 text-[11px] sm:text-xs py-1 px-3 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate">
              Transvaal Road, Kimberley, Northern Cape | Mon–Sat: 07:30–17:30
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-emerald-400" />
              WhatsApp: 082 555 SAMY
            </span>
            <Link 
              href="/admin" 
              className={`hover:text-white transition flex items-center gap-1 ${
                pathname === '/admin' ? 'text-amber-400 font-semibold' : ''
              }`}
            >
              <Layers className="w-3 h-3" />
              Staff Dispatch
            </Link>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-red-600 flex items-center justify-center font-black text-white text-lg tracking-wider shadow-sm group-hover:bg-red-700 transition">
            S
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg tracking-tight leading-none text-white">
                SAMY&apos;S
              </span>
              <span className="bg-amber-500 text-slate-950 font-black text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded leading-none uppercase">
                Wholesalers
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium tracking-wide">
              Cash & Carry • Kimberley
            </span>
          </div>
        </Link>

        {/* Desktop / Tablet Nav Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-xs font-semibold">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-md transition ${
              pathname === '/'
                ? 'bg-slate-800 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Catalog & Specials
          </Link>
          <Link
            href="/trader-portal"
            className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
              pathname === '/trader-portal'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            Trader Portal & Reorders
          </Link>
          <Link
            href="/admin"
            className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
              pathname === '/admin'
                ? 'bg-red-600/20 text-red-400 border border-red-600/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Store Dispatch Board
          </Link>
        </nav>

        {/* Right Actions: Cart Trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCartOpen(true)}
            aria-label="Open Shopping Cart"
            className="relative flex items-center gap-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white px-3 sm:px-4 py-2 rounded-xl text-sm font-semibold transition border border-slate-700 shadow-sm"
          >
            <ShoppingCart className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Cart</span>
            {cartTotalCount > 0 ? (
              <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                {cartTotalCount}
              </span>
            ) : (
              <span className="text-xs text-slate-400">0</span>
            )}
          </button>
        </div>
      </div>

      {/* Prominent Buying Mode Switcher (Feature #1) */}
      <div className="bg-slate-850 bg-[#162033] border-t border-slate-800 px-3 py-2">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              Active Buying Mode:
            </span>
            <div className="sm:hidden flex items-center gap-2 text-xs">
              <Link href="/trader-portal" className="text-amber-400 underline text-[11px]">
                Reorder Hub
              </Link>
              <span className="text-slate-600">•</span>
              <Link href="/admin" className="text-slate-400 text-[11px]">
                Staff
              </Link>
            </div>
          </div>

          {/* Toggle pill button */}
          <div className="w-full sm:w-auto inline-flex p-1 bg-slate-900 rounded-xl border border-slate-700/80 shadow-inner">
            <button
              type="button"
              onClick={() => setMode('retail')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'retail'
                  ? 'bg-slate-100 text-slate-900 shadow-md scale-[1.01]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Store className={`w-3.5 h-3.5 ${mode === 'retail' ? 'text-red-600' : ''}`} />
              <span>Retail Shopper <span className="font-normal opacity-80">(Click & Collect)</span></span>
            </button>

            <button
              type="button"
              onClick={() => setMode('trader')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'trader'
                  ? 'bg-amber-500 text-slate-950 shadow-md scale-[1.01]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Briefcase className={`w-3.5 h-3.5 ${mode === 'trader' ? 'text-slate-950' : 'text-amber-400'}`} />
              <span>Trader / Bulk Mode <span className="font-normal opacity-90">(Cases & Quotes)</span></span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
