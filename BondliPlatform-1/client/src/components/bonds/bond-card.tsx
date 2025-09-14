import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Bond } from "@shared/schema";

interface BondCardProps {
  bond: Bond;
  onTradeClick: () => void;
}

export default function BondCard({ bond, onTradeClick }: BondCardProps) {
  const getRatingColor = (rating: string) => {
    if (rating === "AAA") return "bg-success/10 text-success";
    if (rating.startsWith("AA")) return "bg-warning/10 text-warning";
    return "bg-muted text-muted-foreground";
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-IN', { 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(amount));
  };

  return (
    <Card className="hover:shadow-lg transition-shadow" data-testid={`card-bond-${bond.id}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground">{bond.issuer}</h3>
            <p className="text-sm text-muted-foreground">{bond.isin}</p>
          </div>
          <Badge className={cn("text-xs font-medium", getRatingColor(bond.rating))}>
            {bond.rating}
          </Badge>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Coupon Rate</span>
            <span className="text-sm font-medium">{Number(bond.couponRate).toFixed(2)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Maturity</span>
            <span className="text-sm font-medium">{formatDate(bond.maturityDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Face Value</span>
            <span className="text-sm font-medium">{formatCurrency(bond.faceValue)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Min. Investment</span>
            <span className="text-sm font-medium">{formatCurrency(bond.minInvestment || "10000")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Current Yield</span>
            <span className="text-sm font-medium text-success">
              {bond.currentYield ? `${Number(bond.currentYield).toFixed(2)}%` : 'N/A'}
            </span>
          </div>
        </div>
        
        <div className="mt-6 space-y-2">
          <Button 
            className="w-full" 
            onClick={onTradeClick}
            data-testid={`button-trade-${bond.id}`}
          >
            Trade Now
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
            data-testid={`button-details-${bond.id}`}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
