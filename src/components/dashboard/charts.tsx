"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const AXIS = "hsl(var(--muted-foreground))";
const GRID = "hsl(var(--border))";

const tooltipStyle = {
  background: "hsl(var(--surface))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
  boxShadow: "0 8px 28px -6px hsl(var(--shadow-color) / 0.18)",
  color: "hsl(var(--surface-foreground))",
};

export function TrendArea({
  data,
  dataKey,
  xKey = "label",
  color = "hsl(var(--c-blue))",
  height = 240,
}: {
  data: any[];
  dataKey: string;
  xKey?: string;
  color?: string;
  height?: number;
}) {
  const id = React.useId().replace(/:/g, "");
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.28} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey={xKey} stroke={AXIS} fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke={AXIS} fontSize={11} tickLine={false} axisLine={false} width={48} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: GRID }} />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          fill={`url(#${id})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function MultiLine({
  data,
  series,
  xKey = "label",
  height = 240,
}: {
  data: any[];
  series: { key: string; color: string; label?: string }[];
  xKey?: string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey={xKey} stroke={AXIS} fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke={AXIS} fontSize={11} tickLine={false} axisLine={false} width={48} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: GRID }} />
        {series.map((s) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            stroke={s.color}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function Bars({
  data,
  dataKey,
  xKey = "label",
  color = "hsl(var(--c-violet))",
  height = 240,
}: {
  data: any[];
  dataKey: string;
  xKey?: string;
  color?: string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey={xKey} stroke={AXIS} fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke={AXIS} fontSize={11} tickLine={false} axisLine={false} width={48} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--muted) / 0.5)" }} />
        <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} maxBarSize={42} />
      </BarChart>
    </ResponsiveContainer>
  );
}

const PIE_COLORS = [
  "hsl(var(--c-blue))",
  "hsl(var(--c-violet))",
  "hsl(var(--c-amber))",
  "hsl(var(--c-emerald))",
  "hsl(var(--c-rose))",
  "hsl(var(--c-cyan))",
  "hsl(var(--c-orange))",
  "hsl(var(--c-indigo))",
];

export function Donut({
  data,
  dataKey,
  nameKey,
  height = 240,
}: {
  data: any[];
  dataKey: string;
  nameKey: string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Tooltip contentStyle={tooltipStyle} />
        <Pie
          data={data}
          dataKey={dataKey}
          nameKey={nameKey}
          innerRadius="58%"
          outerRadius="86%"
          paddingAngle={2}
          stroke="hsl(var(--surface))"
          strokeWidth={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

export { PIE_COLORS };
