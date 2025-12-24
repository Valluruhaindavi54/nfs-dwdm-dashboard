 "use client";
import React from 'react';
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function TopologyChart({ topologyData }) {
  // 1. Safety check: if data is missing, show a message
  if (!topologyData || !Array.isArray(topologyData)) {
    return <div style={{ color: '#64748b', textAlign: 'center' }}>No valid data</div>;
  }

  // 2. Process data for the chart
  const statuses = [...new Set(topologyData.map(t => t.status || "Unknown"))];
  const counts = statuses.map(s => topologyData.filter(t => (t.status || "Unknown") === s).length);

  const data = {
    labels: statuses,
    datasets: [{
      data: counts,
      backgroundColor: ["#38bdf8", "#22c55e", "#fb7185", "#fbbf24"],
      hoverOffset: 10,
      borderWidth: 0,
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#cbd5e1',
          font: { size: 11 },
          padding: 20
        }
      }
    }
  };

  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      <Pie data={data} options={options} />
    </div>
  );
}