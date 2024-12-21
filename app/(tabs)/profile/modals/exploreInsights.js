import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import * as Location from "expo-location";
import Theme from "@/assets/theme";

const ExploreInsights = () => {
  const [weather, setWeather] = useState(null);
  const [sunrise, setSunrise] = useState("");
  const [sunset, setSunset] = useState("");
  const [sleepTip, setSleepTip] = useState("");
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);

  const fetchInsights = async (latitude, longitude) => {
    await Promise.all([
      fetchWeather(latitude, longitude),
      fetchSunTimes(latitude, longitude),
    ]);
    fetchSleepTip();
  };

  const fetchWeather = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=8ad6f26a6f2b4685b44132145241312&q=${latitude},${longitude}`
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setWeather(data);
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  };

  const fetchSunTimes = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/astronomy.json?key=8ad6f26a6f2b4685b44132145241312&q=${latitude},${longitude}`
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setSunrise(data.astronomy.astro.sunrise); // Assuming `sunrise` exists
      setSunset(data.astronomy.astro.sunset); // Assuming `sunset` exists
    } catch (error) {
      console.error("Error fetching sun times data:", error);
    }
  };

  const fetchSleepTip = () => {
    const tips = [
      "Keep your bedroom dark and quiet for better sleep.",
      "Avoid screens at least one hour before bedtime.",
      "Stick to a consistent sleep schedule, even on weekends.",
      "Limit caffeine intake, especially in the afternoon.",
    ];
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    setSleepTip(randomTip);
  };

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationError("Permission to access location was denied.");
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      fetchInsights(latitude, longitude);
    } catch (error) {
      console.error("Error getting location:", error);
      setLocationError("Unable to get your location.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Theme.colors.textHighlighted} />
      </View>
    );
  }

  if (locationError) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{locationError}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {weather && (
        <>
          <Text style={styles.title}>Weather Insights</Text>
          <Text style={styles.location}>
            {weather.location.name}, {weather.location.region}
          </Text>
          <Text style={styles.temp}>{weather.current.temp_c}°C</Text>
          <Text style={styles.condition}>{weather.current.condition.text}</Text>
          <Text style={styles.text}>Humidity: {weather.current.humidity}%</Text>
        </>
      )}
      {(sunrise || sunset) && (
        <>
          <Text style={styles.title}>Sun Times</Text>
          <Text style={styles.text}>Sunrise: {sunrise}</Text>
          <Text style={styles.text}>Sunset: {sunset}</Text>
        </>
      )}
      {sleepTip && (
        <>
          <Text style={styles.title}>Sleep Tip of the Day</Text>
          <Text style={styles.text}>{sleepTip}</Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Theme.colors.backgroundPrimary,
    padding: 20,
  },
  title: {
    fontSize: Theme.sizes.textLarge,
    fontWeight: "bold",
    color: Theme.colors.textHighlighted,
    marginTop: 50,
    marginBottom: 10,
  },
  location: {
    fontSize: Theme.sizes.textMedium,
    color: Theme.colors.textSecondary,
    marginBottom: 5,
  },
  temp: {
    fontSize: 50,
    fontWeight: "bold",
    color: Theme.colors.textPrimary,
    marginBottom: 5,
  },
  condition: {
    fontSize: Theme.sizes.textMedium,
    color: Theme.colors.textSecondary,
  },
  text: {
    fontSize: Theme.sizes.textMedium,
    color: Theme.colors.textSecondary,
    marginBottom: 5,
  },
  errorText: {
    fontSize: Theme.sizes.textMedium,
    color: Theme.colors.danger,
  },
});

export default ExploreInsights;
