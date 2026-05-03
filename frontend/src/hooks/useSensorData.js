import { useState, useEffect, useRef, useCallback } from "react";
import { CHART_MAX_POINTS, POLL_INTERVAL_MS } from "@/constants/thresholds";
import { useWebSocket } from "@/hooks/useWebSocket";
import {
  simulateSensorData,
  getScenarioFromTick,
  computePredictions,
  computeAqi,
} from "@/utils/sensorHelpers";
import { alertTimestamp, appendCapped } from "@/utils/formatters";
import { setVentilation, setAlarm } from "@/utils/actuatorControl";

/**
 * useSensorData — central hook that drives the entire dashboard.
 * Now receives data from WebSocket connection to FastAPI backend.
 */
export function useSensorData() {
  const { connected, lastMessage } = useWebSocket();
  const lastScene  = useRef("");

  const [clock,      setClock]      = useState("--:--:--");
  const [readings,   setReadings]   = useState({ co2: null, gas: null, temp: null, hum: null });
  const [scenario,   setScenario]   = useState("ok");
  const [predictions,setPredictions]= useState({ co2: null, gas: null, anomaly: false, risk: "Faible", state: "ok", pm25: null });
  const [aqi,        setAqi]        = useState(0);
  const [co2History, setCo2History] = useState([]);
  const [gasHistory, setGasHistory] = useState([]);
  const [alerts,     setAlerts]     = useState([
    { id: 0, msg: "Système initialisé — surveillance active", type: "ok", time: alertTimestamp() },
  ]);
  const [vent,  setVent]  = useState(false);
  const [alarm, setAlarm] = useState(false);

  const pushAlert = useCallback((msg, type) => {
    setAlerts((prev) =>
      [{ id: Date.now(), msg, type, time: alertTimestamp() }, ...prev].slice(0, 6)
    );
  }, []);

  const toggleVent = useCallback(async () => {
    const newState = !vent;
    try {
      await setVentilation(newState);
      setVent(newState);
    } catch (error) {
      pushAlert("Erreur commande ventilation", "danger");
    }
  }, [vent, pushAlert]);

  const toggleAlarm = useCallback(async () => {
    const newState = !alarm;
    try {
      await setAlarm(newState);
      setAlarm(newState);
    } catch (error) {
      pushAlert("Erreur commande alarme", "danger");
    }
  }, [alarm, pushAlert]);

  // ── Update clock every second
  useEffect(() => {
    const interval = setInterval(() => {
      setClock(new Date().toLocaleTimeString("fr-FR"));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ── Process incoming WebSocket data
  useEffect(() => {
    if (!lastMessage) return;

    // Map WebSocket data to readings format
    const data = {
      co2: lastMessage.co2 || null,
      gas: lastMessage.gas || null,
      temp: lastMessage.temperature || null,
      hum: lastMessage.humidity || null,
    };

    setReadings(data);

    // ── Update history
    if (data.co2) setCo2History((prev) => appendCapped(prev, data.co2, CHART_MAX_POINTS));
    if (data.gas) setGasHistory((prev) => appendCapped(prev, data.gas, CHART_MAX_POINTS));

    // ── Compute AQI
    setAqi(computeAqi(data.co2, data.gas));

    // ── Determine scenario based on values
    let sc = "ok";
    if (data.co2 > 1200 || data.gas > 350) {
      sc = "danger";
    } else if (data.co2 > 800 || data.gas > 200) {
      sc = "warn";
    }
    
    setScenario(sc);

    // ── Predictions
    const computedPreds = computePredictions(data, sc);
    computedPreds.pm25 = lastMessage.pm25_prediction ?? null;
    setPredictions(computedPreds);

    // ── Alert logic on scenario change
    if (sc !== lastScene.current) {
      if (sc === "warn") {
        pushAlert(`CO₂ en hausse — seuil d'alerte approché (${data.co2} ppm)`, "warn");
      } else if (sc === "danger") {
        pushAlert(`CRITIQUE — CO₂ ${data.co2} ppm · ventilation requise`, "danger");
        // Auto-activate ventilation and alarm on critical levels
        if (!vent) {
          setVentilation(true).then(() => setVent(true)).catch(() => {});
        }
        if (!alarm) {
          setAlarm(true).then(() => setAlarm(true)).catch(() => {});
        }
      } else if (lastScene.current === "danger") {
        pushAlert("Retour à la normale — niveaux stabilisés", "ok");
        // Auto-deactivate on return to normal
        if (vent) {
          setVentilation(false).then(() => setVent(false)).catch(() => {});
        }
        if (alarm) {
          setAlarm(false).then(() => setAlarm(false)).catch(() => {});
        }
      }
      lastScene.current = sc;
    }
  }, [lastMessage, pushAlert, vent, alarm]);

  return {
    clock,
    readings,
    scenario,
    predictions,
    aqi,
    co2History,
    gasHistory,
    alerts,
    vent,
    alarm,
    connected,
    toggleVent,
    toggleAlarm,
  };
}
