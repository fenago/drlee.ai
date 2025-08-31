import { createRequestHandler } from "@remix-run/node";
import * as build from "../../build/server/index.js";

let cachedHandler;

export const handler = async (event, context) => {
  if (!cachedHandler) {
    cachedHandler = createRequestHandler({
      build,
      mode: process.env.NODE_ENV,
    });
  }
  
  return cachedHandler(event, context);
};
