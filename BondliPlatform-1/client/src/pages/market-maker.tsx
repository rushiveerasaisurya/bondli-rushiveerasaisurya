import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { TrendingUp, Coins, Quote, Warehouse } from "lucide-react";

export default function MarketMaker() {
  const [selectedBondId, setSelectedBondId] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bonds } = useQuery({
    queryKey: ['/api/bonds'],
  });

  const { data: quotes } = useQuery({
    queryKey: ['/api/market-maker/quotes', selectedBondId],
    enabled: !!selectedBondId,
  });

  const updateQuoteMutation = useMutation({
    mutationFn: async (quoteData: any) => {
      await apiRequest('POST', '/api/market-maker/quotes', quoteData);
    },
    onSuccess: () => {
      toast({
        title: "Quote updated successfully",
        description: "Your market maker quote has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/market-maker/quotes'] });
    },
    onError: (error) => {
      toast({
        title: "Quote update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Market Maker Portal</h2>
        <p className="text-muted-foreground">Manage liquidity provision and quotes</p>
      </div>

      {/* MM Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Today's Volume</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-mm-volume">₹8.4 Cr</p>
                <p className="text-success text-sm">+22% vs avg</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Spread Earned</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-mm-spread">₹2,450</p>
                <p className="text-success text-sm">+₹450 today</p>
              </div>
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <Coins className="text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Active Quotes</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-active-quotes">24</p>
                <p className="text-muted-foreground text-sm">12 bonds</p>
              </div>
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                <Quote className="text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Inventory Value</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-inventory-value">₹45.2 Cr</p>
                <p className="text-success text-sm">+1.2% P&L</p>
              </div>
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                <Warehouse className="text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Quote Management */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Active Quotes</h3>
            
            {/* Add Quote Form */}
            <div className="border border-border rounded-lg p-4 mb-4">
              <h4 className="font-medium mb-3">Add New Quote</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Bond</label>
                  <select 
                    className="w-full px-2 py-1 border border-input rounded text-sm"
                    value={selectedBondId}
                    onChange={(e) => setSelectedBondId(e.target.value)}
                    data-testid="select-quote-bond"
                  >
                    <option value="">Select Bond</option>
                    {bonds?.map((bond: any) => (
                      <option key={bond.id} value={bond.id}>
                        {bond.issuer} {bond.couponRate}%
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Size</label>
                  <Input className="h-8 text-sm" placeholder="100" data-testid="input-quote-size" />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Bid Price</label>
                  <Input className="h-8 text-sm" placeholder="1023.75" data-testid="input-bid-price" />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Ask Price</label>
                  <Input className="h-8 text-sm" placeholder="1025.25" data-testid="input-ask-price" />
                </div>
              </div>
              <Button 
                size="sm" 
                className="w-full mt-3"
                disabled={!selectedBondId || updateQuoteMutation.isPending}
                data-testid="button-add-quote"
              >
                {updateQuoteMutation.isPending ? 'Adding...' : 'Add Quote'}
              </Button>
            </div>

            {/* Existing Quotes */}
            <div className="space-y-4">
              {quotes?.map((quote: any) => (
                <div key={quote.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Bond #{quote.bondId.slice(-6)}</h4>
                    <Badge className="bg-success/10 text-success text-xs">Active</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Bid</p>
                      <p className="font-medium text-success">₹{Number(quote.bidPrice).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Size: {quote.bidSize}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Ask</p>
                      <p className="font-medium text-destructive">₹{Number(quote.askPrice).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Size: {quote.askSize}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-3">
                    <Button size="sm" variant="outline" className="flex-1" data-testid={`button-update-${quote.id}`}>
                      Update
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" data-testid={`button-cancel-${quote.id}`}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No active quotes</p>
                  <p className="text-sm mt-1">Add quotes to provide liquidity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Inventory Management */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Inventory</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 font-medium text-muted-foreground text-sm">Bond</th>
                    <th className="text-left py-2 font-medium text-muted-foreground text-sm">Position</th>
                    <th className="text-left py-2 font-medium text-muted-foreground text-sm">P&L</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="py-3 text-sm">
                      <p className="font-medium">HDFC Bank</p>
                      <p className="text-xs text-muted-foreground">INE040A08027</p>
                    </td>
                    <td className="py-3 text-sm">+250</td>
                    <td className="py-3 text-sm text-success">+₹3,250</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3 text-sm">
                      <p className="font-medium">Reliance</p>
                      <p className="text-xs text-muted-foreground">INE002A08031</p>
                    </td>
                    <td className="py-3 text-sm">-120</td>
                    <td className="py-3 text-sm text-destructive">-₹1,890</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3 text-sm">
                      <p className="font-medium">Tata Motors</p>
                      <p className="text-xs text-muted-foreground">INE155A08026</p>
                    </td>
                    <td className="py-3 text-sm">+180</td>
                    <td className="py-3 text-sm text-success">+₹2,160</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
