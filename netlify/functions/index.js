const { createRequestHandler } = require("@remix-run/node");

exports.handler = createRequestHandler({
  build: require("../../build/server/index.js"),
  mode: process.env.NODE_ENV,
});
