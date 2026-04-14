import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from "../context/AuthContext";

import AuthScreen from "../screens/shared/AuthScreen";
import ParentTabNavigator from "./ParentTabNavigator";
import TutorTabNavigator from "./TutorTabNavigator";
import TutorProfileScreen from "../screens/parent/TutorProfileScreen";
import BookingScreen from "../screens/parent/BookingScreen";
import BookingConfirmedScreen from "../screens/parent/BookingConfirmedScreen";
import ChatScreen from "../screens/shared/ChatScreen";

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isLoggedIn, role, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          <>
            <Stack.Screen name="Auth" component={AuthScreen} />
          </>
        ) : role === "parent" ? (
          <>
            <Stack.Screen name="ParentTabs" component={ParentTabNavigator} />
            <Stack.Screen
              name="TutorProfile"
              component={TutorProfileScreen}
              options={{ headerShown: true, title: "Tutor Profile" }}
            />
            <Stack.Screen
              name="Booking"
              component={BookingScreen}
              options={{ headerShown: true, title: "Book Session" }}
            />
            <Stack.Screen
              name="BookingConfirmed"
              component={BookingConfirmedScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={{ headerShown: true, title: "Messages" }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="TutorTabs" component={TutorTabNavigator} />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={{ headerShown: true, title: "Messages" }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
