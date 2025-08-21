import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid
} from "recharts";
import { motion } from "framer-motion";

export default function Dashboard({ projects }) {
  const total = projects.length;
  const completed = projects.filter(p => p.status === "Completed").length;
  const inProgress = projects.filter(p => p.status === "In Progress").length;
  const notStarted = projects.filter(p => p.status === "Not Started").length;

  // Data Bar
  const chartData = projects.map(p => ({
    name: p.name || "Tanpa Nama",
    progress: p.progress || 0,
  }));

  // Data Pie
  const pieData = [
    { name: "Selesai ✅", value: completed },
    { name: "Berjalan 🚀", value: inProgress },
    { name: "Belum Mulai ⏳", value: notStarted },
  ];
  const COLORS = ["#22c55e", "#3b82f6", "#facc15"];

  // Data Line
  const monthlyCounts = {};
  projects.forEach(p => {
    if (p.deadline) {
      const d = new Date(p.deadline);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyCounts[key] = (monthlyCounts[key] || 0) + 1;
    }
  });
  const lineData = Object.entries(monthlyCounts).map(([month, count]) => ({
    month, count
  }));

  // Motion Card wrapper
  const MotionCard = motion(Card);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">📊 Dashboard</h1>

      {/* Grid Chart */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Chart Progress */}
        <MotionCard
          className="rounded-2xl shadow-lg"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-3">📈 Progress</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.7}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" hide />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="progress" fill="url(#barGradient)" radius={[10,10,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </MotionCard>

        {/* Chart Status */}
        <MotionCard
          className="rounded-2xl shadow-lg"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-3">📌 Status</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                      <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.3"/>
                    </filter>
                  </defs>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        filter="url(#shadow)"
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </MotionCard>

        {/* Chart Tren */}
        <MotionCard
          className="rounded-2xl shadow-lg"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-3">📊 Tren Proyek</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2}/>
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="url(#lineGradient)"
                    strokeWidth={3}
                    dot={{ r: 5, fill: "#f97316", stroke: "#fff", strokeWidth: 2 }}
                  />
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#f97316" />
                      <stop offset="100%" stopColor="#ea580c" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </MotionCard>

      </div>
    </div>
  );
}
