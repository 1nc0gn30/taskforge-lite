// gateway/routes/comments.js
import dotenv from 'dotenv';
dotenv.config();

import { createProxyMiddleware } from 'http-proxy-middleware';

const target = process.env.COMMENTS_SERVICE_URL;
console.log('[GATEWAY] COMMENTS_SERVICE_URL =', target);

if (!target) throw new Error('[GATEWAY] Missing COMMENTS_SERVICE_URL');

const commentsProxy = createProxyMiddleware({
  target,
  changeOrigin: true,
  pathRewrite: {
    '^/api/comments': '/comments',
  },
  onProxyReq(proxyReq, req) {
    console.log(`[GATEWAY] PROXY → ${req.method} ${req.originalUrl}`);
  },
});

export default commentsProxy;
