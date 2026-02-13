interface RecentPaymentsProps {
  payments: Array<{
    studentId: string;
    studentName: string;
    month: string;
    year: number;
    totalAmount: number;
    status: "PAID" | "DUE" | "PENDING";
  }>;
}

export default function RecentPayments({ payments }: RecentPaymentsProps) {
  return (
    <div className="bg-white rounded shadow p-2 min-h-[120px] flex flex-col">
      <div className="font-bold text-sm mb-2">Recent Payments</div>
      <div className="space-y-2">
        {payments.length === 0 ? (
          <div className="text-gray-400 text-xs text-center">
            No recent payments
          </div>
        ) : (
          payments.map((payment) => (
            <div
              key={payment.studentId}
              className="flex items-center justify-between"
            >
              <div className="flex flex-col">
                <div className="font-medium text-sm">{payment.studentName}</div>
                <div className="text-xs text-gray-500">
                  {payment.month} {payment.year}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-green-600 text-sm">
                  ₹{payment.totalAmount}
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    payment.status === "PAID"
                      ? "bg-green-100 text-green-600"
                      : payment.status === "DUE"
                        ? "bg-red-100 text-red-600"
                        : "bg-yellow-100 text-yellow-600"
                  }`}
                >
                  {payment.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
