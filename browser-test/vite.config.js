import { defineConfig } from "vite";

export default defineConfig({
    build: {
        target: "esnext" // enables top-level await
    },
    server: {
        fs: {
            allow: [".."] // allow serving files from parent (SomMark source)
        }
    },
    optimizeDeps: {
        exclude: ["quickjs-emscripten"] // WASM package — don't pre-bundle
    }
});
