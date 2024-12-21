import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import Theme from "@/assets/theme";
import db from "@/database/db";
import useSession from "@/utils/useSession";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Loading from "@/components/Loading";
import AnimatedSheep from "../../floatingSheep";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [sleepData, setSleepData] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Single loading state
  const session = useSession();
  const router = useRouter();
  const navigation = useNavigation();

  const [averageSleepHours, setAverageSleepHours] = useState(0);
  const [healthySleepPercentage, setHealthySleepPercentage] = useState(0);
  const [consecutiveDays, setConsecutiveDays] = useState(0);

  const fetchUserProfile = async () => {
    if (!session) return;

    try {
      const { data, error } = await db
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  const fetchSleepData = async () => {
    if (!session) return;

    try {
      const { data, error } = await db
        .from("sleep_logs")
        .select("hours_slept, sleep_date")
        .eq("user_id", session.user.id)
        .order("sleep_date", { ascending: false })
        .limit(7);

      if (error) {
        console.error("Error fetching sleep data:", error);
      } else {
        setSleepData(data || []);

        if (data && data.length > 0) {
          const totalSleep = data.reduce((sum, entry) => sum + entry.hours_slept, 0);
          setAverageSleepHours(totalSleep / data.length);

          const healthyNights = data.filter(
            (entry) => entry.hours_slept >= 7 && entry.hours_slept <= 9
          ).length;
          setHealthySleepPercentage((healthyNights / data.length) * 100);

          const consecutiveCount = calculateConsecutiveDays(data);
          setConsecutiveDays(consecutiveCount);
        } else {
          setAverageSleepHours(0);
          setHealthySleepPercentage(0);
          setConsecutiveDays(0);
        }
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

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

  const loadData = async () => {
    setIsLoading(true); // Start loading
    await Promise.all([fetchUserProfile(), fetchSleepData()]);
    setIsLoading(false); // Stop loading
  };

  const signOut = async () => {
    try {
      const { error } = await db.auth.signOut();
      if (error) {
        Alert.alert(error.message);
      } else {
        router.replace("/"); // Navigate to login
        Alert.alert("Sign out successful.");
      }
    } catch (err) {
      console.log(err);
    }
  };

  // Load data on initial render and when screen regains focus
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [session])
  );

  if (isLoading) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* User Info */}
      <View style={styles.userContainer}>
        <View style={styles.userTextContainer}>
          <View>
            <Text style={styles.title}>Hello, {profile?.display_name || "Unknown User"}!</Text>
            <Text style={styles.username}>@{profile?.username || "unknown"}</Text>
          </View>
          <TouchableOpacity onPress={signOut}>
            <Text style={styles.signOutText}>Sign out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sheep Box */}
      <View style={styles.sheepBox}>
        <Image
          source={require("../../../assets/SheepBox.png")}
          style={styles.sheepBoxImage}
        />
        <AnimatedSheep horizontalOffset={"130%"} verticalPosition={"85%"} />
      </View>

      {/* Summary Section */}
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
        <TouchableOpacity
          style={styles.moreStatsButton}
          onPress={() => navigation.navigate("statsPage")}
        >
          <Text style={styles.moreStatsText}>More Stats {'>'}</Text>
        </TouchableOpacity>
      </View>

      {/* Buttons for Edit Profile and Insights */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("modals/editprofile")}
        >
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("modals/exploreInsights")}
        >
          <Text style={styles.buttonText}>Explore Insights</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.backgroundPrimary,
    padding: "1%",
  },
  userContainer: {
    width: "100%",
    marginTop: 12,
    paddingHorizontal: 12,
  },
  userTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sheepBox: {
    width: "98%",
    height: "30%",
    borderRadius: 16,
    overflow: "hidden",
    alignSelf: "center",
  },
  sheepBoxImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  title: {
    color: Theme.colors.textPrimary,
    fontSize: Theme.sizes.textLarge,
    fontWeight: "bold",
    marginTop: "5%",
    marginBottom: "2%",
  },
  username: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.sizes.textMedium,
    marginBottom: "2%",
  },
  signOutText: {
    fontWeight: "bold",
    color: Theme.colors.textHighlighted,
    fontSize: Theme.sizes.textMedium,
  },
  summaryCont: {
    margin: "2%",
    marginTop: "4%",
    borderRadius: 15,
    borderColor: Theme.colors.backgroundSecondary,
    borderWidth: 3,
    backgroundColor: Theme.colors.backgroundTertiary,
    justifyContent: "space-evenly",
    alignItems: "center",
    padding: 10,
  },
  summaryHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: Theme.colors.textPrimary,
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  sumSecCont: {
    flexDirection: "column",
    alignItems: "center",
  },
  sumItemCont: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 5,
  },
  icon: {
    fontSize: 24,
    color: Theme.colors.textHighlighted,
    marginRight: 5,
  },
  sumText: {
    fontSize: 20,
    color: Theme.colors.textPrimary,
    fontWeight: "bold",
  },
  sumLabel: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
    fontWeight: "500",
    marginTop: 4,
  },
  moreStatsButton: {
    marginTop: 15,
    alignSelf: "flex-end",
    marginRight: 10,
  },
  moreStatsText: {
    fontSize: 14,
    fontWeight: "bold",
    color: Theme.colors.textHighlighted,
  },
  buttonText: {
    fontWeight: "bold",
    color: Theme.colors.textPrimary,
    fontSize: Theme.sizes.textMedium,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 20,
  },
  button: {
    backgroundColor: Theme.colors.textHighlighted,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
});
