const { createRequestHandler } = require("@netlify/remix-adapter");

exports.handler = createRequestHandler({
  build: require("../../build/server/index.js"),
  mode: process.env.NODE_ENV,
});
