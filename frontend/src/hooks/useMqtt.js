import { useState, useEffect, useRef } from "react";
import mqtt from "mqtt";
import { MQTT_CONFIG } from "@/constants/thresholds";

/**
 * useMqtt — connects to a real Mosquitto broker over WebSocket.
 *
 * Usage:
 *   const { lastMessage, connected } = useMqtt();
 *
 * In useSensorData, replace simulateSensorData() with:
 *   const { lastMessage } = useMqtt();
 *   useEffect(() => { if (lastMessage) setReadings(lastMessage); }, [lastMessage]);
 */
export function useMqtt() {
  const clientRef    = useRef(null);
  const [connected,  setConnected]  = useState(false);
  const [lastMessage,setLastMessage]= useState(null);
  const [error,      setError]      = useState(null);

  useEffect(() => {
    const client = mqtt.connect(MQTT_CONFIG.brokerUrl, {
      clientId:        MQTT_CONFIG.clientId,
      keepalive:       MQTT_CONFIG.options.keepalive,
      reconnectPeriod: MQTT_CONFIG.options.reconnectPeriod,
      connectTimeout:  MQTT_CONFIG.options.connectTimeout,
    });

    clientRef.current = client;

    client.on("connect", () => {
      setConnected(true);
      setError(null);
      client.subscribe(MQTT_CONFIG.topic, { qos: 1 });
    });

    client.on("message", (_topic, payload) => {
      try {
        const parsed = JSON.parse(payload.toString());
        setLastMessage(parsed);
      } catch {
        console.warn("[MQTT] Failed to parse message:", payload.toString());
      }
    });

    client.on("error",      (err) => setError(err.message));
    client.on("disconnect", ()    => setConnected(false));
    client.on("offline",    ()    => setConnected(false));

    return () => {
      client.end(true);
    };
  }, []);

  const publish = (payload) => {
    if (clientRef.current?.connected) {
      clientRef.current.publish(
        MQTT_CONFIG.topic + "/commands",
        JSON.stringify(payload),
        { qos: 1 }
      );
    }
  };

  return { connected, lastMessage, error, publish };
}
