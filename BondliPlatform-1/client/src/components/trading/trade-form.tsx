import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Bond, Account } from "@shared/schema";

interface TradeFormProps {
  bond: Bond;
  account?: Account;
  onOrderPlaced: () => void;
}

export default function TradeForm({ bond, account, onOrderPlaced }: TradeFormProps) {
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'limit' | 'market'>('limit');
  const [price, setPrice] = useState(bond.currentPrice || '');
  const [quantity, setQuantity] = useState('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      await apiRequest('POST', '/api/orders', orderData);
    },
    onSuccess: () => {
      toast({
        title: "Order placed successfully",
        description: `Your ${orderSide} order has been submitted.`,
      });
      
      // Reset form
      setPrice(bond.currentPrice || '');
      setQuantity('');
      
      // Refresh data
      onOrderPlaced();
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio'] });
    },
    onError: (error) => {
      toast({
        title: "Order failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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

    const totalValue = orderType === 'limit' ? Number(price) * Number(quantity) : null;
    const tradingFee = 25; // Fixed fee for demo
    const totalCost = totalValue ? totalValue + tradingFee : 0;

    if (orderSide === 'buy' && account && totalCost > Number(account.cashBalance)) {
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

  const totalValue = orderType === 'limit' && price && quantity 
    ? Number(price) * Number(quantity) 
    : 0;
  const tradingFee = 25;
  const totalCost = totalValue + tradingFee;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex border-b border-border mb-4">
          <button 
            type="button"
            className={`flex-1 py-3 px-4 text-center font-medium ${
              orderSide === 'buy' 
                ? 'bg-success/10 text-success border-b-2 border-success' 
                : 'text-muted-foreground hover:bg-accent'
            }`}
            onClick={() => setOrderSide('buy')}
            data-testid="button-buy-tab"
          >
            Buy
          </button>
          <button 
            type="button"
            className={`flex-1 py-3 px-4 text-center font-medium ${
              orderSide === 'sell' 
                ? 'bg-destructive/10 text-destructive border-b-2 border-destructive' 
                : 'text-muted-foreground hover:bg-accent'
            }`}
            onClick={() => setOrderSide('sell')}
            data-testid="button-sell-tab"
          >
            Sell
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="orderType">Order Type</Label>
            <Select value={orderType} onValueChange={(value: 'limit' | 'market') => setOrderType(value)}>
              <SelectTrigger data-testid="select-order-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="limit">Limit Order</SelectItem>
                <SelectItem value="market">Market Order</SelectItem>
              </SelectContent>
            </Select>
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
                data-testid="input-price"
              />
            </div>
          )}
          
          <div>
            <Label htmlFor="quantity">Quantity (Fractions)</Label>
            <Input
              id="quantity"
              type="number"
              placeholder="10"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              data-testid="input-quantity"
            />
            <p className="text-xs text-muted-foreground mt-1">Min: 1 fraction (₹10,000)</p>
          </div>
          
          {orderType === 'limit' && totalValue > 0 && (
            <div className="bg-muted rounded-lg p-4">
              <div className="flex justify-between text-sm">
                <span>Total Value:</span>
                <span className="font-medium">₹{totalValue.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Trading Fee:</span>
                <span>₹{tradingFee}</span>
              </div>
              <div className="flex justify-between text-sm font-medium border-t border-border pt-2 mt-2">
                <span>Total:</span>
                <span>₹{totalCost.toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}
          
          <Button 
            type="submit" 
            className={`w-full ${orderSide === 'buy' ? 'bg-success hover:bg-success/90' : 'bg-destructive hover:bg-destructive/90'} text-white`}
            disabled={createOrderMutation.isPending}
            data-testid="button-place-order"
          >
            {createOrderMutation.isPending 
              ? 'Placing Order...' 
              : `Place ${orderSide === 'buy' ? 'Buy' : 'Sell'} Order`
            }
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
