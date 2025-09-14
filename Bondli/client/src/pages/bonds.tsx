import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BondCard from "@/components/bonds/bond-card";
import TradingModal from "@/components/modals/trading-modal";
import type { Bond } from "@shared/schema";

export default function Bonds() {
  const [selectedBond, setSelectedBond] = useState<Bond | null>(null);
  const [showTradingModal, setShowTradingModal] = useState(false);
  const [filters, setFilters] = useState({
    issuer: "all",
    rating: "all",
    maturity: "all",
    yield: "all",
  });

  const { data: bonds, isLoading } = useQuery<Bond[]>({
    queryKey: ['/api/bonds'],
    refetchInterval: 30000,
  });

  const handleTradeClick = (bond: Bond) => {
    setSelectedBond(bond);
    setShowTradingModal(true);
  };

  const filteredBonds = bonds?.filter((bond) => {
    if (filters.issuer !== "all" && !bond.issuer.toLowerCase().includes(filters.issuer)) {
      return false;
    }
    if (filters.rating !== "all" && bond.rating !== filters.rating) {
      return false;
    }
    // Add more filter logic as needed
    return true;
  }) || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-2"></div>
          <div className="h-4 bg-muted rounded w-96"></div>
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-40 bg-muted rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Bond Catalog</h2>
          <p className="text-muted-foreground">Browse and filter available corporate bonds for trading</p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Filters</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Issuer</label>
                <Select value={filters.issuer} onValueChange={(value) => setFilters(prev => ({ ...prev, issuer: value }))}>
                  <SelectTrigger data-testid="select-issuer">
                    <SelectValue placeholder="All Issuers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Issuers</SelectItem>
                    <SelectItem value="hdfc">HDFC Bank</SelectItem>
                    <SelectItem value="reliance">Reliance Industries</SelectItem>
                    <SelectItem value="tata">Tata Motors</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Rating</label>
                <Select value={filters.rating} onValueChange={(value) => setFilters(prev => ({ ...prev, rating: value }))}>
                  <SelectTrigger data-testid="select-rating">
                    <SelectValue placeholder="All Ratings" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="AAA">AAA</SelectItem>
                    <SelectItem value="AA+">AA+</SelectItem>
                    <SelectItem value="AA">AA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Maturity</label>
                <Select value={filters.maturity} onValueChange={(value) => setFilters(prev => ({ ...prev, maturity: value }))}>
                  <SelectTrigger data-testid="select-maturity">
                    <SelectValue placeholder="All Maturities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Maturities</SelectItem>
                    <SelectItem value="less-than-1">Under 1 Year</SelectItem>
                    <SelectItem value="1-3">1-3 Years</SelectItem>
                    <SelectItem value="3-5">3-5 Years</SelectItem>
                    <SelectItem value="greater-than-5">Over 5 Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Yield Range</label>
                <Select value={filters.yield} onValueChange={(value) => setFilters(prev => ({ ...prev, yield: value }))}>
                  <SelectTrigger data-testid="select-yield">
                    <SelectValue placeholder="All Yields" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Yields</SelectItem>
                    <SelectItem value="5-7">5-7%</SelectItem>
                    <SelectItem value="7-9">7-9%</SelectItem>
                    <SelectItem value="9-11">9-11%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bond Grid */}
        {filteredBonds.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {filteredBonds.map((bond) => (
              <BondCard 
                key={bond.id} 
                bond={bond} 
                onTradeClick={() => handleTradeClick(bond)}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No bonds available matching your filters</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setFilters({ issuer: "all", rating: "all", maturity: "all", yield: "all" })}
                data-testid="button-clear-filters"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <TradingModal 
        bond={selectedBond}
        open={showTradingModal}
        onClose={() => setShowTradingModal(false)}
      />
    </>
  );
}
