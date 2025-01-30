// vite.config.ts
import react from "file:///Users/dexter/Documents/GitHub/CLabs/protocol-land/node_modules/@vitejs/plugin-react/dist/index.mjs";
import path from "path";
import { fileURLToPath, URL } from "url";
import { defineConfig } from "file:///Users/dexter/Documents/GitHub/CLabs/protocol-land/node_modules/vite/dist/node/index.js";
import { nodePolyfills } from "file:///Users/dexter/Documents/GitHub/CLabs/protocol-land/node_modules/vite-plugin-node-polyfills/dist/index.js";
var __vite_injected_original_dirname = "/Users/dexter/Documents/GitHub/CLabs/protocol-land";
var __vite_injected_original_import_meta_url = "file:///Users/dexter/Documents/GitHub/CLabs/protocol-land/vite.config.ts";
var vite_config_default = defineConfig({
  plugins: [
    react({ include: "**/*.tsx" }),
    nodePolyfills({
      globals: {
        global: true,
        Buffer: true,
        process: true
      },
      include: ["buffer", "process"],
      protocolImports: false
    })
  ],
  server: {
    watch: {
      usePolling: true
    }
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url)),
      "@codemirror": path.resolve(__vite_injected_original_dirname, "node_modules/@codemirror/"),
      "@arweave-wallet-kit": path.resolve(__vite_injected_original_dirname, "node_modules/@arweave-wallet-kit-beta/")
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {}
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvZGV4dGVyL0RvY3VtZW50cy9HaXRIdWIvQ0xhYnMvcHJvdG9jb2wtbGFuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2RleHRlci9Eb2N1bWVudHMvR2l0SHViL0NMYWJzL3Byb3RvY29sLWxhbmQvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2RleHRlci9Eb2N1bWVudHMvR2l0SHViL0NMYWJzL3Byb3RvY29sLWxhbmQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCwgVVJMIH0gZnJvbSAndXJsJ1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCB7IG5vZGVQb2x5ZmlsbHMgfSBmcm9tICd2aXRlLXBsdWdpbi1ub2RlLXBvbHlmaWxscydcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCh7IGluY2x1ZGU6ICcqKi8qLnRzeCcgfSksXG4gICAgbm9kZVBvbHlmaWxscyh7XG4gICAgICBnbG9iYWxzOiB7XG4gICAgICAgIGdsb2JhbDogdHJ1ZSxcbiAgICAgICAgQnVmZmVyOiB0cnVlLFxuICAgICAgICBwcm9jZXNzOiB0cnVlXG4gICAgICB9LFxuICAgICAgaW5jbHVkZTogWydidWZmZXInLCAncHJvY2VzcyddLFxuICAgICAgcHJvdG9jb2xJbXBvcnRzOiBmYWxzZVxuICAgIH0pXG4gIF0sXG4gIHNlcnZlcjoge1xuICAgIHdhdGNoOiB7XG4gICAgICB1c2VQb2xsaW5nOiB0cnVlXG4gICAgfVxuICB9LFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICdAJzogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuL3NyYycsIGltcG9ydC5tZXRhLnVybCkpLFxuICAgICAgJ0Bjb2RlbWlycm9yJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ25vZGVfbW9kdWxlcy9AY29kZW1pcnJvci8nKSxcbiAgICAgICdAYXJ3ZWF2ZS13YWxsZXQta2l0JzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ25vZGVfbW9kdWxlcy9AYXJ3ZWF2ZS13YWxsZXQta2l0LWJldGEvJylcbiAgICB9XG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIG1hbnVhbENodW5rczoge31cbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXdVLE9BQU8sV0FBVztBQUMxVixPQUFPLFVBQVU7QUFDakIsU0FBUyxlQUFlLFdBQVc7QUFDbkMsU0FBUyxvQkFBb0I7QUFDN0IsU0FBUyxxQkFBcUI7QUFKOUIsSUFBTSxtQ0FBbUM7QUFBbUssSUFBTSwyQ0FBMkM7QUFPN1AsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsTUFBTSxFQUFFLFNBQVMsV0FBVyxDQUFDO0FBQUEsSUFDN0IsY0FBYztBQUFBLE1BQ1osU0FBUztBQUFBLFFBQ1AsUUFBUTtBQUFBLFFBQ1IsUUFBUTtBQUFBLFFBQ1IsU0FBUztBQUFBLE1BQ1g7QUFBQSxNQUNBLFNBQVMsQ0FBQyxVQUFVLFNBQVM7QUFBQSxNQUM3QixpQkFBaUI7QUFBQSxJQUNuQixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sT0FBTztBQUFBLE1BQ0wsWUFBWTtBQUFBLElBQ2Q7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLGNBQWMsSUFBSSxJQUFJLFNBQVMsd0NBQWUsQ0FBQztBQUFBLE1BQ3BELGVBQWUsS0FBSyxRQUFRLGtDQUFXLDJCQUEyQjtBQUFBLE1BQ2xFLHVCQUF1QixLQUFLLFFBQVEsa0NBQVcsd0NBQXdDO0FBQUEsSUFDekY7QUFBQSxFQUNGO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixjQUFjLENBQUM7QUFBQSxNQUNqQjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
