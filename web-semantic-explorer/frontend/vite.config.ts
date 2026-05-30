import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react-swc"
import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    chunkSizeWarningLimit: 1024,
  },
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ["d3-geo", "d3-geo-projection", "topojson-client"],
  },
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
      codeSplittingOptions: {
        splitBehavior: ({ routeId }) => {
          if (routeId === "/_layout/map") {
            return []
          }
        },
      },
    }),
    react(),
    tailwindcss(),
  ],
})
