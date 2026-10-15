# ⚡ InsightFlow AI

> **Autonomous Business Intelligence Copilot that turns CSV/Excel data into dashboards, natural-language insights, time-series forecasts, and 3D spatial visualizations.**

---

## 🏛️ Monorepo Architecture

- **`mobile/`** — Cross-platform Expo React Native mobile application and Android APK (`buildType: "apk"` via EAS Build), with file-based Expo Router navigation, Zustand auth store, and Three.js WebView.
- **`server/`** — Production Node.js, Express, TypeScript backend powered by Prisma ORM, PostgreSQL, Helmet security, Zod validation, and JWT session handling.
- **`ml-service/`** — Python FastAPI microservice providing time-series sales forecasting (Prophet / Fourier harmonics) and statistical anomaly detection.
- **`docs/`** — Architecture blueprints, viva defense guides, and milestone roadmaps.

---

## 🚀 Quickstart

### 1. Start the Node.js API
```bash
cd server
npm install
npm run build
npm start
```
Server runs at `http://localhost:5000` (`http://10.0.2.2:5000` for Android emulators).

### 2. (Optional) Start Python ML Service
```bash
cd ml-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Start the Mobile App
```bash
cd mobile
npm install
npx expo start
```
- Press `a` for Android Emulator.
- Press `w` for Web Preview in your browser.
- Scan QR code using Expo Go on a physical phone.

### 4. Build Installable Android APK
```bash
cd mobile
npx eas-cli build --platform android --profile preview
```
Download the resulting `.apk` and install it directly on any Android device.
