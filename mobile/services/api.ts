import axios from "axios";
import { Platform } from "react-native";

// Configuration for local emulator vs physical phone vs production
const getDefaultApiUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (Platform.OS === "android") {
    return "http://10.0.2.2:5000"; // Android Emulator loopback
  }
  return "http://localhost:5000"; // Web and iOS Simulator
};

export const API_URL = getDefaultApiUrl();

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000
});

export const uploadDataset = async (fileAsset: any) => {
  const formData = new FormData();
  formData.append("file", {
    uri: fileAsset.uri,
    name: fileAsset.name,
    type: fileAsset.mimeType || "application/octet-stream"
  } as any);

  const response = await api.post("/api/datasets/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return response.data;
};

export const loadDemoDataset = async () => {
  const response = await api.get("/api/datasets/demo");
  return response.data;
};

export const getDataset = async (id: string = "demo") => {
  const response = await api.get(`/api/datasets/${id}`);
  return response.data;
};

export const get3DData = async (id: string = "demo") => {
  const response = await api.get(`/api/datasets/${id}/3d-data`);
  return response.data;
};

export const askAICopilot = async (datasetId: string, question: string) => {
  const response = await api.post("/api/ai/ask", { datasetId, question });
  return response.data;
};

export const getForecast = async (datasetId: string = "demo", periods: number = 30) => {
  const response = await api.post("/api/ml/forecast", { datasetId, periods });
  return response.data;
};

export default api;

