// CommonJS wrapper for ESM build
exports.handler = async (event, context) => {
  // Dynamically import ESM modules
  const { createRequestHandler } = await import("@netlify/remix-adapter");
  const build = await import("../../build/server/index.js");
  
  const handler = createRequestHandler({
    build,
    mode: process.env.NODE_ENV,
  });
  
  return handler(event, context);
};
