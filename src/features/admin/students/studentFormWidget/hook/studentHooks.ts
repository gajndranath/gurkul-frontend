import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllSlots } from "../../../../../api/slotApi";
import {
  getStudent,
  registerStudent,
  updateStudent,
} from "../../../../../api/studentsApi";
import type { StudentFormValues } from "../type/AdminStudentForm.types";

export function useSlots() {
  return useQuery({
    queryKey: ["slots"],
    queryFn: getAllSlots,
  });
}

export function useStudent(id?: string) {
  return useQuery({
    queryKey: ["student", id],
    queryFn: () => (id ? getStudent(id) : null),
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
