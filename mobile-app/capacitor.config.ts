import type { CapacitorConfig } from "@capacitor/cli";
import "dotenv/config";

const appUrl = process.env.APP_URL || "https://msr-liart.vercel.app";

const config: CapacitorConfig = {
  appId: "com.maliksajawal.refreshment",
  appName: "MSR Accounting",
  webDir: "www",
  server: {
    url: appUrl,
    cleartext: appUrl.startsWith("http://"),
    androidScheme: "https"
  }
};

export default config;
