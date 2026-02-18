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
  occupiedSeats?: number; // Make it optional with ?
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
