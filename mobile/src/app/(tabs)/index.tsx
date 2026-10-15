import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../store/auth";
import { Ionicons } from "@expo/vector-icons";

export default function Home() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [kpis, setKpis] = useState({
    revenue: "$428,950",
    profit: "$89,240",
    margin: "20.8%",
    datasets: 1
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name ?? "Analyst"}</Text>
          <Text style={styles.userEmail}>{user?.email ?? "analyst@insightflow.ai"}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* KPI Highlights */}
      <Text style={styles.sectionTitle}>Executive Business Metrics</Text>
      <View style={styles.kpiGrid}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Total Revenue</Text>
          <Text style={styles.kpiValue}>{kpis.revenue}</Text>
          <Text style={styles.kpiTrend}>▲ 14.2% MoM</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Net Profit</Text>
          <Text style={[styles.kpiValue, { color: "#22C55E" }]}>{kpis.profit}</Text>
          <Text style={[styles.kpiTrend, { color: "#22C55E" }]}>▲ 8.6% MoM</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Profit Margin</Text>
          <Text style={[styles.kpiValue, { color: "#A78BFA" }]}>{kpis.margin}</Text>
          <Text style={styles.kpiTrend}>Healthy Band</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Active Datasets</Text>
          <Text style={styles.kpiValue}>{kpis.datasets}</Text>
          <Text style={styles.kpiTrend}>In-Memory OLAP</Text>
        </View>
      </View>

      {/* Quick Action Shortcuts */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/(tabs)/upload")}>
          <View style={[styles.iconCircle, { backgroundColor: "rgba(79, 140, 255, 0.15)" }]}>
            <Ionicons name="cloud-upload" size={24} color="#4F8CFF" />
          </View>
          <Text style={styles.actionTitle}>Upload CSV/Excel</Text>
          <Text style={styles.actionDesc}>Ingest & check hygiene</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/(tabs)/chat")}>
          <View style={[styles.iconCircle, { backgroundColor: "rgba(167, 139, 250, 0.15)" }]}>
            <Ionicons name="chatbubbles" size={24} color="#A78BFA" />
          </View>
          <Text style={styles.actionTitle}>AI Copilot</Text>
          <Text style={styles.actionDesc}>Ask business queries</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/(tabs)/three-d")}>
          <View style={[styles.iconCircle, { backgroundColor: "rgba(0, 212, 160, 0.15)" }]}>
            <Ionicons name="cube" size={24} color="#00D4A0" />
          </View>
          <Text style={styles.actionTitle}>3D Insights</Text>
          <Text style={styles.actionDesc}>Three.js Spatial scene</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/(tabs)/settings")}>
          <View style={[styles.iconCircle, { backgroundColor: "rgba(245, 158, 11, 0.15)" }]}>
            <Ionicons name="people" size={24} color="#F59E0B" />
          </View>
          <Text style={styles.actionTitle}>Team Workspace</Text>
          <Text style={styles.actionDesc}>Roles & permissions</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1020",
  },
  content: {
    padding: 20,
    paddingTop: 48,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greeting: {
    color: "#94A3B8",
    fontSize: 14,
  },
  userName: {
    color: "#F5F7FF",
    fontSize: 24,
    fontWeight: "800",
    marginTop: 2,
  },
  userEmail: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 2,
  },
  logoutBtn: {
    backgroundColor: "#131A2E",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1F2A44",
  },
  sectionTitle: {
    color: "#F5F7FF",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 12,
    marginTop: 8,
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  kpiCard: {
    width: "48%",
    backgroundColor: "#131A2E",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1F2A44",
    marginBottom: 12,
  },
  kpiLabel: {
    color: "#94A3B8",
    fontSize: 12,
    marginBottom: 6,
  },
  kpiValue: {
    color: "#4F8CFF",
    fontSize: 20,
    fontWeight: "800",
  },
  kpiTrend: {
    color: "#4F8CFF",
    fontSize: 11,
    marginTop: 4,
    fontWeight: "600",
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionCard: {
    width: "48%",
    backgroundColor: "#131A2E",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1F2A44",
    marginBottom: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  actionTitle: {
    color: "#F5F7FF",
    fontSize: 14,
    fontWeight: "700",
  },
  actionDesc: {
    color: "#64748B",
    fontSize: 11,
    marginTop: 4,
  },
});

