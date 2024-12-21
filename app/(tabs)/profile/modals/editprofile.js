import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import Theme from "@/assets/theme";
import db from "@/database/db";
import useSession from "@/utils/useSession";

export default function EditProfile() {
  const session = useSession();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch current user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (session) {
        try {
          const { data, error } = await db
            .from("users")
            .select("display_name, username")
            .eq("id", session.user.id)
            .single();

          if (error) {
            console.error("Error fetching user data:", error);
            Alert.alert("Error", "Could not load user data.");
          } else {
            setDisplayName(data.display_name || "");
            setUsername(data.username || "");
          }
        } catch (err) {
          console.error("Unexpected error:", err);
          Alert.alert("Error", "Unexpected error occurred.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [session]);

  // Update user data in Supabase
  const handleSave = async () => {
    if (!session) return;

    try {
      const { error } = await db
        .from("users")
        .update({ display_name: displayName, username: username })
        .eq("id", session.user.id);

      if (error) {
        console.error("Error updating user data:", error);
        Alert.alert("Error", "Could not update profile.");
      } else {
        Alert.alert("Success", "Your profile has been updated!");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      Alert.alert("Error", "Unexpected error occurred.");
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>
      
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Display Name</Text>
        <TextInput
          style={styles.input}
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Enter your display name"
        />
      </View>
      
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Enter your username"
        />
      </View>
      
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Confirm</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Theme.colors.backgroundPrimary,
  },
  title: {
    fontSize: Theme.sizes.textLarge,
    fontWeight: "bold",
    color: Theme.colors.textPrimary,
    marginBottom: 20,
    textAlign: "center",
  },
  fieldContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: Theme.sizes.textMedium,
    color: Theme.colors.textSecondary,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: 8,
    padding: 10,
    fontSize: Theme.sizes.textMedium,
    color: Theme.colors.textPrimary,
    backgroundColor: Theme.colors.inputBackground,
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: Theme.colors.textHighlighted,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: Theme.sizes.textMedium,
    fontWeight: "bold",
  },
  loadingText: {
    fontSize: Theme.sizes.textMedium,
    color: Theme.colors.textSecondary,
    textAlign: "center",
    marginTop: 20,
  },
});
