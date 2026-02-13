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
  occupiedSeats?: number;
  availableSeats?: number;
  occupancyPercentage?: number;
}

export const getAllSlots = async () => {
  const { data } = await axiosInstance.get("/slots");
  return data.data; // Following your ApiResponse structure
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
