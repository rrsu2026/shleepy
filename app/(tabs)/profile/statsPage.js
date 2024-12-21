import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text } from "react-native";
import Stats from "./stats"; 
import Theme from "@/assets/theme";
import db from "@/database/db";
import Loading from "@/components/Loading";

export default function StatsPage() {
  const [sleepData, setSleepData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSleepData = async () => {
      try {
        const { data, error } = await db
          .from("sleep_logs")
          .select("hours_slept, sleep_date")
          .order("sleep_date", { ascending: false })
          .limit(30);
        if (error) {
          console.error("Error fetching sleep data:", error);
        } else {
          setSleepData(data || []);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSleepData();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Sleep Stats</Text>
      <Stats sleepData={sleepData} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.backgroundPrimary,
    paddingHorizontal: 12,
    paddingTop: 20,
  },
  title: {
    fontSize: Theme.sizes.textLarge,
    fontWeight: "bold",
    color: Theme.colors.textPrimary,
    textAlign: "center",
    marginBottom: 5,
  },
});
