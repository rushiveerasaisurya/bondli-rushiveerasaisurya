import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import OrderBook from "@/components/trading/order-book";
import TradeForm from "@/components/trading/trade-form";
import { useWebSocket } from "@/hooks/use-websocket";
import type { Bond } from "@shared/schema";

export default function Trading() {
  const [selectedBondId, setSelectedBondId] = useState<string>("");
  const [selectedBond, setSelectedBond] = useState<Bond | null>(null);

  const { data: bonds } = useQuery<Bond[]>({
    queryKey: ['/api/bonds'],
  });

  const { data: orderBook, refetch: refetchOrderBook } = useQuery({
    queryKey: ['/api/orderbook', selectedBondId],
    enabled: !!selectedBondId,
    refetchInterval: 5000,
  });

  const { data: account } = useQuery({
    queryKey: ['/api/portfolio', 'demo-user'],
  });

  // WebSocket for real-time updates
  const { isConnected } = useWebSocket((message) => {
    const data = JSON.parse(message.data);
    
    if (data.type === 'ORDER_BOOK_UPDATE' && data.bondId === selectedBondId) {
      refetchOrderBook();
    }
    
    if (data.type === 'NEW_TRADE' && data.bondId === selectedBondId) {
      refetchOrderBook();
    }
  });

  useEffect(() => {
    if (bonds && bonds.length > 0 && !selectedBondId) {
      const firstBond = bonds[0];
      setSelectedBondId(firstBond.id);
      setSelectedBond(firstBond);
    }
  }, [bonds, selectedBondId]);

  useEffect(() => {
    if (selectedBondId && bonds) {
      const bond = bonds.find(b => b.id === selectedBondId);
      setSelectedBond(bond || null);
    }
  }, [selectedBondId, bonds]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Trading Interface</h2>
        <p className="text-muted-foreground">Real-time bond trading with live order books</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Book & Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bond Selection */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Select value={selectedBondId} onValueChange={setSelectedBondId}>
                  <SelectTrigger className="w-full max-w-[300px]" data-testid="select-trading-bond">
                    <SelectValue placeholder="Select a bond" />
                  </SelectTrigger>
                  <SelectContent>
                    {bonds?.map((bond) => (
                      <SelectItem key={bond.id} value={bond.id}>
                        {bond.issuer} {Number(bond.couponRate).toFixed(1)}% ({bond.isin})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground" data-testid="text-current-price">
                      {selectedBond?.currentPrice ? `₹${Number(selectedBond.currentPrice).toFixed(2)}` : 'N/A'}
                    </p>
                    <p className="text-success text-sm">+₹18.25 (+1.81%)</p>
                  </div>
                  <div className={`flex items-center space-x-2 ${isConnected ? 'text-success' : 'text-destructive'}`}>
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success' : 'bg-destructive'} animate-pulse`}></div>
                    <span className="text-xs">{isConnected ? 'Live' : 'Disconnected'}</span>
                  </div>
                </div>
              </div>
              
              {selectedBond && (
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Coupon</p>
                    <p className="font-medium">{Number(selectedBond.couponRate).toFixed(2)}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Maturity</p>
                    <p className="font-medium">
                      {new Date(selectedBond.maturityDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Rating</p>
                    <p className="font-medium">{selectedBond.rating}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Volume Today</p>
                    <p className="font-medium">2,150</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Book */}
          {selectedBondId && (
            <OrderBook bondId={selectedBondId} orderBook={orderBook} />
          )}
        </div>

        {/* Trading Panel */}
        <div className="space-y-6">
          {selectedBond && (
            <TradeForm 
              bond={selectedBond} 
              account={account?.account}
              onOrderPlaced={() => refetchOrderBook()}
            />
          )}

          {/* Account Summary */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Account Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Available Cash</span>
                  <span className="font-medium" data-testid="text-available-cash">
                    {account?.account?.cashBalance ? `₹${Number(account.account.cashBalance).toLocaleString('en-IN')}` : '₹0'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reserved</span>
                  <span className="font-medium">
                    {account?.account?.reservedBalance ? `₹${Number(account.account.reservedBalance).toLocaleString('en-IN')}` : '₹0'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Holdings</span>
                  <span className="font-medium">₹12,45,850</span>
                </div>
                <div className="flex justify-between border-t border-border pt-3">
                  <span className="text-foreground">Total Portfolio</span>
                  <span className="font-semibold">₹19,16,530</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
