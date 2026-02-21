import { useQuery } from "@tanstack/react-query";
import { getSeatChart } from "../../../../api/slotApi";

export interface Seat {
  seatNumber: string;
  status: "VACANT" | "OCCUPIED" | "BLOCKED_BY_FULL_DAY";
  studentName?: string;
  studentId?: string;
}

export interface SeatChartResponse {
  roomName: string;
  slotName: string;
  totalSeats: number;
  seats: Seat[];
}

export const useSeatChart = (slotId: string | undefined) => {
  return useQuery<SeatChartResponse>({
    queryKey: ["seatChart", slotId],
    queryFn: () => getSeatChart(slotId!),
    enabled: !!slotId,
    staleTime: 60 * 1000, // 1 minute
  });
};
