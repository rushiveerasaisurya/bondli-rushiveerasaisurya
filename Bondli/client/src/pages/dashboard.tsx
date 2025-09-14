import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Coins, Users, ArrowRightLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface MarketStats {
  totalVolume: string;
  activeBonds: number;
  avgSpread: string;
  activeTraders: number;
}

interface TopBond {
  id: string;
  issuer: string;
  isin: string;
  currentPrice: string;
  change: string;
}

interface RecentTrade {
  id: string;
  time: string;
  bondName: string;
  isin: string;
  price: string;
  quantity: number;
  value: string;
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<MarketStats>({
    queryKey: ['/api/dashboard/stats'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: topBonds, isLoading: bondsLoading } = useQuery<TopBond[]>({
    queryKey: ['/api/dashboard/top-bonds'],
    refetchInterval: 30000,
  });

  const { data: recentTrades, isLoading: tradesLoading } = useQuery<RecentTrade[]>({
    queryKey: ['/api/trades'],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  if (statsLoading || bondsLoading || tradesLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Market Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Volume Today</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-total-volume">
                  {stats?.totalVolume || "₹0"}
                </p>
                <p className="text-success text-sm flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  <span>+18.2%</span>
                </p>
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
                <p className="text-muted-foreground text-sm">Active Bonds</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-active-bonds">
                  {stats?.activeBonds || 0}
                </p>
                <p className="text-success text-sm flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  <span>+3 new</span>
                </p>
              </div>
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                <Coins className="text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Avg Bid-Ask Spread</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-avg-spread">
                  {stats?.avgSpread || "0.00%"}
                </p>
                <p className="text-success text-sm flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  <span>-0.05%</span>
                </p>
              </div>
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                <ArrowRightLeft className="text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Active Traders</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-active-traders">
                  {stats?.activeTraders || 0}
                </p>
                <p className="text-success text-sm flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  <span>+12 today</span>
                </p>
              </div>
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <Users className="text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Overview and Top Bonds */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Market Chart */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Bond Market Index</h3>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded">1D</button>
                <button className="px-3 py-1 text-sm text-muted-foreground hover:bg-accent rounded">1W</button>
                <button className="px-3 py-1 text-sm text-muted-foreground hover:bg-accent rounded">1M</button>
              </div>
            </div>
            
            {/* Mock Chart Container */}
            <div className="chart-container h-64 rounded-lg flex items-end justify-center p-6 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <svg viewBox="0 0 400 200" className="w-full h-full">
                  <polyline fill="none" stroke="white" strokeWidth="2" 
                            points="0,150 50,140 100,145 150,120 200,110 250,105 300,100 350,95 400,90"/>
                </svg>
              </div>
              <div className="text-white text-center">
                <p className="text-3xl font-bold" data-testid="text-market-index">₹1,245.67</p>
                <p className="text-sm opacity-90">+2.34% (+₹28.45) Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Top Performing Bonds */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Top Performers</h3>
            <div className="space-y-4">
              {topBonds?.slice(0, 3).map((bond) => (
                <div key={bond.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{bond.issuer}</p>
                    <p className="text-xs text-muted-foreground">{bond.isin}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{bond.currentPrice}</p>
                    <p className={cn(
                      "text-xs",
                      bond.change.startsWith('+') ? "text-success" : "text-destructive"
                    )}>
                      {bond.change}
                    </p>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No bond data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Trade Activity</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Time</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Bond</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">ISIN</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Price</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Quantity</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Value</th>
                </tr>
              </thead>
              <tbody>
                {recentTrades?.slice(0, 10).map((trade) => (
                  <tr key={trade.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4 text-sm">{trade.time}</td>
                    <td className="py-3 px-4 text-sm font-medium">{trade.bondName}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{trade.isin}</td>
                    <td className="py-3 px-4 text-sm">{trade.price}</td>
                    <td className="py-3 px-4 text-sm">{trade.quantity} fractions</td>
                    <td className="py-3 px-4 text-sm">{trade.value}</td>
                  </tr>
                )) || (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      No recent trades available
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
