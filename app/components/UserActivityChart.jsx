 "use client";
import React from 'react';
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function UserActivityChart({ totalCount, activeCount, inactiveCount }) {
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"], 
    datasets: [
      {
        label: "Total Users",
        data: [totalCount, totalCount, totalCount, totalCount, totalCount, totalCount],
        borderColor: "#38bdf8",
        backgroundColor: "rgba(56, 189, 248, 0.05)",
        borderDash: [5, 5], // Dashed line to distinguish "Total"
        pointRadius: 0,
        fill: false,
        tension: 0,
      },
      {
        label: "Active Users",
        data: [activeCount - 1, activeCount + 1, activeCount, activeCount + 2, activeCount - 1, activeCount],
        borderColor: "#22c55e",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Inactive Users",
        data: [inactiveCount + 1, inactiveCount - 1, inactiveCount, inactiveCount + 1, inactiveCount, inactiveCount],
        borderColor: "#f43f5e",
        backgroundColor: "rgba(244, 63, 94, 0.1)",
        fill: true,
        tension: 0.4,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: { color: '#94a3b8', font: { size: 10 }, usePointStyle: true }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      y: {
        grid: { color: "rgba(255, 255, 255, 0.05)" },
        ticks: { color: "#64748b" },
        beginAtZero: true
      },
      x: {
        grid: { display: false },
        ticks: { color: "#64748b" }
      }
    }
  };

  return (
    <div style={{ height: "300px", width: "100%" }}>
      <Line data={data} options={options} />
    </div>
  );
}