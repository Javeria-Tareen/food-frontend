// src/lib/deliveryStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LatLng, Area, DeliveryZone } from '../types/delivery.types';

// Delivery area stored in frontend state (matches backend Area minimally)
export interface DeliveryArea {
  _id: string;
  name: string;
  city: string;
  center?: LatLng;
}

// Delivery info stored in frontend state (matches backend DeliveryZone exactly)
export interface DeliveryInfo {
  deliveryFee: number;
  minOrderAmount: number;
  estimatedTime: string;
}

export interface DeliveryState {
  // Current delivery status
  selectedArea: DeliveryArea | null;
  deliveryInfo: DeliveryInfo | null;
  isInService: boolean;

  // User location
  userLocation: LatLng | null;
  locationPermission: 'granted' | 'denied' | 'prompt' | null;

  // UI state
  isChecking: boolean;
  hasChecked: boolean;
  showModal: boolean;

  // Actions
  setDeliveryArea: (area: DeliveryArea | null, delivery: DeliveryInfo | null) => void;
  setUserLocation: (lat: number, lng: number) => void;
  setLocationPermission: (status: 'granted' | 'denied' | 'prompt') => void;
  setIsChecking: (checking: boolean) => void;
  setShowModal: (show: boolean) => void;
  clearDelivery: () => void;
  reset: () => void;
}

export const useDeliveryStore = create<DeliveryState>()(
  persist(
    (set) => ({
      // Initial state
      selectedArea: null,
      deliveryInfo: null,
      isInService: false,
      userLocation: null,
      locationPermission: null,
      isChecking: false,
      hasChecked: false,
      showModal: false,

      // Actions
      setDeliveryArea: (area, delivery) =>
        set({
          selectedArea: area,
          deliveryInfo: delivery,
          isInService: !!area && !!delivery,
          hasChecked: true,
        }),

      setUserLocation: (lat, lng) =>
        set({ userLocation: { lat, lng } }),

      setLocationPermission: (status) =>
        set({ locationPermission: status }),

      setIsChecking: (checking) =>
        set({ isChecking: checking }),

      setShowModal: (show) =>
        set({ showModal: show }),

      clearDelivery: () =>
        set({
          selectedArea: null,
          deliveryInfo: null,
          isInService: false,
          hasChecked: false,
        }),

      reset: () =>
        set({
          selectedArea: null,
          deliveryInfo: null,
          isInService: false,
          userLocation: null,
          locationPermission: null,
          isChecking: false,
          hasChecked: false,
          showModal: false,
        }),
    }),
    {
      name: 'zaika-delivery-storage',
      partialize: (state) => ({
        selectedArea: state.selectedArea,
        deliveryInfo: state.deliveryInfo,
        isInService: state.isInService,
        userLocation: state.userLocation,
        hasChecked: state.hasChecked,
      }),
    }
  )
);
