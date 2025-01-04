// src/lib/services/carService.ts
import { supabase } from "../supabase";
import type { Car } from "../supabase";

export interface AddCarInput {
  brand: string;
  model: string;
  year: number;
  oil_change_km: number; // Interval in km for oil changes
  oil_change_months: number; // Interval in months for oil changes
  current_odometer_km: number; // Current odometer reading
  last_oil_change_km: number; // Odometer reading at last oil change
  last_oil_change_date: string; // Date of last oil change
}

export const carService = {
  // Add a new car
  addCar: async (
    car: AddCarInput
  ): Promise<{ data: Car | null; error: any }> => {
    const user = supabase.auth.getUser();
    if (!user) {
      return { data: null, error: new Error("User not authenticated") };
    }

    const { data, error } = await supabase
      .from("cars")
      .insert([{ ...car, user_id: (await user).data.user?.id }])
      .select()
      .single();

    return { data, error };
  },

  // Get all cars for current user
  getUserCars: async (): Promise<{ data: Car[] | null; error: any }> => {
    const user = supabase.auth.getUser();
    if (!user) {
      return { data: null, error: new Error("User not authenticated") };
    }

    const { data, error } = await supabase
      .from("cars")
      .select("*")
      .eq("user_id", (await user).data.user?.id)
      .order("created_at", { ascending: false });

    return { data, error };
  },

  // Get a specific car by ID
  getCar: async (id: string): Promise<{ data: Car | null; error: any }> => {
    const { data, error } = await supabase
      .from("cars")
      .select("*")
      .eq("id", id)
      .single();

    return { data, error };
  },

  // Update car details
  updateCar: async (
    id: string,
    updates: Partial<Car>
  ): Promise<{ data: Car | null; error: any }> => {
    const { data, error } = await supabase
      .from("cars")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    return { data, error };
  },

  // Delete a car
  deleteCar: async (id: string): Promise<{ error: any }> => {
    const { error } = await supabase.from("cars").delete().eq("id", id);
    return { error };
  },

  // Update car's odometer reading
  updateOdometer: async (
    id: string,
    odometer_km: number
  ): Promise<{ data: Car | null; error: any }> => {
    const { data, error } = await supabase
      .from("cars")
      .update({ current_odometer_km: odometer_km })
      .eq("id", id)
      .select()
      .single();

    return { data, error };
  },
};
