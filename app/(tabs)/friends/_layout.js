import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SkyScreen from "./sky"; // Main screen for the friends tab
import AddFriendsScreen from "./addfriends"; // Modal for adding friends

const Stack = createNativeStackNavigator();

export default function FriendsLayout() {
  return (
    <Stack.Navigator>
      {/* Main Friends Tab Screen */}
      <Stack.Screen
        name="Sky"
        component={SkyScreen}
        options={{
          headerShown: false, // Hide header for the main screen
        }}
      />

      {/* Modal for Adding Friends */}
      <Stack.Screen
        name="AddFriends"
        component={AddFriendsScreen}
        options={{
          presentation: "modal", 
          title: "Add Friends", 
          headerShown: false, 
        }}
      />
    </Stack.Navigator>
  );
}
