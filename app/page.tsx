 import React from 'react';
import UserActivityChart from "./components/UserActivityChart";
import TopologyChart from "./components/TopologyChart";
// This import handles the components that need "use client"
import { GlassCard, StatCard, AlarmChip, UserMetric } from "./components/ClientWrappers";

async function getData(endpoint: string) {
  const url = `http://192.168.21.27:9999/api/${endpoint}`;
  try {
    const res = await fetch(url, { 
      method: 'GET',
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : (data.data || []); 
  } catch (err: any) {
    console.error(`Fetch error for ${endpoint}:`, err.message);
    return []; 
  }
}

export default async function HomePage() {
  const [nodes, alarms, users, configData, performance, inventory, topology] = await Promise.all([
    getData("nodes"),
    getData("alarms"),
    getData("users"),
    getData("configs"),     
    getData("performance"),
    getData("inventory"),
    getData("topology")
  ]);

  // Data Logic
  const totalUsers = users.length;
  const activeUsers = users.filter((u: any) => u.status?.toLowerCase() === "active").length;
  const inactiveUsers = totalUsers - activeUsers;

  const user = users.find((u: any) => u.status?.toLowerCase() === "active") || users[0];
  const loginActions = (user?.actions || []).filter((a: any) => a.action === "login");
  const lastLogin = loginActions.length
    ? loginActions.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0].timestamp
    : "--";

  const nodeStats = nodes.reduce((acc: any, node: any) => {
    const status = node.status?.toUpperCase();
    if (status === "UP") acc.up++;
    else if (status === "DOWN") acc.down++;
    else if (status === "MAINTENANCE") acc.maint++;
    return acc;
  }, { up: 0, down: 0, maint: 0 });

  const alarmCounts = alarms.reduce((acc: any, alarm: any) => {
    const sev = alarm.severity?.toLowerCase();
    if (sev === "critical") acc.critical++;
    else if (sev === "major") acc.major++;
    else if (sev === "minor") acc.minor++;
    return acc;
  }, { critical: 0, major: 0, minor: 0 });

  const tableHeaderStyle: React.CSSProperties = { 
    position: "sticky", top: 0, background: "#1e293b", zIndex: 2, fontSize: "10px", 
    textTransform: "uppercase", color: "#64748b", padding: "6px 8px", textAlign: "left", 
    borderBottom: "1px solid rgba(255,255,255,0.1)" 
  };

  const cellStyle: React.CSSProperties = { 
    padding: "6px 8px", fontSize: "10px", borderBottom: "1px solid rgba(255,255,255,0.03)", color: "#e2e8f0" 
  };

  return (
    <div style={{ padding: "16px", fontFamily: "sans-serif", color: "#f8fafc", background: "#0f172a", minHeight: "100vh" }}>

      {/* TOP STATS BAR */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <StatCard label="Nodes Up" count={nodeStats.up} color="#86efac" />
        <StatCard label="Nodes Down" count={nodeStats.down} color="#fca5a5" />
        <StatCard label="System Alarms" count={alarms.length} color="#fef08a" />
        <StatCard label="Maintenance" count={nodeStats.maint} color="#f97316" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>

        {/* ACTIVE ALARMS */}
        <GlassCard>
          <h2 style={{ fontSize: "0.9rem", fontWeight: "600", marginBottom: "8px" }}>Active Alarms</h2>
          <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
            <AlarmChip label="Critical" count={alarmCounts.critical} color="#ef4444" />
            <AlarmChip label="Major" count={alarmCounts.major} color="#f97316" />
            <AlarmChip label="Minor" count={alarmCounts.minor} color="#eab308" />
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={tableHeaderStyle}>id</th>
                  <th style={tableHeaderStyle}>severity</th>
                  <th style={tableHeaderStyle}>description</th>
                  <th style={{ ...tableHeaderStyle, textAlign: "right" }}>timestamp</th>
                </tr>
              </thead>
              <tbody>
                {alarms.map((alarm: any, i: number) => (
                  <tr key={i}>
                    <td style={cellStyle}>{alarm.id}</td>
                    <td style={{ ...cellStyle, color: alarm.severity?.toLowerCase() === 'critical' ? "#ef4444" : "#f97316" }}>{alarm.severity}</td>
                    <td style={{ ...cellStyle, maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{alarm.description}</td>
                    <td style={{ ...cellStyle, textAlign: "right", color: "#64748b", fontSize: "9px" }}>{alarm.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* NODE STATUS */}
        <GlassCard>
          <h2 style={{ fontSize: "0.9rem", fontWeight: "600", marginBottom: "8px" }}>Node Status</h2>
          <div style={{ overflowY: "auto", flex: 1 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={tableHeaderStyle}>Node</th>
                  <th style={tableHeaderStyle}>IP</th>
                  <th style={{ ...tableHeaderStyle, textAlign: "center" }}>Status</th>
                  <th style={{ ...tableHeaderStyle, textAlign: "right" }}>Uptime</th>
                </tr>
              </thead>
              <tbody>
                {nodes.map((node: any, i: number) => (
                  <tr key={i}>
                    <td style={cellStyle}>{node.name}</td>
                    <td style={{ ...cellStyle, color: "#94a3b8", fontSize: "9px" }}>{node.ip}</td>
                    <td style={{ ...cellStyle, textAlign: "center", color: node.status?.toUpperCase() === "UP" ? "#22c55e" : "#ef4444" }}>{node.status}</td>
                    <td style={{ ...cellStyle, textAlign: "right", color: "#64748b" }}>{node.uptime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* USER ACTIVITY */}
        <GlassCard>
          <h2 style={{ fontSize: "0.9rem", fontWeight: "600", marginBottom: "8px" }}>User Activity</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px", marginBottom: "10px" }}>
            <UserMetric label="TOTAL USERS" value={totalUsers} color="#38bdf8" />
            <UserMetric label="ACTIVE" value={activeUsers} color="#22c55e" />
            <UserMetric label="LAST LOGIN" value={lastLogin} color="#eab308" />
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <UserActivityChart active={activeUsers} inactive={inactiveUsers} total={totalUsers} />
          </div>
        </GlassCard>

        {/* PERFORMANCE */}
        <GlassCard>
          <h2 style={{ fontSize: "0.9rem", fontWeight: "600", marginBottom: "8px" }}>Live Performance</h2>
          <div style={{ overflowY: "auto", flex: 1 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={tableHeaderStyle}>node id</th>
                  <th style={tableHeaderStyle}>latency</th>
                  <th style={{ ...tableHeaderStyle, textAlign: "right" }}>timestamp</th>
                </tr>
              </thead>
              <tbody>
                {performance.map((p: any, i: number) => (
                  <tr key={i}>
                    <td style={cellStyle}>{p.nodeId}</td>
                    <td style={{ ...cellStyle, color: "#86efac" }}>{p.latency}ms</td>
                    <td style={{ ...cellStyle, textAlign: "right", color: "#64748b" }}>{p.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* TOPOLOGY ANALYSIS */}
        <GlassCard fullWidth style={{ minHeight: "300px", maxHeight: "300px" }}>
          <h2 style={{ fontSize: "0.9rem", fontWeight: "600", marginBottom: "10px" }}>Network Topology Analysis</h2>
          <div style={{ display: "flex", gap: "24px", alignItems: "start", height: "100%" }}>
            <div style={{ width: "300px", height: "220px" }}>
              <TopologyChart topologyData={topology} />
            </div>
            <div style={{ flex: 1, overflowY: "auto", maxHeight: "220px" }}>
              <table style={{ width: "100%" }}>
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>Source</th>
                    <th style={tableHeaderStyle}>Target</th>
                    <th style={{ ...tableHeaderStyle, textAlign: "right" }}>Utilization</th>
                  </tr>
                </thead>
                <tbody>
                  {topology.map((t: any, i: number) => (
                    <tr key={i}>
                      <td style={cellStyle}>{t.source}</td>
                      <td style={cellStyle}>{t.target}</td>
                      <td style={{ ...cellStyle, textAlign: "right", color: "#86efac" }}>{t.utilization}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}