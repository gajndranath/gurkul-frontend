import { create } from "zustand";

export interface FeatureFlagsState {
  flags: Record<string, boolean>;
  setFlag: (key: string, value: boolean) => void;
  isEnabled: (key: string) => boolean;
}

export const featureFlagsStore = create<FeatureFlagsState>((set, get) => ({
  flags: {},
  setFlag: (key, value) =>
    set((state) => ({ flags: { ...state.flags, [key]: value } })),
  isEnabled: (key) => {
    // Fail-closed: if flag is missing, return false
    return !!get().flags[key];
  },
}));
