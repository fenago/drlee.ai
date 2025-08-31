const { createRequestHandler } = require("@remix-run/node");
const path = require("path");

let cachedHandler;

exports.handler = async (event, context) => {
  if (!cachedHandler) {
    // Use absolute path to load the server build
    const serverBuildPath = path.join(process.cwd(), "build", "server", "index.js");
    const build = await import(serverBuildPath);
    cachedHandler = createRequestHandler({
      build: build.default || build,
      mode: process.env.NODE_ENV,
    });
  }
  
  return cachedHandler(event, context);
};
