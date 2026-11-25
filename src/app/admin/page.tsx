'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Order, OrderStatus } from '@/types';
import { 
  Layers, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  Truck, 
  User, 
  Phone, 
  MapPin, 
  Flame, 
  Check, 
  ShoppingBag, 
  Store, 
  Building2, 
  Package, 
  RefreshCw 
} from 'lucide-react';

const STATUS_STEPS: OrderStatus[] = [
  'New',
  'Picking',
  'Ready for Collection',
  'Collected',
];

export default function AdminPage() {
  const {
    orders,
    updateOrderStatus,
    products,
    toggleProductStock,
    toggleProductPromo,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'retail' | 'trader' | 'inventory'>('retail');

  // Filter orders by queue
  const retailOrders = orders.filter((o) => o.type === 'retail_click_collect');
  const traderOrders = orders.filter((o) => o.type === 'trader_bulk');

  const advanceStatus = (order: Order) => {
    const currentIndex = STATUS_STEPS.indexOf(order.status);
    if (currentIndex < STATUS_STEPS.length - 1) {
      updateOrderStatus(order.id, STATUS_STEPS[currentIndex + 1]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      {/* Admin Top Header */}
      <div className="bg-slate-900 text-white border-b border-slate-800 py-5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white mb-2 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Storefront
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                Samy&apos;s Store Picker &amp; Dispatch Console
              </h1>
              <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                Staff Only
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Transvaal Road Floor Staff • Live Order Routing, Picking, and Express Counter Dispatch
            </p>
          </div>

          {/* Quick Counter Stats */}
          <div className="flex items-center gap-2 text-xs">
            <div className="bg-slate-800 px-3 py-2 rounded-xl border border-slate-700">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                Retail Click &amp; Collect
              </span>
              <span className="text-base font-black text-amber-400">
                {retailOrders.filter((o) => o.status !== 'Collected').length} Pending
              </span>
            </div>
            <div className="bg-slate-800 px-3 py-2 rounded-xl border border-slate-700">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                Trader Bulk Lanes
              </span>
              <span className="text-base font-black text-emerald-400">
                {traderOrders.filter((o) => o.status !== 'Collected').length} In Dispatch
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab('retail')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition ${
              activeTab === 'retail'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Retail Click &amp; Collect Queue ({retailOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('trader')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition ${
              activeTab === 'trader'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Trader Bulk Dispatch &amp; Quotes ({traderOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition ${
              activeTab === 'inventory'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Stock &amp; Specials Manager ({products.length})</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="py-6">
          {activeTab === 'retail' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {STATUS_STEPS.map((status) => {
                const columnOrders = retailOrders.filter((o) => o.status === status);
                return (
                  <div
                    key={status}
                    className="bg-slate-200/70 rounded-2xl p-3 flex flex-col gap-3 min-h-[450px]"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-300">
                      <h3 className="font-black text-slate-800 text-xs sm:text-sm uppercase tracking-wide">
                        {status}
                      </h3>
                      <span className="bg-slate-300 text-slate-800 font-bold text-xs px-2 py-0.5 rounded-full font-mono">
                        {columnOrders.length}
                      </span>
                    </div>

                    <div className="space-y-3 flex-1 overflow-y-auto">
                      {columnOrders.map((order) => {
                        const ret = order.retailDetails;
                        return (
                          <div
                            key={order.id}
                            className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200 space-y-2.5 text-xs"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-mono font-bold text-slate-900">
                                {order.orderNumber}
                              </span>
                              <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded font-mono text-[11px]">
                                PIN: {ret?.collectionPin}
                              </span>
                            </div>

                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1">
                                <User className="w-3.5 h-3.5 text-slate-400" />
                                {ret?.customerName}
                              </div>
                              <div className="text-slate-500 flex items-center gap-1 mt-0.5">
                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                {ret?.whatsappNumber}
                              </div>
                              <div className="text-slate-600 flex items-center gap-1 mt-0.5 font-medium">
                                <Clock className="w-3.5 h-3.5 text-red-500" />
                                {ret?.pickupSlot}
                              </div>
                            </div>

                            {/* Substitution Note */}
                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-[11px]">
                              <span className="text-slate-400 font-semibold block">
                                Substitution Preference:
                              </span>
                              <span className="text-slate-700 font-medium">
                                {ret?.substitutionPreference}
                              </span>
                            </div>

                            {/* Item Count & Total */}
                            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                              <span className="text-slate-500">
                                {order.items.reduce((sum, i) => sum + i.quantity, 0)} items
                              </span>
                              <span className="font-black font-mono text-slate-900">
                                R{order.total.toFixed(2)}
                              </span>
                            </div>

                            {/* Action to advance status */}
                            {status !== 'Collected' && (
                              <button
                                onClick={() => advanceStatus(order)}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 rounded-lg transition flex items-center justify-center gap-1.5 active:scale-95"
                              >
                                <span>Advance to</span>
                                <strong className="text-amber-400">
                                  {STATUS_STEPS[STATUS_STEPS.indexOf(status) + 1]}
                                </strong>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'trader' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {STATUS_STEPS.map((status) => {
                const columnOrders = traderOrders.filter((o) => o.status === status);
                return (
                  <div
                    key={status}
                    className="bg-slate-200/70 rounded-2xl p-3 flex flex-col gap-3 min-h-[450px]"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-300">
                      <h3 className="font-black text-slate-800 text-xs sm:text-sm uppercase tracking-wide">
                        {status}
                      </h3>
                      <span className="bg-slate-300 text-slate-800 font-bold text-xs px-2 py-0.5 rounded-full font-mono">
                        {columnOrders.length}
                      </span>
                    </div>

                    <div className="space-y-3 flex-1 overflow-y-auto">
                      {columnOrders.map((order) => {
                        const trd = order.traderDetails;
                        const isQuote = trd?.isQuoteOnly || order.orderNumber.startsWith('QUO');

                        return (
                          <div
                            key={order.id}
                            className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200 space-y-2.5 text-xs"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-mono font-bold text-slate-900">
                                {order.orderNumber}
                              </span>
                              {isQuote ? (
                                <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded text-[10px]">
                                  PRO-FORMA QUOTE
                                </span>
                              ) : (
                                <span className="bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded text-[10px]">
                                  BULK ORDER
                                </span>
                              )}
                            </div>

                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1 text-sm">
                                <Building2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                {trd?.businessName}
                              </div>
                              <div className="text-slate-500 mt-0.5">
                                Rep: {trd?.contactPerson} ({trd?.whatsappNumber})
                              </div>
                              <div className="text-slate-600 flex items-center gap-1 mt-0.5 font-medium">
                                <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                                {trd?.area} • {trd?.fulfillment}
                              </div>
                            </div>

                            {/* Items count */}
                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-[11px] space-y-1">
                              <span className="text-slate-400 font-semibold block">
                                Case Packing:
                              </span>
                              <div className="font-medium text-slate-700">
                                {order.items.length} wholesale lines (
                                {order.items.reduce((s, i) => s + i.quantity, 0)} total cases)
                              </div>
                            </div>

                            {/* Total */}
                            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                              <span className="text-slate-500">Invoice Total</span>
                              <span className="font-black font-mono text-slate-900 text-sm">
                                R{order.total.toFixed(2)}
                              </span>
                            </div>

                            {/* Advance */}
                            {status !== 'Collected' && (
                              <button
                                onClick={() => advanceStatus(order)}
                                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs py-2 rounded-lg transition flex items-center justify-center gap-1.5 active:scale-95 shadow-sm"
                              >
                                <span>Advance to</span>
                                <strong>
                                  {STATUS_STEPS[STATUS_STEPS.indexOf(status) + 1]}
                                </strong>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Samy&apos;s Store Product Catalog &amp; Promo Switcher
                  </h3>
                  <p className="text-xs text-slate-500">
                    Floor supervisors can toggle items in/out of stock or activate &quot;Month-End Special&quot; promo banners in real-time.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                      <th className="p-3">Product Name</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Retail Price</th>
                      <th className="p-3">Trader Case Price</th>
                      <th className="p-3 text-center">Stock Status</th>
                      <th className="p-3 text-center">Promo Badge</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-bold text-slate-900">
                          {p.name}
                          <span className="block text-[10px] font-normal text-slate-400">
                            {p.brand}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600">{p.category}</td>
                        <td className="p-3 font-mono font-semibold text-slate-900">
                          R{p.retailPrice.toFixed(2)}
                        </td>
                        <td className="p-3 font-mono font-bold text-amber-700">
                          R{p.traderCasePrice.toFixed(2)}{' '}
                          <span className="text-[10px] text-slate-500">({p.caseUnit})</span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => toggleProductStock(p.id)}
                            className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase transition ${
                              p.inStock
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-red-100 hover:text-red-800'
                                : 'bg-red-100 text-red-800 hover:bg-emerald-100 hover:text-emerald-800'
                            }`}
                          >
                            {p.inStock ? 'In Stock (Click to Disable)' : 'Out of Stock (Click to Enable)'}
                          </button>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => toggleProductPromo(p.id)}
                            className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase flex items-center gap-1 mx-auto transition ${
                              p.isMonthEndSpecial
                                ? 'bg-red-600 text-white'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            <Flame className="w-3 h-3" />
                            <span>
                              {p.isMonthEndSpecial ? 'Month-End Promo Active' : 'Regular Price'}
                            </span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
