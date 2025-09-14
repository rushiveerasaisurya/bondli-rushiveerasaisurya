import type { Order as SchemaOrder } from "@shared/schema";

export interface OrderWithBond extends SchemaOrder {
  bond?: {
    issuer: string;
    isin: string;
    couponRate: string;
    rating: string;
  };
}

export interface OrderBookEntry {
  price: number;
  quantity: number;
  orderCount: number;
  cumulative: number;
}

export interface OrderBookData {
  bondId: string;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  spread: number;
  midPrice: number;
  lastUpdate: string;
}

export interface OrderFormData {
  bondId: string;
  orderType: 'limit' | 'market';
  orderSide: 'buy' | 'sell';
  quantity: number;
  price?: number;
  timeInForce?: 'IOC' | 'FOK' | 'GTC' | 'DAY';
  stopPrice?: number;
  notes?: string;
}

export interface OrderValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  estimatedCost?: number;
  estimatedProceeds?: number;
  requiredMargin?: number;
}

export interface OrderExecution {
  orderId: string;
  executedQuantity: number;
  executedPrice: number;
  executionTime: string;
  commission: number;
  taxes: number;
  netAmount: number;
  executionVenue: string;
}

export interface OrderUpdate {
  orderId: string;
  status: 'pending' | 'partial' | 'filled' | 'cancelled' | 'rejected';
  filledQuantity: number;
  remainingQuantity: number;
  averagePrice?: number;
  lastUpdate: string;
  reason?: string;
}

export interface OrderHistory {
  orderId: string;
  timestamp: string;
  action: 'created' | 'modified' | 'cancelled' | 'filled' | 'partial_fill' | 'rejected';
  details: string;
  quantity?: number;
  price?: number;
}

export interface OrderFilter {
  status?: string[];
  orderType?: string[];
  orderSide?: string[];
  bondId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  priceRange?: {
    min: number;
    max: number;
  };
  quantityRange?: {
    min: number;
    max: number;
  };
}

export interface OrderSummary {
  totalOrders: number;
  filledOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  totalVolume: number;
  averageOrderSize: number;
  fillRate: number;
}
