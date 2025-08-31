const { createRequestHandler } = require("@remix-run/node");

let cachedHandler;

exports.handler = async (event, context) => {
  if (!cachedHandler) {
    // Use dynamic import to handle the server build with top-level await
    const build = await import("../../build/server/index.js");
    cachedHandler = createRequestHandler({
      build: build.default || build,
      mode: process.env.NODE_ENV,
    });
  }
  
  return cachedHandler(event, context);
};
