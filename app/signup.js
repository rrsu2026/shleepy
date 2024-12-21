import React, { useState } from "react";
import {
  Text,
  Alert,
  StyleSheet,
  View,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useRouter } from "expo-router";
import Theme from "@/assets/theme";
import db from "@/database/db";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Function to check if the username is already taken
  const checkUsernameAvailability = async (username) => {
    try {
      const { data, error } = await db
        .from("users")
        .select("username")
        .eq("username", username)
        .single();

      if (data) {
        Alert.alert("Error", "This username is already taken.");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error checking username:", error);
      Alert.alert("Error", "Unable to check username availability. Please try again.");
      return false;
    }
  };

  const signUpWithEmail = async () => {
    setLoading(true);
    try {
      // Check if the username is available
      const isAvailable = await checkUsernameAvailability(username);
      if (!isAvailable) {
        setLoading(false);
        return;
      }

      // Create a new user in Supabase Auth
      const { data: authData, error: authError } = await db.auth.signUp({
        email,
        password,
      });

      if (authError) {
        Alert.alert("Error", authError.message);
        setLoading(false);
        return;
      }

      // Insert the user into the "users" table
      const { error: userError } = await db
        .from("users")
        .insert([
          {
            id: authData.user.id, // Supabase Auth user ID
            email,
            display_name: name,
            username,
            profile_picture: "", // Default empty profile picture
            sleep_hours: [], // Default empty sleep hours (JSONB field)
          },
        ]);

      if (userError) {
        Alert.alert("Error", userError.message);
      } else {
        Alert.alert("Success", "Account created successfully! Please log in.");
        router.replace("/"); // Navigate to login screen
      }
    } catch (err) {
      console.error("Error during sign-up:", err);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isSignUpDisabled =
    loading || email.length === 0 || password.length === 0 || name.length === 0 || username.length === 0;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <ImageBackground
      source={require("../assets/homesky.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Create an Account</Text>
        <TextInput
          onChangeText={(text) => setName(text)}
          value={name}
          placeholder="Full Name"
          placeholderTextColor={Theme.colors.textSecondary}
          style={styles.input}
        />
        <TextInput
          onChangeText={(text) => setUsername(text)}
          value={username}
          placeholder="Username"
          placeholderTextColor={Theme.colors.textSecondary}
          style={styles.input}
        />
        <TextInput
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="Email Address"
          placeholderTextColor={Theme.colors.textSecondary}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />
        <TextInput
          onChangeText={(text) => setPassword(text)}
          value={password}
          placeholder="Password"
          placeholderTextColor={Theme.colors.textSecondary}
          secureTextEntry={true}
          autoCapitalize="none"
          style={styles.input}
        />
        <TouchableOpacity
          onPress={signUpWithEmail}
          disabled={isSignUpDisabled}
          style={[styles.button, isSignUpDisabled && styles.buttonDisabled]}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        {/* Back to Login */}
        <TouchableOpacity
          onPress={() => router.push("/")}
          style={{ marginTop: 16 }}
        >
          <Text style={{ color: Theme.colors.textHighlighted }}>
            Already have an account? Sign in
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </ImageBackground>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    width: "100%",
  },
  title: {
    fontWeight: "bold",
    color: Theme.colors.textPrimary,
    fontSize: 30,
    marginBottom: 16,
  },
  input: {
    color: Theme.colors.textPrimary,
    backgroundColor: Theme.colors.backgroundPrimary,
    width: "90%",
    padding: 16,
    height: 50,
    borderRadius: 8,
    marginVertical: 10,
  },
  button: {
    backgroundColor: Theme.colors.textHighlighted,
    borderRadius: 8,
    padding: 12,
    width: "90%",
    alignItems: "center",
    marginVertical: 10,
  },
  buttonDisabled: {
    backgroundColor: Theme.colors.textSecondary,
  },
  buttonText: {
    color: Theme.colors.textPrimary,
    fontWeight: "bold",
    fontSize: 16,
  },
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
