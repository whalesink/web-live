import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig(async ({ command, mode, ssrBuild }) => {
	const env = loadEnv(mode, process.cwd(), "");

	return {
		plugins: [vue()],
		server: {
			open: false,
			host: true,
			port: 3000,
			proxy: {
				"/dev": {
					target: env.SERVER,
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/dev/, ""),
				},
			},
		},
	};
});
