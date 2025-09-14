import type { Trade as SchemaTrade } from "@shared/schema";

export interface TradeWithDetails extends SchemaTrade {
  bond?: {
    issuer: string;
    isin: string;
    couponRate: string;
    rating: string;
  };
  buyer?: {
    id: string;
    name: string;
    type: string;
  };
  seller?: {
    id: string;
    name: string;
    type: string;
  };
}

export interface TradeExecution {
  tradeId: string;
  buyOrderId: string;
  sellOrderId: string;
  bondId: string;
  quantity: number;
  price: number;
  totalValue: number;
  executionTime: string;
  venue: string;
  commissions: {
    buyerCommission: number;
    sellerCommission: number;
  };
  taxes: {
    buyerTax: number;
    sellerTax: number;
  };
  settlement: {
    date: string;
    status: 'pending' | 'settled' | 'failed';
    reference: string;
  };
}

export interface TradeFilter {
  bondId?: string;
  userId?: string;
  side?: 'buy' | 'sell' | 'both';
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
  settlementStatus?: string[];
  venue?: string[];
}

export interface TradeSummary {
  totalTrades: number;
  totalVolume: number;
  totalValue: number;
  averagePrice: number;
  averageQuantity: number;
  buyTrades: number;
  sellTrades: number;
  realizedPnL: number;
  commissionsPaid: number;
  taxesPaid: number;
}

export interface TradeAnalytics {
  bondId: string;
  period: '1D' | '1W' | '1M' | '3M' | '1Y';
  vwap: number; // Volume Weighted Average Price
  twap: number; // Time Weighted Average Price
  totalVolume: number;
  tradeCount: number;
  averageTradeSize: number;
  high: number;
  low: number;
  open: number;
  close: number;
  volatility: number;
  turnover: number;
}

export interface MarketImpact {
  tradeId: string;
  preTradeSpread: number;
  postTradeSpread: number;
  priceImpact: number;
  temporaryImpact: number;
  permanentImpact: number;
  liquidityConsumed: number;
  marketShare: number;
}

export interface TradeReport {
  reportId: string;
  userId: string;
  period: {
    start: Date;
    end: Date;
  };
  trades: TradeWithDetails[];
  summary: TradeSummary;
  analytics: TradeAnalytics[];
  taxSummary: {
    totalCapitalGains: number;
    totalCapitalLosses: number;
    netCapitalGains: number;
    interestIncome: number;
    totalTaxableIncome: number;
  };
  commissionSummary: {
    totalCommissions: number;
    averageCommissionRate: number;
    commissionsByVenue: Record<string, number>;
  };
}

export interface RealTimeTradeUpdate {
  type: 'NEW_TRADE' | 'TRADE_UPDATE' | 'SETTLEMENT_UPDATE';
  trade: TradeWithDetails;
  bondId: string;
  timestamp: string;
  marketData?: {
    lastPrice: number;
    volume: number;
    change: number;
    changePercent: number;
  };
}

export interface TradeNotification {
  id: string;
  userId: string;
  type: 'execution' | 'settlement' | 'amendment' | 'cancellation';
  title: string;
  message: string;
  tradeId: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}
