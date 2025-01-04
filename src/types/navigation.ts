export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Fuel: undefined;
  Maintenance: undefined;
  Cars: undefined;
};

// You can declare your route params for screens that need them
export type FuelScreenParams = {
  carId?: string;
};

export type MaintenanceScreenParams = {
  carId?: string;
};

// Extend the NavigationProp and RouteProp types if needed
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
