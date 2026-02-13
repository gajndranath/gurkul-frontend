export interface Slot {
  _id: string;
  name: string;
  timeRange: {
    start: string;
    end: string;
  };
  monthlyFee: number;
  totalSeats: number;
  isActive: boolean;
  occupiedSeats: number;
  availableSeats: number;
  occupancyPercentage: number;
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
