 import React from 'react';
import UserActivityChart from "./components/UserActivityChart";
import TopologyChart from "./components/TopologyChart";
import { GlassCard, StatCard, AlarmChip } from "./components/ClientWrappers";

async function getData(endpoint: string) {
  const url = `http://192.168.21.27:9999/api/${endpoint}`;
  try {
    const res = await fetch(url, { 
      method: 'GET',
      cache: "no-store",
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json' 
      }
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

  // --- LOGIC CALCULATIONS ---
  const totalUsers = users.length;
  const activeUsers = users.filter((u: any) => u.status?.toLowerCase() === "active").length;
  const inactiveUsers = totalUsers - activeUsers;

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

  // --- STYLING ---
  const tableHeaderStyle: React.CSSProperties = { 
    position: "sticky", top: 0, background: "#1e293b", zIndex: 2, fontSize: "10px", 
    textTransform: "uppercase", color: "#64748b", padding: "12px 8px", textAlign: "left", 
    borderBottom: "1px solid rgba(255,255,255,0.1)" 
  };

  const cellStyle: React.CSSProperties = { 
    padding: "12px 8px", fontSize: "11px", borderBottom: "1px solid rgba(255,255,255,0.03)", color: "#e2e8f0" 
  };

  // Increased height slightly for all cards (from 380px to 440px)
  const cardHeight = "440px";

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", color: "#f8fafc", background: "#0f172a", minHeight: "100vh" }}>

      {/* TOP STATS BAR */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
        <StatCard label="Nodes Up" count={nodeStats.up} color="#22c55e" />
        <StatCard label="Nodes Down" count={nodeStats.down} color="#ef4444" />
        <StatCard label="Active Users" count={activeUsers} color="#38bdf8" />
        <StatCard label="Total Inventory" count={inventory.length} color="#a855f7" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

        {/* 1. NODE STATUS */}
        <GlassCard style={{ height: cardHeight, display: "flex", flexDirection: "column" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "12px" }}>Nodes List</h2>
          <div style={{ overflowY: "auto", flex: 1 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={tableHeaderStyle}>Name</th>
                  <th style={tableHeaderStyle}>IP</th>
                  <th style={tableHeaderStyle}>Status</th>
                  <th style={tableHeaderStyle}>Type</th>
                  <th style={tableHeaderStyle}>Region</th>
                  <th style={tableHeaderStyle}>Uptime</th>
                </tr>
              </thead>
              <tbody>
                {nodes.map((node: any, i: number) => (
                  <tr key={i}>
                    <td style={{ ...cellStyle, fontWeight: "500" }}>{node.name}</td>
                    <td style={{ ...cellStyle, color: "#94a3b8", fontFamily: "monospace" }}>{node.ip}</td>
                    <td style={{ ...cellStyle, fontWeight: "bold", color: node.status?.toUpperCase() === "UP" ? "#22c55e" : "#ef4444" }}>
                      {node.status?.toUpperCase()}
                    </td>
                    <td style={cellStyle}>{node.type}</td>
                    <td style={cellStyle}>{node.region}</td>
                    <td style={cellStyle}>{node.uptime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* 2. ACTIVE ALARMS */}
        <GlassCard style={{ height: cardHeight, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: "600" }}>System Alarms</h2>
            <div style={{ display: "flex", gap: "8px" }}>
              <AlarmChip label="Crit" count={alarmCounts.critical} color="#ef4444" />
              <AlarmChip label="Maj" count={alarmCounts.major} color="#f97316" />
            </div>
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={tableHeaderStyle}>NodeID</th>
                  <th style={tableHeaderStyle}>Severity</th>
                  <th style={tableHeaderStyle}>Type</th>
                  <th style={tableHeaderStyle}>Description</th>
                  <th style={tableHeaderStyle}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {alarms.map((alarm: any, i: number) => (
                  <tr key={i}>
                    <td style={cellStyle}>{alarm.nodeId || alarm.nodeid}</td>
                    <td style={{ ...cellStyle, fontWeight: "600", color: alarm.severity?.toLowerCase() === 'critical' ? "#ef4444" : "#f97316" }}>
                      {alarm.severity}
                    </td>
                    <td style={cellStyle}>{alarm.type || "N/A"}</td>
                    <td style={{ ...cellStyle, maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {alarm.description || alarm.message}
                    </td>
                    <td style={{ ...cellStyle, color: "#64748b" }}>{alarm.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* 3. PERFORMANCE */}
        <GlassCard style={{ height: cardHeight, display: "flex", flexDirection: "column" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "12px" }}>Performance Metrics</h2>
          <div style={{ overflowY: "auto", flex: 1 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={tableHeaderStyle}>Node ID</th>
                  <th style={tableHeaderStyle}>Latency</th>
                  <th style={tableHeaderStyle}>Throughput</th>
                  <th style={tableHeaderStyle}>Error Rate</th>
                  <th style={tableHeaderStyle}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {performance.map((p: any, i: number) => (
                  <tr key={i}>
                    <td style={cellStyle}>{p.nodeId}</td>
                    <td style={{ ...cellStyle, color: "#86efac" }}>{p.latency}ms</td>
                    <td style={cellStyle}>{p.throughput || '0'}Gbps</td>
                    <td style={{ ...cellStyle, color: "#fb7185" }}>{p.errorrate || p.errorRate || 0}%</td>
                    <td style={{ ...cellStyle, color: "#64748b" }}>{p.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* 4. USER ACTIVITY TRENDS */}
        <GlassCard style={{ height: cardHeight, display: "flex", flexDirection: "column" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "12px" }}>User Activity Trends</h2>
          <div style={{ flex: 1, minHeight: 0 }}>
            <UserActivityChart 
              totalCount={totalUsers} 
              activeCount={activeUsers} 
              inactiveCount={inactiveUsers} 
            />
          </div>
        </GlassCard>

        {/* 5. NETWORK TOPOLOGY (FULL WIDTH - PAGE SIZE LENGTH) */}
        <GlassCard style={{ 
          gridColumn: "1 / -1", 
          height: cardHeight, 
          display: "flex", 
          flexDirection: "column" 
        }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "20px" }}>Network Topology Analysis</h2>
          <div style={{ display: "flex", gap: "40px", flex: 1, overflow: "hidden" }}>
            
            {/* Chart Area */}
            <div style={{ width: "400px", height: "100%" }}>
              <TopologyChart topologyData={topology} />
            </div>

            {/* Table Area */}
            <div style={{ flex: 1, overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>Source</th>
                    <th style={tableHeaderStyle}>Target</th>
                    <th style={tableHeaderStyle}>Status</th>
                    <th style={{ ...tableHeaderStyle, textAlign: "right" }}>Utilization (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {topology.map((t: any, i: number) => (
                    <tr key={i}>
                      <td style={cellStyle}>{t.source}</td>
                      <td style={cellStyle}>{t.target}</td>
                      <td style={{ 
                        ...cellStyle, 
                        fontWeight: "bold",
                        color: t.status?.toUpperCase() === "ACTIVE" || t.status?.toUpperCase() === "UP" ? "#86efac" : "#ef4444" 
                      }}>
                        {t.status || "N/A"}
                      </td>
                      <td style={{ ...cellStyle, textAlign: "right", color: t.utilization > 80 ? "#fb7185" : "#86efac", fontWeight: "bold" }}>
                        {t.utilization ? `${t.utilization}%` : "0%"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </GlassCard>
        
        {/* 6. NETWORK ASSETS (INVENTORY) */}
        <GlassCard style={{ height: cardHeight, display: "flex", flexDirection: "column" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "12px" }}>Inventory Tracking</h2>
          <div style={{ overflowY: "auto", flex: 1 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={tableHeaderStyle}>Serial</th>
                  <th style={tableHeaderStyle}>Model</th>
                  <th style={tableHeaderStyle}>Vendor</th>
                  <th style={tableHeaderStyle}>Location</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item: any, i: number) => (
                  <tr key={i}>
                    <td style={cellStyle}>{item.serial || item.nodeid}</td>
                    <td style={cellStyle}>{item.model || "N/A"}</td>
                    <td style={cellStyle}>{item.vendor || "N/A"}</td>
                    <td style={cellStyle}>{item.location || item.rack || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* 7. SYSTEM CONFIG */}
        <GlassCard style={{ height: cardHeight, display: "flex", flexDirection: "column" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "12px" }}>System Configs</h2>
          <div style={{ overflowY: "auto", flex: 1 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={tableHeaderStyle}>Config Key</th>
                  <th style={tableHeaderStyle}>Value</th>
                  <th style={tableHeaderStyle}>Applied On</th>
                </tr>
              </thead>
              <tbody>
                {configData.map((cfg: any, i: number) => (
                  <tr key={i}>
                    <td style={cellStyle}>{cfg.key || cfg.id}</td>
                    <td style={cellStyle}>{cfg.value || cfg.status}</td>
                    <td style={cellStyle}>{cfg.lastApplied || cfg.backuptime || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

      </div>
    </div>
  );
}