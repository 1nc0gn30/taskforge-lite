// gateway/routes/tasks.js
import dotenv from 'dotenv';
dotenv.config();

import { createProxyMiddleware } from 'http-proxy-middleware';

const target = process.env.TASKS_SERVICE_URL;
console.log('[GATEWAY] TASKS_SERVICE_URL =', target);

if (!target) throw new Error('[GATEWAY] Missing TASKS_SERVICE_URL');

const tasksProxy = createProxyMiddleware({
  target,
  changeOrigin: true,
  pathRewrite: {
    '^/api/tasks': '/tasks', // 👈 ensure correct base path is forwarded
  },
  onProxyReq(proxyReq, req) {
    console.log(`[GATEWAY] PROXY → ${req.method} ${req.originalUrl}`);
  },
});

export default tasksProxy;
