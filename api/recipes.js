const https = require('https');

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { reject(e); }
      });
    }).on('error', reject);
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { action, query, id } = req.query;

  try {
    if (action === 'search') {
      const data = await fetchJSON(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query || '')}`);
      return res.status(200).json(data);
    }
    if (action === 'lookup') {
      const data = await fetchJSON(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
      return res.status(200).json(data);
    }
    res.status(400).json({ error: 'Invalid action' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
