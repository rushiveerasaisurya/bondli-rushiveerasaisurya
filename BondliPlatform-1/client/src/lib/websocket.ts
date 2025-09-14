export class WebSocketManager {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isManuallyDisconnected = false;

  constructor(private url?: string) {
    this.url = url || this.getWebSocketUrl();
  }

  private getWebSocketUrl(): string {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${window.location.host}/ws`;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url!);
        
        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          this.isManuallyDisconnected = false;
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          
          if (!this.isManuallyDisconnected && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (event) => {
          console.error('WebSocket error:', event);
          reject(new Error('WebSocket connection failed'));
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  private handleMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data);
      const eventType = data.type;
      
      if (this.listeners.has(eventType)) {
        this.listeners.get(eventType)!.forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            console.error('Error in WebSocket message handler:', error);
          }
        });
      }
      
      // Notify all listeners for '*' (catch-all)
      if (this.listeners.has('*')) {
        this.listeners.get('*')!.forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            console.error('Error in WebSocket catch-all handler:', error);
          }
        });
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;

    console.log(`Scheduling WebSocket reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

    this.reconnectTimeout = setTimeout(() => {
      this.connect().catch(error => {
        console.error('Reconnection failed:', error);
      });
    }, delay);
  }

  on(eventType: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    
    this.listeners.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(eventType);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.listeners.delete(eventType);
        }
      }
    };
  }

  off(eventType: string, callback?: (data: any) => void): void {
    if (callback) {
      const listeners = this.listeners.get(eventType);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.listeners.delete(eventType);
        }
      }
    } else {
      this.listeners.delete(eventType);
    }
  }

  send(message: any): boolean {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error('Failed to send WebSocket message:', error);
        return false;
      }
    }
    
    console.warn('WebSocket is not connected. Cannot send message.');
    return false;
  }

  disconnect(): void {
    this.isManuallyDisconnected = true;
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }

    this.reconnectAttempts = 0;
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getReadyState(): number | null {
    return this.ws?.readyState ?? null;
  }
}

// Singleton instance
export const wsManager = new WebSocketManager();

// Auto-connect when module is imported
wsManager.connect().catch(error => {
  console.error('Initial WebSocket connection failed:', error);
});
