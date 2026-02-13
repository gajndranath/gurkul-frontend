import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui";

interface Slot {
  _id: string;
  name: string;
  totalSeats: number;
  occupiedSeats: number;
  availableSeats: number;
  occupancyPercentage: number;
}

interface SlotOccupancyTableProps {
  slots: Slot[];
}

const SlotOccupancyTable: React.FC<SlotOccupancyTableProps> = React.memo(
  ({ slots }) => (
    <div className="bg-white shadow rounded p-2 sm:p-4 mb-4 overflow-x-auto">
      <div className="font-semibold mb-2 text-base">Slot Occupancy</div>
      <Table className="min-w-[480px]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-2/5">Slot Name</TableHead>
            <TableHead className="w-1/5 text-center">Total</TableHead>
            <TableHead className="w-1/5 text-center">Occupied</TableHead>
            <TableHead className="w-1/5 text-center">Available</TableHead>
            <TableHead className="w-1/5 text-center">Occupancy</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {slots.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-gray-400">
                No slots found
              </TableCell>
            </TableRow>
          ) : (
            slots.map((slot, idx) => (
              <TableRow
                key={slot._id}
                className={idx % 2 === 0 ? "bg-gray-50" : ""}
              >
                <TableCell className="truncate max-w-[120px]" title={slot.name}>
                  {slot.name}
                </TableCell>
                <TableCell className="text-center">{slot.totalSeats}</TableCell>
                <TableCell className="text-center font-semibold text-blue-700">
                  {slot.occupiedSeats}
                </TableCell>
                <TableCell className="text-center font-semibold text-green-700">
                  {slot.availableSeats}
                </TableCell>
                <TableCell className="text-center font-bold">
                  <span
                    className={
                      slot.occupancyPercentage >= 80
                        ? "text-green-600"
                        : slot.occupancyPercentage >= 50
                          ? "text-yellow-600"
                          : "text-red-600"
                    }
                  >
                    {slot.occupancyPercentage}%
                  </span>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  ),
);

export default SlotOccupancyTable;
