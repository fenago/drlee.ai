import type { Context } from "@netlify/functions";
import { createRequestHandler } from "@netlify/remix-adapter";
import * as build from "../../build/server/index.js";

const handler = createRequestHandler({
  // @ts-ignore
  build,
  mode: process.env.NODE_ENV,
});

export default async (req: Request, context: Context) => {
  return handler(req, context);
};
