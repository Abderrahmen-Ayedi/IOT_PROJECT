import { useState, useEffect, useRef, useCallback } from "react";
import { API_BASE_URL } from "@/constants/thresholds";

/**
 * useWebSocket — connects to FastAPI WebSocket endpoint
 * Receives sensor data and manages connection state
 */
export function useWebSocket() {
  const wsRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = useRef(1000);

  useEffect(() => {
    const connectWebSocket = () => {
      try {
        const wsUrl = API_BASE_URL.replace("http", "ws") + "/ws";
        console.log(`[WebSocket] Connecting to ${wsUrl}...`);
        
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log("[WebSocket] Connected ✓");
          setConnected(true);
          setError(null);
          reconnectAttempts.current = 0;
          reconnectDelay.current = 1000;
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setLastMessage(data);
          } catch (err) {
            console.warn("[WebSocket] Failed to parse message:", event.data);
          }
        };

        ws.onerror = (err) => {
          console.error("[WebSocket] Error:", err);
          setError("Erreur de connexion WebSocket");
        };

        ws.onclose = () => {
          console.log("[WebSocket] Disconnected");
          setConnected(false);
          
          // Auto-reconnect with exponential backoff
          if (reconnectAttempts.current < maxReconnectAttempts) {
            console.log(
              `[WebSocket] Reconnecting in ${reconnectDelay.current}ms... (attempt ${reconnectAttempts.current + 1})`
            );
            reconnectAttempts.current += 1;
            setTimeout(() => {
              reconnectDelay.current = Math.min(reconnectDelay.current * 2, 30000);
              connectWebSocket();
            }, reconnectDelay.current);
          } else {
            setError("Impossible de se connecter au serveur");
          }
        };

        wsRef.current = ws;
      } catch (err) {
        console.error("[WebSocket] Connection error:", err);
        setError(err.message);
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const send = useCallback((message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn("[WebSocket] Cannot send message - connection not open");
    }
  }, []);

  return { connected, lastMessage, error, send };
}
