import { THRESHOLDS, AQI_LEVELS } from "@/constants/thresholds";

/**
 * Returns the severity state for a given sensor reading.
 * @param {"co2"|"gas"|"temp"|"hum"} key
 * @param {number} value
 * @returns {"ok"|"warn"|"danger"}
 */
export function getSensorState(key, value) {
  const t = THRESHOLDS[key];
  if (!t || value == null) return "ok";
  if (value >= t.danger) return "danger";
  if (value >= t.warn)   return "warn";
  return "ok";
}

/**
 * Returns a fill percentage (0–100) relative to thresholds.
 * @param {"co2"|"gas"|"temp"|"hum"} key
 * @param {number} value
 */
export function getFillPercent(key, value) {
  const t = THRESHOLDS[key];
  if (!t || value == null) return 0;
  return Math.min(100, Math.max(0, ((value - t.min) / (t.max - t.min)) * 100));
}

/**
 * Computes a 0–100 AQI score from CO2 and gas readings.
 */
export function computeAqi(co2, gas) {
  if (co2 == null || gas == null) return 0;
  return Math.min(100, Math.max(0, Math.round(((co2 - 400) / 14) + (gas / 5))));
}

/**
 * Returns the AQI level object { label, color, bg } for a given score.
 */
export function getAqiLevel(score) {
  return AQI_LEVELS.find((l) => score <= l.max) || AQI_LEVELS[AQI_LEVELS.length - 1];
}

/**
 * Formats a sensor value for display.
 */
export function formatValue(key, value) {
  if (value == null) return "—";
  if (key === "temp") return `${value.toFixed(1)} °C`;
  return `${Math.round(value)}`;
}

/**
 * Simulates realistic sensor data for a given scenario.
 * Replace this entire function when connecting real hardware.
 */
export function simulateSensorData(scenario) {
  const rand = (base, variance, min, max) =>
    Math.min(max, Math.max(min, base + (Math.random() - 0.5) * 2 * variance));

  switch (scenario) {
    case "warn":
      return {
        co2:  Math.round(rand(970,  130, 700,  1250)),
        gas:  Math.round(rand(290,  65,  180,  420)),
        temp: parseFloat(rand(34,   4,   26,   42).toFixed(1)),
        hum:  Math.round(rand(68,   10,  45,   88)),
      };
    case "danger":
      return {
        co2:  Math.round(rand(1450, 160, 1100, 1850)),
        gas:  Math.round(rand(470,  85,  330,  620)),
        temp: parseFloat(rand(41,   5,   33,   52).toFixed(1)),
        hum:  Math.round(rand(82,   10,  62,   96)),
      };
    default: // "ok"
      return {
        co2:  Math.round(rand(620,  90,  400,  820)),
        gas:  Math.round(rand(160,  45,  50,   250)),
        temp: parseFloat(rand(27,   3,   18,   34).toFixed(1)),
        hum:  Math.round(rand(55,   8,   30,   80)),
      };
  }
}

/**
 * Derives the current scenario from a tick counter (cycles every 120 ticks).
 */
export function getScenarioFromTick(tick) {
  const phase = tick % 120;
  if (phase < 45) return "ok";
  if (phase < 85) return "warn";
  return "danger";
}

/**
 * Generates ML-style predictions (simple trend extrapolation).
 * Replace with a real /api/predict call in production.
 */
export function computePredictions(readings, scenario) {
  const multipliers = { ok: 0.97, warn: 1.04, danger: 1.09 };
  const gasMultipliers = { ok: 0.95, warn: 1.05, danger: 1.11 };
  const m  = multipliers[scenario]    ?? 1;
  const mg = gasMultipliers[scenario] ?? 1;

  return {
    co2:     Math.round((readings.co2 ?? 0) * m),
    gas:     Math.round((readings.gas ?? 0) * mg),
    anomaly: scenario === "danger",
    risk:    scenario === "danger" ? "Élevé" : scenario === "warn" ? "Modéré" : "Faible",
    state:   scenario,
  };
}
