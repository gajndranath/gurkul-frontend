export interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  fatherName?: string;
  address?: string;
  seatNumber?: string;
  slotId?: string | { _id?: string; name?: string; monthlyFee?: number };
  monthlyFee?: number;
  status?: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  joiningDate?: string;
  notes?: string;
  tags?: string[];
}
}

export interface StudentListResponse {
  data: {
    students: Student[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}
