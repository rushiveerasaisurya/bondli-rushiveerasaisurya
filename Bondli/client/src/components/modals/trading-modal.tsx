import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import type { Bond } from "@shared/schema";

interface TradingModalProps {
  bond: Bond | null;
  open: boolean;
  onClose: () => void;
}

export default function TradingModal({ bond, open, onClose }: TradingModalProps) {
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'limit' | 'market'>('limit');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user account for balance validation
  const { data: account } = useQuery({
    queryKey: ['/api/portfolio', 'demo-user'],
    enabled: open,
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      await apiRequest('POST', '/api/orders', orderData);
    },
    onSuccess: () => {
      toast({
        title: "Order placed successfully",
        description: `Your ${orderSide} order for ${bond?.issuer} has been submitted.`,
      });
      
      // Reset form and close modal
      resetForm();
      onClose();
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/orderbook'] });
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['/api/trades'] });
    },
    onError: (error) => {
      toast({
        title: "Order failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setOrderSide('buy');
    setOrderType('limit');
    setPrice('');
    setQuantity('');
  };

  useEffect(() => {
    if (bond && open) {
      setPrice(bond.currentPrice || '');
    }
  }, [bond, open]);

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bond) return;

    if (!quantity || Number(quantity) <= 0) {
      toast({
        title: "Invalid quantity",
        description: "Please enter a valid quantity.",
        variant: "destructive",
      });
      return;
    }

    if (orderType === 'limit' && (!price || Number(price) <= 0)) {
      toast({
        title: "Invalid price",
        description: "Please enter a valid price for limit orders.",
        variant: "destructive",
      });
      return;
    }

    const totalValue = orderType === 'limit' ? Number(price) * Number(quantity) : 0;
    const tradingFee = 25; // Fixed fee for demo
    const totalCost = totalValue + tradingFee;

    if (orderSide === 'buy' && account?.account && totalCost > Number(account.account.cashBalance)) {
      toast({
        title: "Insufficient funds",
        description: "You don't have enough cash balance for this order.",
        variant: "destructive",
      });
      return;
    }

    createOrderMutation.mutate({
      userId: 'demo-user', // In a real app, this would come from auth
      bondId: bond.id,
      orderType,
      orderSide,
      quantity: Number(quantity),
      price: orderType === 'limit' ? Number(price) : null,
    });
  };

  const getRatingColor = (rating: string) => {
    if (rating === "AAA") return "bg-success/10 text-success";
    if (rating.startsWith("AA")) return "bg-warning/10 text-warning";
    return "bg-muted text-muted-foreground";
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(amount));
  };

  const totalValue = orderType === 'limit' && price && quantity 
    ? Number(price) * Number(quantity) 
    : 0;
  const tradingFee = 25;
  const totalCost = totalValue + tradingFee;

  if (!bond) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Quick Trade</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Bond Information */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-foreground">{bond.issuer}</h4>
                  <p className="text-sm text-muted-foreground">{bond.isin}</p>
                </div>
                <Badge className={cn("text-xs font-medium", getRatingColor(bond.rating))}>
                  {bond.rating}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Current Price:</span>
                  <span className="ml-2 font-medium">
                    {bond.currentPrice ? formatCurrency(bond.currentPrice) : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Coupon:</span>
                  <span className="ml-2 font-medium">{Number(bond.couponRate).toFixed(2)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Order Side Tabs */}
          <div className="flex border-b border-border">
            <button 
              type="button"
              className={cn(
                "flex-1 py-3 px-4 text-center font-medium transition-colors",
                orderSide === 'buy' 
                  ? 'bg-success/10 text-success border-b-2 border-success' 
                  : 'text-muted-foreground hover:bg-accent'
              )}
              onClick={() => setOrderSide('buy')}
              data-testid="button-buy-tab-modal"
            >
              Buy
            </button>
            <button 
              type="button"
              className={cn(
                "flex-1 py-3 px-4 text-center font-medium transition-colors",
                orderSide === 'sell' 
                  ? 'bg-destructive/10 text-destructive border-b-2 border-destructive' 
                  : 'text-muted-foreground hover:bg-accent'
              )}
              onClick={() => setOrderSide('sell')}
              data-testid="button-sell-tab-modal"
            >
              Sell
            </button>
          </div>
          
          {/* Order Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="orderType">Order Type</Label>
                <Select value={orderType} onValueChange={(value: 'limit' | 'market') => setOrderType(value)}>
                  <SelectTrigger data-testid="select-order-type-modal">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="limit">Limit Order</SelectItem>
                    <SelectItem value="market">Market Order</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="quantity">Quantity (Fractions)</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="10"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  data-testid="input-quantity-modal"
                />
              </div>
            </div>
            
            {orderType === 'limit' && (
              <div>
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="1,024.50"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  data-testid="input-price-modal"
                />
              </div>
            )}
            
            <p className="text-xs text-muted-foreground">
              Min: 1 fraction ({formatCurrency(bond.minInvestment)})
            </p>
            
            {/* Order Summary */}
            {orderType === 'limit' && totalValue > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Value:</span>
                      <span className="font-medium">{formatCurrency(totalValue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Trading Fee:</span>
                      <span>{formatCurrency(tradingFee)}</span>
                    </div>
                    <div className="flex justify-between font-medium border-t border-border pt-2">
                      <span>Total:</span>
                      <span>{formatCurrency(totalCost)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Account Balance */}
            {account?.account && (
              <div className="text-sm text-muted-foreground">
                Available Balance: {formatCurrency(account.account.cashBalance)}
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button 
                type="button"
                variant="outline" 
                className="flex-1" 
                onClick={onClose}
                data-testid="button-cancel-trade"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className={cn(
                  "flex-1",
                  orderSide === 'buy' 
                    ? 'bg-success hover:bg-success/90' 
                    : 'bg-destructive hover:bg-destructive/90'
                )}
                disabled={createOrderMutation.isPending}
                data-testid="button-place-order-modal"
              >
                {createOrderMutation.isPending 
                  ? 'Placing Order...' 
                  : `Place ${orderSide === 'buy' ? 'Buy' : 'Sell'} Order`
                }
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
