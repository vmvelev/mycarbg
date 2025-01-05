// src/navigation/index.tsx
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ActivityIndicator, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuthContext } from "../contexts/AuthContext";

// Auth Screens
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen";

// Main App Screens
import FuelScreen from "../screens/main/FuelScreen";
import MaintenanceScreen from "../screens/main/MaintenanceScreen";
import CarManagementScreen from "../screens/main/CarManagementScreen";

// Navigation Types
import {
  RootStackParamList,
  AuthStackParamList,
  MainTabParamList,
} from "../types/navigation";
import { ErrorBoundary } from "../components/ErrorBoundary";

const DEBUG = true;
const log = (...args: any[]) => {
  if (DEBUG) {
    console.log("[Navigation]", ...args);
  }
};

const withErrorBoundary = (
  ScreenComponent: React.ComponentType<any>,
  screenName: string
) => {
  return (props: any) => {
    log(`Rendering screen: ${screenName}`);
    return (
      <ErrorBoundary>
        <ScreenComponent {...props} />
      </ErrorBoundary>
    );
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

// Auth Navigator
function AuthNavigator() {
  log("Rendering AuthNavigator");
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "white" },
      }}
    >
      <AuthStack.Screen
        name="Login"
        component={withErrorBoundary(LoginScreen, "Login")}
      />
      <AuthStack.Screen
        name="Register"
        component={withErrorBoundary(RegisterScreen, "Register")}
      />
      <AuthStack.Screen
        name="ForgotPassword"
        component={withErrorBoundary(ForgotPasswordScreen, "ForgotPassword")}
      />
    </AuthStack.Navigator>
  );
}

// Main App Navigator
function MainNavigator() {
  log("Rendering MainNavigator");
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof MaterialCommunityIcons.glyphMap = "help";
          switch (route.name) {
            case "Fuel":
              iconName = "gas-station";
              break;
            case "Maintenance":
              iconName = "car-wrench";
              break;
            case "Cars":
              iconName = "car";
              break;
          }
          return (
            <MaterialCommunityIcons name={iconName} size={size} color={color} />
          );
        },
        tabBarActiveTintColor: "#2196F3",
        tabBarInactiveTintColor: "gray",
        headerShown: true,
      })}
    >
      <MainTab.Screen
        name="Fuel"
        component={withErrorBoundary(FuelScreen, "Fuel")}
        options={{ title: "Гориво" }}
      />
      <MainTab.Screen
        name="Maintenance"
        component={withErrorBoundary(MaintenanceScreen, "Maintenance")}
        options={{ title: "Обслужване" }}
      />
      <MainTab.Screen
        name="Cars"
        component={withErrorBoundary(CarManagementScreen, "Cars")}
        options={{ title: "Автомобили" }}
      />
    </MainTab.Navigator>
  );
}

// Loading Screen
function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#2196F3" />
    </View>
  );
}

// Root Navigator
export default function RootNavigator() {
  const { user, loading } = useAuthContext();

  log("RootNavigator render:", { user: !!user, loading });

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer
      onStateChange={(state) => {
        log("Navigation state changed:", state);
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
