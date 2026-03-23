// server.js - Production server for GitHub deployment
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// API Routes would go here
// Note: These would be imported from your existing routes.ts

// Serve static files
const clientDistPath = path.resolve(__dirname, '../dist/client');
app.use(express.static(clientDistPath));

// Always return the main index.html for any route not handled by API or static files
app.get('*', (req, res) => {
  res.sendFile(path.resolve(clientDistPath, 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});