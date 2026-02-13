import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface SlotOccupancyBarProps {
  slots: Array<{
    name: string;
    occupied: number;
    available: number;
    occupancy: number;
  }>;
}

export default function SlotOccupancyBar({ slots }: SlotOccupancyBarProps) {
  return (
    <div className="bg-white rounded shadow p-2 min-h-[120px] flex flex-col">
      <div className="font-bold text-sm mb-2">Slot Occupancy</div>
      <div className="w-full">
        <ResponsiveContainer width="100%" aspect={2}>
          <BarChart
            data={slots}
            margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip formatter={(v) => `${v} seats`} />
            <Legend />
            <Bar
              dataKey="occupied"
              name="Occupied Seats"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="available"
              name="Available Seats"
              fill="#64748b"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Mobile fallback table */}
      <div className="overflow-x-auto mt-2">
        <table className="min-w-full text-xs">
          <thead>
            <tr>
              <th className="px-2 py-1">Slot</th>
              <th className="px-2 py-1">Occupied</th>
              <th className="px-2 py-1">Available</th>
              <th className="px-2 py-1">Occupancy %</th>
            </tr>
          </thead>
          <tbody>
            {slots.map((slot) => (
              <tr key={slot.name}>
                <td className="px-2 py-1 font-medium">{slot.name}</td>
                <td className="px-2 py-1 text-blue-600">{slot.occupied}</td>
                <td className="px-2 py-1 text-gray-600">{slot.available}</td>
                <td className="px-2 py-1">{slot.occupancy}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
