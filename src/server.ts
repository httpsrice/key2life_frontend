import express from 'express';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

/**
 * Universal Proxy Handler for Sidecar Services
 * @param baseUrl The target service base URL
 * @param serviceName Name for error reporting
 */
const proxyRequest = async (
  baseUrl: string | undefined, 
  serviceName: string, 
  req: express.Request, 
  res: express.Response
) => {
  if (!baseUrl) {
    console.warn(`[Proxy] ${serviceName} requested but base URL is not defined in environment.`);
    return res.status(503).json({ 
      error: `${serviceName}_OFFLINE`, 
      status: 'SERVICE_UNAVAILABLE' 
    });
  }

  // Extract the sub-path after /api/service-name/
  const subPath = req.params[0] || '';
  const url = `${baseUrl.replace(/\/$/, '')}/${subPath}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization as string;
    }

    const response = await fetch(url, {
      method: req.method,
      headers,
      body: ['POST', 'PUT', 'PATCH'].includes(req.method) ? JSON.stringify(req.body) : undefined,
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    
    // Attempt to parse JSON response
    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = { message: 'Raw response returned' };
    }
    
    res.status(response.status).json(data);
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.error(`[Proxy] ${serviceName} timeout at ${url}`);
      res.status(504).json({ 
        error: 'TIMEOUT', 
        message: `${serviceName} took too long to respond (10s limit)` 
      });
    } else {
      console.error(`[Proxy] ${serviceName} error at ${url}:`, error.message);
      res.status(500).json({ 
        error: 'PROXY_ERROR', 
        message: error.message 
      });
    }
  }
};

// 1. Paperclip Proxy Route
app.all('/api/paperclip/*', (req, res) => {
  proxyRequest(process.env.PAPERCLIP_API_URL, 'PAPERCLIP', req, res);
});

// 2. ZeroClaw Proxy Route (On hold as per user request, but structure maintained)
app.all('/api/zeroclaw/*', (req, res) => {
  // If user said "hold on", we could return a specific message or just proceed if they eventually fill the env
  proxyRequest(process.env.ZEROCLAW_API_URL, 'ZEROCLAW', req, res);
});

app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  SAM-OS Sidecar Proxy :: Active on Port ${PORT}`);
  console.log(`  Proxying /api/paperclip -> ${process.env.PAPERCLIP_API_URL || 'OFFLINE'}`);
  console.log(`  Proxying /api/zeroclaw  -> ${process.env.ZEROCLAW_API_URL || 'OFFLINE'}`);
  console.log('═══════════════════════════════════════════════════════════');
});
