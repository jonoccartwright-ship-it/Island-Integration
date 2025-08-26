import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// IMPORTANT: If your repo name is different, change this to match EXACTLY.
export default defineConfig({
  plugins: [react()],
  base: "/Island-Integration/"
});
