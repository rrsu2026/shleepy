import React from "react";
import { StyleSheet, View, Text, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import Theme from "@/assets/theme";

export default function Test({ sleepData, averageSleepHours, healthySleepPercentage }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>This is my test page.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 12,
  },
  title: {
    color: "black",
    fontSize: Theme.sizes.textMedium,
    fontWeight: "bold",
  },
  noDataContainer: {
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  noDataText: {
    color: Theme.colors.textPrimary,
    fontSize: Theme.sizes.textSmall,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  statsCont: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  averageContainer: {
    alignItems: "center",
  },
  averageTitle: {
    fontSize: 16,
    color: Theme.colors.textPrimary,
    fontWeight: "bold",
  },
  averageValue: {
    fontSize: 20,
    color: Theme.colors.textPrimary,
    fontWeight: "bold",
  },
});
