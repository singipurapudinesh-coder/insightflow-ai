import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { Platform } from "react-native";

export interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadSession: () => Promise<void>;
}

const getDefaultApiUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (Platform.OS === "android") {
    return "http://10.0.2.2:5000";
  }
  return "http://localhost:5000";
};

const API_URL = getDefaultApiUrl();

// Safe storage helper supporting web & native SecureStore
const safeStorage = {
  setItem: async (key: string, value: string) => {
    try {
      if (Platform.OS === "web") {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (e) {
      // storage fallback
    }
  },
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === "web") {
        return typeof window !== "undefined" && window.localStorage ? window.localStorage.getItem(key) : null;
      }
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      return null;
    }
  },
  deleteItem: async (key: string) => {
    try {
      if (Platform.OS === "web") {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.removeItem(key);
        }
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (e) {}
  }
};

export const useAuth = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  loading: true,

  register: async (name, email, password) => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Registration failed");
    }

    await safeStorage.setItem("accessToken", data.accessToken);
    await safeStorage.setItem("user", JSON.stringify(data.user));

    set({
      accessToken: data.accessToken,
      user: data.user,
      isAuthenticated: true,
      loading: false,
    });
  },

  login: async (email, password) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    await safeStorage.setItem("accessToken", data.accessToken);
    await safeStorage.setItem("user", JSON.stringify(data.user));

    set({
      accessToken: data.accessToken,
      user: data.user,
      isAuthenticated: true,
      loading: false,
    });
  },

  logout: async () => {
    await safeStorage.deleteItem("accessToken");
    await safeStorage.deleteItem("user");
    set({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      loading: false,
    });
  },

  loadSession: async () => {
    const token = await safeStorage.getItem("accessToken");
    const userStr = await safeStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;

    if (token) {
      set({
        accessToken: token,
        user,
        isAuthenticated: true,
        loading: false,
      });
    } else {
      set({ loading: false });
    }
  },
}));

