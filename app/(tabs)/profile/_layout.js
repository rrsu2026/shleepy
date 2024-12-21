import { Stack } from "expo-router";
import Theme from "../../../assets/theme";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Theme.colors.backgroundPrimary, 
        },
        headerShadowVisible: false, 
        headerTintColor: Theme.colors.textHighlighted, 
        headerTitleStyle: {
          fontSize: 18, 
          fontWeight: "bold",
        },
        headerBackTitleStyle: {
          color: Theme.colors.textSecondary, 
          fontSize: 20, 
        },
      }}
    >
      {/* Main Tabs */}
      <Stack.Screen
        name="me"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="statsPage"
        options={{
          headerShown: true,
          title: "", 
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="modals/editprofile"
        options={{
          title: "Edit Profile",
          presentation: "modal",
          headerShown: true,
          headerTitleStyle: {
            fontSize: 16, // Smaller font size for modal headers
            color: Theme.colors.textHighlighted,
          },
        }}
      />
      <Stack.Screen
        name="modals/exploreInsights"
        options={{
          title: "Explore Insights",
          presentation: "modal",
          headerShown: true,
        }}
      />
    </Stack>
  );
}
