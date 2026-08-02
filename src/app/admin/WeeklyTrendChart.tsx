"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface WeekPoint {
  week_start: string;
  signups: number;
  referrals: number;
}

export default function WeeklyTrendChart({ data }: { data: WeekPoint[] }) {
  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.week_start).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));

  return (
    <div className="h-[220px] -ml-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formatted} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2A2D35" />
          <XAxis dataKey="label" stroke="#787E8C" tick={{ fontSize: 11 }} />
          <YAxis stroke="#787E8C" tick={{ fontSize: 11 }} allowDecimals={false} width={28} />
          <Tooltip
            contentStyle={{
              background: "#1B1E25",
              border: "1px solid #2A2D35",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "#F7F5F1" }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="signups" name="Signups" stroke="#E8A33D" strokeWidth={2} dot={false} />
          <Line
            type="monotone"
            dataKey="referrals"
            name="Referrals"
            stroke="#3ED9A3"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
