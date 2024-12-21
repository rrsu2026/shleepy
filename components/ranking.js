import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Image } from "react-native";
import db from "@/database/db";

const LeaderboardTab = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFriendsData = async () => {
    setLoading(true);
    try {
      const userId = "5eb30c35-80aa-4ad8-a9f5-1b1561244672";

      // Fetch friendships where the current user is involved
      const { data: friendships, error: friendshipsError } = await db
        .from("friendships")
        .select("friend_id")
        .eq("user_id", userId);

      if (friendshipsError) {
        console.error("Error fetching friendships:", friendshipsError);
        setLoading(false);
        return;
      }

      if (!friendships || friendships.length === 0) {
        console.log("No friendships found.");
        setFriends([]);
        setLoading(false);
        return;
      }

      // Extract friend IDs
      const friendIds = friendships.map((friendship) => friendship.friend_id);

      // Fetch friend details from the users table
      const { data: friendDetails, error: userError } = await db
        .from("users")
        .select("id, display_name, profile_picture, sleep_hours")
        .in("id", friendIds);

      if (userError) {
        console.error("Error fetching user details:", userError);
        setLoading(false);
        return;
      }

      // Process and sort the data based on sleep hours for the given date
      const dateToFetch = "2024-11-28";
      const processedData = friendDetails.map((friend) => {
        const sleepHours = friend.sleep_hours?.[dateToFetch] || 0;
        return {
          id: friend.id,
          displayName: friend.display_name,
          profilePicture: friend.profile_picture,
          sleepHours,
        };
      });

      // Sort friends by sleep hours in descending order
      processedData.sort((a, b) => b.sleepHours - a.sleepHours);

      setFriends(processedData);
    } catch (err) {
      console.error("Unexpected error in fetchFriendsData:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriendsData();
  }, []);

  if (loading) {
    return <Text style={styles.loadingText}>Loading leaderboard...</Text>;
  }

  if (friends.length === 0) {
    return (
      <Text style={styles.loadingText}>
        No friends found for the leaderboard.
      </Text>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leaderboard</Text>
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View style={styles.friendItem}>
            <Text style={styles.rank}>{index + 1}</Text>
            <Image
              source={{ uri: item.profilePicture }}
              style={styles.profilePicture}
            />
            <View style={styles.friendInfo}>
              <Text style={styles.friendName}>{item.displayName}</Text>
              <Text style={styles.friendSleep}>{item.sleepHours} hours</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  loadingText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 50,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  rank: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#555",
    width: 30,
    textAlign: "center",
  },
  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  friendSleep: {
    fontSize: 16,
    color: "#666",
  },
});

export default LeaderboardTab;
