'use client';

import React from 'react';
import { Order } from '@/types';
import { CheckCircle2, QrCode, Clock, MapPin, Share2, Printer, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface OrderPassModalProps {
  order: Order;
  onClose: () => void;
}

export const OrderPassModal: React.FC<OrderPassModalProps> = ({ order, onClose }) => {
  React.useEffect(() => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignore confetti issues
    }
  }, []);

  const retail = order.retailDetails;

  const handleWhatsAppShare = () => {
    const text = `*SAMY'S WHOLESALERS (KIMBERLEY)*%0A` +
      `*Click & Collect Pass: ${order.orderNumber}*%0A` +
      `*Collection PIN:* ${retail?.collectionPin}%0A` +
      `*Slot:* ${retail?.pickupSlot}%0A` +
      `*Total:* R${order.total.toFixed(2)}%0A` +
      `*Items:* ${order.items.length}%0A` +
      `*Pickup Location:* Transvaal Road, Kimberley, Northern Cape%0A` +
      `Present this PIN to the Express Counter for instant order release.`;
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 my-4 sm:my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-5 relative text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full bg-black/20 hover:bg-black/30 transition text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 bg-white text-red-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-md">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <h2 className="text-xl font-black tracking-tight">Click & Collect Pass Ready!</h2>
          <p className="text-xs text-red-100 mt-0.5">
            Samy&apos;s Wholesalers • Express Counter Pickup
          </p>
        </div>

        {/* Pass Content */}
        <div className="p-6 space-y-5">
          {/* Collection PIN Banner */}
          <div className="bg-amber-50 border-2 border-dashed border-amber-300 rounded-2xl p-4 text-center">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
              Express Collection PIN
            </span>
            <div className="text-4xl font-black tracking-widest text-slate-900 my-1 font-mono">
              {retail?.collectionPin || '4921'}
            </div>
            <p className="text-[11px] text-amber-700 font-medium">
              Show this PIN to our cashier or collection marshal at Transvaal Road
            </p>
          </div>

          {/* QR Code Simulation Badge */}
          <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
            <div className="w-16 h-16 bg-white border border-slate-300 rounded-xl flex items-center justify-center shrink-0 p-1">
              <QrCode className="w-12 h-12 text-slate-900" />
            </div>
            <div className="text-xs space-y-0.5">
              <div className="font-mono font-bold text-slate-900">{order.orderNumber}</div>
              <div className="text-slate-600">Customer: <strong className="text-slate-900">{retail?.customerName}</strong></div>
              <div className="text-slate-600">WhatsApp: {retail?.whatsappNumber}</div>
            </div>
          </div>

          {/* Pickup Slot & Location Details */}
          <div className="space-y-2 text-xs border-y border-slate-100 py-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Reserved Time Slot:
              </span>
              <span className="font-bold text-slate-900">{retail?.pickupSlot}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Store Address:
              </span>
              <span className="font-semibold text-slate-900">Transvaal Rd, Kimberley</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Substitution Preference:</span>
              <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                {retail?.substitutionPreference}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Payment:</span>
              <span className="font-bold text-emerald-700">{retail?.paymentMethod}</span>
            </div>
          </div>

          {/* Itemized summary */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Reserved Items ({order.items.length})
            </span>
            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 text-xs">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-slate-700">
                  <span className="truncate pr-2">
                    {item.quantity}x {item.productName}
                  </span>
                  <span className="font-semibold text-slate-900 shrink-0">
                    R{item.lineTotal.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200 mt-2">
              <span>Total Amount (VAT incl.)</span>
              <span>R{order.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleWhatsAppShare}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm"
            >
              <Share2 className="w-4 h-4" />
              <span>Send to WhatsApp</span>
            </button>
            <button
              onClick={() => window.print()}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Print Pass</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
