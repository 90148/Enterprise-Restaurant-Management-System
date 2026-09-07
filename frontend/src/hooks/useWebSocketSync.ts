import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import wsManager, { WsMessagePayload } from '@/api/websocket';

export const useWebSocketSync = () => {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    wsManager.connect();
    setIsConnected(wsManager.getConnectedStatus());

    const unsubscribe = wsManager.subscribe((payload: WsMessagePayload) => {
      setIsConnected(true);
      console.log('[WebSocketSync] Received event:', payload.eventType);

      switch (payload.eventType) {
        case 'ORDER_CREATED':
        case 'ORDER_STATUS_CHANGED':
          queryClient.invalidateQueries({ queryKey: ['orders'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
          break;
        case 'KOT_CREATED':
        case 'KOT_STATUS_CHANGED':
        case 'ITEM_BUMPED':
          queryClient.invalidateQueries({ queryKey: ['kitchen-kots'] });
          queryClient.invalidateQueries({ queryKey: ['orders'] });
          break;
        case 'TABLE_OCCUPIED':
        case 'TABLE_BILLING':
        case 'TABLE_RELEASED':
          queryClient.invalidateQueries({ queryKey: ['tables'] });
          queryClient.invalidateQueries({ queryKey: ['floors'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
          break;
        case 'BILL_CREATED':
        case 'BILL_PAID':
        case 'BILL_UPDATED':
          queryClient.invalidateQueries({ queryKey: ['bills'] });
          queryClient.invalidateQueries({ queryKey: ['reports'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
          break;
      }
    });

    const interval = setInterval(() => {
      setIsConnected(wsManager.getConnectedStatus());
    }, 3000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [queryClient]);

  return { isConnected };
};

export default useWebSocketSync;
