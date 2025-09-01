// vite.config.ts
import { cloudflareDevProxyVitePlugin as remixCloudflareDevProxy, vitePlugin as remixVitePlugin } from "file:///C:/WindsurfProjects/drleeAI/bolt.diy/node_modules/@remix-run/dev/dist/index.js";
import UnoCSS from "file:///C:/WindsurfProjects/drleeAI/bolt.diy/node_modules/unocss/dist/vite.mjs";
import { defineConfig } from "file:///C:/WindsurfProjects/drleeAI/bolt.diy/node_modules/vite/dist/node/index.js";
import { nodePolyfills } from "file:///C:/WindsurfProjects/drleeAI/bolt.diy/node_modules/vite-plugin-node-polyfills/dist/index.js";
import { optimizeCssModules } from "file:///C:/WindsurfProjects/drleeAI/bolt.diy/node_modules/vite-plugin-optimize-css-modules/dist/index.mjs";
import tsconfigPaths from "file:///C:/WindsurfProjects/drleeAI/bolt.diy/node_modules/vite-tsconfig-paths/dist/index.mjs";
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
      config2.mode !== "test" && remixCloudflareDevProxy(),
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxXaW5kc3VyZlByb2plY3RzXFxcXGRybGVlQUlcXFxcYm9sdC5kaXlcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFdpbmRzdXJmUHJvamVjdHNcXFxcZHJsZWVBSVxcXFxib2x0LmRpeVxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovV2luZHN1cmZQcm9qZWN0cy9kcmxlZUFJL2JvbHQuZGl5L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgY2xvdWRmbGFyZURldlByb3h5Vml0ZVBsdWdpbiBhcyByZW1peENsb3VkZmxhcmVEZXZQcm94eSwgdml0ZVBsdWdpbiBhcyByZW1peFZpdGVQbHVnaW4gfSBmcm9tICdAcmVtaXgtcnVuL2Rldic7XG5pbXBvcnQgVW5vQ1NTIGZyb20gJ3Vub2Nzcy92aXRlJztcbmltcG9ydCB7IGRlZmluZUNvbmZpZywgdHlwZSBWaXRlRGV2U2VydmVyIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgeyBub2RlUG9seWZpbGxzIH0gZnJvbSAndml0ZS1wbHVnaW4tbm9kZS1wb2x5ZmlsbHMnO1xuaW1wb3J0IHsgb3B0aW1pemVDc3NNb2R1bGVzIH0gZnJvbSAndml0ZS1wbHVnaW4tb3B0aW1pemUtY3NzLW1vZHVsZXMnO1xuaW1wb3J0IHRzY29uZmlnUGF0aHMgZnJvbSAndml0ZS10c2NvbmZpZy1wYXRocyc7XG5pbXBvcnQgKiBhcyBkb3RlbnYgZnJvbSAnZG90ZW52JztcbmltcG9ydCB7IGV4ZWNTeW5jIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgeyByZWFkRmlsZVN5bmMgfSBmcm9tICdmcyc7XG5pbXBvcnQgeyBqb2luIH0gZnJvbSAncGF0aCc7XG5cbmRvdGVudi5jb25maWcoKTtcblxuLy8gR2V0IGRldGFpbGVkIGdpdCBpbmZvIHdpdGggZmFsbGJhY2tzXG5jb25zdCBnZXRHaXRJbmZvID0gKCkgPT4ge1xuICB0cnkge1xuICAgIHJldHVybiB7XG4gICAgICBjb21taXRIYXNoOiBleGVjU3luYygnZ2l0IHJldi1wYXJzZSAtLXNob3J0IEhFQUQnKS50b1N0cmluZygpLnRyaW0oKSxcbiAgICAgIGJyYW5jaDogZXhlY1N5bmMoJ2dpdCByZXYtcGFyc2UgLS1hYmJyZXYtcmVmIEhFQUQnKS50b1N0cmluZygpLnRyaW0oKSxcbiAgICAgIGNvbW1pdFRpbWU6IGV4ZWNTeW5jKCdnaXQgbG9nIC0xIC0tZm9ybWF0PSVjZCcpLnRvU3RyaW5nKCkudHJpbSgpLFxuICAgICAgYXV0aG9yOiBleGVjU3luYygnZ2l0IGxvZyAtMSAtLWZvcm1hdD0lYW4nKS50b1N0cmluZygpLnRyaW0oKSxcbiAgICAgIGVtYWlsOiBleGVjU3luYygnZ2l0IGxvZyAtMSAtLWZvcm1hdD0lYWUnKS50b1N0cmluZygpLnRyaW0oKSxcbiAgICAgIHJlbW90ZVVybDogZXhlY1N5bmMoJ2dpdCBjb25maWcgLS1nZXQgcmVtb3RlLm9yaWdpbi51cmwnKS50b1N0cmluZygpLnRyaW0oKSxcbiAgICAgIHJlcG9OYW1lOiBleGVjU3luYygnZ2l0IGNvbmZpZyAtLWdldCByZW1vdGUub3JpZ2luLnVybCcpXG4gICAgICAgIC50b1N0cmluZygpXG4gICAgICAgIC50cmltKClcbiAgICAgICAgLnJlcGxhY2UoL14uKmdpdGh1Yi5jb21bOi9dLywgJycpXG4gICAgICAgIC5yZXBsYWNlKC9cXC5naXQkLywgJycpLFxuICAgIH07XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiB7XG4gICAgICBjb21taXRIYXNoOiAnbm8tZ2l0LWluZm8nLFxuICAgICAgYnJhbmNoOiAndW5rbm93bicsXG4gICAgICBjb21taXRUaW1lOiAndW5rbm93bicsXG4gICAgICBhdXRob3I6ICd1bmtub3duJyxcbiAgICAgIGVtYWlsOiAndW5rbm93bicsXG4gICAgICByZW1vdGVVcmw6ICd1bmtub3duJyxcbiAgICAgIHJlcG9OYW1lOiAndW5rbm93bicsXG4gICAgfTtcbiAgfVxufTtcblxuLy8gUmVhZCBwYWNrYWdlLmpzb24gd2l0aCBkZXRhaWxlZCBkZXBlbmRlbmN5IGluZm9cbmNvbnN0IGdldFBhY2thZ2VKc29uID0gKCkgPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IHBrZ1BhdGggPSBqb2luKHByb2Nlc3MuY3dkKCksICdwYWNrYWdlLmpzb24nKTtcbiAgICBjb25zdCBwa2cgPSBKU09OLnBhcnNlKHJlYWRGaWxlU3luYyhwa2dQYXRoLCAndXRmLTgnKSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogcGtnLm5hbWUsXG4gICAgICBkZXNjcmlwdGlvbjogcGtnLmRlc2NyaXB0aW9uLFxuICAgICAgbGljZW5zZTogcGtnLmxpY2Vuc2UsXG4gICAgICBkZXBlbmRlbmNpZXM6IHBrZy5kZXBlbmRlbmNpZXMgfHwge30sXG4gICAgICBkZXZEZXBlbmRlbmNpZXM6IHBrZy5kZXZEZXBlbmRlbmNpZXMgfHwge30sXG4gICAgICBwZWVyRGVwZW5kZW5jaWVzOiBwa2cucGVlckRlcGVuZGVuY2llcyB8fCB7fSxcbiAgICAgIG9wdGlvbmFsRGVwZW5kZW5jaWVzOiBwa2cub3B0aW9uYWxEZXBlbmRlbmNpZXMgfHwge30sXG4gICAgfTtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6ICdEckxlZS5BSScsXG4gICAgICBkZXNjcmlwdGlvbjogJ0EgRElZIExMTSBpbnRlcmZhY2UnLFxuICAgICAgbGljZW5zZTogJ01JVCcsXG4gICAgICBkZXBlbmRlbmNpZXM6IHt9LFxuICAgICAgZGV2RGVwZW5kZW5jaWVzOiB7fSxcbiAgICAgIHBlZXJEZXBlbmRlbmNpZXM6IHt9LFxuICAgICAgb3B0aW9uYWxEZXBlbmRlbmNpZXM6IHt9LFxuICAgIH07XG4gIH1cbn07XG5cbmNvbnN0IHBrZyA9IGdldFBhY2thZ2VKc29uKCk7XG5jb25zdCBnaXRJbmZvID0gZ2V0R2l0SW5mbygpO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKGNvbmZpZykgPT4ge1xuICByZXR1cm4ge1xuICAgIGRlZmluZToge1xuICAgICAgX19DT01NSVRfSEFTSDogSlNPTi5zdHJpbmdpZnkoZ2l0SW5mby5jb21taXRIYXNoKSxcbiAgICAgIF9fR0lUX0JSQU5DSDogSlNPTi5zdHJpbmdpZnkoZ2l0SW5mby5icmFuY2gpLFxuICAgICAgX19HSVRfQ09NTUlUX1RJTUU6IEpTT04uc3RyaW5naWZ5KGdpdEluZm8uY29tbWl0VGltZSksXG4gICAgICBfX0dJVF9BVVRIT1I6IEpTT04uc3RyaW5naWZ5KGdpdEluZm8uYXV0aG9yKSxcbiAgICAgIF9fR0lUX0VNQUlMOiBKU09OLnN0cmluZ2lmeShnaXRJbmZvLmVtYWlsKSxcbiAgICAgIF9fR0lUX1JFTU9URV9VUkw6IEpTT04uc3RyaW5naWZ5KGdpdEluZm8ucmVtb3RlVXJsKSxcbiAgICAgIF9fR0lUX1JFUE9fTkFNRTogSlNPTi5zdHJpbmdpZnkoZ2l0SW5mby5yZXBvTmFtZSksXG4gICAgICBfX0FQUF9WRVJTSU9OOiBKU09OLnN0cmluZ2lmeShwcm9jZXNzLmVudi5ucG1fcGFja2FnZV92ZXJzaW9uKSxcbiAgICAgIF9fUEtHX05BTUU6IEpTT04uc3RyaW5naWZ5KHBrZy5uYW1lKSxcbiAgICAgIF9fUEtHX0RFU0NSSVBUSU9OOiBKU09OLnN0cmluZ2lmeShwa2cuZGVzY3JpcHRpb24pLFxuICAgICAgX19QS0dfTElDRU5TRTogSlNPTi5zdHJpbmdpZnkocGtnLmxpY2Vuc2UpLFxuICAgICAgX19QS0dfREVQRU5ERU5DSUVTOiBKU09OLnN0cmluZ2lmeShwa2cuZGVwZW5kZW5jaWVzKSxcbiAgICAgIF9fUEtHX0RFVl9ERVBFTkRFTkNJRVM6IEpTT04uc3RyaW5naWZ5KHBrZy5kZXZEZXBlbmRlbmNpZXMpLFxuICAgICAgX19QS0dfUEVFUl9ERVBFTkRFTkNJRVM6IEpTT04uc3RyaW5naWZ5KHBrZy5wZWVyRGVwZW5kZW5jaWVzKSxcbiAgICAgIF9fUEtHX09QVElPTkFMX0RFUEVOREVOQ0lFUzogSlNPTi5zdHJpbmdpZnkocGtnLm9wdGlvbmFsRGVwZW5kZW5jaWVzKSxcbiAgICAgICdwcm9jZXNzLmVudi5OT0RFX0VOVic6IEpTT04uc3RyaW5naWZ5KHByb2Nlc3MuZW52Lk5PREVfRU5WKSxcbiAgICB9LFxuICAgIGJ1aWxkOiB7XG4gICAgICB0YXJnZXQ6ICdlc25leHQnLFxuICAgICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgICBvdXRwdXQ6IHtcbiAgICAgICAgICBtYW51YWxDaHVua3M6IChpZDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAvLyBPbmx5IGFwcGx5IG1hbnVhbCBjaHVua3MgZm9yIGNsaWVudCBidWlsZCwgbm90IFNTUlxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMnKSkge1xuICAgICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ0ByYWRpeC11aScpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICd1aSc7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgLy8gRG9uJ3QgbWFudWFsbHkgY2h1bmsgUmVhY3QgZm9yIFNTUiBidWlsZFxuICAgICAgICAgICAgICBpZiAoIXByb2Nlc3MuZW52LlZJVEVfQlVJTERfU1NSICYmIChpZC5pbmNsdWRlcygncmVhY3QvJykgfHwgaWQuaW5jbHVkZXMoJ3JlYWN0LWRvbS8nKSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ3ZlbmRvcic7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIGNodW5rRmlsZU5hbWVzOiAnYXNzZXRzL1tuYW1lXS1baGFzaF0uanMnXG4gICAgICAgIH0sXG4gICAgICAgIG9ud2Fybih3YXJuaW5nOiBhbnksIHdhcm46IGFueSkge1xuICAgICAgICAgIGlmICh3YXJuaW5nLmNvZGUgPT09ICdFVkFMJyB8fCB3YXJuaW5nLmNvZGUgPT09ICdNT0RVTEVfTEVWRUxfRElSRUNUSVZFJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICB3YXJuKHdhcm5pbmcpO1xuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIHNvdXJjZW1hcDogZmFsc2UsXG4gICAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDEwMDAsXG4gICAgICBtaW5pZnk6ICdlc2J1aWxkJyxcbiAgICAgIGFzc2V0c0lubGluZUxpbWl0OiAwLFxuICAgIH0sXG4gICAgb3B0aW1pemVEZXBzOiB7XG4gICAgICBlc2J1aWxkT3B0aW9uczoge1xuICAgICAgICBkZWZpbmU6IHtcbiAgICAgICAgICBnbG9iYWw6ICdnbG9iYWxUaGlzJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICByZXNvbHZlOiB7XG4gICAgICBhbGlhczoge1xuICAgICAgICBidWZmZXI6ICd2aXRlLXBsdWdpbi1ub2RlLXBvbHlmaWxscy9wb2x5ZmlsbHMvYnVmZmVyJyxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBwbHVnaW5zOiBbXG4gICAgICBub2RlUG9seWZpbGxzKHtcbiAgICAgICAgaW5jbHVkZTogWydidWZmZXInLCAncHJvY2VzcycsICd1dGlsJywgJ3N0cmVhbSddLFxuICAgICAgICBnbG9iYWxzOiB7XG4gICAgICAgICAgQnVmZmVyOiB0cnVlLFxuICAgICAgICAgIHByb2Nlc3M6IHRydWUsXG4gICAgICAgICAgZ2xvYmFsOiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgICBwcm90b2NvbEltcG9ydHM6IHRydWUsXG4gICAgICAgIGV4Y2x1ZGU6IFsnY2hpbGRfcHJvY2VzcycsICdmcycsICdwYXRoJ10sXG4gICAgICB9KSxcbiAgICAgIHtcbiAgICAgICAgbmFtZTogJ2J1ZmZlci1wb2x5ZmlsbCcsXG4gICAgICAgIHRyYW5zZm9ybShjb2RlLCBpZCkge1xuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnZW52Lm1qcycpKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBjb2RlOiBgaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSAnYnVmZmVyJztcXG4ke2NvZGV9YCxcbiAgICAgICAgICAgICAgbWFwOiBudWxsLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBjb25maWcubW9kZSAhPT0gJ3Rlc3QnICYmIHJlbWl4Q2xvdWRmbGFyZURldlByb3h5KCksXG4gICAgICByZW1peFZpdGVQbHVnaW4oe1xuICAgICAgICBmdXR1cmU6IHtcbiAgICAgICAgICB2M19mZXRjaGVyUGVyc2lzdDogdHJ1ZSxcbiAgICAgICAgICB2M19yZWxhdGl2ZVNwbGF0UGF0aDogdHJ1ZSxcbiAgICAgICAgICB2M190aHJvd0Fib3J0UmVhc29uOiB0cnVlLFxuICAgICAgICAgIHYzX2xhenlSb3V0ZURpc2NvdmVyeTogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgIH0pLFxuICAgICAgVW5vQ1NTKCksXG4gICAgICB0c2NvbmZpZ1BhdGhzKCksXG4gICAgICBjaHJvbWUxMjlJc3N1ZVBsdWdpbigpLFxuICAgICAgY29uZmlnLm1vZGUgPT09ICdwcm9kdWN0aW9uJyAmJiBvcHRpbWl6ZUNzc01vZHVsZXMoeyBhcHBseTogJ2J1aWxkJyB9KSxcbiAgICBdLFxuICAgIGVudlByZWZpeDogW1xuICAgICAgJ1ZJVEVfJyxcbiAgICAgICdPUEVOQUlfTElLRV9BUElfQkFTRV9VUkwnLFxuICAgICAgJ09MTEFNQV9BUElfQkFTRV9VUkwnLFxuICAgICAgJ0xNU1RVRElPX0FQSV9CQVNFX1VSTCcsXG4gICAgICAnVE9HRVRIRVJfQVBJX0JBU0VfVVJMJyxcbiAgICBdLFxuICAgIGNzczoge1xuICAgICAgcHJlcHJvY2Vzc29yT3B0aW9uczoge1xuICAgICAgICBzY3NzOiB7XG4gICAgICAgICAgYXBpOiAnbW9kZXJuLWNvbXBpbGVyJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfTtcbn0pO1xuXG5mdW5jdGlvbiBjaHJvbWUxMjlJc3N1ZVBsdWdpbigpIHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnY2hyb21lMTI5SXNzdWVQbHVnaW4nLFxuICAgIGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXI6IFZpdGVEZXZTZXJ2ZXIpIHtcbiAgICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICAgIGNvbnN0IHJhdyA9IHJlcS5oZWFkZXJzWyd1c2VyLWFnZW50J10/Lm1hdGNoKC9DaHJvbShlfGl1bSlcXC8oWzAtOV0rKVxcLi8pO1xuXG4gICAgICAgIGlmIChyYXcpIHtcbiAgICAgICAgICBjb25zdCB2ZXJzaW9uID0gcGFyc2VJbnQocmF3WzJdLCAxMCk7XG5cbiAgICAgICAgICBpZiAodmVyc2lvbiA9PT0gMTI5KSB7XG4gICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdjb250ZW50LXR5cGUnLCAndGV4dC9odG1sJyk7XG4gICAgICAgICAgICByZXMuZW5kKFxuICAgICAgICAgICAgICAnPGJvZHk+PGgxPlBsZWFzZSB1c2UgQ2hyb21lIENhbmFyeSBmb3IgdGVzdGluZy48L2gxPjxwPkNocm9tZSAxMjkgaGFzIGFuIGlzc3VlIHdpdGggSmF2YVNjcmlwdCBtb2R1bGVzICYgVml0ZSBsb2NhbCBkZXZlbG9wbWVudCwgc2VlIDxhIGhyZWY9XCJodHRwczovL2dpdGh1Yi5jb20vc3RhY2tibGl0ei9ib2x0Lm5ldy9pc3N1ZXMvODYjaXNzdWVjb21tZW50LTIzOTU1MTkyNThcIj5mb3IgbW9yZSBpbmZvcm1hdGlvbi48L2E+PC9wPjxwPjxiPk5vdGU6PC9iPiBUaGlzIG9ubHkgaW1wYWN0cyA8dT5sb2NhbCBkZXZlbG9wbWVudDwvdT4uIGBwbnBtIHJ1biBidWlsZGAgYW5kIGBwbnBtIHJ1biBzdGFydGAgd2lsbCB3b3JrIGZpbmUgaW4gdGhpcyBicm93c2VyLjwvcD48L2JvZHk+JyxcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBuZXh0KCk7XG4gICAgICB9KTtcbiAgICB9LFxuICB9O1xufSJdLAogICJtYXBwaW5ncyI6ICI7QUFBc1MsU0FBUyxnQ0FBZ0MseUJBQXlCLGNBQWMsdUJBQXVCO0FBQzdZLE9BQU8sWUFBWTtBQUNuQixTQUFTLG9CQUF3QztBQUNqRCxTQUFTLHFCQUFxQjtBQUM5QixTQUFTLDBCQUEwQjtBQUNuQyxPQUFPLG1CQUFtQjtBQUMxQixZQUFZLFlBQVk7QUFDeEIsU0FBUyxnQkFBZ0I7QUFDekIsU0FBUyxvQkFBb0I7QUFDN0IsU0FBUyxZQUFZO0FBRWQsY0FBTztBQUdkLElBQU0sYUFBYSxNQUFNO0FBQ3ZCLE1BQUk7QUFDRixXQUFPO0FBQUEsTUFDTCxZQUFZLFNBQVMsNEJBQTRCLEVBQUUsU0FBUyxFQUFFLEtBQUs7QUFBQSxNQUNuRSxRQUFRLFNBQVMsaUNBQWlDLEVBQUUsU0FBUyxFQUFFLEtBQUs7QUFBQSxNQUNwRSxZQUFZLFNBQVMseUJBQXlCLEVBQUUsU0FBUyxFQUFFLEtBQUs7QUFBQSxNQUNoRSxRQUFRLFNBQVMseUJBQXlCLEVBQUUsU0FBUyxFQUFFLEtBQUs7QUFBQSxNQUM1RCxPQUFPLFNBQVMseUJBQXlCLEVBQUUsU0FBUyxFQUFFLEtBQUs7QUFBQSxNQUMzRCxXQUFXLFNBQVMsb0NBQW9DLEVBQUUsU0FBUyxFQUFFLEtBQUs7QUFBQSxNQUMxRSxVQUFVLFNBQVMsb0NBQW9DLEVBQ3BELFNBQVMsRUFDVCxLQUFLLEVBQ0wsUUFBUSxxQkFBcUIsRUFBRSxFQUMvQixRQUFRLFVBQVUsRUFBRTtBQUFBLElBQ3pCO0FBQUEsRUFDRixRQUFRO0FBQ04sV0FBTztBQUFBLE1BQ0wsWUFBWTtBQUFBLE1BQ1osUUFBUTtBQUFBLE1BQ1IsWUFBWTtBQUFBLE1BQ1osUUFB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
