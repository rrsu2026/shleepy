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
  Image,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import Theme from "@/assets/theme";
import db from "@/database/db";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const signInWithEmail = async () => {
    setLoading(true);
    try {
      // Attempt to sign in with Supabase auth
      const { data, error } = await db.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        Alert.alert("Login Failed", error.message);
        setLoading(false);
        return;
      }

      Alert.alert("Success", "Logged in successfully!");
      router.push("/home"); // Navigate to the home page after login
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isSignInDisabled =
    loading || email.length === 0 || password.length === 0;

  return (
    <ImageBackground
      source={require("../assets/Landing.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />

        {/* Splash Section */}
        <View style={styles.splash}>
          <Image
            source={require("../assets/sheepwhite.png")}
            style={{ width: 70, height: 60 }}
            resizeMode="contain"
          />
          <Text style={styles.splashText}>Shleepy</Text>
        </View>

        {/* Email Input */}
        <TextInput
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          placeholderTextColor={Theme.colors.textSecondary}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />

        {/* Password Input */}
        <TextInput
          onChangeText={(text) => setPassword(text)}
          value={password}
          placeholder="Password"
          placeholderTextColor={Theme.colors.textSecondary}
          secureTextEntry={true}
          autoCapitalize="none"
          style={styles.input}
        />

        {/* Sign-In Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={signInWithEmail}
            disabled={isSignInDisabled}
          >
            <Text
              style={[
                styles.button,
                isSignInDisabled ? styles.buttonDisabled : undefined,
              ]}
            >
              Sign in
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sign-Up Option */}
        <TouchableOpacity
          onPress={() => router.push("/signup")} // Navigate to Sign-Up
          style={{ marginTop: 16 }}
        >
          <Text style={{ color: Theme.colors.textHighlighted }}>
            Don't have an account? Sign up
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 16,
    marginTop: "20%",
    width: "100%",
  },
  splash: {
    alignItems: "center",
    marginBottom: 12,
  },
  splashText: {
    fontWeight: "bold",
    color: Theme.colors.textPrimary,
    fontSize: 40,
  },
  buttonContainer: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-around",
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
    color: Theme.colors.textHighlighted,
    fontSize: 18,
    fontWeight: "bold",
    padding: 8,
  },
  buttonDisabled: {
    color: Theme.colors.textSecondary,
  },
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

