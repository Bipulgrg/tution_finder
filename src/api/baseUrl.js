import { Platform } from "react-native";

export const getApiBaseUrl = () => {
  if (Platform.OS === "web") {
    return process.env.EXPO_PUBLIC_API_URL_WEB || "http://localhost:5000";
  }

  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl;

  // Android emulator reaches host machine via 10.0.2.2.
  // iOS simulator can use localhost.
  if (Platform.OS === "android") return "http://10.0.2.2:5000";
  return "http://localhost:5000";
};
