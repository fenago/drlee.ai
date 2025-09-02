// vite.config.ts
import { vitePlugin as remixVitePlugin } from "file:///C:/WindsurfProjects/drleeAI/bolt.diy/node_modules/@remix-run/dev/dist/index.js";
import UnoCSS from "file:///C:/WindsurfProjects/drleeAI/bolt.diy/node_modules/unocss/dist/vite.mjs";
import { defineConfig } from "file:///C:/WindsurfProjects/drleeAI/bolt.diy/node_modules/vite/dist/node/index.js";
import { nodePolyfills } from "file:///C:/WindsurfProjects/drleeAI/bolt.diy/node_modules/vite-plugin-node-polyfills/dist/index.js";
import { optimizeCssModules } from "file:///C:/WindsurfProjects/drleeAI/bolt.diy/node_modules/vite-plugin-optimize-css-modules/dist/index.mjs";
import tsconfigPaths from "file:///C:/WindsurfProjects/drleeAI/bolt.diy/node_modules/vite-tsconfig-paths/dist/index.mjs";
import { netlifyPlugin } from "file:///C:/WindsurfProjects/drleeAI/bolt.diy/node_modules/@netlify/remix-adapter/dist/vite/plugin.mjs";
import * as dotenv from "file:///C:/WindsurfProjects/drleeAI/bolt.diy/node_modules/dotenv/lib/main.js";
import { execSync } from "child_process";
import { readFileSync } from "fs";
import { join } from "path";
dotenv.config();
var getGitInfo = () => {
  try {
    return {
      commitHash: execSync("git rev-parse --short HEAD").toString().trim(),
      branch: execSync("git rev-parse --abbrev-ref HEAD").toString().trim(),
      commitTime: execSync("git log -1 --format=%cd").toString().trim(),
      author: execSync("git log -1 --format=%an").toString().trim(),
      email: execSync("git log -1 --format=%ae").toString().trim(),
      remoteUrl: execSync("git config --get remote.origin.url").toString().trim(),
      repoName: execSync("git config --get remote.origin.url").toString().trim().replace(/^.*github.com[:/]/, "").replace(/\.git$/, "")
    };
  } catch {
    return {
      commitHash: "no-git-info",
      branch: "unknown",
      commitTime: "unknown",
      author: "unknown",
      email: "unknown",
      remoteUrl: "unknown",
      repoName: "unknown"
    };
  }
};
var getPackageJson = () => {
  try {
    const pkgPath = join(process.cwd(), "package.json");
    const pkg2 = JSON.parse(readFileSync(pkgPath, "utf-8"));
    return {
      name: pkg2.name,
      description: pkg2.description,
      license: pkg2.license,
      dependencies: pkg2.dependencies || {},
      devDependencies: pkg2.devDependencies || {},
      peerDependencies: pkg2.peerDependencies || {},
      optionalDependencies: pkg2.optionalDependencies || {}
    };
  } catch {
    return {
      name: "DrLee.AI",
      description: "A DIY LLM interface",
      license: "MIT",
      dependencies: {},
      devDependencies: {},
      peerDependencies: {},
      optionalDependencies: {}
    };
  }
};
var pkg = getPackageJson();
var gitInfo = getGitInfo();
var vite_config_default = defineConfig((config2) => {
  return {
    define: {
      __COMMIT_HASH: JSON.stringify(gitInfo.commitHash),
      __GIT_BRANCH: JSON.stringify(gitInfo.branch),
      __GIT_COMMIT_TIME: JSON.stringify(gitInfo.commitTime),
      __GIT_AUTHOR: JSON.stringify(gitInfo.author),
      __GIT_EMAIL: JSON.stringify(gitInfo.email),
      __GIT_REMOTE_URL: JSON.stringify(gitInfo.remoteUrl),
      __GIT_REPO_NAME: JSON.stringify(gitInfo.repoName),
      __APP_VERSION: JSON.stringify(process.env.npm_package_version),
      __PKG_NAME: JSON.stringify(pkg.name),
      __PKG_DESCRIPTION: JSON.stringify(pkg.description),
      __PKG_LICENSE: JSON.stringify(pkg.license),
      __PKG_DEPENDENCIES: JSON.stringify(pkg.dependencies),
      __PKG_DEV_DEPENDENCIES: JSON.stringify(pkg.devDependencies),
      __PKG_PEER_DEPENDENCIES: JSON.stringify(pkg.peerDependencies),
      __PKG_OPTIONAL_DEPENDENCIES: JSON.stringify(pkg.optionalDependencies),
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV)
    },
    build: {
      target: "esnext",
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes("node_modules")) {
              if (id.includes("@radix-ui")) {
                return "ui";
              }
              if (!process.env.VITE_BUILD_SSR && (id.includes("react/") || id.includes("react-dom/"))) {
                return "vendor";
              }
            }
          },
          chunkFileNames: "assets/[name]-[hash].js"
        },
        onwarn(warning, warn) {
          if (warning.code === "EVAL" || warning.code === "MODULE_LEVEL_DIRECTIVE") {
            return;
          }
          warn(warning);
        }
      },
      sourcemap: false,
      chunkSizeWarningLimit: 1e3,
      minify: "esbuild",
      assetsInlineLimit: 0
    },
    optimizeDeps: {
      esbuildOptions: {
        define: {
          global: "globalThis"
        }
      }
    },
    resolve: {
      alias: {
        buffer: "vite-plugin-node-polyfills/polyfills/buffer"
      }
    },
    plugins: [
      nodePolyfills({
        include: ["buffer", "process", "util", "stream"],
        globals: {
          Buffer: true,
          process: true,
          global: true
        },
        protocolImports: true,
        exclude: ["child_process", "fs", "path"]
      }),
      {
        name: "buffer-polyfill",
        transform(code, id) {
          if (id.includes("env.mjs")) {
            return {
              code: `import { Buffer } from 'buffer';
${code}`,
              map: null
            };
          }
          return null;
        }
      },
      remixVitePlugin({
        future: {
          v3_fetcherPersist: true,
          v3_relativeSplatPath: true,
          v3_throwAbortReason: true,
          v3_lazyRouteDiscovery: true
        }
      }),
      UnoCSS(),
      tsconfigPaths(),
      netlifyPlugin(),
      chrome129IssuePlugin(),
      config2.mode === "production" && optimizeCssModules({ apply: "build" })
    ],
    envPrefix: [
      "VITE_",
      "OPENAI_LIKE_API_BASE_URL",
      "OLLAMA_API_BASE_URL",
      "LMSTUDIO_API_BASE_URL",
      "TOGETHER_API_BASE_URL"
    ],
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler"
        }
      }
    }
  };
});
function chrome129IssuePlugin() {
  return {
    name: "chrome129IssuePlugin",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const raw = req.headers["user-agent"]?.match(/Chrom(e|ium)\/([0-9]+)\./);
        if (raw) {
          const version = parseInt(raw[2], 10);
          if (version === 129) {
            res.setHeader("content-type", "text/html");
            res.end(
              '<body><h1>Please use Chrome Canary for testing.</h1><p>Chrome 129 has an issue with JavaScript modules & Vite local development, see <a href="https://github.com/stackblitz/bolt.new/issues/86#issuecomment-2395519258">for more information.</a></p><p><b>Note:</b> This only impacts <u>local development</u>. `pnpm run build` and `pnpm run start` will work fine in this browser.</p></body>'
            );
            return;
          }
        }
        next();
      });
    }
  };
}
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxXaW5kc3VyZlByb2plY3RzXFxcXGRybGVlQUlcXFxcYm9sdC5kaXlcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFdpbmRzdXJmUHJvamVjdHNcXFxcZHJsZWVBSVxcXFxib2x0LmRpeVxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovV2luZHN1cmZQcm9qZWN0cy9kcmxlZUFJL2JvbHQuZGl5L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgdml0ZVBsdWdpbiBhcyByZW1peFZpdGVQbHVnaW4gfSBmcm9tICdAcmVtaXgtcnVuL2Rldic7XG5pbXBvcnQgVW5vQ1NTIGZyb20gJ3Vub2Nzcy92aXRlJztcbmltcG9ydCB7IGRlZmluZUNvbmZpZywgdHlwZSBWaXRlRGV2U2VydmVyIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgeyBub2RlUG9seWZpbGxzIH0gZnJvbSAndml0ZS1wbHVnaW4tbm9kZS1wb2x5ZmlsbHMnO1xuaW1wb3J0IHsgb3B0aW1pemVDc3NNb2R1bGVzIH0gZnJvbSAndml0ZS1wbHVnaW4tb3B0aW1pemUtY3NzLW1vZHVsZXMnO1xuaW1wb3J0IHRzY29uZmlnUGF0aHMgZnJvbSAndml0ZS10c2NvbmZpZy1wYXRocyc7XG5pbXBvcnQgeyBuZXRsaWZ5UGx1Z2luIH0gZnJvbSAnQG5ldGxpZnkvcmVtaXgtYWRhcHRlci9wbHVnaW4nO1xuaW1wb3J0ICogYXMgZG90ZW52IGZyb20gJ2RvdGVudic7XG5pbXBvcnQgeyBleGVjU3luYyB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuaW1wb3J0IHsgcmVhZEZpbGVTeW5jIH0gZnJvbSAnZnMnO1xuaW1wb3J0IHsgam9pbiB9IGZyb20gJ3BhdGgnO1xuXG5kb3RlbnYuY29uZmlnKCk7XG5cbi8vIEdldCBkZXRhaWxlZCBnaXQgaW5mbyB3aXRoIGZhbGxiYWNrc1xuY29uc3QgZ2V0R2l0SW5mbyA9ICgpID0+IHtcbiAgdHJ5IHtcbiAgICByZXR1cm4ge1xuICAgICAgY29tbWl0SGFzaDogZXhlY1N5bmMoJ2dpdCByZXYtcGFyc2UgLS1zaG9ydCBIRUFEJykudG9TdHJpbmcoKS50cmltKCksXG4gICAgICBicmFuY2g6IGV4ZWNTeW5jKCdnaXQgcmV2LXBhcnNlIC0tYWJicmV2LXJlZiBIRUFEJykudG9TdHJpbmcoKS50cmltKCksXG4gICAgICBjb21taXRUaW1lOiBleGVjU3luYygnZ2l0IGxvZyAtMSAtLWZvcm1hdD0lY2QnKS50b1N0cmluZygpLnRyaW0oKSxcbiAgICAgIGF1dGhvcjogZXhlY1N5bmMoJ2dpdCBsb2cgLTEgLS1mb3JtYXQ9JWFuJykudG9TdHJpbmcoKS50cmltKCksXG4gICAgICBlbWFpbDogZXhlY1N5bmMoJ2dpdCBsb2cgLTEgLS1mb3JtYXQ9JWFlJykudG9TdHJpbmcoKS50cmltKCksXG4gICAgICByZW1vdGVVcmw6IGV4ZWNTeW5jKCdnaXQgY29uZmlnIC0tZ2V0IHJlbW90ZS5vcmlnaW4udXJsJykudG9TdHJpbmcoKS50cmltKCksXG4gICAgICByZXBvTmFtZTogZXhlY1N5bmMoJ2dpdCBjb25maWcgLS1nZXQgcmVtb3RlLm9yaWdpbi51cmwnKVxuICAgICAgICAudG9TdHJpbmcoKVxuICAgICAgICAudHJpbSgpXG4gICAgICAgIC5yZXBsYWNlKC9eLipnaXRodWIuY29tWzovXS8sICcnKVxuICAgICAgICAucmVwbGFjZSgvXFwuZ2l0JC8sICcnKSxcbiAgICB9O1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29tbWl0SGFzaDogJ25vLWdpdC1pbmZvJyxcbiAgICAgIGJyYW5jaDogJ3Vua25vd24nLFxuICAgICAgY29tbWl0VGltZTogJ3Vua25vd24nLFxuICAgICAgYXV0aG9yOiAndW5rbm93bicsXG4gICAgICBlbWFpbDogJ3Vua25vd24nLFxuICAgICAgcmVtb3RlVXJsOiAndW5rbm93bicsXG4gICAgICByZXBvTmFtZTogJ3Vua25vd24nLFxuICAgIH07XG4gIH1cbn07XG5cbi8vIFJlYWQgcGFja2FnZS5qc29uIHdpdGggZGV0YWlsZWQgZGVwZW5kZW5jeSBpbmZvXG5jb25zdCBnZXRQYWNrYWdlSnNvbiA9ICgpID0+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBwa2dQYXRoID0gam9pbihwcm9jZXNzLmN3ZCgpLCAncGFja2FnZS5qc29uJyk7XG4gICAgY29uc3QgcGtnID0gSlNPTi5wYXJzZShyZWFkRmlsZVN5bmMocGtnUGF0aCwgJ3V0Zi04JykpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6IHBrZy5uYW1lLFxuICAgICAgZGVzY3JpcHRpb246IHBrZy5kZXNjcmlwdGlvbixcbiAgICAgIGxpY2Vuc2U6IHBrZy5saWNlbnNlLFxuICAgICAgZGVwZW5kZW5jaWVzOiBwa2cuZGVwZW5kZW5jaWVzIHx8IHt9LFxuICAgICAgZGV2RGVwZW5kZW5jaWVzOiBwa2cuZGV2RGVwZW5kZW5jaWVzIHx8IHt9LFxuICAgICAgcGVlckRlcGVuZGVuY2llczogcGtnLnBlZXJEZXBlbmRlbmNpZXMgfHwge30sXG4gICAgICBvcHRpb25hbERlcGVuZGVuY2llczogcGtnLm9wdGlvbmFsRGVwZW5kZW5jaWVzIHx8IHt9LFxuICAgIH07XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiAnRHJMZWUuQUknLFxuICAgICAgZGVzY3JpcHRpb246ICdBIERJWSBMTE0gaW50ZXJmYWNlJyxcbiAgICAgIGxpY2Vuc2U6ICdNSVQnLFxuICAgICAgZGVwZW5kZW5jaWVzOiB7fSxcbiAgICAgIGRldkRlcGVuZGVuY2llczoge30sXG4gICAgICBwZWVyRGVwZW5kZW5jaWVzOiB7fSxcbiAgICAgIG9wdGlvbmFsRGVwZW5kZW5jaWVzOiB7fSxcbiAgICB9O1xuICB9XG59O1xuXG5jb25zdCBwa2cgPSBnZXRQYWNrYWdlSnNvbigpO1xuY29uc3QgZ2l0SW5mbyA9IGdldEdpdEluZm8oKTtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKChjb25maWcpID0+IHtcbiAgcmV0dXJuIHtcbiAgICBkZWZpbmU6IHtcbiAgICAgIF9fQ09NTUlUX0hBU0g6IEpTT04uc3RyaW5naWZ5KGdpdEluZm8uY29tbWl0SGFzaCksXG4gICAgICBfX0dJVF9CUkFOQ0g6IEpTT04uc3RyaW5naWZ5KGdpdEluZm8uYnJhbmNoKSxcbiAgICAgIF9fR0lUX0NPTU1JVF9USU1FOiBKU09OLnN0cmluZ2lmeShnaXRJbmZvLmNvbW1pdFRpbWUpLFxuICAgICAgX19HSVRfQVVUSE9SOiBKU09OLnN0cmluZ2lmeShnaXRJbmZvLmF1dGhvciksXG4gICAgICBfX0dJVF9FTUFJTDogSlNPTi5zdHJpbmdpZnkoZ2l0SW5mby5lbWFpbCksXG4gICAgICBfX0dJVF9SRU1PVEVfVVJMOiBKU09OLnN0cmluZ2lmeShnaXRJbmZvLnJlbW90ZVVybCksXG4gICAgICBfX0dJVF9SRVBPX05BTUU6IEpTT04uc3RyaW5naWZ5KGdpdEluZm8ucmVwb05hbWUpLFxuICAgICAgX19BUFBfVkVSU0lPTjogSlNPTi5zdHJpbmdpZnkocHJvY2Vzcy5lbnYubnBtX3BhY2thZ2VfdmVyc2lvbiksXG4gICAgICBfX1BLR19OQU1FOiBKU09OLnN0cmluZ2lmeShwa2cubmFtZSksXG4gICAgICBfX1BLR19ERVNDUklQVElPTjogSlNPTi5zdHJpbmdpZnkocGtnLmRlc2NyaXB0aW9uKSxcbiAgICAgIF9fUEtHX0xJQ0VOU0U6IEpTT04uc3RyaW5naWZ5KHBrZy5saWNlbnNlKSxcbiAgICAgIF9fUEtHX0RFUEVOREVOQ0lFUzogSlNPTi5zdHJpbmdpZnkocGtnLmRlcGVuZGVuY2llcyksXG4gICAgICBfX1BLR19ERVZfREVQRU5ERU5DSUVTOiBKU09OLnN0cmluZ2lmeShwa2cuZGV2RGVwZW5kZW5jaWVzKSxcbiAgICAgIF9fUEtHX1BFRVJfREVQRU5ERU5DSUVTOiBKU09OLnN0cmluZ2lmeShwa2cucGVlckRlcGVuZGVuY2llcyksXG4gICAgICBfX1BLR19PUFRJT05BTF9ERVBFTkRFTkNJRVM6IEpTT04uc3RyaW5naWZ5KHBrZy5vcHRpb25hbERlcGVuZGVuY2llcyksXG4gICAgICAncHJvY2Vzcy5lbnYuTk9ERV9FTlYnOiBKU09OLnN0cmluZ2lmeShwcm9jZXNzLmVudi5OT0RFX0VOViksXG4gICAgfSxcbiAgICBidWlsZDoge1xuICAgICAgdGFyZ2V0OiAnZXNuZXh0JyxcbiAgICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgICAgb3V0cHV0OiB7XG4gICAgICAgICAgbWFudWFsQ2h1bmtzOiAoaWQ6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgLy8gT25seSBhcHBseSBtYW51YWwgY2h1bmtzIGZvciBjbGllbnQgYnVpbGQsIG5vdCBTU1JcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzJykpIHtcbiAgICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdAcmFkaXgtdWknKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAndWknO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgLy8gRG9uJ3QgbWFudWFsbHkgY2h1bmsgUmVhY3QgZm9yIFNTUiBidWlsZFxuICAgICAgICAgICAgICBpZiAoIXByb2Nlc3MuZW52LlZJVEVfQlVJTERfU1NSICYmIChpZC5pbmNsdWRlcygncmVhY3QvJykgfHwgaWQuaW5jbHVkZXMoJ3JlYWN0LWRvbS8nKSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ3ZlbmRvcic7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIGNodW5rRmlsZU5hbWVzOiAnYXNzZXRzL1tuYW1lXS1baGFzaF0uanMnLFxuICAgICAgICB9LFxuICAgICAgICBvbndhcm4od2FybmluZzogYW55LCB3YXJuOiBhbnkpIHtcbiAgICAgICAgICBpZiAod2FybmluZy5jb2RlID09PSAnRVZBTCcgfHwgd2FybmluZy5jb2RlID09PSAnTU9EVUxFX0xFVkVMX0RJUkVDVElWRScpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB3YXJuKHdhcm5pbmcpO1xuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIHNvdXJjZW1hcDogZmFsc2UsXG4gICAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDEwMDAsXG4gICAgICBtaW5pZnk6ICdlc2J1aWxkJyxcbiAgICAgIGFzc2V0c0lubGluZUxpbWl0OiAwLFxuICAgIH0sXG4gICAgb3B0aW1pemVEZXBzOiB7XG4gICAgICBlc2J1aWxkT3B0aW9uczoge1xuICAgICAgICBkZWZpbmU6IHtcbiAgICAgICAgICBnbG9iYWw6ICdnbG9iYWxUaGlzJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICByZXNvbHZlOiB7XG4gICAgICBhbGlhczoge1xuICAgICAgICBidWZmZXI6ICd2aXRlLXBsdWdpbi1ub2RlLXBvbHlmaWxscy9wb2x5ZmlsbHMvYnVmZmVyJyxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBwbHVnaW5zOiBbXG4gICAgICBub2RlUG9seWZpbGxzKHtcbiAgICAgICAgaW5jbHVkZTogWydidWZmZXInLCAncHJvY2VzcycsICd1dGlsJywgJ3N0cmVhbSddLFxuICAgICAgICBnbG9iYWxzOiB7XG4gICAgICAgICAgQnVmZmVyOiB0cnVlLFxuICAgICAgICAgIHByb2Nlc3M6IHRydWUsXG4gICAgICAgICAgZ2xvYmFsOiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgICBwcm90b2NvbEltcG9ydHM6IHRydWUsXG4gICAgICAgIGV4Y2x1ZGU6IFsnY2hpbGRfcHJvY2VzcycsICdmcycsICdwYXRoJ10sXG4gICAgICB9KSxcbiAgICAgIHtcbiAgICAgICAgbmFtZTogJ2J1ZmZlci1wb2x5ZmlsbCcsXG4gICAgICAgIHRyYW5zZm9ybShjb2RlLCBpZCkge1xuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnZW52Lm1qcycpKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBjb2RlOiBgaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSAnYnVmZmVyJztcXG4ke2NvZGV9YCxcbiAgICAgICAgICAgICAgbWFwOiBudWxsLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICByZW1peFZpdGVQbHVnaW4oe1xuICAgICAgICBmdXR1cmU6IHtcbiAgICAgICAgICB2M19mZXRjaGVyUGVyc2lzdDogdHJ1ZSxcbiAgICAgICAgICB2M19yZWxhdGl2ZVNwbGF0UGF0aDogdHJ1ZSxcbiAgICAgICAgICB2M190aHJvd0Fib3J0UmVhc29uOiB0cnVlLFxuICAgICAgICAgIHYzX2xhenlSb3V0ZURpc2NvdmVyeTogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgIH0pLFxuICAgICAgVW5vQ1NTKCksXG4gICAgICB0c2NvbmZpZ1BhdGhzKCksXG4gICAgICBuZXRsaWZ5UGx1Z2luKCksXG4gICAgICBjaHJvbWUxMjlJc3N1ZVBsdWdpbigpLFxuICAgICAgY29uZmlnLm1vZGUgPT09ICdwcm9kdWN0aW9uJyAmJiBvcHRpbWl6ZUNzc01vZHVsZXMoeyBhcHBseTogJ2J1aWxkJyB9KSxcbiAgICBdLFxuICAgIGVudlByZWZpeDogW1xuICAgICAgJ1ZJVEVfJyxcbiAgICAgICdPUEVOQUlfTElLRV9BUElfQkFTRV9VUkwnLFxuICAgICAgJ09MTEFNQV9BUElfQkFTRV9VUkwnLFxuICAgICAgJ0xNU1RVRElPX0FQSV9CQVNFX1VSTCcsXG4gICAgICAnVE9HRVRIRVJfQVBJX0JBU0VfVVJMJyxcbiAgICBdLFxuICAgIGNzczoge1xuICAgICAgcHJlcHJvY2Vzc29yT3B0aW9uczoge1xuICAgICAgICBzY3NzOiB7XG4gICAgICAgICAgYXBpOiAnbW9kZXJuLWNvbXBpbGVyJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfTtcbn0pO1xuXG5mdW5jdGlvbiBjaHJvbWUxMjlJc3N1ZVBsdWdpbigpIHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnY2hyb21lMTI5SXNzdWVQbHVnaW4nLFxuICAgIGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXI6IFZpdGVEZXZTZXJ2ZXIpIHtcbiAgICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICAgIGNvbnN0IHJhdyA9IHJlcS5oZWFkZXJzWyd1c2VyLWFnZW50J10/Lm1hdGNoKC9DaHJvbShlfGl1bSlcXC8oWzAtOV0rKVxcLi8pO1xuXG4gICAgICAgIGlmIChyYXcpIHtcbiAgICAgICAgICBjb25zdCB2ZXJzaW9uID0gcGFyc2VJbnQocmF3WzJdLCAxMCk7XG5cbiAgICAgICAgICBpZiAodmVyc2lvbiA9PT0gMTI5KSB7XG4gICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdjb250ZW50LXR5cGUnLCAndGV4dC9odG1sJyk7XG4gICAgICAgICAgICByZXMuZW5kKFxuICAgICAgICAgICAgICAnPGJvZHk+PGgxPlBsZWFzZSB1c2UgQ2hyb21lIENhbmFyeSBmb3IgdGVzdGluZy48L2gxPjxwPkNocm9tZSAxMjkgaGFzIGFuIGlzc3VlIHdpdGggSmF2YVNjcmlwdCBtb2R1bGVzICYgVml0ZSBsb2NhbCBkZXZlbG9wbWVudCwgc2VlIDxhIGhyZWY9XCJodHRwczovL2dpdGh1Yi5jb20vc3RhY2tibGl0ei9ib2x0Lm5ldy9pc3N1ZXMvODYjaXNzdWVjb21tZW50LTIzOTU1MTkyNThcIj5mb3IgbW9yZSBpbmZvcm1hdGlvbi48L2E+PC9wPjxwPjxiPk5vdGU6PC9iPiBUaGlzIG9ubHkgaW1wYWN0cyA8dT5sb2NhbCBkZXZlbG9wbWVudDwvdT4uIGBwbnBtIHJ1biBidWlsZGAgYW5kIGBwbnBtIHJ1biBzdGFydGAgd2lsbCB3b3JrIGZpbmUgaW4gdGhpcyBicm93c2VyLjwvcD48L2JvZHk+JyxcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBuZXh0KCk7XG4gICAgICB9KTtcbiAgICB9LFxuICB9O1xufVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFzUyxTQUFTLGNBQWMsdUJBQXVCO0FBQ3BWLE9BQU8sWUFBWTtBQUNuQixTQUFTLG9CQUF3QztBQUNqRCxTQUFTLHFCQUFxQjtBQUM5QixTQUFTLDBCQUEwQjtBQUNuQyxPQUFPLG1CQUFtQjtBQUMxQixTQUFTLHFCQUFxQjtBQUM5QixZQUFZLFlBQVk7QUFDeEIsU0FBUyxnQkFBZ0I7QUFDekIsU0FBUyxvQkFBb0I7QUFDN0IsU0FBUyxZQUFZO0FBRWQsY0FBTztBQUdkLElBQU0sYUFBYSxNQUFNO0FBQ3ZCLE1BQUk7QUFDRixXQUFPO0FBQUEsTUFDTCxZQUFZLFNBQVMsNEJBQTRCLEVBQUUsU0FBUyxFQUFFLEtBQUs7QUFBQSxNQUNuRSxRQUFRLFNBQVMsaUNBQWlDLEVBQUUsU0FBUyxFQUFFLEtBQUs7QUFBQSxNQUNwRSxZQUFZLFNBQVMseUJBQXlCLEVBQUUsU0FBUyxFQUFFLEtBQUs7QUFBQSxNQUNoRSxRQUFRLFNBQVMseUJBQXlCLEVBQUUsU0FBUyxFQUFFLEtBQUs7QUFBQSxNQUM1RCxPQUFPLFNBQVMseUJBQXlCLEVBQUUsU0FBUyxFQUFFLEtBQUs7QUFBQSxNQUMzRCxXQUFXLFNBQVMsb0NBQW9DLEVBQUUsU0FBUyxFQUFFLEtBQUs7QUFBQSxNQUMxRSxVQUFVLFNBQVMsb0NBQW9DLEVBQ3BELFNBQVMsRUFDVCxLQUFLLEVBQ0wsUUFBUSxxQkFBcUIsRUFBRSxFQUMvQixRQUFRLFVBQVUsRUFBRTtBQUFBLElBQ3pCO0FBQUEsRUFDRixRQUFRO0FBQ04sV0FBTztBQUFBLE1BQ0wsWUFBWTtBQUFBLE1BQ1osUUFBUTtBQUFBLE1BQ1IsWUFBWTtBQUFBLE1BQ1osUUFBUTtBQUFBLE1BQ1IsT0FBTztB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
