import { Card, CardContent } from "@/components/ui/card";
import type { Order } from "@shared/schema";

interface OrderBookProps {
  bondId: string;
  orderBook?: {
    buyOrders: Order[];
    sellOrders: Order[];
  };
}

export default function OrderBook({ bondId, orderBook }: OrderBookProps) {
  if (!orderBook) {
    return (
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Order Book</h3>
          <div className="text-center py-8 text-muted-foreground">
            <p>Loading order book...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Order Book</h3>
        
        <div className="grid grid-cols-2 gap-6">
          {/* Sell Orders */}
          <div>
            <h4 className="text-sm font-medium text-destructive mb-3">Sell Orders</h4>
            <div className="space-y-1">
              {orderBook.sellOrders.length > 0 ? (
                orderBook.sellOrders.slice(0, 10).map((order) => (
                  <div 
                    key={order.id} 
                    className="order-book-row flex justify-between py-2 px-3 rounded text-sm hover:bg-muted/50"
                    data-testid={`sell-order-${order.id}`}
                  >
                    <span>₹{Number(order.price).toFixed(2)}</span>
                    <span>{order.quantity - (order.filledQuantity || 0)}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No sell orders
                </div>
              )}
            </div>
          </div>
          
          {/* Buy Orders */}
          <div>
            <h4 className="text-sm font-medium text-success mb-3">Buy Orders</h4>
            <div className="space-y-1">
              {orderBook.buyOrders.length > 0 ? (
                orderBook.buyOrders.slice(0, 10).map((order) => (
                  <div 
                    key={order.id} 
                    className="order-book-row flex justify-between py-2 px-3 rounded text-sm hover:bg-muted/50"
                    data-testid={`buy-order-${order.id}`}
                  >
                    <span>₹{Number(order.price).toFixed(2)}</span>
                    <span>{order.quantity - (order.filledQuantity || 0)}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No buy orders
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
