import React, { useState, useEffect } from "react";
import {
  View,
  SafeAreaView,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ImageBackground,
  Alert,
} from "react-native";
import Theme from "@/assets/theme";
import DateTimePicker from "@react-native-community/datetimepicker";
import db from "@/database/db";

const HomePage = () => {
  const [user, setUser] = useState(null);
  const [sleepTime, setSleepTime] = useState(null);
  const [wakeTime, setWakeTime] = useState(null);
  const [loggedSleep, setLoggedSleep] = useState({ hours: 0, minutes: 0 });
  const [showPicker, setShowPicker] = useState({ type: null, visible: false });
  const [currentDate, setCurrentDate] = useState(""); // New state for the current date

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await db.auth.getSession();

      if (error) {
        console.error("Error fetching user session:", error);
        Alert.alert("Error", "Could not fetch user session. Please log in again.");
      } else if (data?.session?.user) {
        setUser(data.session.user);
        fetchLoggedSleep(data.session.user.id);
      } else {
        console.log("No active session found.");
      }
    };

    // Set current date on component mount
    const today = new Date();
    setCurrentDate(
      today.toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );

    fetchUser();
  }, []);

  const fetchLoggedSleep = async (userId) => {
    const today = new Date().toISOString().split("T")[0]; // Format date as YYYY-MM-DD
    try {
      const { data, error } = await db
        .from("sleep_logs")
        .select("hours_slept")
        .eq("user_id", userId)
        .eq("sleep_date", today)
        .single(); // Fetch the entry for today

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching logged sleep:", error);
      } else if (data) {
        const hours = Math.floor(data.hours_slept);
        const minutes = Math.round((data.hours_slept - hours) * 60);
        setLoggedSleep({ hours, minutes });
      } else {
        setLoggedSleep({ hours: 0, minutes: 0 }); // No log found
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  // Define the showTimePicker function
  const showTimePicker = (type) => {
    setShowPicker({ type, visible: true });
  };

  return (
    <ImageBackground
      source={require("../../assets/Home.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        {/* Display Current Date */}
        <Text style={styles.date}>{currentDate}</Text>

        <Text style={styles.duration}>
          {loggedSleep.hours} hours {loggedSleep.minutes} mins
        </Text>
        <Text style={styles.title}>slept overnight</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Bed Time</Text>
          <Text style={styles.label}>Wake Time</Text>
        </View>
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => showTimePicker("sleep")}
          >
            <Text style={styles.timeText}>
              {sleepTime
                ? sleepTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "Set Time"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => showTimePicker("wake")}
          >
            <Text style={styles.timeText}>
              {wakeTime
                ? wakeTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "Set Time"}
            </Text>
          </TouchableOpacity>
        </View>

        {showPicker.visible && (
          <DateTimePicker
            value={
              showPicker.type === "sleep"
                ? sleepTime || new Date()
                : wakeTime || new Date()
            }
            mode="time"
            is24Hour={true}
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) => {
              if (showPicker.type === "sleep") {
                setSleepTime(selectedDate);
              } else {
                setWakeTime(selectedDate);
              }
              setShowPicker({ type: null, visible: false });
            }}
          />
        )}

        <TouchableOpacity
          style={styles.logButton}
          onPress={() => console.log("Log Sleep")}
          disabled={!user}
        >
          <Text style={styles.logButtonText}>Log Sleep</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  date: {
    fontSize: 16,
    fontWeight: "bold",
    color: Theme.colors.iconSecondary,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    marginBottom: 50,
    color: Theme.colors.iconSecondary,
  },
  duration: {
    fontSize: 24,
    fontWeight: "bold",
    color: Theme.colors.iconPrimary,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  label: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    color: Theme.colors.textSecondary,
  },
  timeButton: {
    flex: 1,
    backgroundColor: Theme.colors.iconSecondary,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginHorizontal: 15,
  },
  timeText: {
    fontSize: 16,
    color: "#333",
  },
  logButton: {
    backgroundColor: Theme.colors.textHighlighted,
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  logButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default HomePage;
