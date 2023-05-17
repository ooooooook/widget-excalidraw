// eslint-disable-next-line @typescript-eslint/no-var-requires,no-undef
const { createProxyMiddleware } = require("http-proxy-middleware");

// eslint-disable-next-line no-undef
module.exports = function (app) {
  // eslint-disable-next-line no-undef
  if (process.env.NODE_ENV === "development") {
    app.use(
      "/api",
      createProxyMiddleware({
        target: "http://localhost:6806/",
        changeOrigin: true,
        pathRewrite: {
          "^/api": "/api",
        },
      })
    );
  }
};
