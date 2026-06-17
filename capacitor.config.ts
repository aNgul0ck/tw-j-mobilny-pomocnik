import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.lovable.pinly",
  appName: "Pinly",
  webDir: "dist",
  server: {
    // Hot-reload from the Lovable preview while developing on a device.
    // Remove the `url` line to bundle the local build into the app for release.
    url: "https://5a7b6bf4-2e44-4184-abd2-a860ba97facc.lovableproject.com?forceHideBadge=true",
    cleartext: true,
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
