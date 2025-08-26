import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// IMPORTANT: change base to your repo name, e.g. "/island-site/"
export default defineConfig({
  plugins: [react()],
  base: "/YOUR_REPO_NAME/"
});
