import { useState, useCallback } from "react";
import { Car } from "../lib/supabase";
import {
  maintenanceService,
  MaintenanceStatus,
} from "../lib/services/maintenanceService";

export function useMaintenance(
  car: Car | null,
  onMaintenanceRecorded?: () => Promise<void>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getMaintenanceStatus = useCallback((): MaintenanceStatus | null => {
    if (!car) return null;
    return maintenanceService.getMaintenanceStatus(car);
  }, [car]);

  const recordOilChange = useCallback(
    async (date: string, odometerKm: number) => {
      if (!car) {
        return { success: false, error: "No car selected" };
      }

      try {
        setLoading(true);
        const { data, error } = await maintenanceService.recordOilChange(
          car.id,
          date,
          odometerKm
        );

        if (error) throw error;

        // Call the callback to refresh data immediately after successful update
        if (onMaintenanceRecorded) {
          await onMaintenanceRecorded();
        }

        return { success: true };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to record oil change";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [car, onMaintenanceRecorded]
  );

  return {
    loading,
    error,
    getMaintenanceStatus,
    recordOilChange,
  };
}
