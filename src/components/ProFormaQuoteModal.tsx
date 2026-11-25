'use client';

import React from 'react';
import { Order } from '@/types';
import { useApp } from '@/context/AppContext';
import { Printer, Check, X, FileCheck, Building2, MapPin, Calendar, CheckCircle2 } from 'lucide-react';

interface ProFormaQuoteModalProps {
  order: Order;
  onClose: () => void;
}

export const ProFormaQuoteModal: React.FC<ProFormaQuoteModalProps> = ({ order, onClose }) => {
  const { updateOrderStatus } = useApp();
  const [converted, setConverted] = React.useState(false);

  const trader = order.traderDetails;

  const handleConvertOrder = () => {
    updateOrderStatus(order.id, 'New');
    setConverted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 my-4 sm:my-6">
        {/* Header Modal Bar */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500 rounded-lg text-slate-950">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                Trader Pro-Forma Wholesale Quote
              </h2>
              <p className="text-xs text-slate-400">
                Official Estimate • 72-Hour Price Guarantee
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Invoice Container */}
        <div className="p-5 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Top Brand & Quote Meta */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl text-slate-900">SAMY&apos;S WHOLESALERS</span>
                <span className="bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded">
                  CASH & CARRY
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Transvaal Road, Kimberley, 8301, Northern Cape
              </p>
              <p className="text-xs text-slate-500">VAT Reg: 4890123847 | Tel: 053 832 9900</p>
            </div>

            <div className="text-right sm:text-right w-full sm:w-auto bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
              <div className="text-xs font-mono font-bold text-amber-600">
                QUOTE #{trader?.quoteNumber || order.orderNumber}
              </div>
              <div className="text-xs text-slate-500 mt-0.5 flex items-center justify-start sm:justify-end gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Date: {new Date().toLocaleDateString('en-ZA')}</span>
              </div>
              <div className="text-xs text-red-600 font-semibold mt-0.5">
                Valid for: 72 Hours (Until {trader?.validUntil || '72h'})
              </div>
            </div>
          </div>

          {/* Business & Dispatch Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                Billed To (Trader / Spaza)
              </span>
              <div className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-amber-600 shrink-0" />
                {trader?.businessName || 'Kimberley Trader'}
              </div>
              <div className="text-slate-600 mt-0.5">Contact: {trader?.contactPerson}</div>
              <div className="text-slate-600">WhatsApp / Phone: {trader?.whatsappNumber}</div>
            </div>

            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                Fulfillment Logistics
              </span>
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-red-600 shrink-0" />
                <span>Area: {trader?.area}</span>
              </div>
              <div className="text-slate-600 mt-0.5">
                Method: <strong className="text-slate-800">{trader?.fulfillment}</strong>
              </div>
              <div className="text-emerald-700 font-semibold mt-0.5">
                • Fast-track loading bay pass enabled
              </div>
            </div>
          </div>

          {/* Line items table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="py-2">Item Description</th>
                  <th className="py-2 text-center">Packaging</th>
                  <th className="py-2 text-center">Cases</th>
                  <th className="py-2 text-right">Case Price (ZAR)</th>
                  <th className="py-2 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 font-bold text-slate-800">{item.productName}</td>
                    <td className="py-2.5 text-center text-slate-600 font-medium">{item.unitType}</td>
                    <td className="py-2.5 text-center font-bold text-slate-900">{item.quantity}</td>
                    <td className="py-2.5 text-right font-mono text-slate-700">R{item.unitPrice.toFixed(2)}</td>
                    <td className="py-2.5 text-right font-mono font-bold text-slate-900">
                      R{item.lineTotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Totals & VAT Breakdown */}
          <div className="border-t-2 border-slate-200 pt-4 flex flex-col items-end text-xs space-y-1.5">
            <div className="flex justify-between w-64 text-slate-600">
              <span>Subtotal (Net Wholesale):</span>
              <span className="font-mono">R{(order.total - order.vatAmount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-64 text-slate-600">
              <span>15% VAT (Included):</span>
              <span className="font-mono">R{order.vatAmount.toFixed(2)}</span>
            </div>
            {order.estimatedSavings && order.estimatedSavings > 0 && (
              <div className="flex justify-between w-64 text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded">
                <span>Estimated Bulk Margin:</span>
                <span className="font-mono">+R{order.estimatedSavings.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between w-64 text-base font-black text-slate-900 border-t border-slate-300 pt-2">
              <span>Total Pro-Forma:</span>
              <span className="text-amber-600 font-mono">R{order.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Conversion Notification if already clicked */}
          {converted && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3.5 flex items-center gap-2.5 text-emerald-800 text-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <strong>Quote Converted to Live Order!</strong> This bulk order is now queued on our Staff Dispatch Board for picking at Transvaal Road.
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </button>

            {!converted ? (
              <button
                onClick={handleConvertOrder}
                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-xs py-2.5 px-5 rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>Convert Quote to Live Order</span>
              </button>
            ) : (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-3 py-1.5 rounded-lg">
                Status: Queued for Dispatch
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
