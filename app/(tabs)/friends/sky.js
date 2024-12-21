import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
  Animated,
  TouchableOpacity,
  Modal,
} from "react-native";
import theme from "../../../assets/theme";
import db from "@/database/db"; // Supabase client
import useSession from "@/utils/useSession";
import FriendInfo from "./friendInfo"; // Import FriendInfo modal

// Screen dimensions
const { width, height } = Dimensions.get("window");

// Reusable Sheep Component with Animation
const SkySheep = ({ horizontalOffset, verticalPosition, onPress }) => {
  const translateY = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: 10,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -10,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [translateY]);

  const sheepSize = 100; // Fixed sheep size
  const sheepImage = require("../../../assets/sheepwhite.png");

  return (
    <Animated.View
      style={{
        transform: [{ translateY }],
        position: "absolute",
        top: verticalPosition, // Correct vertical position
        left: horizontalOffset, // Random horizontal offset
      }}
    >
      <TouchableOpacity onPress={onPress}>
        <Image
          source={sheepImage}
          style={[styles.sheep, { width: sheepSize, height: sheepSize }]}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

// Main Component
const SleepSheepScreen = ({ navigation }) => {
  const [friendsData, setFriendsData] = useState([]);
  const [localSession, setLocalSession] = useState(null); // Local session state
  const [selectedFriend, setSelectedFriend] = useState(null); // Selected friend for modal
  const session = useSession();

  // Update localSession whenever session changes
  useEffect(() => {
    if (session) {
      setLocalSession(session);
    }
  }, [session]);

  // Fetch data once localSession is set
  useEffect(() => {
    const fetchFriendsAndSleepLogs = async () => {
      if (!localSession?.user?.id) {
        console.log("LocalSession not available yet");
        return;
      }
      try {
        const { data: friendships } = await db
          .from("friendships")
          .select("*")
          .or(
            `user_id.eq.${localSession.user.id},friend_id.eq.${localSession.user.id}`
          )
          .eq("req_status", "accepted");

        const friendUUIDs = friendships.map((friendship) =>
          friendship.user_id === localSession.user.id
            ? friendship.friend_id
            : friendship.user_id
        );

        const today = new Date().toLocaleDateString("en-CA");
        const { data: sleepLogs } = await db
          .from("sleep_logs")
          .select("user_id, hours_slept")
          .in("user_id", friendUUIDs)
          .eq("sleep_date", today);

        const { data: friendDetails } = await db
          .from("users")
          .select("id, display_name")
          .in("id", friendUUIDs);

        const friendsWithSleepData = friendUUIDs.map((friendId) => {
          const friendDetail = friendDetails.find((user) => user.id === friendId);
          const friendSleepLog = sleepLogs.find(
            (log) => log.user_id === friendId
          );

          return {
            id: friendId,
            name: friendDetail?.display_name || `Friend ${friendId.slice(0, 4)}`,
            sleepHours: friendSleepLog?.hours_slept || null,
          };
        });

        setFriendsData(friendsWithSleepData);
      } catch (err) {
        console.error("Error fetching friends and sleep logs:", err);
      }
    };

    fetchFriendsAndSleepLogs();
  }, [localSession]); // Run this effect whenever localSession changes

  return (
    <View style={styles.backupCont}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Add Friends Button */}
        <View style={styles.addFriendsContainer}>
          <TouchableOpacity
            style={styles.addFriendsButton}
            onPress={() => navigation.navigate("AddFriends")}
          >
            <Text style={styles.addFriendButtonText}> + add</Text>
          </TouchableOpacity>
        </View>

        {/* Background Image */}
        <Image
          source={require("../../../assets/friendsky.png")}
          style={styles.backgroundImage}
          resizeMode="cover"
        />

        {/* Render Friend Items */}
        <View style={styles.contentContainer}>
          {friendsData.map((friend) => {
            const topPadding = 100;
            const bottomPadding = 100;
            const availableHeight = height * 2 - topPadding - bottomPadding;

            const verticalPosition =
              friend.sleepHours === null
                ? availableHeight / 1
                : topPadding +
                  (availableHeight *
                    (10 - (friend.sleepHours > 10 ? 10 : friend.sleepHours))) /
                    10;

            const padding = 30;
            const horizontalOffset =
              Math.random() * (width - 100 - padding * 2) + padding;

            return (
              <View key={friend.id}>
                <SkySheep
                  horizontalOffset={horizontalOffset}
                  verticalPosition={verticalPosition}
                  onPress={() => setSelectedFriend(friend)}
                />
                <View
                  style={[
                    styles.friendDetails,
                    {
                      position: "absolute",
                      top: verticalPosition + 100,
                      left: horizontalOffset - 20,
                    },
                  ]}
                >
                  <Text style={styles.friendName}>{friend.name}</Text>
                  <Text style={styles.sleepHours}>
                    {friend.sleepHours === null
                      ? "No data today"
                      : `${friend.sleepHours} hours slept`}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Friend Info Modal */}
      {selectedFriend && (
        <Modal
          transparent={false}
          visible={!!selectedFriend}
          onRequestClose={() => setSelectedFriend(null)}
        >
          <FriendInfo
            friendId={selectedFriend.id}
            friendName={selectedFriend.name}
            onClose={() => setSelectedFriend(null)}
          />
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: theme.colors.backgroundPrimary, // Fallback background color
  },
  backupCont: {
    backgroundColor: theme.colors.backgroundPrimary,
  },
  backgroundImage: {
    width: width,
    height: height * 2, // Ensure the image covers the scrollable content height
  },
  contentContainer: {
    position: "absolute", // Overlay the friend items on the background
    top: 0,
    width: width,
    paddingTop: 20,
    backgroundColor: theme.colors.backgroundPrimary,
  },
  friendDetails: {
    alignItems: "center",
  },
  friendName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  sleepHours: {
    fontSize: 16,
    color: "#fff",
  },
  sheep: {
    borderRadius: 0, // Circular for the sheep
  },
  addFriendsContainer: {
    backgroundColor: theme.colors.backgroundSecondary,
    alignItems: "center",
  },
  addFriendsButton: {
    position: "absolute",
    top: "95%", // Adjust based on desired vertical position
    right: "5%",
    backgroundColor: theme.colors.textHighlighted,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginTop: "15%",
    borderRadius: 15,
    zIndex: 10,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  addFriendButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default SleepSheepScreen;
