import { createRequestHandler } from "@remix-run/node";

// Use dynamic import to handle the server build with top-level await
const build = await import("../../build/server/index.js");

export const handler = createRequestHandler({
  build,
  mode: process.env.NODE_ENV,
});
