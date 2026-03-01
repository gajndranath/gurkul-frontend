import { useQuery } from "@tanstack/react-query";
import { getStudents } from "../api/studentsAdminApi";
import { getAllSlots } from "../api/slotApi";
import axiosInstance from "../api/axiosInstance";

/**
 * useLibraryData
 * A centralized hook to fetch and cache core library entities.
 * Reduces redundant API calls across different widgets.
 */
export const useLibraryData = () => {
  // 1. Fetch Students (Limited set or based on active filters)
  const studentsQuery = useQuery({
    queryKey: ["students", "standard-list"],
    queryFn: () => getStudents({ limit: 1000 }),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  // 2. Fetch Rooms
  const roomsQuery = useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const res = await axiosInstance.get("/rooms");
      return res.data.data ?? [];
    },
    staleTime: 10 * 60 * 1000,
  });

  // 3. Fetch Slots
  const slotsQuery = useQuery({
    queryKey: ["slots"],
    queryFn: () => getAllSlots(),
    staleTime: 10 * 60 * 1000,
  });

  return {
    students: studentsQuery.data?.students || (Array.isArray(studentsQuery.data) ? studentsQuery.data : []),
    rooms: roomsQuery.data || [],
    slots: slotsQuery.data || [],
    isLoading: studentsQuery.isLoading || roomsQuery.isLoading || slotsQuery.isLoading,
    isError: studentsQuery.isError || roomsQuery.isError || slotsQuery.isError,
    refresh: () => {
      studentsQuery.refetch();
      roomsQuery.refetch();
      slotsQuery.refetch();
    }
  };
};
