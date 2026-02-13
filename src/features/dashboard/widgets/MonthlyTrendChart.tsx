import React from "react";
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

interface MonthlyTrendChartProps {
  monthlyTrend: Array<{
    month: string;
    paid: number;
    due: number;
    paidAmount: number;
    dueAmount: number;
  }>;
}

const MonthlyTrendChart: React.FC<MonthlyTrendChartProps> = React.memo(
  ({ monthlyTrend }) => (
    <div className="bg-white shadow rounded p-4 mb-4">
      <div className="font-semibold mb-2">
        Monthly Fee Trend (Last 6 Months)
      </div>
      <div className="w-full">
        <ResponsiveContainer width="100%" aspect={2}>
          <LineChart
            data={monthlyTrend}
            margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" fontSize={12} />
            <YAxis fontSize={12} tickFormatter={(v: number) => `₹${v}`} />
            <Tooltip
              formatter={(v?: number) => (v !== undefined ? `₹${v}` : "")}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="paidAmount"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Paid Amount"
            />
            <Line
              type="monotone"
              dataKey="dueAmount"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Due Amount"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  ),
);

export default MonthlyTrendChart;
