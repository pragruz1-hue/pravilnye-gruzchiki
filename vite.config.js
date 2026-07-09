import { defineConfig } from "vite";
import legacy from "@vitejs/plugin-legacy";

export default defineConfig({
  root: ".",
  base: "/",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: "index.html",
      },
    },
    minify: "terser",
    cssMinify: true,
  },
  plugins: [
    legacy({
      targets: ["> 0.5%", "last 2 versions", "not dead", "not op_mini all"],
    }),
  ],
  css: {
    devSourcemap: true,
  },
});