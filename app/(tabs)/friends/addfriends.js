import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";
import db from "@/database/db";
import useSession from "@/utils/useSession";
import Theme from "@/assets/theme";

const AddFriends = () => {
  const session = useSession();
  const [username, setUsername] = useState("");
  const [friendRequests, setFriendRequests] = useState([]);
  const [suggestedFriends, setSuggestedFriends] = useState([]);

  // Fetch active friend requests
  useEffect(() => {
    const fetchFriendRequests = async () => {
      if (!session?.user?.id) return;

      const { data, error } = await db
        .from("friendships")
        .select(`
          id,
          user_id,
          friend_id,
          req_status,
          requester:users!fk_user_id(display_name, username)
        `)
        .eq("friend_id", session.user.id) // Show requests where the logged-in user is the receiver
        .eq("req_status", "pending");

      if (error) {
        console.error("Error fetching friend requests:", error);
      } else {
        setFriendRequests(data || []);
      }
    };

    fetchFriendRequests();
  }, [session]);

  // Fetch suggested friends
  useEffect(() => {
    const fetchSuggestedFriends = async () => {
      if (!session?.user?.id) return;

      const { data: allUsers, error } = await db
        .from("users")
        .select("id, display_name, username");

      if (error) {
        console.error("Error fetching users:", error);
        return;
      }

      const { data: existingFriends, error: friendsError } = await db
        .from("friendships")
        .select("*")
        .or(
          `user_id.eq.${session.user.id},friend_id.eq.${session.user.id}`
        )
        .in("req_status", ["accepted", "pending"]);

      if (friendsError) {
        console.error("Error fetching friendships:", friendsError);
        return;
      }

      const friendIds = existingFriends.map((f) =>
        f.user_id === session.user.id ? f.friend_id : f.user_id
      );

      const suggestions = allUsers.filter(
        (user) => user.id !== session.user.id && !friendIds.includes(user.id)
      );

      setSuggestedFriends(suggestions);
    };

    fetchSuggestedFriends();
  }, [session]);

  const sendFriendRequest = async () => {
    if (!username || !session?.user?.id) return;
  
    try {
      // Find user by username (not display_name)
      const { data: friend, error } = await db
        .from("users")
        .select("*")
        .eq("username", username)
        .single();
  
      if (error || !friend) {
        Alert.alert("User not found");
        return;
      }
  
      // Check if a friendship already exists between the current user and the friend
      const { data: existingFriendship, error: friendshipError } = await db
        .from("friendships")
        .select("*")
        .or(
          `user_id.eq.${session.user.id},friend_id.eq.${session.user.id}`
        )
        .or(`user_id.eq.${friend.id},friend_id.eq.${friend.id}`)
        .single();
  
      if (friendshipError && friendshipError.code !== "PGRST116") {
        // Ignore "No rows found" error, handle other errors
        Alert.alert("Error checking friendship. Please try again.");
        return;
      }
  
      if (existingFriendship?.req_status === "accepted") {
        Alert.alert("You are already friends!");
        return;
      }
  
      if (!existingFriendship) {
        // Create a new friendship
        await db.from("friendships").insert({
          user_id: session.user.id,
          friend_id: friend.id,
          req_status: "pending",
        });
        Alert.alert("Friend request sent!");
      } else {
        // Update existing friendship to "pending"
        await db
          .from("friendships")
          .update({ req_status: "pending" })
          .eq("id", existingFriendship.id);
        Alert.alert("Friend request updated!");
      }
    } catch (err) {
      console.error("Error sending friend request:", err);
      Alert.alert("An error occurred. Please try again.");
    }
  };
  
  const acceptRequest = async (requestId) => {
    try {
      await db
        .from("friendships")
        .update({ req_status: "accepted" })
        .eq("id", requestId);

      setFriendRequests((prev) =>
        prev.filter((request) => request.id !== requestId)
      );
      Alert.alert("Friend request accepted!");
    } catch (err) {
      console.error("Error accepting request:", err);
    }
  };

  const denyRequest = async (requestId) => {
    try {
      await db.from("friendships").delete().eq("id", requestId);

      setFriendRequests((prev) =>
        prev.filter((request) => request.id !== requestId)
      );
      Alert.alert("Friend request denied.");
    } catch (err) {
      console.error("Error denying request:", err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Friends</Text>

      {/* Send Friend Request */}
      <View style={styles.section}>
        <TextInput
          style={styles.input}
          placeholder="Enter friend's username"
          placeholderTextColor={Theme.colors.textSecondary}
          value={username}
          onChangeText={setUsername}
        />
        <TouchableOpacity onPress={sendFriendRequest} style={styles.button}>
          <Text style={styles.buttonText}>Send Request</Text>
        </TouchableOpacity>
      </View>

      {/* Active Friend Requests */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Friend Requests</Text>
        <FlatList
          data={friendRequests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
          <View style={styles.requestItem}>
            <View>
              <Text style={styles.displayNameText}>
                {item.requester?.display_name || "Unknown"}
              </Text>
              <Text style={styles.usernameText}>
                @{item.requester?.username || "Unknown"}
              </Text>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={() => acceptRequest(item.id)}
                style={styles.acceptButton}
              >
                <Text style={styles.buttonText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => denyRequest(item.id)}
                style={styles.denyButton}
              >
                <Text style={styles.buttonText}>Deny</Text>
              </TouchableOpacity>
            </View>
          </View>

          )}
        />
      </View>

      {/* Suggested Friends */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Suggested Friends</Text>
        <FlatList
          data={suggestedFriends}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.suggestionItem}>
              <Text style={styles.suggestionText}>{item.display_name} (@{item.username})</Text>
              <TouchableOpacity
                onPress={() => setUsername(item.username)}
                style={styles.suggestButton}
              >
                <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.backgroundPrimary,
    padding: 20,
  },
  title: {
    fontSize: Theme.sizes.textLarge,
    fontWeight: "bold",
    color: Theme.colors.textPrimary,
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    marginVertical: 15,
    padding: 15,
    borderRadius: 10,
    backgroundColor: Theme.colors.backgroundSecondary,
  },
  sectionTitle: {
    fontSize: Theme.sizes.textMedium,
    fontWeight: "bold",
    color: Theme.colors.textPrimary,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.backgroundPrimary,
    padding: 10,
    fontSize: Theme.sizes.textMedium,
    borderRadius: 8,
    color: Theme.colors.textPrimary,
    marginBottom: 10,
  },
  button: {
    backgroundColor: Theme.colors.textHighlighted,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: Theme.colors.textPrimary,
    fontSize: Theme.sizes.textMedium,
    fontWeight: "bold",
  },
  requestItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: Theme.colors.backgroundTertiary,
  },
  requestText: {
    color: Theme.colors.textPrimary,
    fontSize: Theme.sizes.textMedium,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
  },
  acceptButton: {
    backgroundColor: Theme.colors.success,
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  denyButton: {
    backgroundColor: Theme.colors.danger,
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  suggestionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: Theme.colors.backgroundTertiary,
  },
  suggestionText: {
    color: Theme.colors.textPrimary,
    fontSize: Theme.sizes.textMedium,
  },
  suggestButton: {
    backgroundColor: Theme.colors.textHighlighted,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  displayNameText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Theme.colors.textPrimary,
  }, 
  usernameText: {
    fontSize: Theme.sizes.textSmall, 
    color: Theme.colors.textSecondary,
  },
});

export default AddFriends;
