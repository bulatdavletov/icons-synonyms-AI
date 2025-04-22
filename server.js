// Simple Express.js proxy server to handle JetBrains API requests
// This avoids CORS issues when calling the API directly from the browser

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Parse JSON request bodies
app.use(bodyParser.json());

// Serve static files from the 'build' directory
app.use(express.static('build'));

// Proxy endpoint for JetBrains API
app.post('/api/jetbrains/chat/completions', async (req, res) => {
  try {
    const apiEndpoint = 'https://platform.jetbrains.ai/api/v1/chat/completions';
    
    // Forward the request to JetBrains API with proper headers
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Grazie-Authenticate-JWT': process.env.JETBRAINS_API_KEY,
        'Grazie-Agent': JSON.stringify({
          name: 'icons-synonyms-ai',
          version: '1.0.0'
        })
      },
      body: JSON.stringify(req.body)
    });

    if (!response.ok) {
      throw new Error(`JetBrains API error: ${response.statusText}`);
    }

    // Forward the response back to the client
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: error.message || 'Unknown error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Proxy server running at http://localhost:${port}`);
}); 