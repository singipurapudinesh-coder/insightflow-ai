import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useAuth } from "../../store/auth";
import { Ionicons } from "@expo/vector-icons";

export default function SettingsTab() {
  const { user, logout } = useAuth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Workspace & Account</Text>
      <Text style={styles.subtitle}>Manage team members, roles, and profile settings</Text>

      <View style={styles.card}>
        <View style={styles.avatarWrap}>
          <Text style={styles.avatarTxt}>{user?.name ? user.name[0].toUpperCase() : "A"}</Text>
        </View>
        <Text style={styles.profileName}>{user?.name ?? "Analyst"}</Text>
        <Text style={styles.profileEmail}>{user?.email ?? "analyst@insightflow.ai"}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleTxt}>WORKSPACE OWNER</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Workspace Settings</Text>
      <View style={styles.settingsGroup}>
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Ionicons name="business" size={20} color="#4F8CFF" />
            <Text style={styles.settingLabel}>Workspace Name</Text>
          </View>
          <Text style={styles.settingValue}>{user?.name ? `${user.name}'s Workspace` : "Main Workspace"}</Text>
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Ionicons name="shield-checkmark" size={20} color="#22C55E" />
            <Text style={styles.settingLabel}>Data Security</Text>
          </View>
          <Text style={[styles.settingValue, { color: "#22C55E" }]}>Encrypted</Text>
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Ionicons name="server" size={20} color="#A78BFA" />
            <Text style={styles.settingLabel}>OLAP Engine</Text>
          </View>
          <Text style={styles.settingValue}>In-Memory DuckDB</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Ionicons name="log-out" size={20} color="white" />
        <Text style={styles.logoutTxt}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B1020" },
  content: { padding: 20, paddingTop: 48 },
  title: { color: "#F5F7FF", fontSize: 24, fontWeight: "800" },
  subtitle: { color: "#94A3B8", fontSize: 13, marginTop: 4, marginBottom: 20 },
  card: { backgroundColor: "#131A2E", borderRadius: 16, padding: 24, alignItems: "center", borderWidth: 1, borderColor: "#1F2A44", marginBottom: 24 },
  avatarWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#4F8CFF", justifyContent: "center", alignItems: "center", marginBottom: 12 },
  avatarTxt: { color: "white", fontSize: 28, fontWeight: "bold" },
  profileName: { color: "#F5F7FF", fontSize: 20, fontWeight: "800" },
  profileEmail: { color: "#94A3B8", fontSize: 13, marginTop: 2 },
  roleBadge: { backgroundColor: "rgba(79, 140, 255, 0.15)", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginTop: 10, borderWidth: 1, borderColor: "rgba(79, 140, 255, 0.4)" },
  roleTxt: { color: "#4F8CFF", fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  sectionTitle: { color: "#F5F7FF", fontSize: 16, fontWeight: "700", marginBottom: 12 },
  settingsGroup: { backgroundColor: "#131A2E", borderRadius: 14, borderWidth: 1, borderColor: "#1F2A44", marginBottom: 24 },
  settingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#1F2A44" },
  settingLeft: { flexDirection: "row", alignItems: "center" },
  settingLabel: { color: "#F5F7FF", fontSize: 14, marginLeft: 12, fontWeight: "500" },
  settingValue: { color: "#94A3B8", fontSize: 13 },
  logoutBtn: { flexDirection: "row", backgroundColor: "#EF4444", padding: 15, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  logoutTxt: { color: "white", fontWeight: "700", marginLeft: 8, fontSize: 15 }
});
