import { API_BASE_URL } from "@/constants/thresholds";

/**
 * Actuator control functions
 * Send commands to ventilation and alarm systems
 */

export async function setVentilation(enabled) {
  try {
    const response = await fetch(`${API_BASE_URL}/actuators/vent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ enabled }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("[Actuators] Ventilation command sent:", data);
    return data;
  } catch (error) {
    console.error("[Actuators] Ventilation control error:", error);
    throw error;
  }
}

export async function setAlarm(enabled) {
  try {
    const response = await fetch(`${API_BASE_URL}/actuators/alarm`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ enabled }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("[Actuators] Alarm command sent:", data);
    return data;
  } catch (error) {
    console.error("[Actuators] Alarm control error:", error);
    throw error;
  }
}
