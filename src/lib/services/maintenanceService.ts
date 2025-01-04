import { supabase } from "../supabase";
import type { Car } from "../supabase";
import { addMonths, isBefore } from "date-fns";

export interface MaintenanceStatus {
  kmUntilNextService: number;
  daysUntilNextService: number;
  isOverdueByKm: boolean;
  isOverdueByTime: boolean;
  lastServiceDate: Date;
  lastServiceKm: number;
  nextServiceDate: Date;
  nextServiceKm: number;
}

export const maintenanceService = {
  recordOilChange: async (
    carId: string,
    date: string,
    odometerKm: number
  ): Promise<{ data: Car | null; error: any }> => {
    const { data, error } = await supabase
      .from("cars")
      .update({
        last_oil_change_date: date,
        last_oil_change_km: odometerKm,
        current_odometer_km: odometerKm,
      })
      .eq("id", carId)
      .select()
      .single();

    return { data, error };
  },

  getNextServiceDate: (
    lastServiceDate: string,
    monthsInterval: number
  ): Date => {
    return addMonths(new Date(lastServiceDate), monthsInterval);
  },

  getMaintenanceStatus: (car: Car): MaintenanceStatus => {
    const lastServiceDate = new Date(car.last_oil_change_date);
    const nextServiceDate = maintenanceService.getNextServiceDate(
      car.last_oil_change_date,
      car.oil_change_months
    );

    const nextServiceKm = car.last_oil_change_km + car.oil_change_km;
    const kmUntilNextService = nextServiceKm - car.current_odometer_km;
    const daysUntilNextService = Math.ceil(
      (nextServiceDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      kmUntilNextService,
      daysUntilNextService,
      isOverdueByKm: kmUntilNextService <= 0,
      isOverdueByTime: isBefore(nextServiceDate, new Date()),
      lastServiceDate,
      lastServiceKm: car.last_oil_change_km,
      nextServiceDate,
      nextServiceKm,
    };
  },
};
