export interface SlotTimeRange {
  start: string;
  end: string;
}

export interface Slot {
  _id: string;
  name: string;
  timeRange: SlotTimeRange;
  monthlyFee: number;
  totalSeats: number;
  isActive: boolean;
  roomId: string;
  slotType: "FULL_DAY" | "PARTIAL";
  occupiedSeats?: number;
  availableSeats?: number; // Make these optional too if needed
  occupancyPercentage?: number;
}

export interface SlotDetailsResponse {
  slot: Slot;
  occupancy: {
    totalSeats: number;
    occupiedSeats: number;
    availableSeats: number;
    occupancyPercentage: number;
  };
  students: Array<{
    _id: string;
    name: string;
    phone: string;
    seatNumber?: string;
    joiningDate: string;
  }>;
}
