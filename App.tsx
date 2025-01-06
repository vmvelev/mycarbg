import { StatusBar } from "expo-status-bar";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./src/contexts/AuthContext";
import RootNavigator from "./src/navigation";
import { LogBox, Platform } from "react-native";
import { enableScreens } from "react-native-screens";

// Enable native screens implementation
enableScreens();

// Set up error handling for development
if (__DEV__) {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    originalConsoleError(...args);
    // Log additional debug information
    console.log("Error occurred in development mode");
    console.log("Platform:", Platform.OS);
    console.log(
      "React Native version:",
      require("react-native/package.json").version
    );
  };
}

// Ignore specific warnings if needed
LogBox.ignoreLogs([
  "Value being stored in SecureStore is larger than 2048 bytes",
  "[react-native-gesture-handler]",
  "New Architecture",
]);

export default function App() {
  return (
    <AuthProvider>
      <PaperProvider>
        <SafeAreaProvider>
          <StatusBar style="auto" />
          <RootNavigator />
        </SafeAreaProvider>
      </PaperProvider>
    </AuthProvider>
  );
}
