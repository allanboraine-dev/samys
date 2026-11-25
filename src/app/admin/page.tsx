'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { ProductModal } from '@/components/ProductModal';
import { CsvImportModal } from '@/components/CsvImportModal';
import { Order, OrderStatus, Product } from '@/types';
import { 
  ArrowLeft, 
  Clock, 
  User, 
  Phone, 
  MapPin, 
  Flame, 
  Store, 
  Building2, 
  Package,
  Plus,
  Minus,
  Pencil,
  Trash2,
  Lock,
  LogOut,
  ShieldAlert,
  FileSpreadsheet,
  Archive,
  RotateCcw,
  Search
} from 'lucide-react';

const STATUS_STEPS: OrderStatus[] = [
  'New',
  'Picking',
  'Ready for Collection',
  'Collected',
];

const ACTIVE_STATUS_STEPS: OrderStatus[] = [
  'New',
  'Picking',
  'Ready for Collection',
];

function OrderPickingList({
  order,
  pickedKeys,
  onToggleItem,
}: {
  order: Order;
  pickedKeys: Record<string, boolean>;
  onToggleItem: (key: string) => void;
}) {
  const pickedCount = order.items.filter(
    (_, idx) => pickedKeys[`${order.id}-${idx}`]
  ).length;

  return (
    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-[11px] space-y-1.5">
      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wide text-slate-500 pb-1 border-b border-slate-200/70">
        <span>Picking List</span>
        <span className="font-mono text-slate-700">
          {pickedCount}/{order.items.length} picked
        </span>
      </div>
      <ul className="space-y-1.5 max-h-44 overflow-y-auto pr-0.5">
        {order.items.map((item, idx) => {
          const key = `${order.id}-${idx}`;
          const isPicked = Boolean(pickedKeys[key]);
          return (
            <li key={key}>
              <label className="flex items-start gap-2 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  checked={isPicked}
                  onChange={() => onToggleItem(key)}
                  className="mt-0.5 w-3.5 h-3.5 rounded accent-emerald-600 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div
                    className={`font-bold leading-snug ${
                      isPicked ? 'line-through text-slate-400' : 'text-slate-900'
                    }`}
                  >
                    <span className="inline-block bg-slate-200 text-slate-900 font-mono font-black px-1.5 py-0.2 rounded mr-1 text-[10px]">
                      {item.quantity}x
                    </span>
                    {item.productName}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-0.5">
                    <span className="truncate">{item.unitType}</span>
                    <span className="font-mono font-semibold text-slate-700 ml-2 shrink-0">
                      R{item.lineTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function buildWhatsAppNotifyUrl(order: Order): string | null {
  const rawPhone =
    order.retailDetails?.whatsappNumber || order.traderDetails?.whatsappNumber;
  if (!rawPhone) return null;

  const digits = rawPhone.replace(/\D/g, '');
  if (!digits) return null;
  const intlPhone = digits.startsWith('0') ? `27${digits.slice(1)}` : digits;

  const pinText = order.retailDetails?.collectionPin
    ? ` Collection PIN: ${order.retailDetails.collectionPin}.`
    : '';
  const text = `Hi from Samy's Wholesalers (Kimberley)! Your order ${order.orderNumber} status is now: ${order.status}.${pinText} Total: R${order.total.toFixed(2)}.`;
  return `https://wa.me/${intlPhone}?text=${encodeURIComponent(text)}`;
}

export default function AdminPage() {
  const {
    orders,
    updateOrderStatus,
    clearCompletedOrders,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    importProductsFromCsv,
    updateProductStockQuantity,
    toggleProductStock,
    toggleProductPromo,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'retail' | 'trader' | 'archive' | 'inventory'>('retail');
  const [archiveSearch, setArchiveSearch] = useState('');
  const [confirmClearArchive, setConfirmClearArchive] = useState(false);
  const [pickedItems, setPickedItems] = useState<Record<string, boolean>>({});

  const togglePickedItem = (key: string) => {
    setPickedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getPickingProgress = (order: Order) => {
    const picked = order.items.filter((_, idx) => pickedItems[`${order.id}-${idx}`]).length;
    const total = order.items.length;
    return { picked, total, allPicked: total === 0 || picked === total };
  };
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [authStatus, setAuthStatus] = useState<'checking' | 'locked' | 'authenticated'>('checking');
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('/api/admin-auth')
      .then((res) => res.json())
      .then((data: { authenticated?: boolean }) => {
        if (active) {
          setAuthStatus(data.authenticated ? 'authenticated' : 'locked');
        }
      })
      .catch(() => {
        if (active) setAuthStatus('locked');
      });
    return () => {
      active = false;
    };
  }, []);

  const handleManagerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsSubmittingAuth(true);
    try {
      const res = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });
      const data = (await res.json()) as { authenticated?: boolean; error?: string };
      if (res.ok && data.authenticated) {
        setAuthStatus('authenticated');
        setPasscode('');
      } else {
        setAuthError(data.error || 'Invalid manager passcode.');
      }
    } catch {
      setAuthError('Unable to verify passcode. Please try again.');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleManagerLogout = async () => {
    await fetch('/api/admin-auth', { method: 'DELETE' });
    setAuthStatus('locked');
  };

  // Filter orders by queue (active boards exclude Collected; Collected moves to Archive)
  const retailOrders = orders.filter(
    (o) => o.type === 'retail_click_collect' && o.status !== 'Collected'
  );
  const traderOrders = orders.filter(
    (o) => o.type === 'trader_bulk' && o.status !== 'Collected'
  );
  const completedOrders = orders.filter((o) => o.status === 'Collected');
  const filteredCompletedOrders = completedOrders.filter((o) => {
    if (!archiveSearch.trim()) return true;
    const q = archiveSearch.toLowerCase();
    const customer = o.retailDetails?.customerName || o.traderDetails?.businessName || '';
    const phone = o.retailDetails?.whatsappNumber || o.traderDetails?.whatsappNumber || '';
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      customer.toLowerCase().includes(q) ||
      phone.toLowerCase().includes(q)
    );
  });

  const advanceStatus = (order: Order) => {
    const currentIndex = STATUS_STEPS.indexOf(order.status);
    if (currentIndex < STATUS_STEPS.length - 1) {
      updateOrderStatus(order.id, STATUS_STEPS[currentIndex + 1]);
    }
  };

  if (authStatus === 'checking') {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm text-center text-xs font-semibold text-slate-500">
          Verifying manager session...
        </div>
      </div>
    );
  }

  if (authStatus === 'locked') {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="bg-slate-900 text-white p-6 border-b border-slate-800">
            <div className="w-11 h-11 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center mb-3">
              <Lock className="w-5 h-5 text-red-400" />
            </div>
            <h1 className="text-lg font-black tracking-tight">
              Manager Access Required
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Only authorized Samy&apos;s Wholesalers managers can access stock controls and dispatch queues.
            </p>
          </div>

          <form onSubmit={handleManagerLogin} className="p-6 space-y-4 text-xs">
            {authError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 font-semibold px-3 py-2.5 rounded-xl">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Manager Passcode
              </label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter manager passcode"
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                autoFocus
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingAuth}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-black text-sm py-2.5 rounded-xl transition shadow-sm"
            >
              {isSubmittingAuth ? 'Verifying...' : 'Unlock Manager Console'}
            </button>

            <div className="pt-2 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Storefront
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

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
            <button
              type="button"
              onClick={handleManagerLogout}
              className="bg-slate-800 hover:bg-red-600/20 hover:border-red-500/50 hover:text-red-300 text-slate-300 px-3 py-2.5 rounded-xl border border-slate-700 font-bold flex items-center gap-1.5 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Lock</span>
            </button>
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

          <button
            onClick={() => setActiveTab('archive')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition ${
              activeTab === 'archive'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Archive className="w-4 h-4" />
            <span>Completed Archive ({completedOrders.length})</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="py-6">
          {activeTab === 'retail' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ACTIVE_STATUS_STEPS.map((status) => {
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

                            {/* Picking List */}
                            <OrderPickingList
                              order={order}
                              pickedKeys={pickedItems}
                              onToggleItem={togglePickedItem}
                            />

                            {/* Item Count & Total */}
                            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                              <span className="text-slate-500">
                                {order.items.reduce((sum, i) => sum + i.quantity, 0)} items
                              </span>
                              <span className="font-black font-mono text-slate-900">
                                R{order.total.toFixed(2)}
                              </span>
                            </div>

                            {/* Action to advance status + Notify Customer */}
                            {status !== 'Collected' && (() => {
                              const { picked, total, allPicked } = getPickingProgress(order);
                              const blockedByPicking = status === 'Picking' && !allPicked;
                              return (
                                <button
                                  type="button"
                                  disabled={blockedByPicking}
                                  onClick={() => advanceStatus(order)}
                                  className={`w-full font-bold text-xs py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
                                    blockedByPicking
                                      ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                                      : 'bg-slate-900 hover:bg-slate-800 text-white active:scale-95'
                                  }`}
                                >
                                  {blockedByPicking ? (
                                    <span>Check all items ({picked}/{total}) to advance</span>
                                  ) : (
                                    <>
                                      <span>Advance to</span>
                                      <strong className="text-amber-400">
                                        {STATUS_STEPS[STATUS_STEPS.indexOf(status) + 1]}
                                      </strong>
                                    </>
                                  )}
                                </button>
                              );
                            })()}
                            {buildWhatsAppNotifyUrl(order) && (
                              <a
                                href={buildWhatsAppNotifyUrl(order) ?? '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[11px] py-1.5 rounded-lg transition flex items-center justify-center gap-1.5"
                              >
                                <Phone className="w-3 h-3" />
                                <span>WhatsApp Customer ({order.status})</span>
                              </a>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ACTIVE_STATUS_STEPS.map((status) => {
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

                            {/* Case Packing & Picking List */}
                            <OrderPickingList
                              order={order}
                              pickedKeys={pickedItems}
                              onToggleItem={togglePickedItem}
                            />

                            {/* Total */}
                            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                              <span className="text-slate-500">Invoice Total</span>
                              <span className="font-black font-mono text-slate-900 text-sm">
                                R{order.total.toFixed(2)}
                              </span>
                            </div>

                            {/* Advance + Notify Customer */}
                            {status !== 'Collected' && (() => {
                              const { picked, total, allPicked } = getPickingProgress(order);
                              const blockedByPicking = status === 'Picking' && !allPicked;
                              return (
                                <button
                                  type="button"
                                  disabled={blockedByPicking}
                                  onClick={() => advanceStatus(order)}
                                  className={`w-full font-black text-xs py-2 rounded-lg transition flex items-center justify-center gap-1.5 shadow-sm ${
                                    blockedByPicking
                                      ? 'bg-slate-200 text-slate-500 cursor-not-allowed shadow-none'
                                      : 'bg-amber-500 hover:bg-amber-600 text-slate-950 active:scale-95'
                                  }`}
                                >
                                  {blockedByPicking ? (
                                    <span>Check all items ({picked}/{total}) to advance</span>
                                  ) : (
                                    <>
                                      <span>Advance to</span>
                                      <strong>
                                        {STATUS_STEPS[STATUS_STEPS.indexOf(status) + 1]}
                                      </strong>
                                    </>
                                  )}
                                </button>
                              );
                            })()}
                            {buildWhatsAppNotifyUrl(order) && (
                              <a
                                href={buildWhatsAppNotifyUrl(order) ?? '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[11px] py-1.5 rounded-lg transition flex items-center justify-center gap-1.5"
                              >
                                <Phone className="w-3 h-3" />
                                <span>WhatsApp Trader ({order.status})</span>
                              </a>
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

          {activeTab === 'archive' && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Completed &amp; Paid Orders Archive
                  </h3>
                  <p className="text-xs text-slate-500">
                    Orders marked as Collected &amp; Paid move here automatically to keep live dispatch boards uncluttered.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={archiveSearch}
                      onChange={(e) => setArchiveSearch(e.target.value)}
                      placeholder="Search order #, name, phone..."
                      className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  {completedOrders.length > 0 && (
                    confirmClearArchive ? (
                      <div className="inline-flex items-center gap-1.5 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            clearCompletedOrders();
                            setConfirmClearArchive(false);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
                        >
                          Confirm Clear All
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmClearArchive(false)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-200 text-slate-700 font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmClearArchive(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Clear Archive</span>
                      </button>
                    )
                  )}
                </div>
              </div>

              {filteredCompletedOrders.length === 0 ? (
                <div className="p-10 text-center text-xs text-slate-500">
                  No completed orders in the archive.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                        <th className="p-3">Order #</th>
                        <th className="p-3">Channel</th>
                        <th className="p-3">Customer / Business</th>
                        <th className="p-3">Items</th>
                        <th className="p-3">Total Paid</th>
                        <th className="p-3">Date</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredCompletedOrders.map((order) => {
                        const customerName =
                          order.retailDetails?.customerName ||
                          order.traderDetails?.businessName ||
                          'Customer';
                        const phone =
                          order.retailDetails?.whatsappNumber ||
                          order.traderDetails?.whatsappNumber ||
                          '';
                        return (
                          <tr key={order.id} className="hover:bg-slate-50/50">
                            <td className="p-3 font-mono font-bold text-slate-900">
                              {order.orderNumber}
                            </td>
                            <td className="p-3">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                  order.type === 'retail_click_collect'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-amber-100 text-amber-900'
                                }`}
                              >
                                {order.type === 'retail_click_collect' ? 'Retail' : 'Trader Bulk'}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="font-bold text-slate-900">{customerName}</div>
                              {phone && <div className="text-[11px] text-slate-500">{phone}</div>}
                            </td>
                            <td className="p-3 text-slate-600 max-w-xs">
                              <div className="font-semibold text-slate-800">
                                {order.items.reduce((s, i) => s + i.quantity, 0)} unit(s)
                              </div>
                              <div className="text-[11px] text-slate-500 truncate">
                                {order.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                              </div>
                            </td>
                            <td className="p-3 font-mono font-black text-emerald-700">
                              R{order.total.toFixed(2)}
                            </td>
                            <td className="p-3 text-slate-500">
                              {new Date(order.createdAt).toLocaleDateString('en-ZA')}
                            </td>
                            <td className="p-3 text-right">
                              <button
                                type="button"
                                onClick={() => updateOrderStatus(order.id, 'Ready for Collection')}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Reopen</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
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
                    Add, edit, or remove products, adjust numeric stock levels, or toggle &quot;Month-End Special&quot; promo banners in real-time.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCsvModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 text-xs font-bold shadow-xs transition active:scale-95"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Import / Export CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProduct(null);
                      setIsProductModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Product</span>
                  </button>
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
                      <th className="p-3 text-center">Stock Qty</th>
                      <th className="p-3 text-center">Stock Status</th>
                      <th className="p-3 text-center">Promo Badge</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map((p) => {
                      const qty = p.stockQuantity ?? (p.inStock ? 50 : 0);
                      return (
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
                          <div className="inline-flex items-center bg-white border border-slate-300 rounded-lg overflow-hidden shadow-xs">
                            <button
                              type="button"
                              aria-label={`Decrease stock for ${p.name}`}
                              onClick={() => updateProductStockQuantity(p.id, qty - 1)}
                              className="p-1.5 hover:bg-slate-100 text-slate-600 transition"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <input
                              type="number"
                              min={0}
                              aria-label={`Stock quantity for ${p.name}`}
                              value={qty}
                              onChange={(e) =>
                                updateProductStockQuantity(
                                  p.id,
                                  parseInt(e.target.value || '0', 10)
                                )
                              }
                              className="w-12 text-center font-mono font-bold text-slate-900 text-xs py-1 focus:outline-none"
                            />
                            <button
                              type="button"
                              aria-label={`Increase stock for ${p.name}`}
                              onClick={() => updateProductStockQuantity(p.id, qty + 1)}
                              className="p-1.5 hover:bg-slate-100 text-slate-600 transition"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
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
                        <td className="p-3 text-right whitespace-nowrap">
                          {confirmDeleteId === p.id ? (
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  deleteProduct(p.id);
                                  setConfirmDeleteId(null);
                                }}
                                className="px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white font-bold text-[10px]"
                              >
                                Confirm
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2 py-1 rounded bg-slate-200 text-slate-700 font-semibold text-[10px]"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                aria-label={`Edit ${p.name}`}
                                onClick={() => {
                                  setEditingProduct(p);
                                  setIsProductModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                aria-label={`Delete ${p.name}`}
                                onClick={() => setConfirmDeleteId(p.id)}
                                className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );})}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {isProductModalOpen && (
        <ProductModal
          product={editingProduct}
          onClose={() => {
            setIsProductModalOpen(false);
            setEditingProduct(null);
          }}
          onSave={(data, existingId) => {
            if (existingId) {
              updateProduct(existingId, data);
            } else {
              addProduct(data);
            }
          }}
          onDelete={(id) => deleteProduct(id)}
        />
      )}
      {isCsvModalOpen && (
        <CsvImportModal
          currentProducts={products}
          onClose={() => setIsCsvModalOpen(false)}
          onImport={(incoming, replaceAll) => importProductsFromCsv(incoming, replaceAll)}
        />
      )}
    </div>
  );
}
