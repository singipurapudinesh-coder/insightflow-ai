import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import ThreeDChart from "../../components/ThreeDChart";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://10.0.2.2:5000";

export default function ThreeDTab() {
  const [loading, setLoading] = useState(true);
  const [cubes, setCubes] = useState<any[]>([]);

  useEffect(() => {
    const fetch3D = async () => {
      try {
        const res = await fetch(`${API_URL}/api/datasets/demo/3d-data`);
        const data = await res.json();
        setCubes(data.cubes || []);
      } catch (e) {
        setCubes([
          { label: "West", value: 112000 },
          { label: "East", value: 98000 },
          { label: "South", value: 84000 },
          { label: "Central", value: 78000 },
          { label: "North", value: 56950 }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetch3D();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4F8CFF" />
        <Text style={styles.loadText}>Rendering Three.js Spatial Analytics Scene...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ThreeDChart data={cubes} title="3D Spatial Business Matrix" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B1020" },
  center: { flex: 1, backgroundColor: "#0B1020", justifyContent: "center", alignItems: "center" },
  loadText: { color: "#4F8CFF", marginTop: 12, fontSize: 13 }
});
