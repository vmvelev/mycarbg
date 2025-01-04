import { useState, useEffect, useCallback } from "react";
import { FuelEntry } from "../lib/supabase";
import { fuelService, AddFuelEntryInput } from "../lib/services/fuelService";

export function useFuelEntries(
  carId: string,
  onCarUpdate?: () => Promise<void>
) {
  const [entries, setEntries] = useState<FuelEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [averageConsumption, setAverageConsumption] = useState<number | null>(
    null
  );

  const fetchEntries = useCallback(async () => {
    if (!carId) {
      setEntries([]);
      setAverageConsumption(null);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await fuelService.getEntriesForCar(carId);

      if (error) throw error;

      setEntries(data || []);

      // Calculate average consumption from the last 5 entries that have consumption data
      if (data && data.length > 0) {
        const validEntries = data
          .filter((entry) => entry.calculated_l_per_100km !== null)
          .slice(0, 5);

        if (validEntries.length > 0) {
          const avg =
            validEntries.reduce(
              (sum, entry) => sum + (entry.calculated_l_per_100km || 0),
              0
            ) / validEntries.length;
          setAverageConsumption(Math.round(avg * 10) / 10);
        } else {
          setAverageConsumption(null);
        }
      } else {
        setAverageConsumption(null);
      }

      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch fuel entries"
      );
      setEntries([]);
      setAverageConsumption(null);
    } finally {
      setLoading(false);
    }
  }, [carId]);

  // Reset statistics when changing cars
  useEffect(() => {
    setEntries([]);
    setAverageConsumption(null);
    if (carId) {
      fetchEntries();
    }
  }, [carId, fetchEntries]);

  const addEntry = useCallback(
    async (entryData: Omit<AddFuelEntryInput, "car_id">) => {
      try {
        setLoading(true);
        const { data, error } = await fuelService.addEntry({
          ...entryData,
          car_id: carId,
        });

        if (error) throw error;

        // Call the callback to refresh data immediately after successful update
        if (onCarUpdate) {
          await onCarUpdate();
        }

        // Then refresh entries
        await fetchEntries();

        return { success: true };
      } catch (err) {
        return {
          success: false,
          error:
            err instanceof Error ? err.message : "Failed to add fuel entry",
        };
      } finally {
        setLoading(false);
      }
    },
    [carId, fetchEntries, onCarUpdate]
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        const { error } = await fuelService.deleteEntry(id);

        if (error) throw error;

        // Call the callback to refresh data immediately after successful update
        if (onCarUpdate) {
          await onCarUpdate();
        }

        // Then refresh entries
        await fetchEntries();

        return { success: true };
      } catch (err) {
        return {
          success: false,
          error:
            err instanceof Error ? err.message : "Failed to delete fuel entry",
        };
      } finally {
        setLoading(false);
      }
    },
    [fetchEntries, onCarUpdate]
  );

  return {
    entries,
    loading,
    error,
    averageConsumption,
    addEntry,
    deleteEntry,
    refreshEntries: fetchEntries,
  };
}
