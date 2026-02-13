import React from "react";
import { Input } from "../../../../../components/ui";
import { User, Phone, Mail, Home, Users } from "lucide-react";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { StudentFormValues } from "../type/AdminStudentForm.types";

interface PersonalInfoSectionProps {
  register: UseFormRegister<StudentFormValues>;
  errors: FieldErrors<StudentFormValues>;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  register,
  errors,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
    {/* Full Name */}
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1 flex items-center gap-1.5">
        <User size={12} className="text-blue-500" /> Full Identity{" "}
        <span className="text-rose-500">*</span>
      </label>
      <Input
        placeholder="e.g. John Doe"
        {...register("name")}
        className="h-12 rounded-xl border-slate-100 bg-slate-50/50 font-bold focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all shadow-sm"
      />
      {errors.name && (
        <p className="text-rose-500 text-[10px] font-bold ml-1 animate-in fade-in slide-in-from-top-1">
          {errors.name.message}
        </p>
      )}
    </div>

    {/* Phone Number */}
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1 flex items-center gap-1.5">
        <Phone size={12} className="text-blue-500" /> Primary Contact{" "}
        <span className="text-rose-500">*</span>
      </label>
      <Input
        placeholder="10-digit number"
        {...register("phone")}
        className="h-12 rounded-xl border-slate-100 bg-slate-50/50 font-bold focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all shadow-sm"
      />
      {errors.phone && (
        <p className="text-rose-500 text-[10px] font-bold ml-1 animate-in fade-in slide-in-from-top-1">
          {errors.phone.message}
        </p>
      )}
    </div>

    {/* Email Address */}
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1 flex items-center gap-1.5">
        <Mail size={12} className="text-blue-500" /> Digital Mail
      </label>
      <Input
        placeholder="email@example.com"
        {...register("email")}
        className="h-12 rounded-xl border-slate-100 bg-slate-50/50 font-bold focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all shadow-sm"
      />
      {errors.email && (
        <p className="text-rose-500 text-[10px] font-bold ml-1">
          {errors.email.message}
        </p>
      )}
    </div>

    {/* Father's Name */}
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1 flex items-center gap-1.5">
        <Users size={12} className="text-blue-500" /> Guardian Name
      </label>
      <Input
        placeholder="Father's Name"
        {...register("fatherName")}
        className="h-12 rounded-xl border-slate-100 bg-slate-50/50 font-bold focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all shadow-sm"
      />
      {errors.fatherName && (
        <p className="text-rose-500 text-[10px] font-bold ml-1">
          {errors.fatherName.message}
        </p>
      )}
    </div>

    {/* Address */}
    <div className="md:col-span-2 space-y-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1 flex items-center gap-1.5">
        <Home size={12} className="text-blue-500" /> Residential Address
      </label>
      <Input
        placeholder="Full residential details..."
        {...register("address")}
        className="h-12 rounded-xl border-slate-100 bg-slate-50/50 font-bold focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all shadow-sm"
      />
      {errors.address && (
        <p className="text-rose-500 text-[10px] font-bold ml-1">
          {errors.address.message}
        </p>
      )}
    </div>
  </div>
);

export default PersonalInfoSection;
