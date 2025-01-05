import "dotenv/config";

export default {
  expo: {
    name: "MyCar BG",
    slug: "mycarbg",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.venelinvelev.mycarbg",
      buildNumber: "1",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      package: "com.venelinvelev.mycarbg",
      versionCode: 1,
      jsEngine: "hermes",
      enableNewArchitecture: false, // Temporarily disabled for dev
      softwareKeyboardLayoutMode: "pan",
      allowBackup: true,
      permissions: ["INTERNET", "WAKE_LOCK"],
    },
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      eas: {
        projectId: "f366305a-9f10-4e63-b464-11d6fa4dee99",
      },
    },
    plugins: ["expo-secure-store"],
    developmentClient: {
      silentLaunch: false,
    },
  },
};
