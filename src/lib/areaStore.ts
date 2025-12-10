// src/lib/areaStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SelectedArea {
  id: string;
  name: string;
  city: string;
  fullAddress: string;
  centerLatLng?: { lat: number; lng: number };
  deliveryFee?: number;
  minOrderAmount?: number;
  estimatedTime?: string;
}

export interface UserLocation {
  lat: number;
  lng: number;
  address?: string;
}

interface AreaStore {
  selectedArea: SelectedArea | null;
  userLocation: UserLocation | null;
  areaCheckedAt?: number;

  setSelectedArea: (area: SelectedArea | null) => void;
  setUserLocation: (location: UserLocation | null) => void;
  clearArea: () => void;
}

export const useAreaStore = create<AreaStore>()(
  persist(
    (set) => ({
      selectedArea: null,
      userLocation: null,
      areaCheckedAt: undefined,

      setSelectedArea: (area) =>
        set({
          selectedArea: area,
          areaCheckedAt: area ? Date.now() : undefined,
        }),

      setUserLocation: (location) => set({ userLocation: location }),

      clearArea: () =>
        set({
          selectedArea: null,
          userLocation: null,
          areaCheckedAt: undefined,
        }),
    }),
    {
      name: "area-storage",
      version: 1,
      partialize: (state) => ({
        selectedArea: state.selectedArea,
        userLocation: state.userLocation,
        areaCheckedAt: state.areaCheckedAt,
      }),
    }
  )
);