import React from "react";

interface FeeStatsProps {
  currentMonth: {
    month: number;
    year: number;
    paid: number;
    due: number;
    pending: number;
    paidAmount: number;
    dueAmount: number;
    pendingAmount: number;
  };
}

const FeeStats: React.FC<FeeStatsProps> = React.memo(({ currentMonth }) => {
  const monthName = new Date(
    currentMonth.year,
    currentMonth.month,
  ).toLocaleString("default", { month: "long" });
  return (
    <div className="bg-white shadow rounded p-4 mb-6">
      <div className="font-semibold mb-2">
        Fee Stats ({monthName} {currentMonth.year})
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <div className="text-xs text-gray-500">Paid</div>
          <div className="text-lg font-bold">{currentMonth.paid}</div>
          <div className="text-sm text-green-600">
            ₹{currentMonth.paidAmount}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Due</div>
          <div className="text-lg font-bold">{currentMonth.due}</div>
          <div className="text-sm text-red-600">₹{currentMonth.dueAmount}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Pending</div>
          <div className="text-lg font-bold">{currentMonth.pending}</div>
          <div className="text-sm text-yellow-600">
            ₹{currentMonth.pendingAmount}
          </div>
        </div>
      </div>
    </div>
  );
});

export default FeeStats;
