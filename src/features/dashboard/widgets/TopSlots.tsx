interface TopSlotsProps {
  topSlots: Array<{
    _id: string;
    name: string;
    timeRange: { start: string; end: string };
    occupancyPercentage: number;
    occupiedSeats: number;
    totalSeats: number;
  }>;
}

export default function TopSlots({ topSlots }: TopSlotsProps) {
  return (
    <div className="bg-white rounded shadow p-2 sm:p-4 min-h-[120px] flex flex-col">
      <div className="font-bold text-base mb-2">Top Performing Slots</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {topSlots.length === 0 ? (
          <div className="text-gray-400 text-xs text-center col-span-full">
            No slots found
          </div>
        ) : (
          topSlots.map((slot) => (
            <div
              key={slot._id}
              className="flex items-center justify-between border rounded p-2 bg-gray-50"
            >
              <div className="flex flex-col">
                <div
                  className="font-medium text-sm truncate max-w-[120px]"
                  title={slot.name}
                >
                  {slot.name}
                </div>
                <div className="text-xs text-gray-500">
                  {slot.timeRange.start} - {slot.timeRange.end}
                </div>
              </div>
              <div className="text-right flex flex-col items-end">
                <span
                  className={
                    slot.occupancyPercentage >= 80
                      ? "text-green-600 font-bold"
                      : slot.occupancyPercentage >= 50
                        ? "text-yellow-600 font-bold"
                        : "text-red-600 font-bold"
                  }
                >
                  {slot.occupancyPercentage}%
                </span>
                <span className="text-xs text-gray-500">
                  {slot.occupiedSeats}/{slot.totalSeats} seats
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
