const { createRequestHandler } = require("@remix-run/node");
const path = require("path");
const { pathToFileURL } = require("url");

let cachedHandler;

exports.handler = async (event, context) => {
  if (!cachedHandler) {
    // Convert path to file:// URL for ES module import
    const serverBuildPath = path.join(process.cwd(), "build", "server", "index.js");
    const serverBuildUrl = pathToFileURL(serverBuildPath).href;
    const build = await import(serverBuildUrl);
    cachedHandler = createRequestHandler({
      build: build.default || build,
      mode: process.env.NODE_ENV,
    });
  }
  
  return cachedHandler(event, context);
};
