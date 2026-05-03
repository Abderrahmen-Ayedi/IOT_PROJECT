import { useEffect, useRef } from "react";
import {
  Chart,
  LineController, LineElement, PointElement,
  LinearScale, CategoryScale, Filler, Tooltip, Legend,
} from "chart.js";
import styles from "./HistoryChart.module.css";

Chart.register(
  LineController, LineElement, PointElement,
  LinearScale, CategoryScale, Filler, Tooltip, Legend
);

export default function HistoryChart({ co2History, gasHistory }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  // Init chart once
  useEffect(() => {
    if (!canvasRef.current) return;

    chartRef.current = new Chart(canvasRef.current, {
      type: "line",
      data: {
        labels: Array(co2History.length).fill(""),
        datasets: [
          {
            label: "CO₂ (ppm)",
            data: [],
            borderColor: "#1D9E75",
            backgroundColor: "rgba(29,158,117,0.08)",
            borderWidth: 1.5,
            tension: 0.4,
            pointRadius: 0,
            fill: true,
          },
          {
            label: "Gaz toxique (ppm)",
            data: [],
            borderColor: "#BA7517",
            backgroundColor: "rgba(186,117,23,0.05)",
            borderWidth: 1.5,
            tension: 0.4,
            pointRadius: 0,
            fill: true,
            borderDash: [4, 3],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 250 },
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
          x: { display: false },
          y: {
            grid:  { color: "rgba(0,0,0,0.04)" },
            ticks: { color: "#B4B2A9", font: { size: 9 }, maxTicksLimit: 5 },
            border:{ display: false },
          },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, []);

  // Update data on each new reading
  useEffect(() => {
    if (!chartRef.current) return;
    chartRef.current.data.labels                  = Array(co2History.length).fill("");
    chartRef.current.data.datasets[0].data        = co2History;
    chartRef.current.data.datasets[1].data        = gasHistory;
    chartRef.current.update("none");
  }, [co2History, gasHistory]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.title}>Historique temps réel</span>
        <div className={styles.legend}>
          <LegendItem color="#1D9E75" label="CO₂ (ppm)" />
          <LegendItem color="#BA7517" label="Gaz toxique (ppm)" dashed />
        </div>
      </div>
      <div className={styles.chartArea}>
        <canvas ref={canvasRef} role="img" aria-label="Historique CO2 et gaz toxiques" />
      </div>
    </div>
  );
}

function LegendItem({ color, label, dashed }) {
  return (
    <div className={styles.legItem}>
      <div
        className={styles.legDot}
        style={{
          background: dashed ? "transparent" : color,
          border: dashed ? `1.5px dashed ${color}` : "none",
        }}
      />
      <span>{label}</span>
    </div>
  );
}
