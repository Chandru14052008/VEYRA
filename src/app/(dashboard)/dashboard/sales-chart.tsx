"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

function formatYAxis(value: number) {
  if (value >= 100000) return "₹" + (value / 100000).toFixed(1) + "L";
  if (value >= 1000) return "₹" + (value / 1000).toFixed(0) + "K";
  return "₹" + value;
}

export default function SalesChart({ data }: { data: { day: string; sales: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
        <CartesianGrid stroke="#E4E8EF" vertical={false} />
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#5B6472" }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 10, fill: "#5B6472" }} axisLine={false} tickLine={false} width={54} />
        <Tooltip formatter={(v: number) => "₹" + v.toLocaleString("en-IN")} />
        <Line type="monotone" dataKey="sales" stroke="#0EA5B7" strokeWidth={2.4} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}