export interface Room {
  _id: string;
  name: string;
  totalSeats: number;
  description?: string;
  isActive: boolean;
  tenantId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoomFormData {
  name: string;
  totalSeats: number;
  description?: string;
}
