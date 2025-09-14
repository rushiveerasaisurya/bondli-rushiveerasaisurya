import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import HoldingsTable from "@/components/portfolio/holdings-table";
import { TrendingUp } from "lucide-react";
import type { Holding, Account } from "@shared/schema";

interface PortfolioData {
  holdings: Holding[];
  account: Account;
}

export default function Portfolio() {
  const { data: portfolio, isLoading } = useQuery<PortfolioData>({
    queryKey: ['/api/portfolio', 'demo-user'], // In real app, use actual user ID
    refetchInterval: 30000,
  });

  const { data: trades } = useQuery({
    queryKey: ['/api/trades/user', 'demo-user'],
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-2"></div>
          <div className="h-4 bg-muted rounded w-96"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-24 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const totalHoldingsValue = portfolio?.holdings?.reduce((sum, holding) => 
    sum + Number(holding.currentValue || 0), 0
  ) || 0;

  const totalUnrealizedPnl = portfolio?.holdings?.reduce((sum, holding) => 
    sum + Number(holding.unrealizedPnl || 0), 0
  ) || 0;

  const totalPortfolioValue = totalHoldingsValue + Number(portfolio?.account?.cashBalance || 0);
  const annualIncome = portfolio?.holdings?.reduce((sum, holding) => 
    sum + (Number(holding.currentValue || 0) * 0.085), 0 // Assuming 8.5% avg yield
  ) || 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Portfolio</h2>
        <p className="text-muted-foreground">Track your bond holdings and performance</p>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Total Portfolio Value</h3>
            <p className="text-3xl font-bold text-foreground" data-testid="text-portfolio-value">
              ₹{totalPortfolioValue.toLocaleString('en-IN')}
            </p>
            <p className="text-success text-sm flex items-center mt-2">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>+₹45,230 (+2.42%) Today</span>
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Total Unrealized P&L</h3>
            <p className={`text-3xl font-bold ${totalUnrealizedPnl >= 0 ? 'text-success' : 'text-destructive'}`} data-testid="text-unrealized-pnl">
              {totalUnrealizedPnl >= 0 ? '+' : ''}₹{Math.abs(totalUnrealizedPnl).toLocaleString('en-IN')}
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              {totalPortfolioValue > 0 ? `${((totalUnrealizedPnl / totalPortfolioValue) * 100).toFixed(2)}%` : '0%'} overall return
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Annual Income</h3>
            <p className="text-3xl font-bold text-foreground" data-testid="text-annual-income">
              ₹{annualIncome.toLocaleString('en-IN')}
            </p>
            <p className="text-muted-foreground text-sm mt-2">8.57% weighted avg yield</p>
          </CardContent>
        </Card>
      </div>

      {/* Holdings */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Current Holdings</h3>
          {portfolio?.holdings && portfolio.holdings.length > 0 ? (
            <HoldingsTable holdings={portfolio.holdings} />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No holdings found</p>
              <p className="text-sm mt-2">Start trading to build your portfolio</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Transactions</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Bond</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Quantity</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Price</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Total</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {trades?.slice(0, 10).map((trade: any) => (
                  <tr key={trade.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4 text-sm">
                      {new Date(trade.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`font-medium ${trade.buyerId === 'demo-user' ? 'text-success' : 'text-destructive'}`}>
                        {trade.buyerId === 'demo-user' ? 'BUY' : 'SELL'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">{trade.bondName || 'Bond'}</td>
                    <td className="py-3 px-4 text-sm">{trade.quantity} fractions</td>
                    <td className="py-3 px-4 text-sm">₹{Number(trade.price).toFixed(2)}</td>
                    <td className="py-3 px-4 text-sm">₹{Number(trade.totalValue).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4">
                      <span className="bg-success/10 text-success px-2 py-1 rounded text-xs">
                        {trade.settlementStatus === 'settled' ? 'Settled' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                )) || (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-muted-foreground">
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
