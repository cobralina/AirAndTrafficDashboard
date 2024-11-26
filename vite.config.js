import { defineConfig, loadEnv } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { version } from "./package.json";

// https://vitejs.dev/config/
export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  let distribution_folder = `${env.VITE_APP_DISTRIBUTION_FOLDER}`;
  let public_folder = `${env.VITE_APP_BASE_URL}`;
  let souremap = false;

  return defineConfig({
    plugins: [svelte()],
    base: public_folder,
    css: {
      preprocessorOptions: {
        scss: {
          // This can include paths to other SCSS files
          //additionalData: `@import '${env.VITE_APP_EXTERNAL_STYLES}';`
        },
      },
    },
    build: {
      sourcemap: souremap,
      rollupOptions: {
        output: {
          dir: distribution_folder,
          entryFileNames: `js/app.js`,
          assetFileNames: `[ext]/[name].[ext]`,
        },
      },
    },
    define: {
      "import.meta.env.PACKAGE_VERSION": JSON.stringify(process.env.npm_package_version),
    },
  });
};
