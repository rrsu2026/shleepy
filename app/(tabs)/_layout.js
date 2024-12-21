import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import theme from "@/assets/theme";

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerShadowVisible: false,
        tabBarActiveTintColor: theme.colors.textHighlighted,
        tabBarInactiveTintColor: theme.colors.iconSecondary, // Inactive tab icon color
        tabBarStyle: {
          backgroundColor: theme.colors.backgroundTertiary, // Tab bar background color
          height: "8%", // Adjust tab bar height
          borderTopWidth: 0,
        },
        headerStyle: {
          backgroundColor: theme.colors.backgroundPrimary,
        },
        headerTintColor: theme.colors.textPrimary,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 20,
        },
      }}
    >
      {/* Home Tab */}
      <Tabs.Screen
        name="home"
        options={{
          headerShown: false,
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="friends"
        options={{
          tabBarLabel: "Friends",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cloud" color={color} size={size} />
          ),
          headerShown: false,
        }}
      />

      {/* Profile Tab */}
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
