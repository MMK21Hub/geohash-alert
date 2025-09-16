import { defineConfig } from "vite"
import voby from "voby-vite"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [voby(), tailwindcss()],
  server: {
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        sw: "sw.ts",
      },
      output: {
        entryFileNames: (chunk) => {
          // Service worker file has to always be at /sw.js
          if (chunk.name === "sw") return "sw.js"
          return "[name].[hash].js"
        },
      },
    },
  },
})
