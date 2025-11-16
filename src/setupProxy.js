const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/cosmos',
    createProxyMiddleware({
      target: 'http://localhost:26657',
      changeOrigin: true,
      pathRewrite: {
        '^/cosmos': '',
      },
      onProxyReq: (proxyReq, req, res) => {
        // 添加 CORS 头部
        proxyReq.setHeader('Access-Control-Allow-Origin', '*');
        proxyReq.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
        proxyReq.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
        return proxyReq;
      },
      onProxyRes: (proxyRes, req, res) => {
        // 确保 CORS 头部被正确设置
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization';
        return proxyRes;
      }
    })
  );
};