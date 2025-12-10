// src/hooks/useCheckArea.ts
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

// Response from /areas/check
export interface CheckAreaResponse {
  success: boolean;
  inService: boolean;
  hasDeliveryZone: boolean;
  area?: {
    _id: string;
    name: string;
    city: string;
    center: { lat: number; lng: number };
  };
  delivery?: {
    fee: number;
    minOrder: number;
    estimatedTime: string;
  };
  message?: string;
}

// Response from /areas
export interface AreaWithDelivery {
  _id: string;
  name: string;
  city: string;
  deliveryZone: {
    deliveryFee: number;
    minOrderAmount: number;
    estimatedTime: string;
    isActive: boolean;
  } | null;
  hasDeliveryZone: boolean;
}

// Hook 1: Check if a lat/lng is inside a service area
export const useCheckArea = (lat?: number, lng?: number) => {
  const [state, setState] = useState<{
    loading: boolean;
    inService: boolean;
    hasDeliveryZone: boolean;
    area: { id: string; name: string; city: string } | null;
    deliveryFee: number;
    minOrderAmount: number;
    estimatedTime: string;
    message: string;
  }>({
    loading: true,
    inService: false,
    hasDeliveryZone: false,
    area: null,
    deliveryFee: 149,
    minOrderAmount: 0,
    estimatedTime: '35-50 min',
    message: '',
  });

  useEffect(() => {
    if (!lat || !lng) {
      setState({
        loading: false,
        inService: false,
        hasDeliveryZone: false,
        area: null,
        deliveryFee: 149,
        minOrderAmount: 0,
        estimatedTime: '35-50 min',
        message: 'Location not provided',
      });
      return;
    }

    let canceled = false;

    const check = async () => {
      try {
        setState(prev => ({ ...prev, loading: true }));

        // apiClient.get already returns the data directly
        const data: CheckAreaResponse = await apiClient.get<CheckAreaResponse>('/areas/check', {
          params: { lat, lng },
        });

        if (canceled) return;

        if (data.success && data.inService) {
          setState({
            loading: false,
            inService: true,
            hasDeliveryZone: data.hasDeliveryZone,
            area: data.area
              ? { id: data.area._id, name: data.area.name, city: data.area.city }
              : null,
            deliveryFee: data.delivery?.fee ?? 149,
            minOrderAmount: data.delivery?.minOrder ?? 0,
            estimatedTime: data.delivery?.estimatedTime ?? '35-50 min',
            message: data.message ?? '',
          });
        } else {
          setState({
            loading: false,
            inService: false,
            hasDeliveryZone: false,
            area: null,
            deliveryFee: 149,
            minOrderAmount: 0,
            estimatedTime: '35-50 min',
            message: data.message ?? 'We do not deliver to this location yet',
          });
        }
      } catch (err: any) {
        if (canceled) return;
        setState({
          loading: false,
          inService: false,
          hasDeliveryZone: false,
          area: null,
          deliveryFee: 149,
          minOrderAmount: 0,
          estimatedTime: '35-50 min',
          message: err.response?.data?.message ?? 'Location check failed',
        });
      }
    };

    check();

    return () => {
      canceled = true;
    };
  }, [lat, lng]);

  return state;
};

// Hook 2: Get ALL active areas (for dropdown in checkout)
export const useAreas = () => {
  return useQuery<AreaWithDelivery[], Error>({
    queryKey: ['areas', 'active'],
    queryFn: async () => {
      const areas = await apiClient.get<AreaWithDelivery[]>('/areas');
      return areas;
    },
    staleTime: 10 * 60 * 1000,
  });
};
