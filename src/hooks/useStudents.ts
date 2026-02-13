import { useQuery } from "@tanstack/react-query";
import { getStudents } from "../api/studentsApi";
import type { StudentListResponse } from "../features/students/types";

export const useStudents = () => {
  return useQuery<StudentListResponse, Error>({
    queryKey: ["students"],
    queryFn: getStudents,
    staleTime: 1000 * 60 * 5, // 5 minutes
    // cacheTime is not a valid option in v5, so remove it
  });
};
