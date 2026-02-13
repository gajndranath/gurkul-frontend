type CardType = {
  value: number | string;
  title: string;
  key: string;
  color: string;
  icon: string;
  description: string;
} & ({ extra?: undefined } | { extra: string });
import React, { useMemo } from "react";

interface OverviewCardsProps {
  overview: {
    totalStudents: number;
    activeStudents: number;
    archivedStudents: number;
    totalSlots: number;
    advance: {
      totalAdvance: number;
      remainingAdvance: number;
      utilizedAdvance: number;
    };
    overdue: { count: number; totalAmount: number };
  };
}

const CARD_CONFIG = [
  {
    title: "Total Students",
    key: "totalStudents",
    color: "bg-blue-500",
    icon: "👥",
    description: "All registered students",
  },
  {
    title: "Active Students",
    key: "activeStudents",
    color: "bg-green-500",
    icon: "✅",
    description: "Currently active",
  },
  {
    title: "Archived Students",
    key: "archivedStudents",
    color: "bg-gray-500",
    icon: "📦",
    description: "No longer active",
  },
  {
    title: "Total Slots",
    key: "totalSlots",
    color: "bg-purple-500",
    icon: "🗂️",
    description: "All available slots",
  },
  {
    title: "Advance Balance",
    key: "advanceBalance",
    color: "bg-yellow-500",
    icon: "💰",
    description: "Remaining advance",
  },
  {
    title: "Overdue",
    key: "overdue",
    color: "bg-red-500",
    icon: "⚠️",
    description: "Total overdue fees",
  },
];

const OverviewCards: React.FC<OverviewCardsProps> = React.memo(
  ({ overview }) => {
    const cards = useMemo(
      () => [
        {
          ...CARD_CONFIG[0],
          value: overview.totalStudents,
        },
        {
          ...CARD_CONFIG[1],
          value: overview.activeStudents,
        },
        {
          ...CARD_CONFIG[2],
          value: overview.archivedStudents,
        },
        {
          ...CARD_CONFIG[3],
          value: overview.totalSlots,
        },
        {
          ...CARD_CONFIG[4],
          value: `₹${overview.advance.remainingAdvance}`,
          extra: `Total: ₹${overview.advance.totalAdvance} | Utilized: ₹${overview.advance.utilizedAdvance}`,
        },
        {
          ...CARD_CONFIG[5],
          value: `Count: ${overview.overdue.count}`,
          extra: `Total Amount: ₹${overview.overdue.totalAmount}`,
        },
      ],
      [overview],
    );

    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 mb-4">
        {cards.map((card: CardType) => (
          <div
            key={card.title}
            className={`rounded shadow p-2 flex flex-col items-center ${card.color} text-white min-h-[80px]`}
          >
            <div className="text-2xl mb-1">{card.icon}</div>
            <div className="text-lg font-bold">{card.value}</div>
            <div className="text-xs mt-1">{card.title}</div>
            <div className="text-xs opacity-70 mt-1">{card.description}</div>
            {card.extra && (
              <div className="text-xs opacity-80 mt-1">{card.extra}</div>
            )}
          </div>
        ))}
      </div>
    );
  },
);

export default OverviewCards;
