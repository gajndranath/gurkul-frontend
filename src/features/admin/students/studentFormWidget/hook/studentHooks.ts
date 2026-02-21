// In studentFormWidget/hook/studentHooks.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllSlots } from "../../../../../api/slotApi";
import {
  getStudent,
  registerStudent,
  updateStudent,
} from "../../../../../api/studentsAdminApi";
import type { StudentFormValues } from "../type/AdminStudentForm.types";
import type { SingleStudentResponse } from "../../types";

export function useSlots() {
  return useQuery({
    queryKey: ["slots"],
    queryFn: async () => {
      const response = await getAllSlots();
      console.log("Raw slots API response:", response); // Debug log
      return response;
    },
  });
}

export function useStudent(id?: string) {
  return useQuery<SingleStudentResponse["data"] | null>({
    queryKey: ["student", id],
    queryFn: async () => {
      if (!id) return null;
      // getStudent returns data.data → { student, feeSummary } directly
      const response = await getStudent(id);
      return response as SingleStudentResponse["data"];
    },
    enabled: !!id,
  });
}

export function useStudentMutations() {
  const queryClient = useQueryClient();
  return {
    registerStudent: async (data: StudentFormValues) => {
      await registerStudent(data);
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    updateStudent: async (id: string, data: StudentFormValues) => {
      await updateStudent(id, data);
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  };
}
