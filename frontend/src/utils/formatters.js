import { format } from "date-fns";
import { fr } from "date-fns/locale";

/**
 * Returns current time as HH:mm:ss.
 */
export function nowTime() {
  return format(new Date(), "HH:mm:ss", { locale: fr });
}

/**
 * Returns current date as "dd MMM yyyy".
 */
export function nowDate() {
  return format(new Date(), "dd MMM yyyy", { locale: fr });
}

/**
 * Returns a full timestamp string for alert logs.
 */
export function alertTimestamp() {
  return format(new Date(), "HH:mm:ss · dd/MM/yyyy");
}

/**
 * Clamps a number between min and max.
 */
export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Appends a new item to a capped array (FIFO).
 */
export function appendCapped(arr, item, maxLength) {
  const next = [...arr, item];
  return next.length > maxLength ? next.slice(-maxLength) : next;
}
