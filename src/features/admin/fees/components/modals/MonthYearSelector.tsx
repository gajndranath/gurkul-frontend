// frontend/src/features/admin/fees/components/MonthYearSelector.tsx
import React, { useMemo, useCallback } from "react";
import { Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getMonthName } from "@/lib/utils";
import {
  useMonth,
  useYear,
  useFeeFiltersActions,
} from "@/stores/feeFiltersStore";

interface MonthYearSelectorProps {
  className?: string;
}

const MonthYearSelector: React.FC<MonthYearSelectorProps> = ({ className }) => {
  const month = useMonth();
  const year = useYear();
  const { setMonth, setYear } = useFeeFiltersActions();

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  }, []);

  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i), []);

  const handleMonthChange = useCallback(
    (value: string) => {
      setMonth(parseInt(value, 10));
    },
    [setMonth],
  );

  const handleYearChange = useCallback(
    (value: string) => {
      setYear(parseInt(value, 10));
    },
    [setYear],
  );

  return (
    <div className={`flex items-center gap-2 ${className || ""}`}>
      <Calendar className="h-5 w-5 text-muted-foreground" />
      <div className="flex items-center gap-2">
        <Select value={month.toString()} onValueChange={handleMonthChange}>
          <SelectTrigger className="w-[140px] bg-white">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {months.map((m) => (
              <SelectItem key={m} value={m.toString()}>
                {getMonthName(m)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={year.toString()} onValueChange={handleYearChange}>
          <SelectTrigger className="w-[120px] bg-white">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {years.map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default MonthYearSelector;
