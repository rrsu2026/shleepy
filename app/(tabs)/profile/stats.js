import React from "react";
import { StyleSheet, View, Text, Dimensions } from "react-native";
import { LineChart, BarChart } from "react-native-chart-kit";
import Theme from "@/assets/theme";

export default function Stats({ sleepData }) {
  const calculateAverageSleep = () => {
    if (!sleepData.length) return 0;
    const totalSleep = sleepData.reduce((sum, entry) => sum + entry.hours_slept, 0);
    return totalSleep / sleepData.length;
  };

  const getSleepHourDistribution = () => {
    const distribution = Array(10).fill(0); // Array to store counts for 0-9 hours of sleep
    sleepData.forEach((entry) => {
      const hours = Math.min(Math.floor(entry.hours_slept), 9); // Cap hours at 9 for visualization
      distribution[hours] += 1;
    });
    return distribution;
  };

  const sleepDistribution = getSleepHourDistribution();
  const averageSleepHours = calculateAverageSleep();

  const screenWidth = Dimensions.get("window").width;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sleep at a Glance</Text>
      {sleepData.length > 0 ? (
        <View>
          {/* Line Chart: Sleep Trends */}
          <LineChart
            data={{
              labels: sleepData
                .slice(-7)
                .reverse()
                .map((entry) => {
                  const date = new Date(entry.sleep_date);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }),
              datasets: [
                {
                  data: sleepData.slice(-7).map((entry) => entry.hours_slept),
                  color: (opacity = 1) => `rgba(34, 139, 230, ${opacity})`, // Blue line
                },
              ],
            }}
            width={screenWidth - 40} // Ensure chart fits within screen
            height={220}
            chartConfig={{
              backgroundGradientFrom: Theme.colors.backgroundSecondary,
              backgroundGradientTo: Theme.colors.backgroundPrimary,
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, // White text
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
            }}
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />

          {/* Bar Chart: Sleep Hour Distribution */}
          <Text style={styles.title}>Sleep Hour Distribution</Text>
          <BarChart
            data={{
              labels: [...Array(10).keys()].map((hour) => `${hour}h`), // 0-9h labels
              datasets: [
                {
                  data: sleepDistribution,
                  color: (opacity = 1) => `rgba(98, 200, 98, ${opacity})`, // Green bars
                },
              ],
            }}
            width={screenWidth - 40} // Ensure chart fits within screen
            height={220}
            chartConfig={{
              backgroundGradientFrom: Theme.colors.backgroundSecondary,
              backgroundGradientTo: Theme.colors.backgroundPrimary,
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, // White text
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              barPercentage: 0.7, // Adjust bar width
              fromZero: true, // Start Y-axis from zero
            }}
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </View>
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No sleep logs found. Start logging your sleep!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  title: {
    color: Theme.colors.textPrimary,
    fontSize: Theme.sizes.textMedium,
    fontWeight: "bold",
    alignSelf: "flex-start",
    marginBottom: 10,
    marginTop: 30,
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
});

