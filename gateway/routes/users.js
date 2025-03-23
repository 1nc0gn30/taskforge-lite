// gateway/routes/users.js
import dotenv from 'dotenv';
dotenv.config();

import { createProxyMiddleware } from 'http-proxy-middleware';

const target = process.env.USERS_SERVICE_URL;
console.log('[GATEWAY] USERS_SERVICE_URL =', target);

if (!target) throw new Error('[GATEWAY] Missing USERS_SERVICE_URL');

const usersProxy = createProxyMiddleware({
  target,
  changeOrigin: true,
  pathRewrite: {
    '^/api/users': '/users', // 👈 CRUCIAL — ensure /users path reaches the microservice
  },
  onProxyReq(proxyReq, req) {
    console.log(`[GATEWAY] PROXY → ${req.method} ${req.originalUrl}`);
  },
});

export default usersProxy;
