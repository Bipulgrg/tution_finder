import "./global.css";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider } from "./src/context/AuthContext";
import { TutorProvider } from "./src/context/TutorContext";
import { BookingProvider } from "./src/context/BookingContext";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <TutorProvider>
          <BookingProvider>
            <StatusBar style="auto" />
            <AppNavigator />
          </BookingProvider>
        </TutorProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
