"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function SalesChart({ data }: { data: { day: string; sales: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid stroke="#E4E8EF" vertical={false} />
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#5B6472" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: "#5B6472" }} axisLine={false} tickLine={false} width={44} />
        <Tooltip formatter={(v: number) => "₹" + v.toLocaleString("en-IN")} />
        <Line type="monotone" dataKey="sales" stroke="#0EA5B7" strokeWidth={2.4} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
