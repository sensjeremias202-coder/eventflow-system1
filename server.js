const express = require('express');
const path = require('path');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 8080;

// CORS aberto para desenvolvimento local
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Proxy para Ollama
app.use('/api/generate', createProxyMiddleware({
  target: 'http://localhost:11434',
  changeOrigin: true,
  pathRewrite: { '^/api/generate': '/api/generate' },
  onProxyReq: (proxyReq, req, res) => {
    // Garantir JSON
    if (!proxyReq.getHeader('Content-Type')) {
      proxyReq.setHeader('Content-Type', 'application/json');
    }
  }
}));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname)));

// SPA fallback para index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[server] 🚀 Servidor iniciado em http://localhost:${PORT}`);
  console.log('[server] 🔁 Proxy ativo: /api/generate -> http://localhost:11434/api/generate');
});
