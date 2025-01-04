import { useState, useEffect, useCallback } from "react";
import { Car } from "../lib/supabase";
import { carService, AddCarInput } from "../lib/services/carService";

export function useCars() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCars = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await carService.getUserCars();

      if (error) throw error;

      setCars(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch cars");
    } finally {
      setLoading(false);
    }
  }, []);

  const addCar = useCallback(
    async (carData: AddCarInput) => {
      try {
        setLoading(true);
        const { data, error } = await carService.addCar(carData);

        if (error) throw error;

        await fetchCars(); // Refresh the list
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Failed to add car",
        };
      } finally {
        setLoading(false);
      }
    },
    [fetchCars]
  );

  const deleteCar = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        const { error } = await carService.deleteCar(id);

        if (error) throw error;

        await fetchCars(); // Refresh the list
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Failed to delete car",
        };
      } finally {
        setLoading(false);
      }
    },
    [fetchCars]
  );

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  return {
    cars,
    loading,
    error,
    fetchCars,
    addCar,
    deleteCar,
  };
}
