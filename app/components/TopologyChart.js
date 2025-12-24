// components/TopologyChart.js
"use client";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function TopologyChart({ topologyData }) {
  const statuses = [...new Set(topologyData.map(t => t.status || "Unknown"))];
  const counts = statuses.map(s => topologyData.filter(t => (t.status || "Unknown") === s).length);

  const data = {
    labels: statuses,
    datasets: [{
      data: counts,
      backgroundColor: ["#22c55e", "#ef4444", "#38bdf8", "#f59e0b"],
      borderWidth: 0,
    }]
  };

  return (
    <div style={{ height: "200px", position: "relative" }}>
      <Pie 
        data={data} 
        options={{ 
          maintainAspectRatio: false, 
          plugins: { legend: { position: 'bottom', labels: { color: '#cbd5e1', font: { size: 10 } } } } 
        }} 
      />
    </div>
  );
}