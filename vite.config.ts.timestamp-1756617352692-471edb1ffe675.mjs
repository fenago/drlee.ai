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
      name: "bolt.diy",
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
          format: "esm"
        }
      },
      commonjsOptions: {
        transformMixedEsModules: true
      }
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxXaW5kc3VyZlByb2plY3RzXFxcXGRybGVlQUlcXFxcYm9sdC5kaXlcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFdpbmRzdXJmUHJvamVjdHNcXFxcZHJsZWVBSVxcXFxib2x0LmRpeVxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovV2luZHN1cmZQcm9qZWN0cy9kcmxlZUFJL2JvbHQuZGl5L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgY2xvdWRmbGFyZURldlByb3h5Vml0ZVBsdWdpbiBhcyByZW1peENsb3VkZmxhcmVEZXZQcm94eSwgdml0ZVBsdWdpbiBhcyByZW1peFZpdGVQbHVnaW4gfSBmcm9tICdAcmVtaXgtcnVuL2Rldic7XHJcbmltcG9ydCBVbm9DU1MgZnJvbSAndW5vY3NzL3ZpdGUnO1xyXG5pbXBvcnQgeyBkZWZpbmVDb25maWcsIHR5cGUgVml0ZURldlNlcnZlciB9IGZyb20gJ3ZpdGUnO1xyXG5pbXBvcnQgeyBub2RlUG9seWZpbGxzIH0gZnJvbSAndml0ZS1wbHVnaW4tbm9kZS1wb2x5ZmlsbHMnO1xyXG5pbXBvcnQgeyBvcHRpbWl6ZUNzc01vZHVsZXMgfSBmcm9tICd2aXRlLXBsdWdpbi1vcHRpbWl6ZS1jc3MtbW9kdWxlcyc7XHJcbmltcG9ydCB0c2NvbmZpZ1BhdGhzIGZyb20gJ3ZpdGUtdHNjb25maWctcGF0aHMnO1xyXG5pbXBvcnQgKiBhcyBkb3RlbnYgZnJvbSAnZG90ZW52JztcclxuaW1wb3J0IHsgZXhlY1N5bmMgfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcclxuaW1wb3J0IHsgcmVhZEZpbGVTeW5jIH0gZnJvbSAnZnMnO1xyXG5pbXBvcnQgeyBqb2luIH0gZnJvbSAncGF0aCc7XHJcblxyXG5kb3RlbnYuY29uZmlnKCk7XHJcblxyXG4vLyBHZXQgZGV0YWlsZWQgZ2l0IGluZm8gd2l0aCBmYWxsYmFja3NcclxuY29uc3QgZ2V0R2l0SW5mbyA9ICgpID0+IHtcclxuICB0cnkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgY29tbWl0SGFzaDogZXhlY1N5bmMoJ2dpdCByZXYtcGFyc2UgLS1zaG9ydCBIRUFEJykudG9TdHJpbmcoKS50cmltKCksXHJcbiAgICAgIGJyYW5jaDogZXhlY1N5bmMoJ2dpdCByZXYtcGFyc2UgLS1hYmJyZXYtcmVmIEhFQUQnKS50b1N0cmluZygpLnRyaW0oKSxcclxuICAgICAgY29tbWl0VGltZTogZXhlY1N5bmMoJ2dpdCBsb2cgLTEgLS1mb3JtYXQ9JWNkJykudG9TdHJpbmcoKS50cmltKCksXHJcbiAgICAgIGF1dGhvcjogZXhlY1N5bmMoJ2dpdCBsb2cgLTEgLS1mb3JtYXQ9JWFuJykudG9TdHJpbmcoKS50cmltKCksXHJcbiAgICAgIGVtYWlsOiBleGVjU3luYygnZ2l0IGxvZyAtMSAtLWZvcm1hdD0lYWUnKS50b1N0cmluZygpLnRyaW0oKSxcclxuICAgICAgcmVtb3RlVXJsOiBleGVjU3luYygnZ2l0IGNvbmZpZyAtLWdldCByZW1vdGUub3JpZ2luLnVybCcpLnRvU3RyaW5nKCkudHJpbSgpLFxyXG4gICAgICByZXBvTmFtZTogZXhlY1N5bmMoJ2dpdCBjb25maWcgLS1nZXQgcmVtb3RlLm9yaWdpbi51cmwnKVxyXG4gICAgICAgIC50b1N0cmluZygpXHJcbiAgICAgICAgLnRyaW0oKVxyXG4gICAgICAgIC5yZXBsYWNlKC9eLipnaXRodWIuY29tWzovXS8sICcnKVxyXG4gICAgICAgIC5yZXBsYWNlKC9cXC5naXQkLywgJycpLFxyXG4gICAgfTtcclxuICB9IGNhdGNoIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGNvbW1pdEhhc2g6ICduby1naXQtaW5mbycsXHJcbiAgICAgIGJyYW5jaDogJ3Vua25vd24nLFxyXG4gICAgICBjb21taXRUaW1lOiAndW5rbm93bicsXHJcbiAgICAgIGF1dGhvcjogJ3Vua25vd24nLFxyXG4gICAgICBlbWFpbDogJ3Vua25vd24nLFxyXG4gICAgICByZW1vdGVVcmw6ICd1bmtub3duJyxcclxuICAgICAgcmVwb05hbWU6ICd1bmtub3duJyxcclxuICAgIH07XHJcbiAgfVxyXG59O1xyXG5cclxuLy8gUmVhZCBwYWNrYWdlLmpzb24gd2l0aCBkZXRhaWxlZCBkZXBlbmRlbmN5IGluZm9cclxuY29uc3QgZ2V0UGFja2FnZUpzb24gPSAoKSA9PiB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHBrZ1BhdGggPSBqb2luKHByb2Nlc3MuY3dkKCksICdwYWNrYWdlLmpzb24nKTtcclxuICAgIGNvbnN0IHBrZyA9IEpTT04ucGFyc2UocmVhZEZpbGVTeW5jKHBrZ1BhdGgsICd1dGYtOCcpKTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBuYW1lOiBwa2cubmFtZSxcclxuICAgICAgZGVzY3JpcHRpb246IHBrZy5kZXNjcmlwdGlvbixcclxuICAgICAgbGljZW5zZTogcGtnLmxpY2Vuc2UsXHJcbiAgICAgIGRlcGVuZGVuY2llczogcGtnLmRlcGVuZGVuY2llcyB8fCB7fSxcclxuICAgICAgZGV2RGVwZW5kZW5jaWVzOiBwa2cuZGV2RGVwZW5kZW5jaWVzIHx8IHt9LFxyXG4gICAgICBwZWVyRGVwZW5kZW5jaWVzOiBwa2cucGVlckRlcGVuZGVuY2llcyB8fCB7fSxcclxuICAgICAgb3B0aW9uYWxEZXBlbmRlbmNpZXM6IHBrZy5vcHRpb25hbERlcGVuZGVuY2llcyB8fCB7fSxcclxuICAgIH07XHJcbiAgfSBjYXRjaCB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBuYW1lOiAnYm9sdC5kaXknLFxyXG4gICAgICBkZXNjcmlwdGlvbjogJ0EgRElZIExMTSBpbnRlcmZhY2UnLFxyXG4gICAgICBsaWNlbnNlOiAnTUlUJyxcclxuICAgICAgZGVwZW5kZW5jaWVzOiB7fSxcclxuICAgICAgZGV2RGVwZW5kZW5jaWVzOiB7fSxcclxuICAgICAgcGVlckRlcGVuZGVuY2llczoge30sXHJcbiAgICAgIG9wdGlvbmFsRGVwZW5kZW5jaWVzOiB7fSxcclxuICAgIH07XHJcbiAgfVxyXG59O1xyXG5cclxuY29uc3QgcGtnID0gZ2V0UGFja2FnZUpzb24oKTtcclxuY29uc3QgZ2l0SW5mbyA9IGdldEdpdEluZm8oKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoY29uZmlnKSA9PiB7XHJcbiAgcmV0dXJuIHtcclxuICAgIGRlZmluZToge1xyXG4gICAgICBfX0NPTU1JVF9IQVNIOiBKU09OLnN0cmluZ2lmeShnaXRJbmZvLmNvbW1pdEhhc2gpLFxyXG4gICAgICBfX0dJVF9CUkFOQ0g6IEpTT04uc3RyaW5naWZ5KGdpdEluZm8uYnJhbmNoKSxcclxuICAgICAgX19HSVRfQ09NTUlUX1RJTUU6IEpTT04uc3RyaW5naWZ5KGdpdEluZm8uY29tbWl0VGltZSksXHJcbiAgICAgIF9fR0lUX0FVVEhPUjogSlNPTi5zdHJpbmdpZnkoZ2l0SW5mby5hdXRob3IpLFxyXG4gICAgICBfX0dJVF9FTUFJTDogSlNPTi5zdHJpbmdpZnkoZ2l0SW5mby5lbWFpbCksXHJcbiAgICAgIF9fR0lUX1JFTU9URV9VUkw6IEpTT04uc3RyaW5naWZ5KGdpdEluZm8ucmVtb3RlVXJsKSxcclxuICAgICAgX19HSVRfUkVQT19OQU1FOiBKU09OLnN0cmluZ2lmeShnaXRJbmZvLnJlcG9OYW1lKSxcclxuICAgICAgX19BUFBfVkVSU0lPTjogSlNPTi5zdHJpbmdpZnkocHJvY2Vzcy5lbnYubnBtX3BhY2thZ2VfdmVyc2lvbiksXHJcbiAgICAgIF9fUEtHX05BTUU6IEpTT04uc3RyaW5naWZ5KHBrZy5uYW1lKSxcclxuICAgICAgX19QS0dfREVTQ1JJUFRJT046IEpTT04uc3RyaW5naWZ5KHBrZy5kZXNjcmlwdGlvbiksXHJcbiAgICAgIF9fUEtHX0xJQ0VOU0U6IEpTT04uc3RyaW5naWZ5KHBrZy5saWNlbnNlKSxcclxuICAgICAgX19QS0dfREVQRU5ERU5DSUVTOiBKU09OLnN0cmluZ2lmeShwa2cuZGVwZW5kZW5jaWVzKSxcclxuICAgICAgX19QS0dfREVWX0RFUEVOREVOQ0lFUzogSlNPTi5zdHJpbmdpZnkocGtnLmRldkRlcGVuZGVuY2llcyksXHJcbiAgICAgIF9fUEtHX1BFRVJfREVQRU5ERU5DSUVTOiBKU09OLnN0cmluZ2lmeShwa2cucGVlckRlcGVuZGVuY2llcyksXHJcbiAgICAgIF9fUEtHX09QVElPTkFMX0RFUEVOREVOQ0lFUzogSlNPTi5zdHJpbmdpZnkocGtnLm9wdGlvbmFsRGVwZW5kZW5jaWVzKSxcclxuICAgICAgJ3Byb2Nlc3MuZW52Lk5PREVfRU5WJzogSlNPTi5zdHJpbmdpZnkocHJvY2Vzcy5lbnYuTk9ERV9FTlYpLFxyXG4gICAgfSxcclxuICAgIGJ1aWxkOiB7XHJcbiAgICAgIHRhcmdldDogJ2VzbmV4dCcsXHJcbiAgICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgICBvdXRwdXQ6IHtcclxuICAgICAgICAgIGZvcm1hdDogJ2VzbScsXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgICAgY29tbW9uanNPcHRpb25zOiB7XHJcbiAgICAgICAgdHJhbnNmb3JtTWl4ZWRFc01vZHVsZXM6IHRydWUsXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgb3B0aW1pemVEZXBzOiB7XHJcbiAgICAgIGVzYnVpbGRPcHRpb25zOiB7XHJcbiAgICAgICAgZGVmaW5lOiB7XHJcbiAgICAgICAgICBnbG9iYWw6ICdnbG9iYWxUaGlzJyxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHJlc29sdmU6IHtcclxuICAgICAgYWxpYXM6IHtcclxuICAgICAgICBidWZmZXI6ICd2aXRlLXBsdWdpbi1ub2RlLXBvbHlmaWxscy9wb2x5ZmlsbHMvYnVmZmVyJyxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICBwbHVnaW5zOiBbXHJcbiAgICAgIG5vZGVQb2x5ZmlsbHMoe1xyXG4gICAgICAgIGluY2x1ZGU6IFsnYnVmZmVyJywgJ3Byb2Nlc3MnLCAndXRpbCcsICdzdHJlYW0nXSxcclxuICAgICAgICBnbG9iYWxzOiB7XHJcbiAgICAgICAgICBCdWZmZXI6IHRydWUsXHJcbiAgICAgICAgICBwcm9jZXNzOiB0cnVlLFxyXG4gICAgICAgICAgZ2xvYmFsOiB0cnVlLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcHJvdG9jb2xJbXBvcnRzOiB0cnVlLFxyXG4gICAgICAgIGV4Y2x1ZGU6IFsnY2hpbGRfcHJvY2VzcycsICdmcycsICdwYXRoJ10sXHJcbiAgICAgIH0pLFxyXG4gICAgICB7XHJcbiAgICAgICAgbmFtZTogJ2J1ZmZlci1wb2x5ZmlsbCcsXHJcbiAgICAgICAgdHJhbnNmb3JtKGNvZGUsIGlkKSB7XHJcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ2Vudi5tanMnKSkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgIGNvZGU6IGBpbXBvcnQgeyBCdWZmZXIgfSBmcm9tICdidWZmZXInO1xcbiR7Y29kZX1gLFxyXG4gICAgICAgICAgICAgIG1hcDogbnVsbCxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgICBjb25maWcubW9kZSAhPT0gJ3Rlc3QnICYmIHJlbWl4Q2xvdWRmbGFyZURldlByb3h5KCksXHJcbiAgICAgIHJlbWl4Vml0ZVBsdWdpbih7XHJcbiAgICAgICAgZnV0dXJlOiB7XHJcbiAgICAgICAgICB2M19mZXRjaGVyUGVyc2lzdDogdHJ1ZSxcclxuICAgICAgICAgIHYzX3JlbGF0aXZlU3BsYXRQYXRoOiB0cnVlLFxyXG4gICAgICAgICAgdjNfdGhyb3dBYm9ydFJlYXNvbjogdHJ1ZSxcclxuICAgICAgICAgIHYzX2xhenlSb3V0ZURpc2NvdmVyeTogdHJ1ZSxcclxuICAgICAgICB9LFxyXG4gICAgICB9KSxcclxuICAgICAgVW5vQ1NTKCksXHJcbiAgICAgIHRzY29uZmlnUGF0aHMoKSxcclxuICAgICAgY2hyb21lMTI5SXNzdWVQbHVnaW4oKSxcclxuICAgICAgY29uZmlnLm1vZGUgPT09ICdwcm9kdWN0aW9uJyAmJiBvcHRpbWl6ZUNzc01vZHVsZXMoeyBhcHBseTogJ2J1aWxkJyB9KSxcclxuICAgIF0sXHJcbiAgICBlbnZQcmVmaXg6IFtcclxuICAgICAgJ1ZJVEVfJyxcclxuICAgICAgJ09QRU5BSV9MSUtFX0FQSV9CQVNFX1VSTCcsXHJcbiAgICAgICdPTExBTUFfQVBJX0JBU0VfVVJMJyxcclxuICAgICAgJ0xNU1RVRElPX0FQSV9CQVNFX1VSTCcsXHJcbiAgICAgICdUT0dFVEhFUl9BUElfQkFTRV9VUkwnLFxyXG4gICAgXSxcclxuICAgIGNzczoge1xyXG4gICAgICBwcmVwcm9jZXNzb3JPcHRpb25zOiB7XHJcbiAgICAgICAgc2Nzczoge1xyXG4gICAgICAgICAgYXBpOiAnbW9kZXJuLWNvbXBpbGVyJyxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9O1xyXG59KTtcclxuXHJcbmZ1bmN0aW9uIGNocm9tZTEyOUlzc3VlUGx1Z2luKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICBuYW1lOiAnY2hyb21lMTI5SXNzdWVQbHVnaW4nLFxyXG4gICAgY29uZmlndXJlU2VydmVyKHNlcnZlcjogVml0ZURldlNlcnZlcikge1xyXG4gICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKChyZXEsIHJlcywgbmV4dCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHJhdyA9IHJlcS5oZWFkZXJzWyd1c2VyLWFnZW50J10/Lm1hdGNoKC9DaHJvbShlfGl1bSlcXC8oWzAtOV0rKVxcLi8pO1xyXG5cclxuICAgICAgICBpZiAocmF3KSB7XHJcbiAgICAgICAgICBjb25zdCB2ZXJzaW9uID0gcGFyc2VJbnQocmF3WzJdLCAxMCk7XHJcblxyXG4gICAgICAgICAgaWYgKHZlcnNpb24gPT09IDEyOSkge1xyXG4gICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdjb250ZW50LXR5cGUnLCAndGV4dC9odG1sJyk7XHJcbiAgICAgICAgICAgIHJlcy5lbmQoXHJcbiAgICAgICAgICAgICAgJzxib2R5PjxoMT5QbGVhc2UgdXNlIENocm9tZSBDYW5hcnkgZm9yIHRlc3RpbmcuPC9oMT48cD5DaHJvbWUgMTI5IGhhcyBhbiBpc3N1ZSB3aXRoIEphdmFTY3JpcHQgbW9kdWxlcyAmIFZpdGUgbG9jYWwgZGV2ZWxvcG1lbnQsIHNlZSA8YSBocmVmPVwiaHR0cHM6Ly9naXRodWIuY29tL3N0YWNrYmxpdHovYm9sdC5uZXcvaXNzdWVzLzg2I2lzc3VlY29tbWVudC0yMzk1NTE5MjU4XCI+Zm9yIG1vcmUgaW5mb3JtYXRpb24uPC9hPjwvcD48cD48Yj5Ob3RlOjwvYj4gVGhpcyBvbmx5IGltcGFjdHMgPHU+bG9jYWwgZGV2ZWxvcG1lbnQ8L3U+LiBgcG5wbSBydW4gYnVpbGRgIGFuZCBgcG5wbSBydW4gc3RhcnRgIHdpbGwgd29yayBmaW5lIGluIHRoaXMgYnJvd3Nlci48L3A+PC9ib2R5PicsXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBuZXh0KCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSxcclxuICB9O1xyXG59Il0sCiAgIm1hcHBpbmdzIjogIjtBQUFzUyxTQUFTLGdDQUFnQyx5QkFBeUIsY0FBYyx1QkFBdUI7QUFDN1ksT0FBTyxZQUFZO0FBQ25CLFNBQVMsb0JBQXdDO0FBQ2pELFNBQVMscUJBQXFCO0FBQzlCLFNBQVMsMEJBQTBCO0FBQ25DLE9BQU8sbUJBQW1CO0FBQzFCLFlBQVksWUFBWTtBQUN4QixTQUFTLGdCQUFnQjtBQUN6QixTQUFTLG9CQUFvQjtBQUM3QixTQUFTLFlBQVk7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
