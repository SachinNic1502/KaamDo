import * as Location from "expo-location";
import { api } from "./api";
import { getAuthToken } from "./storage";

export interface WorkerLocationData {
  latitude: number;
  longitude: number;
  serviceRadiusKm: number;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  lastUpdated?: string;
  isOnline?: boolean;
}

export interface NearbyWorkerResult {
  _id: string;
  user: {
    _id: string;
    name: string;
    phone?: string;
    avatar?: string;
  };
  skills: string[];
  experience: number;
  hourlyRate?: number;
  dailyRate?: number;
  rating: number;
  totalJobs: number;
  isOnline: boolean;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
  };
  serviceRadiusKm: number;
  distanceKm: number;
  etaMinutes: number;
  isWithinCoverage: boolean;
}

export const locationService = {
  // 1. Request GPS Foreground Permissions
  async requestPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === "granted";
    } catch {
      return false;
    }
  },

  // 2. Get current high-accuracy device GPS position
  async getCurrentPosition(): Promise<{ latitude: number; longitude: number } | null> {
    try {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) return null;

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    } catch {
      return null;
    }
  },

  // 3. Reverse geocode coordinates to street address and city
  async reverseGeocode(
    latitude: number,
    longitude: number
  ): Promise<{ address: string; city: string; state: string; pincode: string }> {
    try {
      const results = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (results && results.length > 0) {
        const item = results[0];
        const street = item.street || item.name || "";
        const district = item.district || item.subregion || "";
        const city = item.city || district || "Bengaluru";
        const state = item.region || "Karnataka";
        const pincode = item.postalCode || "";
        const fullAddress = [street, district, city].filter(Boolean).join(", ");

        return {
          address: fullAddress || "Current Location",
          city,
          state,
          pincode,
        };
      }
    } catch {
      // Fallback
    }

    return {
      address: "Current GPS Location",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "",
    };
  },

  // 4. Fetch the authenticated worker's current location & radius from the backend
  async getWorkerLocation(): Promise<WorkerLocationData | null> {
    try {
      const token = await getAuthToken();
      if (!token) return null;

      const res = await api.get<{ data?: WorkerLocationData } & WorkerLocationData>(
        "/api/workers/me/location",
        token
      );

      return (res as any).data || res;
    } catch {
      return null;
    }
  },

  // 5. Update worker live GPS position & service radius (coverage in km)
  async updateLocationAndRadius(params: {
    latitude: number;
    longitude: number;
    serviceRadiusKm: number;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  }): Promise<WorkerLocationData | null> {
    try {
      const token = await getAuthToken();
      if (!token) throw new Error("Authentication required");

      const res = await api.patch<{ data?: WorkerLocationData } & WorkerLocationData>(
        "/api/workers/me/location",
        params,
        token
      );

      return (res as any).data || res;
    } catch (err: any) {
      throw new Error(err.message || "Failed to update location and service radius");
    }
  },

  // 6. Find nearby verified workers within search radius
  async getNearbyWorkers(params: {
    latitude: number;
    longitude: number;
    radiusKm?: number;
    skill?: string;
    onlineOnly?: boolean;
  }): Promise<NearbyWorkerResult[]> {
    try {
      const queryParams = new URLSearchParams({
        lat: params.latitude.toString(),
        lng: params.longitude.toString(),
        radius: (params.radiusKm || 15).toString(),
        ...(params.skill ? { skill: params.skill } : {}),
        ...(params.onlineOnly ? { onlineOnly: "true" } : {}),
      }).toString();

      const res = await api.get<{ workers?: NearbyWorkerResult[]; data?: { workers: NearbyWorkerResult[] } }>(
        `/api/workers/nearby?${queryParams}`
      );

      return (res as any).workers || (res as any).data?.workers || [];
    } catch {
      return [];
    }
  },
};
