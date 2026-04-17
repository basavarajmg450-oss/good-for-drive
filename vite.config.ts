import { defineConfig } from "vite";
import { tanstackStartVite } from "@tanstack/react-start/vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    tailwindcss(),
    tanstackStartVite(),
    process.env.NODE_ENV === "production" && cloudflare(),
  ].filter(Boolean),
});

