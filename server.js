import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import basicAuth from 'express-basic-auth';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Basic authentication for secure sharing
const adminUser = process.env.ADMIN_USER || 'admin';
const adminPass = process.env.ADMIN_PASS || 'key2life';

const secureUsers = {
  [adminUser]: adminPass
};

// Use Basic Auth for all routes to prevent unauthorized access
app.use(basicAuth({
    users: secureUsers,
    challenge: true,
    realm: 'SAM-OS Neural Cockpit',
}));

// Serve static React build
app.use(express.static(path.join(__dirname, 'dist')));

// A simple backend API endpoint to test connectivity
app.get('/api/health', (req, res) => {
    res.json({ status: 'active', version: '1.0.42', message: 'SAM-OS Backend Online' });
});

// Serve index.html for all other routes to support client side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n==============================================`);
    console.log(`[SYS] SAM-OS Backend Active on port ${PORT}`);
    console.log(`[SYS] Secure sharing enabled. Auth: ${adminUser}`);
    console.log(`==============================================\n`);
});
