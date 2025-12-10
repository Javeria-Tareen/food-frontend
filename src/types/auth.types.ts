// src/types/auth.types.ts
export type UserRole = 'customer' | 'rider' | 'admin';

export type RiderStatus = 'none' | 'pending' | 'approved' | 'rejected';

export interface RiderDocuments {
  cnicNumber?: string;
  cnicFront?: string;
  cnicBack?: string;
  drivingLicense?: string;
  riderPhoto?: string;
  vehicleNumber?: string;
  vehicleType?: 'bike' | 'car' | 'bicycle';
}

export interface UserLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface User {
  _id: string;
  name: string;
  email?: string | null;
  phone: string;
  role: UserRole;
  isActive: boolean;

  // Rider-specific
  riderStatus?: RiderStatus;
  riderDocuments?: RiderDocuments;
  currentLocation?: UserLocation;
  isOnline?: boolean;
  isAvailable?: boolean;
  locationUpdatedAt?: string | null;
  rating?: number;
  totalDeliveries?: number;
  earnings?: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // Optional UI helpers (not from DB)
  avatar?: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

export interface RegisterResponse {
  success: boolean;
  user: User;
  message: string;
}

export interface AuthMeResponse {
  success: boolean;
  user: User;
}