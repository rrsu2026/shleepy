import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import theme from "../../../assets/theme";
import db from "@/database/db"; // Supabase client

const FriendInfo = ({ friendId, friendName, onClose }) => {
  const [averageSleepHours, setAverageSleepHours] = useState(0);
  const [healthySleepPercentage, setHealthySleepPercentage] = useState(0);
  const [consecutiveDays, setConsecutiveDays] = useState(0);

  useEffect(() => {
    const fetchFriendStats = async () => {
      try {
        const { data: sleepLogs, error } = await db
          .from("sleep_logs")
          .select("hours_slept, sleep_date")
          .eq("user_id", friendId)
          .order("sleep_date", { ascending: false })
          .limit(7);

        if (error) {
          console.error("Error fetching friend's sleep logs:", error);
          return;
        }

        if (sleepLogs && sleepLogs.length > 0) {
          const totalSleep = sleepLogs.reduce((sum, entry) => sum + entry.hours_slept, 0);
          setAverageSleepHours(totalSleep / sleepLogs.length);

          const healthyNights = sleepLogs.filter(
            (entry) => entry.hours_slept >= 7 && entry.hours_slept <= 9
          ).length;
          setHealthySleepPercentage((healthyNights / sleepLogs.length) * 100);

          const consecutiveCount = calculateConsecutiveDays(sleepLogs);
          setConsecutiveDays(consecutiveCount);
        }
      } catch (err) {
        console.error("Error fetching friend's stats:", err);
      }
    };

    fetchFriendStats();
  }, [friendId]);

  const calculateConsecutiveDays = (data) => {
    const sortedDates = data
      .map((entry) => new Date(entry.sleep_date))
      .sort((a, b) => b - a);

    let count = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const diff = (sortedDates[i - 1] - sortedDates[i]) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        count++;
      } else {
        break;
      }
    }
    return count;
  };

  return (
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>{friendName}</Text>

      {/* Week in Review Section */}
      <View style={styles.summaryCont}>
        <Text style={styles.summaryHeader}>Week in Review</Text>
        <View style={styles.summaryRow}>
          <View style={styles.sumSecCont}>
            <View style={styles.sumItemCont}>
              <MaterialCommunityIcons name="clock-outline" style={styles.icon} />
              <Text style={styles.sumText}>{averageSleepHours.toFixed(1)}</Text>
            </View>
            <Text style={styles.sumLabel}>hrs avg</Text>
          </View>
          <View style={styles.sumSecCont}>
            <View style={styles.sumItemCont}>
              <MaterialCommunityIcons name="heart-outline" style={styles.icon} />
              <Text style={styles.sumText}>{healthySleepPercentage.toFixed(1)}%</Text>
            </View>
            <Text style={styles.sumLabel}>healthy</Text>
          </View>
          <View style={styles.sumSecCont}>
            <View style={styles.sumItemCont}>
              <SimpleLineIcons name="fire" style={styles.icon} />
              <Text style={styles.sumText}>{consecutiveDays}</Text>
            </View>
            <Text style={styles.sumLabel}>streak</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    flex: 1,
    backgroundColor: theme.colors.backgroundPrimary,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.textPrimary,
    marginBottom: 20,
  },
  summaryCont: {
    margin: "2%",
    marginTop: "4%",
    borderRadius: 15,
    borderColor: theme.colors.backgroundSecondary,
    borderWidth: 3,
    backgroundColor: theme.colors.backgroundTertiary,
    justifyContent: "space-evenly",
    alignItems: "center",
    padding: 10,
  },
  summaryHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.textPrimary,
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    width: "100%",
  },
  sumSecCont: {
    flexDirection: "column",
    alignItems: "center", 
    justifyContent: "center",
  },
  sumItemCont: {
    flexDirection: "row",
    alignItems: "center", 
    justifyContent: "center",
    gap: 5,
    marginBottom: 5,
  },
  icon: {
    fontSize: 24,
    color: theme.colors.textHighlighted,
    marginRight: 5,
  },
  sumText: {
    fontSize: 20,
    color: theme.colors.textPrimary,
    fontWeight: "bold",
  },
  sumLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: "500",
    marginTop: 4,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: theme.colors.textHighlighted,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  closeButtonText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default FriendInfo;
