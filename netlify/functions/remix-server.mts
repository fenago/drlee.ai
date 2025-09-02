import { createRequestHandler } from "@netlify/remix-adapter";
// @ts-ignore - Build will be generated during compilation
import * as build from "../../build/server/index.js";

export default createRequestHandler({
  build: build as any,
  mode: process.env.NODE_ENV,
});
