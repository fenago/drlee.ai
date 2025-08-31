import { createRequestHandler } from "@remix-run/node";

let cachedHandler;

export const handler = async (event, context) => {
  if (!cachedHandler) {
    // Lazy load the server build to handle top-level await
    const build = await import("../../build/server/index.js");
    cachedHandler = createRequestHandler({
      build,
      mode: process.env.NODE_ENV,
    });
  }
  
  return cachedHandler(event, context);
};
