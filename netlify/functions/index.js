const { createRequestHandler } = require("@remix-run/node");

let cachedHandler;

exports.handler = async (event, context) => {
  try {
    if (!cachedHandler) {
      // Dynamic import for ES module server build
      const build = await import("../../build/server/index.js");
      cachedHandler = createRequestHandler({
        build: build.default || build,
        mode: process.env.NODE_ENV,
      });
    }
    
    return cachedHandler(event, context);
  } catch (error) {
    console.error("Function error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
