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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxXaW5kc3VyZlByb2plY3RzXFxcXGRybGVlQUlcXFxcYm9sdC5kaXlcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFdpbmRzdXJmUHJvamVjdHNcXFxcZHJsZWVBSVxcXFxib2x0LmRpeVxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovV2luZHN1cmZQcm9qZWN0cy9kcmxlZUFJL2JvbHQuZGl5L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgdml0ZVBsdWdpbiBhcyByZW1peFZpdGVQbHVnaW4gfSBmcm9tICdAcmVtaXgtcnVuL2Rldic7XG5pbXBvcnQgVW5vQ1NTIGZyb20gJ3Vub2Nzcy92aXRlJztcbmltcG9ydCB7IGRlZmluZUNvbmZpZywgdHlwZSBWaXRlRGV2U2VydmVyIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgeyBub2RlUG9seWZpbGxzIH0gZnJvbSAndml0ZS1wbHVnaW4tbm9kZS1wb2x5ZmlsbHMnO1xuaW1wb3J0IHsgb3B0aW1pemVDc3NNb2R1bGVzIH0gZnJvbSAndml0ZS1wbHVnaW4tb3B0aW1pemUtY3NzLW1vZHVsZXMnO1xuaW1wb3J0IHRzY29uZmlnUGF0aHMgZnJvbSAndml0ZS10c2NvbmZpZy1wYXRocyc7XG5pbXBvcnQgeyBuZXRsaWZ5UGx1Z2luIH0gZnJvbSAnQG5ldGxpZnkvcmVtaXgtYWRhcHRlci9wbHVnaW4nO1xuaW1wb3J0ICogYXMgZG90ZW52IGZyb20gJ2RvdGVudic7XG5pbXBvcnQgeyBleGVjU3luYyB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuaW1wb3J0IHsgcmVhZEZpbGVTeW5jIH0gZnJvbSAnZnMnO1xuaW1wb3J0IHsgam9pbiB9IGZyb20gJ3BhdGgnO1xuXG5kb3RlbnYuY29uZmlnKCk7XG5cbi8vIEdldCBkZXRhaWxlZCBnaXQgaW5mbyB3aXRoIGZhbGxiYWNrc1xuY29uc3QgZ2V0R2l0SW5mbyA9ICgpID0+IHtcbiAgdHJ5IHtcbiAgICByZXR1cm4ge1xuICAgICAgY29tbWl0SGFzaDogZXhlY1N5bmMoJ2dpdCByZXYtcGFyc2UgLS1zaG9ydCBIRUFEJykudG9TdHJpbmcoKS50cmltKCksXG4gICAgICBicmFuY2g6IGV4ZWNTeW5jKCdnaXQgcmV2LXBhcnNlIC0tYWJicmV2LXJlZiBIRUFEJykudG9TdHJpbmcoKS50cmltKCksXG4gICAgICBjb21taXRUaW1lOiBleGVjU3luYygnZ2l0IGxvZyAtMSAtLWZvcm1hdD0lY2QnKS50b1N0cmluZygpLnRyaW0oKSxcbiAgICAgIGF1dGhvcjogZXhlY1N5bmMoJ2dpdCBsb2cgLTEgLS1mb3JtYXQ9JWFuJykudG9TdHJpbmcoKS50cmltKCksXG4gICAgICBlbWFpbDogZXhlY1N5bmMoJ2dpdCBsb2cgLTEgLS1mb3JtYXQ9JWFlJykudG9TdHJpbmcoKS50cmltKCksXG4gICAgICByZW1vdGVVcmw6IGV4ZWNTeW5jKCdnaXQgY29uZmlnIC0tZ2V0IHJlbW90ZS5vcmlnaW4udXJsJykudG9TdHJpbmcoKS50cmltKCksXG4gICAgICByZXBvTmFtZTogZXhlY1N5bmMoJ2dpdCBjb25maWcgLS1nZXQgcmVtb3RlLm9yaWdpbi51cmwnKVxuICAgICAgICAudG9TdHJpbmcoKVxuICAgICAgICAudHJpbSgpXG4gICAgICAgIC5yZXBsYWNlKC9eLipnaXRodWIuY29tWzovXS8sICcnKVxuICAgICAgICAucmVwbGFjZSgvXFwuZ2l0JC8sICcnKSxcbiAgICB9O1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29tbWl0SGFzaDogJ25vLWdpdC1pbmZvJyxcbiAgICAgIGJyYW5jaDogJ3Vua25vd24nLFxuICAgICAgY29tbWl0VGltZTogJ3Vua25vd24nLFxuICAgICAgYXV0aG9yOiAndW5rbm93bicsXG4gICAgICBlbWFpbDogJ3Vua25vd24nLFxuICAgICAgcmVtb3RlVXJsOiAndW5rbm93bicsXG4gICAgICByZXBvTmFtZTogJ3Vua25vd24nLFxuICAgIH07XG4gIH1cbn07XG5cbi8vIFJlYWQgcGFja2FnZS5qc29uIHdpdGggZGV0YWlsZWQgZGVwZW5kZW5jeSBpbmZvXG5jb25zdCBnZXRQYWNrYWdlSnNvbiA9ICgpID0+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBwa2dQYXRoID0gam9pbihwcm9jZXNzLmN3ZCgpLCAncGFja2FnZS5qc29uJyk7XG4gICAgY29uc3QgcGtnID0gSlNPTi5wYXJzZShyZWFkRmlsZVN5bmMocGtnUGF0aCwgJ3V0Zi04JykpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6IHBrZy5uYW1lLFxuICAgICAgZGVzY3JpcHRpb246IHBrZy5kZXNjcmlwdGlvbixcbiAgICAgIGxpY2Vuc2U6IHBrZy5saWNlbnNlLFxuICAgICAgZGVwZW5kZW5jaWVzOiBwa2cuZGVwZW5kZW5jaWVzIHx8IHt9LFxuICAgICAgZGV2RGVwZW5kZW5jaWVzOiBwa2cuZGV2RGVwZW5kZW5jaWVzIHx8IHt9LFxuICAgICAgcGVlckRlcGVuZGVuY2llczogcGtnLnBlZXJEZXBlbmRlbmNpZXMgfHwge30sXG4gICAgICBvcHRpb25hbERlcGVuZGVuY2llczogcGtnLm9wdGlvbmFsRGVwZW5kZW5jaWVzIHx8IHt9LFxuICAgIH07XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiAnRHJMZWUuQUknLFxuICAgICAgZGVzY3JpcHRpb246ICdBIERJWSBMTE0gaW50ZXJmYWNlJyxcbiAgICAgIGxpY2Vuc2U6ICdNSVQnLFxuICAgICAgZGVwZW5kZW5jaWVzOiB7fSxcbiAgICAgIGRldkRlcGVuZGVuY2llczoge30sXG4gICAgICBwZWVyRGVwZW5kZW5jaWVzOiB7fSxcbiAgICAgIG9wdGlvbmFsRGVwZW5kZW5jaWVzOiB7fSxcbiAgICB9O1xuICB9XG59O1xuXG5jb25zdCBwa2cgPSBnZXRQYWNrYWdlSnNvbigpO1xuY29uc3QgZ2l0SW5mbyA9IGdldEdpdEluZm8oKTtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKChjb25maWcpID0+IHtcbiAgcmV0dXJuIHtcbiAgICBkZWZpbmU6IHtcbiAgICAgIF9fQ09NTUlUX0hBU0g6IEpTT04uc3RyaW5naWZ5KGdpdEluZm8uY29tbWl0SGFzaCksXG4gICAgICBfX0dJVF9CUkFOQ0g6IEpTT04uc3RyaW5naWZ5KGdpdEluZm8uYnJhbmNoKSxcbiAgICAgIF9fR0lUX0NPTU1JVF9USU1FOiBKU09OLnN0cmluZ2lmeShnaXRJbmZvLmNvbW1pdFRpbWUpLFxuICAgICAgX19HSVRfQVVUSE9SOiBKU09OLnN0cmluZ2lmeShnaXRJbmZvLmF1dGhvciksXG4gICAgICBfX0dJVF9FTUFJTDogSlNPTi5zdHJpbmdpZnkoZ2l0SW5mby5lbWFpbCksXG4gICAgICBfX0dJVF9SRU1PVEVfVVJMOiBKU09OLnN0cmluZ2lmeShnaXRJbmZvLnJlbW90ZVVybCksXG4gICAgICBfX0dJVF9SRVBPX05BTUU6IEpTT04uc3RyaW5naWZ5KGdpdEluZm8ucmVwb05hbWUpLFxuICAgICAgX19BUFBfVkVSU0lPTjogSlNPTi5zdHJpbmdpZnkocHJvY2Vzcy5lbnYubnBtX3BhY2thZ2VfdmVyc2lvbiksXG4gICAgICBfX1BLR19OQU1FOiBKU09OLnN0cmluZ2lmeShwa2cubmFtZSksXG4gICAgICBfX1BLR19ERVNDUklQVElPTjogSlNPTi5zdHJpbmdpZnkocGtnLmRlc2NyaXB0aW9uKSxcbiAgICAgIF9fUEtHX0xJQ0VOU0U6IEpTT04uc3RyaW5naWZ5KHBrZy5saWNlbnNlKSxcbiAgICAgIF9fUEtHX0RFUEVOREVOQ0lFUzogSlNPTi5zdHJpbmdpZnkocGtnLmRlcGVuZGVuY2llcyksXG4gICAgICBfX1BLR19ERVZfREVQRU5ERU5DSUVTOiBKU09OLnN0cmluZ2lmeShwa2cuZGV2RGVwZW5kZW5jaWVzKSxcbiAgICAgIF9fUEtHX1BFRVJfREVQRU5ERU5DSUVTOiBKU09OLnN0cmluZ2lmeShwa2cucGVlckRlcGVuZGVuY2llcyksXG4gICAgICBfX1BLR19PUFRJT05BTF9ERVBFTkRFTkNJRVM6IEpTT04uc3RyaW5naWZ5KHBrZy5vcHRpb25hbERlcGVuZGVuY2llcyksXG4gICAgICAncHJvY2Vzcy5lbnYuTk9ERV9FTlYnOiBKU09OLnN0cmluZ2lmeShwcm9jZXNzLmVudi5OT0RFX0VOViksXG4gICAgfSxcbiAgICBidWlsZDoge1xuICAgICAgdGFyZ2V0OiAnZXNuZXh0JyxcbiAgICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgICAgb3V0cHV0OiB7XG4gICAgICAgICAgbWFudWFsQ2h1bmtzOiAoaWQ6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgLy8gT25seSBhcHBseSBtYW51YWwgY2h1bmtzIGZvciBjbGllbnQgYnVpbGQsIG5vdCBTU1JcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzJykpIHtcbiAgICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdAcmFkaXgtdWknKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAndWknO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIC8vIERvbid0IG1hbnVhbGx5IGNodW5rIFJlYWN0IGZvciBTU1IgYnVpbGRcbiAgICAgICAgICAgICAgaWYgKCFwcm9jZXNzLmVudi5WSVRFX0JVSUxEX1NTUiAmJiAoaWQuaW5jbHVkZXMoJ3JlYWN0LycpIHx8IGlkLmluY2x1ZGVzKCdyZWFjdC1kb20vJykpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICd2ZW5kb3InO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBjaHVua0ZpbGVOYW1lczogJ2Fzc2V0cy9bbmFtZV0tW2hhc2hdLmpzJ1xuICAgICAgICB9LFxuICAgICAgICBvbndhcm4od2FybmluZzogYW55LCB3YXJuOiBhbnkpIHtcbiAgICAgICAgICBpZiAod2FybmluZy5jb2RlID09PSAnRVZBTCcgfHwgd2FybmluZy5jb2RlID09PSAnTU9EVUxFX0xFVkVMX0RJUkVDVElWRScpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgd2Fybih3YXJuaW5nKTtcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBzb3VyY2VtYXA6IGZhbHNlLFxuICAgICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiAxMDAwLFxuICAgICAgbWluaWZ5OiAnZXNidWlsZCcsXG4gICAgICBhc3NldHNJbmxpbmVMaW1pdDogMCxcbiAgICB9LFxuICAgIG9wdGltaXplRGVwczoge1xuICAgICAgZXNidWlsZE9wdGlvbnM6IHtcbiAgICAgICAgZGVmaW5lOiB7XG4gICAgICAgICAgZ2xvYmFsOiAnZ2xvYmFsVGhpcycsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gICAgcmVzb2x2ZToge1xuICAgICAgYWxpYXM6IHtcbiAgICAgICAgYnVmZmVyOiAndml0ZS1wbHVnaW4tbm9kZS1wb2x5ZmlsbHMvcG9seWZpbGxzL2J1ZmZlcicsXG4gICAgICB9LFxuICAgIH0sXG4gICAgcGx1Z2luczogW1xuICAgICAgbm9kZVBvbHlmaWxscyh7XG4gICAgICAgIGluY2x1ZGU6IFsnYnVmZmVyJywgJ3Byb2Nlc3MnLCAndXRpbCcsICdzdHJlYW0nXSxcbiAgICAgICAgZ2xvYmFsczoge1xuICAgICAgICAgIEJ1ZmZlcjogdHJ1ZSxcbiAgICAgICAgICBwcm9jZXNzOiB0cnVlLFxuICAgICAgICAgIGdsb2JhbDogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgICAgcHJvdG9jb2xJbXBvcnRzOiB0cnVlLFxuICAgICAgICBleGNsdWRlOiBbJ2NoaWxkX3Byb2Nlc3MnLCAnZnMnLCAncGF0aCddLFxuICAgICAgfSksXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdidWZmZXItcG9seWZpbGwnLFxuICAgICAgICB0cmFuc2Zvcm0oY29kZSwgaWQpIHtcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ2Vudi5tanMnKSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgY29kZTogYGltcG9ydCB7IEJ1ZmZlciB9IGZyb20gJ2J1ZmZlcic7XFxuJHtjb2RlfWAsXG4gICAgICAgICAgICAgIG1hcDogbnVsbCxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgcmVtaXhWaXRlUGx1Z2luKHtcbiAgICAgICAgZnV0dXJlOiB7XG4gICAgICAgICAgdjNfZmV0Y2hlclBlcnNpc3Q6IHRydWUsXG4gICAgICAgICAgdjNfcmVsYXRpdmVTcGxhdFBhdGg6IHRydWUsXG4gICAgICAgICAgdjNfdGhyb3dBYm9ydFJlYXNvbjogdHJ1ZSxcbiAgICAgICAgICB2M19sYXp5Um91dGVEaXNjb3Zlcnk6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICB9KSxcbiAgICAgIFVub0NTUygpLFxuICAgICAgdHNjb25maWdQYXRocygpLFxuICAgICAgbmV0bGlmeVBsdWdpbigpLFxuICAgICAgY2hyb21lMTI5SXNzdWVQbHVnaW4oKSxcbiAgICAgIGNvbmZpZy5tb2RlID09PSAncHJvZHVjdGlvbicgJiYgb3B0aW1pemVDc3NNb2R1bGVzKHsgYXBwbHk6ICdidWlsZCcgfSksXG4gICAgXSxcbiAgICBlbnZQcmVmaXg6IFtcbiAgICAgICdWSVRFXycsXG4gICAgICAnT1BFTkFJX0xJS0VfQVBJX0JBU0VfVVJMJyxcbiAgICAgICdPTExBTUFfQVBJX0JBU0VfVVJMJyxcbiAgICAgICdMTVNUVURJT19BUElfQkFTRV9VUkwnLFxuICAgICAgJ1RPR0VUSEVSX0FQSV9CQVNFX1VSTCcsXG4gICAgXSxcbiAgICBjc3M6IHtcbiAgICAgIHByZXByb2Nlc3Nvck9wdGlvbnM6IHtcbiAgICAgICAgc2Nzczoge1xuICAgICAgICAgIGFwaTogJ21vZGVybi1jb21waWxlcicsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH07XG59KTtcblxuZnVuY3Rpb24gY2hyb21lMTI5SXNzdWVQbHVnaW4oKSB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogJ2Nocm9tZTEyOUlzc3VlUGx1Z2luJyxcbiAgICBjb25maWd1cmVTZXJ2ZXIoc2VydmVyOiBWaXRlRGV2U2VydmVyKSB7XG4gICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgICAgICBjb25zdCByYXcgPSByZXEuaGVhZGVyc1sndXNlci1hZ2VudCddPy5tYXRjaCgvQ2hyb20oZXxpdW0pXFwvKFswLTldKylcXC4vKTtcblxuICAgICAgICBpZiAocmF3KSB7XG4gICAgICAgICAgY29uc3QgdmVyc2lvbiA9IHBhcnNlSW50KHJhd1syXSwgMTApO1xuXG4gICAgICAgICAgaWYgKHZlcnNpb24gPT09IDEyOSkge1xuICAgICAgICAgICAgcmVzLnNldEhlYWRlcignY29udGVudC10eXBlJywgJ3RleHQvaHRtbCcpO1xuICAgICAgICAgICAgcmVzLmVuZChcbiAgICAgICAgICAgICAgJzxib2R5PjxoMT5QbGVhc2UgdXNlIENocm9tZSBDYW5hcnkgZm9yIHRlc3RpbmcuPC9oMT48cD5DaHJvbWUgMTI5IGhhcyBhbiBpc3N1ZSB3aXRoIEphdmFTY3JpcHQgbW9kdWxlcyAmIFZpdGUgbG9jYWwgZGV2ZWxvcG1lbnQsIHNlZSA8YSBocmVmPVwiaHR0cHM6Ly9naXRodWIuY29tL3N0YWNrYmxpdHovYm9sdC5uZXcvaXNzdWVzLzg2I2lzc3VlY29tbWVudC0yMzk1NTE5MjU4XCI+Zm9yIG1vcmUgaW5mb3JtYXRpb24uPC9hPjwvcD48cD48Yj5Ob3RlOjwvYj4gVGhpcyBvbmx5IGltcGFjdHMgPHU+bG9jYWwgZGV2ZWxvcG1lbnQ8L3U+LiBgcG5wbSBydW4gYnVpbGRgIGFuZCBgcG5wbSBydW4gc3RhcnRgIHdpbGwgd29yayBmaW5lIGluIHRoaXMgYnJvd3Nlci48L3A+PC9ib2R5PicsXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbmV4dCgpO1xuICAgICAgfSk7XG4gICAgfSxcbiAgfTtcbn0iXSwKICAibWFwcGluZ3MiOiAiO0FBQXNTLFNBQVMsY0FBYyx1QkFBdUI7QUFDcFYsT0FBTyxZQUFZO0FBQ25CLFNBQVMsb0JBQXdDO0FBQ2pELFNBQVMscUJBQXFCO0FBQzlCLFNBQVMsMEJBQTBCO0FBQ25DLE9BQU8sbUJBQW1CO0FBQzFCLFNBQVMscUJBQXFCO0FBQzlCLFlBQVksWUFBWTtBQUN4QixTQUFTLGdCQUFnQjtBQUN6QixTQUFTLG9CQUFvQjtBQUM3QixTQUFTLFlBQVk7QUFFZCxjQUFPO0FBR2QsSUFBTSxhQUFhLE1BQU07QUFDdkIsTUFBSTtBQUNGLFdBQU87QUFBQSxNQUNMLFlBQVksU0FBUyw0QkFBNEIsRUFBRSxTQUFTLEVBQUUsS0FBSztBQUFBLE1BQ25FLFFBQVEsU0FBUyxpQ0FBaUMsRUFBRSxTQUFTLEVBQUUsS0FBSztBQUFBLE1BQ3BFLFlBQVksU0FBUyx5QkFBeUIsRUFBRSxTQUFTLEVBQUUsS0FBSztBQUFBLE1BQ2hFLFFBQVEsU0FBUyx5QkFBeUIsRUFBRSxTQUFTLEVBQUUsS0FBSztBQUFBLE1BQzVELE9BQU8sU0FBUyx5QkFBeUIsRUFBRSxTQUFTLEVBQUUsS0FBSztBQUFBLE1BQzNELFdBQVcsU0FBUyxvQ0FBb0MsRUFBRSxTQUFTLEVBQUUsS0FBSztBQUFBLE1BQzFFLFVBQVUsU0FBUyxvQ0FBb0MsRUFDcEQsU0FBUyxFQUNULEtBQUssRUFDTCxRQUFRLHFCQUFxQixFQUFFLEVBQy9CLFFBQVEsVUFBVSxFQUFFO0FBQUEsSUFDekI7QUFBQSxFQUNGLFFBQVE7QUFDTixXQUFPO0FBQUEsTUFDTCxZQUFZO0FBQUEsTUFDWixRQUFRO0FBQUEsTUFDUixZQUFZO0FBQUEsTUFDWixRQUFRO0FBQUEsTUFDUixPQUFPO0FBQUEsTUFD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
