import { useQueryClient } from "@tanstack/react-query";
import { getSlotDetails } from "../../../../api/slotApi";

export const usePrefetchSlot = () => {
  const queryClient = useQueryClient();

  const prefetch = async (slotId: string) => {
    // Only prefetch if data isn't already fresh in cache
    await queryClient.prefetchQuery({
      queryKey: ["slot-details", slotId],
      queryFn: () => getSlotDetails(slotId),
      staleTime: 60 * 1000, // Consider data fresh for 1 minute
    });
  };

  return prefetch;
};
