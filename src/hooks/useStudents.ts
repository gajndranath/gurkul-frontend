import { useQuery } from "@tanstack/react-query";
import { getStudents } from "../api/studentsApi";
// Import the specific params type here
import type { GetStudentsParams } from "../api/studentsApi";
import type { StudentListResponse } from "../features/students/types";

export const useStudents = (params?: GetStudentsParams) => {
  return useQuery<StudentListResponse, Error>({
    // Adding params to the queryKey ensures the cache refreshes when filters change
    queryKey: ["students", params],
    queryFn: () => getStudents(params),
    staleTime: 1000 * 60 * 5,
  });
};
