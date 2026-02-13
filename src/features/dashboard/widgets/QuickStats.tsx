
interface QuickStatsProps {
  stats: {
    collectionRate: number;
    advanceBalance: number;
    totalAdvance: number;
    avgMonthlyFee: number;
    overdueStudents: number;
    overduePercent: number;
  };
}

export default function QuickStats({ stats }: QuickStatsProps) {
  return (
    <div className="bg-white rounded shadow p-2 min-h-[120px] flex flex-col">
      <div className="font-bold text-sm mb-2">Quick Statistics</div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <div className="text-xs text-gray-500">Collection Rate</div>
          <div className="text-lg font-bold">{stats.collectionRate}%</div>
        </div>
        <div className="space-y-1">
          <div className="text-xs text-gray-500">Advance Balance</div>
          <div className="text-lg font-bold">₹{stats.advanceBalance}</div>
          <div className="text-xs text-gray-500">
            Total: ₹{stats.totalAdvance}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-xs text-gray-500">Avg. Monthly Fee</div>
          <div className="text-lg font-bold">₹{stats.avgMonthlyFee}</div>
        </div>
        <div className="space-y-1">
          <div className="text-xs text-gray-500">Overdue Students</div>
          <div className="text-lg font-bold text-red-600">
            {stats.overdueStudents}
          </div>
          <div className="text-xs text-gray-500">
            {stats.overduePercent}% of active
          </div>
        </div>
      </div>
    </div>
  );
}
