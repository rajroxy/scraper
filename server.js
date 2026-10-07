const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.static('public'));

// Base Manifest Template
const BASE_MANIFEST = {
  id: 'org.mycustom.streamhub',
  version: '1.0.0',
  name: 'Custom Stream Hub',
  description: 'Direct MP4 & HLS HTTP Scraper Addon',
  resources: ['stream'],
  types: ['movie', 'series'],
  idPrefixes: ['tt']
};

// 1. Serving the Configure Page UI
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/configure', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// 2. Base & Configured Manifest Links
app.get('/manifest.json', (req, res) => res.json(BASE_MANIFEST));
app.get('/:config/manifest.json', (req, res) => {
  res.json({ ...BASE_MANIFEST, name: `Stream Hub (${req.params.config})` });
});

// 3. Main Stream Resolution Handler
app.get('/:config/stream/:type/:id.json', async (req, res) => {
  const { id } = req.params; // IMDb ID (e.g. tt0111161)
  const streams = [];

  try {
    // EXAMPLE SCRAPER SOURCE: Querying a public video embed provider (e.g. Vidsrc API format)
    const providerUrl = `https://vidsrc.xyz/embed/movie?imdb=${id}`;
    
    // Perform fetch request (simulating browser request)
    const response = await axios.get(providerUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 5000
    });

    // Extract playable streams (or fallback to test streams for demonstration)
    streams.push({
      name: 'Direct HTTP',
      title: 'Provider 1 • 1080p [Fast Direct Stream]',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    });

    streams.push({
      name: 'HLS Auto',
      title: 'Provider 2 • Adaptive .m3u8 Stream',
      url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
    });

  } catch (err) {
    console.error('Error fetching stream:', err.message);
  }

  return res.json({ streams });
});

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
