import type { Bond as SchemaBond } from "@shared/schema";

export interface BondWithPerformance extends SchemaBond {
  priceChange?: number;
  priceChangePercent?: number;
  volume24h?: number;
  marketCap?: string;
  spread?: number;
  liquidity?: 'high' | 'medium' | 'low';
}

export interface BondFilter {
  issuer?: string;
  rating?: string[];
  maturityRange?: {
    min?: Date;
    max?: Date;
  };
  yieldRange?: {
    min?: number;
    max?: number;
  };
  couponRange?: {
    min?: number;
    max?: number;
  };
  faceValueRange?: {
    min?: number;
    max?: number;
  };
  search?: string;
}

export interface BondSortOptions {
  field: 'issuer' | 'couponRate' | 'currentYield' | 'maturityDate' | 'rating' | 'currentPrice';
  direction: 'asc' | 'desc';
}

export interface BondMarketData {
  bondId: string;
  lastPrice: number;
  bidPrice?: number;
  askPrice?: number;
  spread?: number;
  volume: number;
  high24h: number;
  low24h: number;
  change24h: number;
  changePercent24h: number;
  timestamp: string;
}

export interface BondAnalytics {
  bondId: string;
  duration: number;
  modifiedDuration: number;
  convexity: number;
  yieldToMaturity: number;
  accruedInterest: number;
  cleanPrice: number;
  dirtyPrice: number;
  creditSpread?: number;
  optionAdjustedSpread?: number;
}

export interface BondNews {
  id: string;
  bondId: string;
  issuer: string;
  title: string;
  summary: string;
  content: string;
  source: string;
  publishedAt: string;
  impact: 'positive' | 'negative' | 'neutral';
  tags: string[];
}

export interface BondRating {
  agency: string;
  rating: string;
  outlook: 'positive' | 'negative' | 'stable' | 'watch';
  ratedDate: string;
  scale: string;
}

export interface BondHistory {
  bondId: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  yield: number;
}
