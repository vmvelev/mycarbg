import { FuelEntry, supabase } from "../supabase";

export interface AddFuelEntryInput {
  car_id: string;
  date: string;
  station_name: string;
  liters: number;
  price_per_liter?: number;
  total_price: number;
  odometer_km: number;
  is_full_tank: boolean;
}

export interface FuelService {
  addEntry: (
    entry: AddFuelEntryInput
  ) => Promise<{ data: FuelEntry | null; error: any }>;
  getEntriesForCar: (
    carId: string
  ) => Promise<{ data: FuelEntry[] | null; error: any }>;
  deleteEntry: (id: string) => Promise<{ error: any }>;
  updateEntry: (
    id: string,
    updates: Partial<FuelEntry>
  ) => Promise<{ data: FuelEntry | null; error: any }>;
}

const calculateEfficiency = (
  currentEntry: AddFuelEntryInput,
  previousEntry?: FuelEntry
): number | undefined => {
  if (!previousEntry) return undefined;

  // Only calculate if both entries are full tank
  if (!currentEntry.is_full_tank || !previousEntry.is_full_tank)
    return undefined;

  const distanceTraveled = currentEntry.odometer_km - previousEntry.odometer_km;
  if (distanceTraveled <= 0) return undefined;

  // Calculate L/100km
  return (currentEntry.liters / distanceTraveled) * 100;
};

export const fuelService: FuelService = {
  // Add a new fuel entry
  addEntry: async (entry: AddFuelEntryInput) => {
    // Get the previous entry to calculate efficiency
    const { data: previousEntries } = await supabase
      .from("fuel_entries")
      .select("*")
      .eq("car_id", entry.car_id)
      .eq("is_full_tank", true) // Only get full tank entries
      .lt("odometer_km", entry.odometer_km) // Only get entries with lower odometer readings
      .order("odometer_km", { ascending: false })
      .limit(1);

    const previousEntry = previousEntries?.[0];
    const calculated_l_per_100km = entry.is_full_tank
      ? calculateEfficiency(entry, previousEntry)
      : null;

    // If price_per_liter is not provided, calculate it from total_price
    const price_per_liter =
      entry.price_per_liter || entry.total_price / entry.liters;

    const { data, error } = await supabase
      .from("fuel_entries")
      .insert([
        {
          ...entry,
          price_per_liter,
          calculated_l_per_100km,
        },
      ])
      .select()
      .single();

    if (!error && data) {
      // Update car's current odometer reading
      await supabase
        .from("cars")
        .update({ current_odometer_km: entry.odometer_km })
        .eq("id", entry.car_id);
    }

    return { data, error };
  },

  // Get all fuel entries for a specific car
  getEntriesForCar: async (carId: string) => {
    const { data, error } = await supabase
      .from("fuel_entries")
      .select("*")
      .eq("car_id", carId)
      .order("date", { ascending: false });

    return { data, error };
  },

  // Delete a fuel entry
  deleteEntry: async (id: string) => {
    const { error } = await supabase.from("fuel_entries").delete().eq("id", id);

    return { error };
  },

  // Update a fuel entry
  updateEntry: async (id: string, updates: Partial<FuelEntry>) => {
    const { data, error } = await supabase
      .from("fuel_entries")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    return { data, error };
  },
};
