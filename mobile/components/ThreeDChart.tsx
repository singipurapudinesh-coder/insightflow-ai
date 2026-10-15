import React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";

interface ThreeDChartProps {
  data?: Array<{ label: string; value: number }>;
  title?: string;
}

export default function ThreeDChart({ data = [], title = "3D Business Performance Matrix" }: ThreeDChartProps) {
  const fallbackData = [
    { label: "West", value: 72500 },
    { label: "East", value: 68900 },
    { label: "South", value: 54100 },
    { label: "Central", value: 49200 },
    { label: "North", value: 38700 }
  ];

  const activeData = data && data.length > 0 ? data : fallbackData;

  const htmlContent = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
      <title>${title}</title>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
      <style>
        * { box-sizing: border-box; }
        body {
          margin: 0;
          padding: 0;
          overflow: hidden;
          background: #0B1020;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #E2E8F0;
        }
        #hud {
          position: absolute;
          top: 16px;
          left: 16px;
          right: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          pointer-events: none;
          z-index: 10;
        }
        .badge {
          background: rgba(30, 41, 59, 0.85);
          border: 1px solid rgba(59, 130, 246, 0.4);
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 11px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: #60A5FA;
        }
        .instruction {
          position: absolute;
          bottom: 16px;
          width: 100%;
          text-align: center;
          font-size: 11px;
          color: #64748B;
          pointer-events: none;
        }
      </style>
    </head>
    <body>
      <div id="hud">
        <div class="badge">⚡ InsightFlow 3D Matrix</div>
        <div class="badge">${activeData.length} Dimensions</div>
      </div>
      <div class="instruction">Drag to rotate • Pinch to zoom</div>

      <script>
        const data = ${JSON.stringify(activeData)};
        const values = data.map(d => d.value);
        const maxVal = Math.max(...values, 1);

        // 1. Scene, Camera, Renderer
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x0B1020, 0.035);

        const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.set(0, 7, 14);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        document.body.appendChild(renderer.domElement);

        // 2. Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0x3B82F6, 1.2);
        dirLight.position.set(6, 12, 8);
        scene.add(dirLight);

        const accentLight = new THREE.PointLight(0x8B5CF6, 1.5, 20);
        accentLight.position.set(-6, 8, -4);
        scene.add(accentLight);

        // 3. Grid Floor
        const grid = new THREE.GridHelper(24, 24, 0x3B82F6, 0x1E293B);
        grid.position.y = 0;
        scene.add(grid);

        // 4. Color Palette
        const colors = [0x3B82F6, 0x6366F1, 0x8B5CF6, 0xEC4899, 0x06D6A0, 0xF59E0B];

        // 5. Build 3D Bar Columns & Floating Cubes
        const group = new THREE.Group();
        const count = data.length;
        const spacing = 2.2;
        const startX = -((count - 1) * spacing) / 2;

        data.forEach((item, i) => {
          const height = Math.max((item.value / maxVal) * 6, 0.6);
          const barColor = colors[i % colors.length];

          // 3D Bar
          const geo = new THREE.BoxGeometry(1.2, height, 1.2);
          const mat = new THREE.MeshStandardMaterial({
            color: barColor,
            roughness: 0.25,
            metalness: 0.8,
            emissive: barColor,
            emissiveIntensity: 0.15
          });
          const bar = new THREE.Mesh(geo, mat);
          bar.position.set(startX + i * spacing, height / 2, 0);
          group.add(bar);

          // Glowing Crown Cube
          const crownGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
          const crownMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: barColor,
            emissiveIntensity: 0.8
          });
          const crown = new THREE.Mesh(crownGeo, crownMat);
          crown.position.set(startX + i * spacing, height + 0.6, 0);
          group.add(crown);
        });

        scene.add(group);
        camera.lookAt(0, 2.5, 0);

        // 6. Interactive Touch Orbit Controls
        let isDragging = false;
        let previousMouseX = 0;
        let previousMouseY = 0;

        window.addEventListener('mousedown', (e) => {
          isDragging = true;
          previousMouseX = e.clientX;
          previousMouseY = e.clientY;
        });

        window.addEventListener('mousemove', (e) => {
          if (!isDragging) return;
          const deltaX = e.clientX - previousMouseX;
          const deltaY = e.clientY - previousMouseY;
          group.rotation.y += deltaX * 0.006;
          camera.position.y = Math.max(2, Math.min(12, camera.position.y - deltaY * 0.03));
          previousMouseX = e.clientX;
          previousMouseY = e.clientY;
        });

        window.addEventListener('mouseup', () => isDragging = false);

        // Mobile Touch Events
        window.addEventListener('touchstart', (e) => {
          if (e.touches.length === 1) {
            isDragging = true;
            previousMouseX = e.touches[0].clientX;
            previousMouseY = e.touches[0].clientY;
          }
        });

        window.addEventListener('touchmove', (e) => {
          if (!isDragging || e.touches.length !== 1) return;
          const deltaX = e.touches[0].clientX - previousMouseX;
          const deltaY = e.touches[0].clientY - previousMouseY;
          group.rotation.y += deltaX * 0.008;
          previousMouseX = e.touches[0].clientX;
          previousMouseY = e.touches[0].clientY;
        });

        window.addEventListener('touchend', () => isDragging = false);

        // Resize handler
        window.addEventListener('resize', () => {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // 7. Animation Loop
        function animate() {
          requestAnimationFrame(animate);
          if (!isDragging) {
            group.rotation.y += 0.004; // Smooth idle rotation
          }
          renderer.render(scene, camera);
        }
        animate();
      </script>
    </body>
  </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={["*"]}
        source={{ html: htmlContent }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1020"
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent"
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0B1020"
  }
});

