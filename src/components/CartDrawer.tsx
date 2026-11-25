'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Order, RetailOrderDetails, TraderOrderDetails } from '@/types';
import { OrderPassModal } from './OrderPassModal';
import { ProFormaQuoteModal } from './ProFormaQuoteModal';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Truck, 
  FileText, 
  ShieldCheck 
} from 'lucide-react';

const PICKUP_SLOTS = [
  { label: 'Today: 14:00 - 15:00', slotsLeft: 4 },
  { label: 'Today: 15:00 - 16:00', slotsLeft: 6 },
  { label: 'Tomorrow: 08:30 - 09:30', slotsLeft: 8 },
  { label: 'Saturday Express: 09:00 - 10:00', slotsLeft: 2 },
];

const AREAS = [
  'Galeshewe',
  'Roodepan',
  'Greenpoint',
  'Kimberley CBD',
  'Beaconsfield',
  'Other',
] as const;

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateQuantity,
    clearCart,
    mode,
    cartSubtotal,
    cartVat,
    cartBulkSavings,
    addOrder,
  } = useApp();

  // Checkout Step
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [generatedPassOrder, setGeneratedPassOrder] = useState<Order | null>(null);
  const [generatedQuoteOrder, setGeneratedQuoteOrder] = useState<Order | null>(null);

  // Form State: Retail Click & Collect
  const [retailCustomerName, setRetailCustomerName] = useState('');
  const [retailWhatsapp, setRetailWhatsapp] = useState('');
  const [retailPickupSlot, setRetailPickupSlot] = useState(PICKUP_SLOTS[0].label);
  const [retailSubstitution, setRetailSubstitution] = useState<
    'Allow similar flavor/brand' | 'No substitutions'
  >('Allow similar flavor/brand');
  const [retailPayment, setRetailPayment] = useState<
    'PayFast / Card' | 'Instant EFT' | 'Pay at Express Collection Counter'
  >('Pay at Express Collection Counter');

  // Form State: Trader Bulk & Pro-Forma
  const [traderBusinessName, setTraderBusinessName] = useState('');
  const [traderContactPerson, setTraderContactPerson] = useState('');
  const [traderWhatsapp, setTraderWhatsapp] = useState('');
  const [traderArea, setTraderArea] = useState<(typeof AREAS)[number]>('Galeshewe');
  const [traderFulfillment, setTraderFulfillment] = useState<
    'Trader Bulk Dispatch Lane' | 'Local Bulk Delivery'
  >('Trader Bulk Dispatch Lane');

  if (!isCartOpen && !generatedPassOrder && !generatedQuoteOrder) return null;

  const handleRetailCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!retailCustomerName || !retailWhatsapp) {
      alert('Please fill in your name and WhatsApp number.');
      return;
    }

    const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
    const orderNumber = `RET-${Math.floor(1000 + Math.random() * 9000)}`;

    const retailDetails: RetailOrderDetails = {
      customerName: retailCustomerName,
      whatsappNumber: retailWhatsapp,
      pickupSlot: retailPickupSlot,
      substitutionPreference: retailSubstitution,
      paymentMethod: retailPayment,
      collectionPin: randomPin,
    };

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
      type: 'retail_click_collect',
      status: 'New',
      items: cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        unitType: item.product.retailUnit,
        quantity: item.quantity,
        unitPrice: item.product.retailPrice,
        lineTotal: item.product.retailPrice * item.quantity,
        mode: item.mode,
      })),
      subtotal: cartSubtotal,
      vatAmount: cartVat,
      total: cartSubtotal,
      retailDetails,
    };

    addOrder(newOrder);
    clearCart();
    setIsCheckingOut(false);
    setIsCartOpen(false);
    setGeneratedPassOrder(newOrder);
  };

  const handleTraderCheckout = (isQuoteOnly = false) => {
    if (!traderBusinessName || !traderContactPerson || !traderWhatsapp) {
      alert('Please fill in your Tuck Shop / Business Name, Contact Person, and WhatsApp number.');
      return;
    }

    const orderNumber = isQuoteOnly
      ? `QUO-${Math.floor(1000 + Math.random() * 9000)}`
      : `TRD-${Math.floor(1000 + Math.random() * 9000)}`;

    const validUntilDate = new Date();
    validUntilDate.setHours(validUntilDate.getHours() + 72);

    const traderDetails: TraderOrderDetails = {
      businessName: traderBusinessName,
      contactPerson: traderContactPerson,
      whatsappNumber: traderWhatsapp,
      area: traderArea,
      fulfillment: traderFulfillment,
      isQuoteOnly,
      quoteNumber: orderNumber,
      validUntil: validUntilDate.toLocaleDateString('en-ZA'),
    };

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
      type: 'trader_bulk',
      status: isQuoteOnly ? 'New' : 'New',
      items: cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        unitType: item.product.caseUnit,
        quantity: item.quantity,
        unitPrice: item.product.traderCasePrice,
        lineTotal: item.product.traderCasePrice * item.quantity,
        mode: item.mode,
      })),
      subtotal: cartSubtotal,
      vatAmount: cartVat,
      total: cartSubtotal,
      estimatedSavings: cartBulkSavings,
      traderDetails,
    };

    addOrder(newOrder);
    clearCart();
    setIsCheckingOut(false);
    setIsCartOpen(false);

    if (isQuoteOnly) {
      setGeneratedQuoteOrder(newOrder);
    } else {
      alert(
        `Bulk Order ${orderNumber} submitted to Kimberley Trader Dispatch! Loading lane pass generated.`
      );
    }
  };

  return (
    <>
      {isCartOpen && (
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <div
          onClick={() => {
            setIsCartOpen(false);
            setIsCheckingOut(false);
          }}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
            {/* Top Bar */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <h2 className="font-black text-base tracking-tight">
                  Your Wholesale Basket
                </h2>
                <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                  {cart.length} lines
                </span>
              </div>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setIsCheckingOut(false);
                }}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                    <ShoppingBag className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-base">Your cart is empty</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Browse our cash & carry catalog and add wholesale packs or individual units to begin.
                  </p>
                </div>
              ) : !isCheckingOut ? (
                /* Itemized Cart List */
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs text-slate-500 pb-1 border-b border-slate-100">
                    <span>Item & Packing</span>
                    <button
                      onClick={clearCart}
                      className="text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Clear all
                    </button>
                  </div>

                  {cart.map((item) => {
                    const price =
                      item.mode === 'retail'
                        ? item.product.retailPrice
                        : item.product.traderCasePrice;
                    const lineTotal = price * item.quantity;
                    const unitLabel =
                      item.mode === 'retail'
                        ? item.product.retailUnit
                        : item.product.caseUnit;

                    return (
                      <div
                        key={`${item.product.id}-${item.mode}`}
                        className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span
                              className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded ${
                                item.mode === 'retail'
                                  ? 'bg-slate-200 text-slate-800'
                                  : 'bg-amber-200 text-amber-900'
                              }`}
                            >
                              {item.mode === 'retail' ? 'Retail' : 'Trader Case'}
                            </span>
                            <span className="text-slate-400 font-medium truncate text-[10px]">
                              {unitLabel}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-900 truncate">
                            {item.product.name}
                          </h4>
                          <div className="font-mono font-bold text-slate-700 mt-0.5">
                            R{price.toFixed(2)} ea
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center bg-white border border-slate-300 rounded-xl overflow-hidden shadow-sm">
                            <button
                              type="button"
                              aria-label={`Decrease quantity for ${item.product.name}`}
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.mode,
                                  item.quantity - 1
                                )
                              }
                              className="p-1.5 hover:bg-slate-100 text-slate-600 transition"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-2 font-bold text-slate-900 font-mono text-xs">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              aria-label={`Increase quantity for ${item.product.name}`}
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.mode,
                                  item.quantity + 1
                                )
                              }
                              className="p-1.5 hover:bg-slate-100 text-slate-600 transition"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="w-16 text-right font-black text-slate-900 font-mono text-xs">
                            R{lineTotal.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Dual Checkout Form Section */
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="font-bold text-slate-900 text-sm">
                      {mode === 'retail'
                        ? 'Retail Click & Collect Details'
                        : 'Trader Bulk Order & Logistics'}
                    </span>
                    <button
                      onClick={() => setIsCheckingOut(false)}
                      className="text-slate-500 hover:text-slate-900 font-medium underline"
                    >
                      Back to Cart
                    </button>
                  </div>

                  {mode === 'retail' ? (
                    /* Path A: Retail Click & Collect */
                    <form onSubmit={handleRetailCheckout} className="space-y-3.5">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          Your Name
                        </label>
                        <input
                          type="text"
                          required
                          value={retailCustomerName}
                          onChange={(e) => setRetailCustomerName(e.target.value)}
                          placeholder="e.g. Lerato Motsepe"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          WhatsApp / Cellphone Number
                        </label>
                        <input
                          type="tel"
                          required
                          value={retailWhatsapp}
                          onChange={(e) => setRetailWhatsapp(e.target.value)}
                          placeholder="e.g. 078 912 3445"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600"
                        />
                        <span className="text-[10px] text-slate-400">
                          We send your 4-digit Collection PIN directly to this number.
                        </span>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1 flex items-center justify-between">
                          <span>Pickup Time Slot (Transvaal Road)</span>
                          <span className="text-red-600 font-semibold text-[10px]">
                            Fast-track counter
                          </span>
                        </label>
                        <div className="space-y-1.5">
                          {PICKUP_SLOTS.map((slot) => (
                            <label
                              key={slot.label}
                              className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition ${
                                retailPickupSlot === slot.label
                                  ? 'bg-red-50 border-red-400 text-slate-900 font-bold'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name="pickupSlot"
                                  checked={retailPickupSlot === slot.label}
                                  onChange={() => setRetailPickupSlot(slot.label)}
                                  className="text-red-600 focus:ring-red-500"
                                />
                                <span className="text-xs">{slot.label}</span>
                              </div>
                              <span className="text-[10px] text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded-full">
                                {slot.slotsLeft} slots left
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          Substitution Preference (If out of stock)
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {(
                            [
                              'Allow similar flavor/brand',
                              'No substitutions',
                            ] as const
                          ).map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setRetailSubstitution(opt)}
                              className={`p-2 rounded-xl border text-center text-[11px] font-semibold transition ${
                                retailSubstitution === opt
                                  ? 'bg-slate-900 text-white border-slate-900'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          Payment Option
                        </label>
                        <select
                          value={retailPayment}
                          onChange={(e) =>
                            setRetailPayment(
                              e.target.value as RetailOrderDetails['paymentMethod']
                            )
                          }
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600 text-xs font-medium"
                        >
                          <option value="Pay at Express Collection Counter">
                            Pay at Express Collection Counter (Speedpoint / Cash)
                          </option>
                          <option value="Instant EFT">Instant EFT (Capitec / Ozow)</option>
                          <option value="PayFast / Card">PayFast / Credit or Debit Card</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-200 transition active:scale-95"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Confirm & Get Collection Pass</span>
                      </button>
                    </form>
                  ) : (
                    /* Path B: Trader Bulk & Pro-Forma Quote */
                    <div className="space-y-3.5">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          Business / Spaza / Tuck Shop Name
                        </label>
                        <input
                          type="text"
                          required
                          value={traderBusinessName}
                          onChange={(e) => setTraderBusinessName(e.target.value)}
                          placeholder="e.g. Galeshewe Corner Tuck Shop"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">
                            Contact Person
                          </label>
                          <input
                            type="text"
                            required
                            value={traderContactPerson}
                            onChange={(e) => setTraderContactPerson(e.target.value)}
                            placeholder="e.g. Sipho Ndlovu"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">
                            WhatsApp / Cell
                          </label>
                          <input
                            type="tel"
                            required
                            value={traderWhatsapp}
                            onChange={(e) => setTraderWhatsapp(e.target.value)}
                            placeholder="e.g. 073 555 4192"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          Delivery / Trader Area (Kimberley & Surrounds)
                        </label>
                        <select
                          value={traderArea}
                          onChange={(e) =>
                            setTraderArea(e.target.value as (typeof AREAS)[number])
                          }
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs font-medium"
                        >
                          {AREAS.map((a) => (
                            <option key={a} value={a}>
                              {a}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          Fulfillment Logistics
                        </label>
                        <div className="space-y-1.5">
                          {(
                            [
                              'Trader Bulk Dispatch Lane',
                              'Local Bulk Delivery',
                            ] as const
                          ).map((method) => (
                            <label
                              key={method}
                              className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${
                                traderFulfillment === method
                                  ? 'bg-amber-50 border-amber-400 text-slate-900 font-bold'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name="fulfillment"
                                  checked={traderFulfillment === method}
                                  onChange={() => setTraderFulfillment(method)}
                                  className="text-amber-500 focus:ring-amber-400"
                                />
                                <div>
                                  <span className="text-xs block">{method}</span>
                                  <span className="text-[10px] text-slate-500 font-normal">
                                    {method === 'Trader Bulk Dispatch Lane'
                                      ? 'Fast forklift & bakkie loading at Transvaal Rd'
                                      : 'Direct delivery truck to your store'}
                                  </span>
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Trader Dual Buttons */}
                      <div className="space-y-2 pt-2">
                        <button
                          type="button"
                          onClick={() => handleTraderCheckout(true)}
                          className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
                        >
                          <FileText className="w-4 h-4" />
                          <span>Generate Pro-Forma Quote (72h Guarantee)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleTraderCheckout(false)}
                          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition active:scale-95"
                        >
                          <Truck className="w-4 h-4 text-amber-400" />
                          <span>Place Bulk Order (Queue for Dispatch)</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cart Footer Summaries */}
            {cart.length > 0 && (
              <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-mono font-semibold">
                      R{cartSubtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>VAT (15% inclusive):</span>
                    <span className="font-mono">R{cartVat.toFixed(2)}</span>
                  </div>
                  {mode === 'trader' && cartBulkSavings > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                      <span>Estimated Trader Bulk Margin:</span>
                      <span className="font-mono">
                        +R{cartBulkSavings.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                    <span>Total Amount:</span>
                    <span className="font-mono text-lg">
                      R{cartSubtotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {!isCheckingOut && (
                  <button
                    onClick={() => setIsCheckingOut(true)}
                    className={`w-full py-3 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition shadow-md active:scale-95 ${
                      mode === 'retail'
                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-200'
                        : 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-200'
                    }`}
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      {/* Generated Modals */}
      {generatedPassOrder && (
        <OrderPassModal
          order={generatedPassOrder}
          onClose={() => setGeneratedPassOrder(null)}
        />
      )}

      {generatedQuoteOrder && (
        <ProFormaQuoteModal
          order={generatedQuoteOrder}
          onClose={() => setGeneratedQuoteOrder(null)}
        />
      )}
    </>
  );
};
