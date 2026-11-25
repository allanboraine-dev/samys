'use client';

import React, { useState } from 'react';
import { Product, ProductCategory } from '@/types';
import { X, Package, Trash2, Save, PlusCircle } from 'lucide-react';

const PRODUCT_CATEGORIES: ProductCategory[] = [
  'Snacks & Chips',
  'Beverages',
  'Groceries & Staples',
  'Sweets & Confectionery',
  'Household',
];

interface ProductModalProps {
  product: Product | null; // null = Add mode, Product = Edit mode
  onClose: () => void;
  onSave: (data: Omit<Product, 'id'>, existingId?: string) => void;
  onDelete?: (productId: string) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onSave,
  onDelete,
}) => {
  const isEditing = Boolean(product);

  const [name, setName] = useState(product?.name ?? '');
  const [brand, setBrand] = useState(product?.brand ?? '');
  const [category, setCategory] = useState<ProductCategory>(
    product?.category && PRODUCT_CATEGORIES.includes(product.category)
      ? product.category
      : 'Groceries & Staples'
  );
  const [description, setDescription] = useState(product?.description ?? '');
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? '');
  const [stockQuantity, setStockQuantity] = useState<string>(
    String(product ? product.stockQuantity ?? (product.inStock ? 50 : 0) : 50)
  );
  const [retailUnit, setRetailUnit] = useState(product?.retailUnit ?? '1 unit');
  const [retailPrice, setRetailPrice] = useState<string>(
    product ? String(product.retailPrice) : ''
  );
  const [retailOldPrice, setRetailOldPrice] = useState<string>(
    product?.retailOldPrice ? String(product.retailOldPrice) : ''
  );
  const [caseUnit, setCaseUnit] = useState(product?.caseUnit ?? 'Case of 12');
  const [caseUnitsCount, setCaseUnitsCount] = useState<string>(
    product ? String(product.caseUnitsCount) : '12'
  );
  const [traderCasePrice, setTraderCasePrice] = useState<string>(
    product ? String(product.traderCasePrice) : ''
  );
  const [traderOldCasePrice, setTraderOldCasePrice] = useState<string>(
    product?.traderOldCasePrice ? String(product.traderOldCasePrice) : ''
  );
  const [isMonthEndSpecial, setIsMonthEndSpecial] = useState<boolean>(
    product?.isMonthEndSpecial ?? false
  );
  const [badge, setBadge] = useState(product?.badge ?? '');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedRetailPrice = parseFloat(retailPrice);
    const parsedTraderPrice = parseFloat(traderCasePrice);
    const parsedCaseCount = parseInt(caseUnitsCount, 10);
    const parsedStock = parseInt(stockQuantity, 10);

    if (!name.trim() || !brand.trim()) {
      setError('Product name and brand are required.');
      return;
    }
    if (Number.isNaN(parsedRetailPrice) || parsedRetailPrice <= 0) {
      setError('Please enter a valid retail price greater than 0.');
      return;
    }
    if (Number.isNaN(parsedTraderPrice) || parsedTraderPrice <= 0) {
      setError('Please enter a valid trader case price greater than 0.');
      return;
    }
    if (Number.isNaN(parsedCaseCount) || parsedCaseCount < 1) {
      setError('Units per case must be at least 1.');
      return;
    }

    const qty = Number.isNaN(parsedStock) ? 0 : Math.max(0, parsedStock);
    const parsedRetailOld = retailOldPrice ? parseFloat(retailOldPrice) : undefined;
    const parsedTraderOld = traderOldCasePrice ? parseFloat(traderOldCasePrice) : undefined;

    onSave(
      {
        name: name.trim(),
        brand: brand.trim(),
        category,
        description: description.trim() || `${brand.trim()} — available at Samy's Cash & Carry.`,
        imageUrl: imageUrl.trim(),
        stockQuantity: qty,
        inStock: qty > 0,
        retailUnit: retailUnit.trim() || '1 unit',
        retailPrice: Number(parsedRetailPrice.toFixed(2)),
        retailOldPrice:
          parsedRetailOld && !Number.isNaN(parsedRetailOld)
            ? Number(parsedRetailOld.toFixed(2))
            : undefined,
        caseUnit: caseUnit.trim() || `Case of ${parsedCaseCount}`,
        caseUnitsCount: parsedCaseCount,
        traderCasePrice: Number(parsedTraderPrice.toFixed(2)),
        traderOldCasePrice:
          parsedTraderOld && !Number.isNaN(parsedTraderOld)
            ? Number(parsedTraderOld.toFixed(2))
            : undefined,
        isMonthEndSpecial,
        badge: badge.trim() || (isMonthEndSpecial ? 'MONTH-END SPECIAL' : undefined),
      },
      product?.id
    );
    onClose();
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
            <Package className="w-5 h-5 text-amber-400" />
            <h2 className="font-black text-base">
              {isEditing ? 'Edit Product & Stock' : 'Add New Stock Item'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close product modal"
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 font-semibold px-3 py-2 rounded-xl">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ace Super Maize Meal 10kg"
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Brand *
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Ace"
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Stock Quantity (0 = Out of Stock)
              </label>
              <input
                type="number"
                min={0}
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short product description for shoppers and traders"
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Image URL (optional)
            </label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://... or leave blank for category placeholder"
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Retail & Trader Pricing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2.5">
              <div className="font-black text-slate-900 uppercase tracking-wide text-[11px]">
                Retail Click &amp; Collect
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">
                  Retail Unit Label
                </label>
                <input
                  type="text"
                  value={retailUnit}
                  onChange={(e) => setRetailUnit(e.target.value)}
                  placeholder="e.g. 125g packet"
                  className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">
                    Price (R) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={retailPrice}
                    onChange={(e) => setRetailPrice(e.target.value)}
                    placeholder="19.99"
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 bg-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">
                    Was Price (R)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={retailOldPrice}
                    onChange={(e) => setRetailOldPrice(e.target.value)}
                    placeholder="24.99"
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 bg-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200 space-y-2.5">
              <div className="font-black text-amber-950 uppercase tracking-wide text-[11px]">
                Trader Bulk Case
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Case Unit Label
                  </label>
                  <input
                    type="text"
                    value={caseUnit}
                    onChange={(e) => setCaseUnit(e.target.value)}
                    placeholder="Case of 24"
                    className="w-full border border-amber-300 rounded-lg px-2.5 py-1.5 text-slate-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Units / Case *
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={caseUnitsCount}
                    onChange={(e) => setCaseUnitsCount(e.target.value)}
                    className="w-full border border-amber-300 rounded-lg px-2.5 py-1.5 text-slate-900 bg-white font-mono"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Case Price (R) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={traderCasePrice}
                    onChange={(e) => setTraderCasePrice(e.target.value)}
                    placeholder="384.00"
                    className="w-full border border-amber-300 rounded-lg px-2.5 py-1.5 text-slate-900 bg-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Was Case (R)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={traderOldCasePrice}
                    onChange={(e) => setTraderOldCasePrice(e.target.value)}
                    placeholder="456.00"
                    className="w-full border border-amber-300 rounded-lg px-2.5 py-1.5 text-slate-900 bg-white font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Promo & Badge */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <label className="inline-flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={isMonthEndSpecial}
                onChange={(e) => setIsMonthEndSpecial(e.target.checked)}
                className="w-4 h-4 rounded accent-red-600"
              />
              <span>Mark as Month-End Special</span>
            </label>

            <div className="flex items-center gap-2">
              <label className="font-semibold text-slate-600">Badge:</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. TOP SELLER"
                className="border border-slate-300 rounded-lg px-2.5 py-1 text-slate-900 w-40"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
            {isEditing && product && onDelete ? (
              confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-red-600 font-bold">Delete permanently?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onDelete(product.id);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold transition"
                  >
                    Confirm Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold border border-red-200 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Product</span>
                </button>
              )
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition shadow-sm"
              >
                {isEditing ? (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add Product</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
