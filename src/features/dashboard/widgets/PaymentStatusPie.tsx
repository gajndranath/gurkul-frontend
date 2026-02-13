import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface PaymentStatusPieProps {
  paymentStatus: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

export default function PaymentStatusPie({
  paymentStatus,
}: PaymentStatusPieProps) {
  return (
    <div className="bg-white rounded shadow p-2 min-h-[120px] flex flex-col">
      <div className="font-bold text-sm mb-2">Payment Status</div>
      <div className="w-full">
        <ResponsiveContainer width="100%" aspect={2}>
          <PieChart>
            <Pie
              data={paymentStatus}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(props) => {
                const name = props.name ?? "";
                const percent = props.percent ?? 0;
                return `${name}: ${(percent * 100).toFixed(0)}%`;
              }}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {paymentStatus.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => `${v} students`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* Mobile fallback table */}
      <div className="overflow-x-auto mt-2">
        <table className="min-w-full text-xs">
          <thead>
            <tr>
              <th className="px-2 py-1">Status</th>
              <th className="px-2 py-1">Count</th>
            </tr>
          </thead>
          <tbody>
            {paymentStatus.map((item) => (
              <tr key={item.name}>
                <td
                  className="px-2 py-1 font-medium"
                  style={{ color: item.color }}
                >
                  {item.name}
                </td>
                <td className="px-2 py-1">{item.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
