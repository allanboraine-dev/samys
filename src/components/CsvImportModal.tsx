'use client';

import React, { useState, useRef } from 'react';
import { Product } from '@/types';
import { exportProductsToCsv, parseStockCsv, CsvParseResult } from '@/lib/csvStock';
import { X, Upload, Download, FileSpreadsheet, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface CsvImportModalProps {
  currentProducts: Product[];
  onClose: () => void;
  onImport: (products: Product[], replaceAll: boolean) => { added: number; updated: number };
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  currentProducts,
  onClose,
  onImport,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [replaceAll, setReplaceAll] = useState(false);
  const [parseResult, setParseResult] = useState<CsvParseResult | null>(null);
  const [importSummary, setImportSummary] = useState<{ added: number; updated: number } | null>(null);

  const handleDownloadCurrentCsv = () => {
    const csv = exportProductsToCsv(currentProducts);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sammys-stock-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (file: File | undefined) => {
    if (!file) return;
    setFileName(file.name);
    setImportSummary(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = typeof e.target?.result === 'string' ? e.target.result : '';
      setParseResult(parseStockCsv(text));
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (!parseResult || parseResult.products.length === 0) return;
    const summary = onImport(parseResult.products, replaceAll);
    setImportSummary(summary);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
      />

      <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <h2 className="font-black text-base">
              Bulk Stock CSV Import &amp; Export
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close CSV import modal"
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Step 1: Download template / current stock */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-bold text-slate-900 text-sm">
                1. Export Current Stock or Template
              </div>
              <p className="text-slate-500 mt-0.5">
                Download your catalog as a CSV, edit quantities/prices in Excel or Google Sheets, then upload below.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadCurrentCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold border border-slate-300 shadow-xs shrink-0 transition"
            >
              <Download className="w-4 h-4 text-slate-700" />
              <span>Download Stock CSV</span>
            </button>
          </div>

          {/* Step 2: Upload CSV */}
          <div className="space-y-3">
            <div className="font-bold text-slate-900 text-sm">
              2. Upload Updated Stock CSV
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFileChange(e.dataTransfer.files?.[0]);
              }}
              className="border-2 border-dashed border-slate-300 hover:border-slate-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition"
            >
              <Upload className="w-7 h-7 text-slate-400 mx-auto mb-2" />
              <div className="font-bold text-slate-800">
                {fileName ? `Selected: ${fileName}` : 'Click to choose a .csv file or drag and drop'}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Required columns: <code className="font-mono">name</code>,{' '}
                <code className="font-mono">retailPrice</code>,{' '}
                <code className="font-mono">traderCasePrice</code> (plus optional{' '}
                <code className="font-mono">stockQuantity</code>, <code className="font-mono">category</code>,{' '}
                <code className="font-mono">brand</code>, etc.)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => handleFileChange(e.target.files?.[0])}
                className="hidden"
              />
            </div>

            {/* Import Mode */}
            <div className="flex flex-wrap items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="inline-flex items-center gap-2 font-semibold text-slate-800 cursor-pointer">
                <input
                  type="radio"
                  name="csvImportMode"
                  checked={!replaceAll}
                  onChange={() => setReplaceAll(false)}
                  className="accent-slate-900"
                />
                <span>Merge &amp; Update existing items (add new rows)</span>
              </label>
              <label className="inline-flex items-center gap-2 font-semibold text-red-700 cursor-pointer">
                <input
                  type="radio"
                  name="csvImportMode"
                  checked={replaceAll}
                  onChange={() => setReplaceAll(true)}
                  className="accent-red-600"
                />
                <span>Replace entire catalog with CSV</span>
              </label>
            </div>
          </div>

          {/* Preview & Validation */}
          {parseResult && (
            <div className="space-y-3">
              {parseResult.errors.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>{parseResult.errors.length} Row Warning(s)</span>
                  </div>
                  <ul className="list-disc list-inside text-[11px] text-amber-800 max-h-24 overflow-y-auto">
                    {parseResult.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {parseResult.products.length > 0 && (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-100 px-3 py-2 font-bold text-slate-800 flex items-center justify-between">
                    <span>Ready to import: {parseResult.products.length} products</span>
                    <span className="text-[11px] text-slate-500">Preview (first 5 rows)</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                        <tr>
                          <th className="p-2">Name</th>
                          <th className="p-2">Category</th>
                          <th className="p-2">Retail</th>
                          <th className="p-2">Trader Case</th>
                          <th className="p-2">Stock</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parseResult.products.slice(0, 5).map((p, idx) => (
                          <tr key={`${p.id}-${idx}`}>
                            <td className="p-2 font-semibold text-slate-900">{p.name}</td>
                            <td className="p-2 text-slate-600">{p.category}</td>
                            <td className="p-2 font-mono">R{p.retailPrice.toFixed(2)}</td>
                            <td className="p-2 font-mono text-amber-700">R{p.traderCasePrice.toFixed(2)}</td>
                            <td className="p-2 font-mono font-bold">{p.stockQuantity ?? 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {importSummary && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-3 flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Import complete: {importSummary.added} added, {importSummary.updated} updated.
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-300 transition"
          >
            {importSummary ? 'Done' : 'Cancel'}
          </button>
          {!importSummary && (
            <button
              type="button"
              disabled={!parseResult || parseResult.products.length === 0}
              onClick={handleConfirmImport}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold transition shadow-sm"
            >
              Import {parseResult?.products.length ?? 0} Products
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
