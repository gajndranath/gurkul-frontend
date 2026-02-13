import React from "react";

import { FileText, Tags, PlusCircle } from "lucide-react";
import type {
  UseFormRegister,
  FieldErrors,
  Control,
  UseFormSetValue,
} from "react-hook-form";
import type { StudentFormValues } from "../type/AdminStudentForm.types";
import TagInput from "../ui/TagInput";

interface AdditionalInfoSectionProps {
  register: UseFormRegister<StudentFormValues>;
  errors: FieldErrors<StudentFormValues>;
  control: Control<StudentFormValues>;
  setValue: UseFormSetValue<StudentFormValues>;
}

const AdditionalInfoSection: React.FC<AdditionalInfoSectionProps> = ({
  register,
  errors,
  control,
  setValue,
}) => (
  <div className="space-y-6">
    {/* Internal Notes Field */}
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1 flex items-center gap-1.5">
        <FileText size={12} className="text-blue-500" /> Internal Annotations
      </label>
      <div className="relative">
        <textarea
          placeholder="Add specific details about the student's requirements or history..."
          {...register("notes")}
          className="w-full min-h-[100px] p-4 rounded-xl border-slate-100 bg-slate-50/50 font-medium text-sm focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all shadow-sm outline-none resize-none placeholder:text-slate-300"
        />
      </div>
      {errors.notes && (
        <p className="text-rose-500 text-[10px] font-bold ml-1">
          {errors.notes.message}
        </p>
      )}
    </div>

    {/* Branded Tag Input Section */}
    <div className="space-y-3">
      <div className="flex justify-between items-center px-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-1.5">
          <Tags size={12} className="text-blue-500" /> Categorization Tags
        </label>
        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter italic">
          Optional metadata
        </span>
      </div>

      <div className="p-1 bg-slate-50/30 rounded-2xl ring-1 ring-slate-100/50">
        <TagInput control={control} setValue={setValue} />
      </div>

      <div className="flex items-center gap-2 mt-2 px-1">
        <PlusCircle size={10} className="text-blue-400" />
        <p className="text-[9px] font-medium text-slate-400 leading-none">
          Press enter to create a new tag index.
        </p>
      </div>
    </div>
  </div>
);

export default AdditionalInfoSection;
