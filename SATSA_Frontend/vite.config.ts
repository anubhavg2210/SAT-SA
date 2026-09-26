import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    srcDirectory: "./src",
    router: {
      routesDirectory: "./routes",
    },
  },
});
