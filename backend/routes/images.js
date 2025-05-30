const express = require('express');
const router = express.Router();
const axios = require('axios');

// Proxy for TMDb images
router.get('/tmdb/:size/:id', async (req, res) => {
  try {
    const { size, id } = req.params;
    // Validate size parameter
    if (!['w500', 'original', 'w300', 'w780'].includes(size)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid size parameter'
      });
    }

    // Validate id parameter to prevent path traversal
    if (!id.match(/^[a-zA-Z0-9\/]+\.[a-zA-Z]{3,4}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid image id format'
      });
    }

    const imageUrl = `https://image.tmdb.org/t/p/${size}/${id}`;
    
    const response = await axios({
      method: 'get',
      url: imageUrl,
      responseType: 'stream'
    });

    // Set appropriate headers
    res.set('Content-Type', response.headers['content-type']);
    res.set('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    
    // Pipe the image data to the response
    response.data.pipe(res);
  } catch (error) {
    console.error('Error fetching image:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to load image'
    });
  }
});

module.exports = router; 