import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from "react-native";
import { Link } from "expo-router";
import { useAuth } from "../store/auth";

export default function SignIn() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
    } catch (error: any) {
      Alert.alert("Login failed", error.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>InsightFlow AI</Text>
        <Text style={styles.subtitle}>Business Intelligence Copilot</Text>

        <TextInput
          style={styles.input}
          placeholder="Email address"
          placeholderTextColor="#94A3B8"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#94A3B8"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <Link href="/sign-up" style={styles.link}>
          Don’t have an account? Create one
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1020",
    justifyContent: "center",
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#F5F7FF",
    textAlign: "center",
  },
  subtitle: {
    color: "#94A3B8",
    textAlign: "center",
    marginBottom: 32,
    marginTop: 4,
  },
  input: {
    backgroundColor: "#131A2E",
    color: "#F5F7FF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#1F2A44",
    fontSize: 15,
  },
  button: {
    backgroundColor: "#4F8CFF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  link: {
    color: "#4F8CFF",
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
  },
});

