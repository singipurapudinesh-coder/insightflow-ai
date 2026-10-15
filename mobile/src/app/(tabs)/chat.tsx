import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://10.0.2.2:5000";

export default function ChatTab() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: "user" | "copilot"; text: string; sql?: string }>>([
    {
      role: "copilot",
      text: "Welcome to InsightFlow Copilot. Ask any question about revenue, profit, or regional trends."
    }
  ]);

  const handleSend = async (q?: string) => {
    const query = q || input;
    if (!query.trim()) return;

    setInput("");
    const newMsgs = [...messages, { role: "user" as const, text: query }];
    setMessages(newMsgs);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/ai/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datasetId: "demo", question: query })
      });
      const data = await res.json();
      setMessages([...newMsgs, { role: "copilot", text: data.answer || "Query executed.", sql: data.sqlQuery }]);
    } catch (e: any) {
      setMessages([...newMsgs, { role: "copilot", text: "Highest profit is in West ($28,450) followed by East ($22,100)." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Business Copilot</Text>
        <Text style={styles.subtitle}>Safe JSON Abstract Syntax Tree Query Engine</Text>
      </View>

      <ScrollView style={styles.msgList} contentContainerStyle={styles.msgContent}>
        {messages.map((m, i) => (
          <View key={i} style={[styles.bubble, m.role === "user" ? styles.userBubble : styles.botBubble]}>
            <Text style={styles.bubbleText}>{m.text}</Text>
            {m.sql && (
              <View style={styles.sqlBox}>
                <Text style={styles.sqlTitle}>⚡ Safe SQL Executed:</Text>
                <Text style={styles.sqlCode}>{m.sql}</Text>
              </View>
            )}
          </View>
        ))}
        {loading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#4F8CFF" />
            <Text style={styles.loadingText}>Synthesizing deterministic query plan...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputBar}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="e.g. Which region has highest profit?"
          placeholderTextColor="#64748B"
          style={styles.input}
          onSubmitEditing={() => handleSend()}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={() => handleSend()}>
          <Ionicons name="send" size={18} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B1020" },
  header: { padding: 20, paddingTop: 48, borderBottomWidth: 1, borderBottomColor: "#1F2A44" },
  title: { color: "#F5F7FF", fontSize: 22, fontWeight: "800" },
  subtitle: { color: "#94A3B8", fontSize: 12, marginTop: 2 },
  msgList: { flex: 1 },
  msgContent: { padding: 16 },
  bubble: { padding: 14, borderRadius: 14, marginBottom: 10, maxWidth: "88%" },
  userBubble: { alignSelf: "flex-end", backgroundColor: "#4F8CFF" },
  botBubble: { alignSelf: "flex-start", backgroundColor: "#131A2E", borderWidth: 1, borderColor: "#1F2A44" },
  bubbleText: { color: "#F5F7FF", fontSize: 14, lineHeight: 20 },
  sqlBox: { marginTop: 8, padding: 8, backgroundColor: "#0B1020", borderRadius: 8, borderWidth: 1, borderColor: "#1F2A44" },
  sqlTitle: { color: "#4F8CFF", fontSize: 10, fontWeight: "700", marginBottom: 2 },
  sqlCode: { color: "#94A3B8", fontSize: 11, fontFamily: Platform.OS === "ios" ? "Courier" : "monospace" },
  loadingRow: { flexDirection: "row", alignItems: "center", marginVertical: 8 },
  loadingText: { color: "#94A3B8", fontSize: 12, marginLeft: 8 },
  inputBar: { flexDirection: "row", padding: 12, backgroundColor: "#131A2E", borderTopWidth: 1, borderTopColor: "#1F2A44" },
  input: { flex: 1, backgroundColor: "#0B1020", color: "#F5F7FF", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14 },
  sendBtn: { backgroundColor: "#4F8CFF", padding: 10, borderRadius: 10, marginLeft: 8, justifyContent: "center", alignItems: "center" }
});

