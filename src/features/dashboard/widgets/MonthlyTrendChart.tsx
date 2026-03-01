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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";

interface MonthlyTrendChartProps {
  monthlyTrend: Array<{
    month: string;
    paid: number;
    due: number;
    paidAmount: number;
    dueAmount: number;
  }>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-2xl backdrop-blur-xl">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">{label}</p>
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <p className="text-xs font-black text-white uppercase tracking-tighter">
                {entry.name}: <span className="text-blue-400">₹{entry.value}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const MonthlyTrendChart: React.FC<MonthlyTrendChartProps> = React.memo(
  ({ monthlyTrend }) => (
    <Card className="border-none shadow-sm bg-white rounded-[48px] overflow-hidden group h-full flex flex-col">
      <div className="p-10 flex justify-between items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest rounded-full border-blue-100 bg-blue-50 text-blue-600 px-3 py-1">
              Financial Velocity
            </Badge>
          </div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
            Revenue <span className="text-blue-600">Trajectory</span>
          </h3>
        </div>
        <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
           <Activity size={24} />
        </div>
      </div>

      <CardContent className="px-6 pb-10">
        <div className="w-full h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={monthlyTrend}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="month" 
                fontSize={10} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "#94a3b8", fontWeight: 900 }}
                dy={15}
              />
              <YAxis 
                fontSize={10} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "#94a3b8", fontWeight: 900 }}
                tickFormatter={(v: number) => `₹${v/1000}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                align="right" 
                iconType="circle"
                content={({ payload }) => (
                  <div className="flex gap-6 justify-end mb-8">
                    {payload?.map((entry: any, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              />
              <Line
                type="monotone"
                dataKey="paidAmount"
                stroke="#2563eb"
                strokeWidth={4}
                dot={{ r: 6, fill: "#2563eb", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 8, strokeWidth: 0 }}
                name="Revenue"
              />
              <Line
                type="monotone"
                dataKey="dueAmount"
                stroke="#f43f5e"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 4, fill: "#f43f5e", strokeWidth: 2, stroke: "#fff" }}
                name="Liability"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  ),
);

export default MonthlyTrendChart;
