import { useEffect, useRef } from "react";
import {
  Chart,
  DoughnutController, ArcElement, Tooltip,
} from "chart.js";
import { getAqiLevel } from "@/utils/sensorHelpers";
import styles from "./AqiGauge.module.css";

Chart.register(DoughnutController, ArcElement, Tooltip);

const SCALE_COLORS = ["#1D9E75", "#378ADD", "#BA7517", "#D85A30", "#E24B4A"];

export default function AqiGauge({ score }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);
  const level     = getAqiLevel(score);

  useEffect(() => {
    if (!canvasRef.current) return;
    chartRef.current = new Chart(canvasRef.current, {
      type: "doughnut",
      data: {
        datasets: [{
          data: [score, 100 - score],
          backgroundColor: [level.color, "#F1EFE8"],
          borderWidth: 0,
          circumference: 200,
          rotation: -100,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "80%",
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        animation: { duration: 400 },
      },
    });
    return () => chartRef.current?.destroy();
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;
    chartRef.current.data.datasets[0].data             = [score, 100 - score];
    chartRef.current.data.datasets[0].backgroundColor  = [level.color, "#F1EFE8"];
    chartRef.current.update();
  }, [score, level.color]);

  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>Indice de qualité (AQI)</p>

      <div className={styles.gaugeArea}>
        <canvas ref={canvasRef} role="img" aria-label={`Indice AQI : ${score}`} />
      </div>

      <div className={styles.center}>
        <span className={styles.score} style={{ color: level.color }}>{score || "—"}</span>
        <span className={styles.label} style={{ background: level.bg, color: level.color }}>
          {level.label}
        </span>
      </div>

      <div className={styles.scale}>
        {SCALE_COLORS.map((c, i) => (
          <div key={i} className={styles.scaleSeg} style={{ background: c }} />
        ))}
      </div>
      <div className={styles.scaleLabels}>
        <span style={{ color: "var(--teal-dark)" }}>Bon</span>
        <span style={{ color: "var(--red-dark)" }}>Critique</span>
      </div>
    </div>
  );
}
