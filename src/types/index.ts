export interface FuelEntry {
  id: string;
  date: Date;
  mileage: number;
  gallons: number;
  cost: number;
  mpg?: number;
}

export interface OilChange {
  id: string;
  date: Date;
  mileage: number;
  nextDueMileage: number;
  nextDueDate: Date;
  cost: number;
  notes?: string;
}

export interface Vehicle {
  id: string;
  name: string;
  make: string;
  model: string;
  year: number;
  recommendedOilChangeMiles: number;
  recommendedOilChangeMonths: number;
}
