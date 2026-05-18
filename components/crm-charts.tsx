"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Funnel,
  FunnelChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { chartData, funnelData, sourceData } from "@/data/crm";

const colors = ["#14B8A6", "#38BDF8", "#A78BFA", "#F59E0B", "#EF4444"];

export type TrendPoint = {
  calls: number;
  leads: number;
  name: string;
  won: number;
};

export type ChartSlice = {
  name: string;
  value: number;
};

function tooltipStyle() {
  return {
    background: "rgba(15, 23, 42, 0.96)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "14px",
    boxShadow: "0 18px 44px rgba(0,0,0,0.28)",
    color: "#F9FAFB"
  };
}

export function RevenueTrendChart({ data = chartData }: { data?: TrendPoint[] }) {
  return (
    <ResponsiveContainer height={270} width="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#14B8A6" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#14B8A6" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(148,163,184,0.12)" strokeDasharray="3 3" vertical={false} />
        <XAxis axisLine={false} dataKey="name" stroke="#94A3B8" tickLine={false} tickMargin={10} />
        <YAxis axisLine={false} stroke="#94A3B8" tickLine={false} tickMargin={10} />
        <Tooltip contentStyle={tooltipStyle()} />
        <Area dataKey="leads" fill="url(#revenueFill)" stroke="#14B8A6" strokeWidth={2.5} type="monotone" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CallAnalyticsChart({ data = chartData }: { data?: TrendPoint[] }) {
  return (
    <ResponsiveContainer height={270} width="100%">
      <BarChart data={data}>
        <CartesianGrid stroke="rgba(148,163,184,0.12)" strokeDasharray="3 3" vertical={false} />
        <XAxis axisLine={false} dataKey="name" stroke="#94A3B8" tickLine={false} tickMargin={10} />
        <YAxis axisLine={false} stroke="#94A3B8" tickLine={false} tickMargin={10} />
        <Tooltip contentStyle={tooltipStyle()} />
        <Bar dataKey="calls" fill="#38BDF8" radius={[8, 8, 2, 2]} />
        <Bar dataKey="won" fill="#14B8A6" radius={[8, 8, 2, 2]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function FunnelAnalyticsChart({ data = funnelData }: { data?: ChartSlice[] }) {
  return (
    <ResponsiveContainer height={260} width="100%">
      <FunnelChart>
        <Tooltip contentStyle={tooltipStyle()} />
        <Funnel data={data} dataKey="value" isAnimationActive nameKey="name">
          {data.map((entry, index) => (
            <Cell fill={colors[index % colors.length]} key={entry.name} />
          ))}
        </Funnel>
      </FunnelChart>
    </ResponsiveContainer>
  );
}

export function SourcePieChart({ data = sourceData }: { data?: ChartSlice[] }) {
  return (
    <ResponsiveContainer height={260} width="100%">
      <PieChart>
        <Tooltip contentStyle={tooltipStyle()} />
        <Pie data={data} dataKey="value" innerRadius={68} outerRadius={108} paddingAngle={4}>
          {data.map((entry, index) => (
            <Cell fill={colors[index % colors.length]} key={entry.name} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
