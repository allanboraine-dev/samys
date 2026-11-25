export type BuyingMode = 'retail' | 'trader';

export type ProductCategory = 
  | 'All' 
  | "This Week's Specials" 
  | 'Snacks & Chips' 
  | 'Beverages' 
  | 'Groceries & Staples' 
  | 'Sweets & Confectionery' 
  | 'Household';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  brand: string;
  description: string;
  imageUrl: string;
  badge?: string;
  isMonthEndSpecial?: boolean;
  inStock: boolean;
  
  // Retail Mode
  retailUnit: string; // e.g. "125g packet" or "2L Bottle"
  retailPrice: number; // in ZAR e.g. 19.99
  retailOldPrice?: number; // Promo strike-through e.g. 24.99

  // Trader Mode
  caseUnit: string; // e.g. "Case of 24" or "Bale of 5"
  caseUnitsCount: number; // e.g. 24
  traderCasePrice: number; // e.g. 336.00
  traderOldCasePrice?: number; // e.g. 384.00
}

export interface CartItem {
  product: Product;
  quantity: number;
  mode: BuyingMode; // Retail or Trader at the time added
}

export type OrderType = 'retail_click_collect' | 'trader_bulk';

export type OrderStatus = 'New' | 'Picking' | 'Ready for Collection' | 'Collected';

export interface RetailOrderDetails {
  customerName: string;
  whatsappNumber: string;
  pickupSlot: string;
  substitutionPreference: 'Allow similar flavor/brand' | 'No substitutions';
  paymentMethod: 'PayFast / Card' | 'Instant EFT' | 'Pay at Express Collection Counter';
  collectionPin: string;
}

export interface TraderOrderDetails {
  businessName: string;
  contactPerson: string;
  whatsappNumber: string;
  area: 'Galeshewe' | 'Roodepan' | 'Greenpoint' | 'Kimberley CBD' | 'Beaconsfield' | 'Other';
  fulfillment: 'Trader Bulk Dispatch Lane' | 'Local Bulk Delivery';
  isQuoteOnly?: boolean;
  quoteNumber?: string;
  validUntil?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  type: OrderType;
  status: OrderStatus;
  items: {
    productId: string;
    productName: string;
    unitType: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    mode: BuyingMode;
  }[];
  subtotal: number;
  vatAmount: number; // 15% inclusive
  total: number;
  estimatedSavings?: number;
  retailDetails?: RetailOrderDetails;
  traderDetails?: TraderOrderDetails;
}
