import axiosInstance from "./axiosInstance";

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

  availableSeats?: number;
  occupancyPercentage?: number;
}

export const getAllSlots = async () => {
  const { data } = await axiosInstance.get("/slots");
  return data.data; // Following your ApiResponse structure
};

// Get slot master data (can be cached on frontend too)
export const getSlotMasterData = async () => {
  const { data } = await axiosInstance.get("/slots/master/data");
  return data.data;
};

export const getSlotDetails = async (slotId: string) => {
  const { data } = await axiosInstance.get(`/slots/${slotId}`);
  return data.data;
};

export const createSlot = async (slotData: Omit<Slot, "_id" | "isActive">) => {
  const { data } = await axiosInstance.post("/slots", slotData);
  return data.data;
};

export const updateSlot = async (slotId: string, updateData: Partial<Slot>) => {
  const { data } = await axiosInstance.patch(`/slots/${slotId}`, updateData);
  return data.data;
};

export const deactivateSlot = async (slotId: string) => {
  const { data } = await axiosInstance.delete(`/slots/${slotId}`);
  return data.data;
};

export const getSeatChart = async (slotId: string) => {
  const { data } = await axiosInstance.get(`/slots/${slotId}/seat-chart`);
  return data.data;
};

