import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

// Get the Supabase URL and Anon Key from environment variables
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

// Custom storage implementation using SecureStore
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    return SecureStore.deleteItemAsync(key);
  },
};

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types based on our schema
export type Profile = {
  id: string;
  email: string;
  is_premium: boolean;
  notification_push: boolean;
  notification_email: boolean;
  notification_sms: boolean;
  created_at: string;
};

export type Car = {
  id: string;
  user_id: string;
  brand: string;
  model: string;
  year: number;
  oil_change_km: number;
  oil_change_months: number;
  current_odometer_km: number;
  last_oil_change_km: number;
  last_oil_change_date: string;
  created_at: string;
};

export type FuelEntry = {
  id: string;
  car_id: string;
  date: string;
  station_name: string;
  liters: number;
  price_per_liter?: number;
  total_price: number;
  odometer_km: number;
  calculated_l_per_100km?: number;
  created_at: string;
};
