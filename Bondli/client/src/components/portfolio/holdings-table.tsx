import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Holding } from "@shared/schema";

interface HoldingsTableProps {
  holdings: Holding[];
}

export default function HoldingsTable({ holdings }: HoldingsTableProps) {
  const formatCurrency = (amount: string | number) => {
    return `₹${Number(amount).toLocaleString('en-IN')}`;
  };

  const formatPnL = (pnl: string | number) => {
    const value = Number(pnl);
    const sign = value >= 0 ? '+' : '';
    return `${sign}${formatCurrency(Math.abs(value))}`;
  };

  const getPnLColor = (pnl: string | number) => {
    return Number(pnl) >= 0 ? 'text-success' : 'text-destructive';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Bond</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Quantity</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Avg. Price</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Current Price</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Market Value</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">P&L</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((holding) => (
            <tr key={holding.id} className="border-b border-border hover:bg-muted/50">
              <td className="py-4 px-4">
                <div>
                  <p className="font-medium">Bond #{holding.bondId.slice(-6)}</p>
                  <p className="text-xs text-muted-foreground">ID: {holding.bondId}</p>
                </div>
              </td>
              <td className="py-4 px-4 text-sm">{holding.quantity} fractions</td>
              <td className="py-4 px-4 text-sm">{formatCurrency(holding.averagePrice)}</td>
              <td className="py-4 px-4 text-sm">
                {holding.currentValue ? 
                  formatCurrency(Number(holding.currentValue) / holding.quantity) : 
                  'N/A'
                }
              </td>
              <td className="py-4 px-4 text-sm font-medium">
                {holding.currentValue ? formatCurrency(holding.currentValue) : 'N/A'}
              </td>
              <td className={cn("py-4 px-4 text-sm", getPnLColor(holding.unrealizedPnl || 0))}>
                {holding.unrealizedPnl ? formatPnL(holding.unrealizedPnl) : 'N/A'}
              </td>
              <td className="py-4 px-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  data-testid={`button-sell-${holding.id}`}
                >
                  Sell
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
