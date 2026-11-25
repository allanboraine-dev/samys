'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Order } from '@/types';
import { ProFormaQuoteModal } from '@/components/ProFormaQuoteModal';
import { 
  Building2, 
  RotateCcw, 
  FileCheck, 
  Clock, 
  MapPin, 
  Truck, 
  CheckCircle, 
  ShoppingBag, 
  ArrowLeft, 
  BadgePercent, 
  PhoneCall, 
  FileText 
} from 'lucide-react';

export default function TraderPortalPage() {
  const { orders, reorderItems, setMode } = useApp();
  const [selectedQuote, setSelectedQuote] = useState<Order | null>(null);
  const [registered, setRegistered] = useState(false);

  // Filter trader orders
  const traderOrders = orders.filter((o) => o.type === 'trader_bulk');

  const handleReorder = (order: Order) => {
    setMode('trader');
    reorderItems(order.items);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white border-b border-slate-800 py-6 sm:py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white mb-2 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Catalog
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Trader Reorder &amp; Quotes Portal
              </h1>
              <span className="bg-amber-500 text-slate-950 text-xs font-black px-2 py-0.5 rounded uppercase">
                B2B Bulk
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              One-click restocking for Spaza shops, tuck-shops, bakeries, and Kimberley wholesale buyers.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/80 p-3 rounded-2xl border border-slate-700/80">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl">
              <BadgePercent className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <div className="text-slate-400">Direct Cash &amp; Carry Trader Lane:</div>
              <div className="font-bold text-white">Transvaal Road Loading Bay</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Past Orders and Active Quotes */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-600" />
              <span>Trader Past Orders &amp; Saved Quotes ({traderOrders.length})</span>
            </h2>
            <span className="text-xs text-slate-500">Includes active demo orders</span>
          </div>

          {traderOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
              <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="font-bold text-slate-800 text-sm">No trader orders found</h3>
              <p className="text-xs text-slate-500 mt-1">
                Switch to Trader Mode in the top header and add cases to submit your first wholesale bulk order.
              </p>
            </div>
          ) : (
            traderOrders.map((order) => {
              const trader = order.traderDetails;
              const isQuote = trader?.isQuoteOnly || order.orderNumber.startsWith('QUO');

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 p-4 sm:p-5 shadow-sm transition space-y-3"
                >
                  {/* Order header row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {order.orderNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          order.status === 'Ready for Collection'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'Collected'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.status}
                      </span>
                      {isQuote && (
                        <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded">
                          72h Quote
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(order.createdAt).toLocaleDateString('en-ZA')}</span>
                    </div>
                  </div>

                  {/* Business info */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="font-bold text-slate-800 text-sm block">
                        {trader?.businessName || 'Kimberley Trader'}
                      </span>
                      <div className="text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>Contact: {trader?.contactPerson}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-slate-600">
                          <MapPin className="w-3 h-3 text-red-500" />
                          {trader?.area}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-slate-600">
                      <Truck className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium">{trader?.fulfillment}</span>
                    </div>
                  </div>

                  {/* Item preview */}
                  <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1">
                    <span className="font-bold text-slate-500 uppercase text-[10px] block">
                      Case Items ({order.items.length})
                    </span>
                    <div className="space-y-1">
                      {order.items.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex justify-between text-slate-700">
                          <span className="truncate pr-2">
                            {item.quantity}x {item.productName} ({item.unitType})
                          </span>
                          <span className="font-mono font-semibold shrink-0">
                            R{item.lineTotal.toFixed(2)}
                          </span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="text-[11px] text-slate-400 italic">
                          + {order.items.length - 3} additional case items...
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Total & Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">
                        Total Payable (15% VAT incl.)
                      </div>
                      <div className="text-lg font-black text-slate-900 font-mono">
                        R{order.total.toFixed(2)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedQuote(order)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2 px-3 rounded-xl flex items-center gap-1.5 transition active:scale-95"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Invoice</span>
                      </button>

                      <button
                        onClick={() => handleReorder(order)}
                        className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 transition active:scale-95 shadow-sm"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reorder All Items</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Col: Quick Trader Registration & Hotline */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-100 text-red-600 rounded-xl">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm">
                  Register Trader Account
                </h3>
                <p className="text-[11px] text-slate-500">
                  Pre-register your Spaza/Shop for 30-day trader terms &amp; direct bakkie dispatch.
                </p>
              </div>
            </div>

            {registered ? (
              <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 text-xs text-emerald-800 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Account Registered!
                </div>
                <p className="text-[11px]">
                  Our wholesale rep will verify your store via WhatsApp within 2 hours.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setRegistered(true);
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Store / Spaza Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Galeshewe Express Supermarket"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Owner / Manager Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sipho Ndlovu"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    WhatsApp Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 073 555 4192"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Store Location / Suburb
                  </label>
                  <select className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500">
                    <option>Galeshewe</option>
                    <option>Roodepan</option>
                    <option>Greenpoint</option>
                    <option>Kimberley CBD</option>
                    <option>Beaconsfield</option>
                    <option>Other Northern Cape area</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-amber-400 font-black text-xs py-2.5 px-3 rounded-xl transition active:scale-95 shadow-sm"
                >
                  Activate Trader Status
                </button>
              </form>
            )}
          </div>

          {/* Wholesale Help Card */}
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-5 text-slate-950 shadow-sm space-y-3">
            <h4 className="font-black text-sm">Need Pallet / Full Truckload Quotes?</h4>
            <p className="text-xs leading-relaxed text-amber-950 font-medium">
              Call our Transvaal Road wholesale trading desk directly for bulk sugar, maize, and cooking oil container loads.
            </p>
            <a
              href="tel:0538329900"
              className="inline-flex items-center gap-2 bg-slate-950 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-slate-800 transition"
            >
              <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
              <span>Call 053 832 9900</span>
            </a>
          </div>
        </div>
      </div>

      {/* Quote Preview Modal if selected */}
      {selectedQuote && (
        <ProFormaQuoteModal
          order={selectedQuote}
          onClose={() => setSelectedQuote(null)}
        />
      )}
    </div>
  );
}
