import { defineConfig } from "vite";
import { sommarkVite } from "sommark/vite";

export default defineConfig({
	build: {
		target: "esnext"
	},
	server: {
		fs: {
			allow: [".."]
		}
	},
	plugins: [sommarkVite()],
});
