import React from "react";
import { Card } from "../../../../../components/ui";
import {
  Info,
  Asterisk,
  Smartphone,
  LayoutGrid,
  Archive,
  PencilLine,
} from "lucide-react";

const ImportantNotesCard: React.FC = () => (
  <Card className="bg-white border-none shadow-sm ring-1 ring-blue-100 rounded-[24px] overflow-hidden transition-all hover:shadow-md">
    <div className="p-6 space-y-5">
      {/* Branded Header */}
      <div className="flex items-center gap-2.5 border-b border-blue-50 pb-4">
        <div className="p-1.5 bg-blue-50 rounded-lg">
          <Info size={16} className="text-blue-600" />
        </div>
        <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">
          Operational Guidelines
        </h3>
      </div>

      {/* Structured Guidelines List */}
      <ul className="space-y-4">
        <li className="flex items-start gap-3 group">
          <div className="mt-0.5 p-1 rounded-md bg-slate-50 text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Asterisk size={12} strokeWidth={3} />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-black text-slate-800 uppercase tracking-tighter">
              Mandatory Fields
            </p>
            <p className="text-[10px] font-bold text-slate-400">
              Items marked with * must be verified.
            </p>
          </div>
        </li>

        <li className="flex items-start gap-3 group">
          <div className="mt-0.5 p-1 rounded-md bg-slate-50 text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Smartphone size={12} />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-black text-slate-800 uppercase tracking-tighter">
              Contact String
            </p>
            <p className="text-[10px] font-bold text-slate-400">
              Strict 10-digit validation required.
            </p>
          </div>
        </li>

        <li className="flex items-start gap-3 group">
          <div className="mt-0.5 p-1 rounded-md bg-slate-50 text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <LayoutGrid size={12} />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-black text-slate-800 uppercase tracking-tighter">
              Slot Dynamics
            </p>
            <p className="text-[10px] font-bold text-slate-400">
              Selections directly sync with monthly yield.
            </p>
          </div>
        </li>

        <li className="flex items-start gap-3 group">
          <div className="mt-0.5 p-1 rounded-md bg-slate-50 text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Archive size={12} />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-black text-slate-800 uppercase tracking-tighter">
              Data Integrity
            </p>
            <p className="text-[10px] font-bold text-slate-400">
              Archive only; deletion is restricted.
            </p>
          </div>
        </li>

        <li className="flex items-start gap-3 group">
          <div className="mt-0.5 p-1 rounded-md bg-slate-50 text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <PencilLine size={12} />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-black text-slate-800 uppercase tracking-tighter">
              Fee Overrides
            </p>
            <p className="text-[10px] font-bold text-slate-400">
              Custom billing rates can be adjusted later.
            </p>
          </div>
        </li>
      </ul>
    </div>

    {/* Subtle Branded Footer Accent */}
    <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-blue-400 opacity-20" />
  </Card>
);

export default ImportantNotesCard;
