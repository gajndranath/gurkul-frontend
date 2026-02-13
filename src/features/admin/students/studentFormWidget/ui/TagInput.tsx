import React, { useState } from "react";
import { Controller } from "react-hook-form";
import { Input, Button, Badge } from "../../../../../components/ui";
import { Plus, X as CloseIcon, Hash } from "lucide-react";

import type { Control, UseFormSetValue } from "react-hook-form";
import type { StudentFormValues } from "../type/AdminStudentForm.types";

interface TagInputProps {
  control: Control<StudentFormValues>;
  setValue: UseFormSetValue<StudentFormValues>;
}

const TagInput: React.FC<TagInputProps> = ({ control, setValue }) => {
  const [tagInput, setTagInput] = useState("");

  return (
    <Controller
      control={control}
      name="tags"
      render={({ field: { value = [], onChange } }) => (
        <div className="space-y-4">
          {/* Input Area */}
          <div className="flex gap-2 group">
            <div className="relative flex-1">
              <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
              <Input
                placeholder="Index category (e.g. UPSC, Premium, Morning)..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="pl-10 h-11 bg-white border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-medium text-xs"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && tagInput.trim()) {
                    e.preventDefault();
                    if (!value.includes(tagInput.trim())) {
                      const newTags = [...value, tagInput.trim()];
                      onChange(newTags);
                      setValue("tags", newTags);
                    }
                    setTagInput("");
                  }
                }}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => {
                if (tagInput.trim() && !value.includes(tagInput.trim())) {
                  const newTags = [...value, tagInput.trim()];
                  onChange(newTags);
                  setValue("tags", newTags);
                  setTagInput("");
                }
              }}
              disabled={!tagInput.trim()}
              className="h-11 w-11 rounded-xl border-slate-100 bg-white text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all shrink-0"
            >
              <Plus size={18} />
            </Button>
          </div>

          {/* Rendered Tags */}
          <div className="flex flex-wrap gap-2 min-h-[32px]">
            {value.map((tag: string) => (
              <Badge
                key={tag}
                variant="secondary"
                className="
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-none 
                  bg-blue-50 text-blue-700 font-bold text-[10px] uppercase tracking-wider
                  animate-in zoom-in-90 duration-200
                "
              >
                {tag}
                <button
                  type="button"
                  onClick={() => {
                    const newTags = value.filter((t: string) => t !== tag);
                    onChange(newTags);
                    setValue("tags", newTags);
                  }}
                  className="ml-1 p-0.5 rounded-full hover:bg-blue-100 transition-colors"
                >
                  <CloseIcon size={12} strokeWidth={3} />
                </button>
              </Badge>
            ))}
            {value.length === 0 && !tagInput && (
              <p className="text-[10px] text-slate-300 font-medium italic mt-1 ml-1">
                No identifiers assigned yet.
              </p>
            )}
          </div>
        </div>
      )}
    />
  );
};

export default TagInput;
