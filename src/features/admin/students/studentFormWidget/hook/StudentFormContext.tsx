import React, { createContext } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { StudentFormValues } from "../type/AdminStudentForm.types";

interface StudentFormContextProps {
  form: UseFormReturn<StudentFormValues>;
}

const StudentFormContext = createContext<StudentFormContextProps | undefined>(
  undefined,
);

export const StudentFormProvider = ({
  form,
  children,
}: {
  form: UseFormReturn<StudentFormValues>;
  children: React.ReactNode;
}) => (
  <StudentFormContext.Provider value={{ form }}>
    {children}
  </StudentFormContext.Provider>
);
