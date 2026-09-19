import { Client, IMessage } from '@stomp/stompjs';

const ensureSockJsGlobal = () => {
  const globalRef = globalThis as typeof globalThis & { global?: typeof globalThis };

  if (!globalRef.global) {
    globalRef.global = globalThis;
  }
};

export type WsEventType =
  | 'ORDER_CREATED'
  | 'ORDER_STATUS_CHANGED'
  | 'KOT_CREATED'
  | 'KOT_STATUS_CHANGED'
  | 'ITEM_BUMPED'
  | 'TABLE_OCCUPIED'
  | 'TABLE_BILLING'
  | 'TABLE_RELEASED'
  | 'BILL_CREATED'
  | 'BILL_PAID'
  | 'BILL_UPDATED';

export interface WsMessagePayload {
  eventType: WsEventType;
  outletId: string;
  entityId: string;
  data: any;
  timestamp: string;
}

type MessageHandler = (payload: WsMessagePayload) => void;

class WebSocketManager {
  private client: Client | null = null;
  private handlers: Set<MessageHandler> = new Set();
  private isConnected = false;

  public connect(url: string = 'http://localhost:8080/ws') {
    if (this.client && (this.isConnected || this.client.active)) {
      return;
    }

    ensureSockJsGlobal();

    void import('sockjs-client').then(({ default: SockJS }) => {
      this.client = new Client({
        webSocketFactory: () => new SockJS(url),
        reconnectDelay: 5000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        onConnect: () => {
          this.isConnected = true;
          console.log('[WebSocket] Connected to STOMP Broker');

          // Subscribe to operational topics
          const topics = ['/topic/orders', '/topic/kitchen', '/topic/tables', '/topic/billing'];
          topics.forEach((topic) => {
            this.client?.subscribe(topic, (message: IMessage) => {
              try {
                const payload: WsMessagePayload = JSON.parse(message.body);
                this.notifyHandlers(payload);
              } catch (err) {
                console.warn('[WebSocket] Error parsing message body:', err);
              }
            });
          });
        },
        onDisconnect: () => {
          this.isConnected = false;
          console.log('[WebSocket] Disconnected');
        },
        onStompError: (frame) => {
          console.error('[WebSocket] Broker error: ' + frame.headers['message']);
        },
      });

      this.client.activate();
    }).catch((error) => {
      console.error('[WebSocket] Failed to initialize SockJS client:', error);
    });
  }

  public disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.isConnected = false;
      this.client = null;
    }
  }

  public subscribe(handler: MessageHandler): () => void {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  public getConnectedStatus(): boolean {
    return this.isConnected;
  }

  private notifyHandlers(payload: WsMessagePayload) {
    this.handlers.forEach((handler) => {
      try {
        handler(payload);
      } catch (err) {
        console.error('[WebSocket] Error in message handler:', err);
      }
    });
  }
}

export const wsManager = new WebSocketManager();
export default wsManager;
