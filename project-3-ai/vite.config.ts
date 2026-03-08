import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
	plugins: [
		tanstackRouter({
			routesDirectory: './src/frontend/routes',
			generatedRouteTree: './src/frontend/routeTree.gen.ts',
		}),
		react(),
		cloudflare(),
		tailwindcss(),
	],
});
