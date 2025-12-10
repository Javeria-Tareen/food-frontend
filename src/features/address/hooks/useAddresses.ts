// src/features/address/hooks/useAddresses.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export interface Address {
  _id: string;
  label: 'Home' | 'Work' | 'Other';
  fullAddress: string;
  area: {
    _id: string;
    name: string;
    city: string;
  };
  instructions?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressPayload {
  label: string;
  fullAddress: string;
  areaId: string;
  instructions?: string;
  isDefault?: boolean;
}

export interface UpdateAddressPayload {
  label?: string;
  fullAddress?: string;
  areaId?: string;
  instructions?: string;
  isDefault?: boolean;
}

// Fetch all addresses
export const useAddresses = () => {
  return useQuery<Address[]>({
    queryKey: ['addresses'],
    queryFn: async () => {
      const { data } = await api.get('/address');
      return data.addresses;
    },
    staleTime: 5 * 60 * 1000,
    select: (addresses) => 
      addresses.sort((a, b) => {
        if (a.isDefault) return -1;
        if (b.isDefault) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }),
  });
};

// Create new address
export const useCreateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateAddressPayload) => {
      const { data } = await api.post('/address', payload);
      return data.address as Address;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Address saved!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to save address');
    },
  });
};

// Update address
export const useUpdateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateAddressPayload }) => {
      const { data } = await api.put(`/address/${id}`, payload);
      return data.address as Address;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Address updated');
    },
  });
};

// Delete address
export const useDeleteAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/address/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Address deleted');
    },
  });
};

// Set default address
export const useSetDefaultAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/address/${id}/default`);
      return data.address as Address;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Default address updated');
    },
  });
};