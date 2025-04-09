const express = require('express');
const app = express();
const port = process.env.PORT || 3001;
const applyToJob = require('./applyToJob');

app.use(express.json());

app.get('/', (req, res) => {
  res.send('🚀 Puppeteer Job Automation Server is running.');
});

app.post('/apply', async (req, res) => {
  const { link } = req.body;

  if (!link) {
    return res.status(400).json({ success: false, error: 'Missing job application link.' });
  }

  try {
    const result = await applyToJob({ link });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(port, () => {
  console.log(`✅ Puppeteer server listening on port ${port}`);
});
