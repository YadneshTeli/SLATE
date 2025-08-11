// WebSocket Connection Fallback for Development
// This file handles cases where HMR WebSocket connections might fail

if (import.meta.env.DEV) {
  // Fallback for HMR WebSocket connection issues
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;

  const handleWebSocketError = (error?: Error | Event | CloseEvent) => {
    if (reconnectAttempts < maxReconnectAttempts) {
      reconnectAttempts++;
      console.warn(`HMR WebSocket connection failed. Attempting reconnection (${reconnectAttempts}/${maxReconnectAttempts})...`, error);
      
      // Try to reconnect after an exponential backoff delay
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
      setTimeout(() => {
        if (import.meta.hot) {
          try {
            // Force HMR to attempt reconnection
            window.location.reload();
          } catch (reconnectError) {
            console.warn('HMR WebSocket reconnection failed:', reconnectError);
          }
        }
      }, delay);
    } else {
      console.warn('HMR WebSocket connection failed after multiple attempts. Manual refresh may be needed for updates.');
    }
  };

  // Enhanced error handling with proper typing
  const originalWebSocket = window.WebSocket;
  if (originalWebSocket) {
    // Create a proxy to intercept WebSocket connections
    const WebSocketProxy = class extends originalWebSocket {
      constructor(url: string | URL, protocols?: string | string[]) {
        super(url, protocols);
        
        this.addEventListener('error', (event) => {
          if (url.toString().includes('localhost:5173')) {
            handleWebSocketError(event);
          }
        });
        
        this.addEventListener('close', (event) => {
          if (url.toString().includes('localhost:5173') && event.code !== 1000) {
            console.warn('HMR WebSocket closed unexpectedly:', event.code, event.reason);
            handleWebSocketError(event);
          }
        });
      }
    };
    
    // Replace window.WebSocket with our proxy
    (window as Window & { WebSocket: typeof WebSocket }).WebSocket = WebSocketProxy;
  }

  // Listen for Vite HMR events
  if (import.meta.hot) {
    import.meta.hot.on('vite:error', (payload) => {
      console.error('Vite error:', payload);
      handleWebSocketError();
    });
    import.meta.hot.on('vite:ws:disconnect', () => {
      console.log('HMR WebSocket disconnected. Attempting reconnection...');
      handleWebSocketError();
    });
  }

  // Fallback: Check if WebSocket is available
  if (!window.WebSocket || !navigator.onLine) {
    console.warn('WebSocket not available or offline. HMR disabled.');
  }
}
