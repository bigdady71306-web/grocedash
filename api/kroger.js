// Kroger API Proxy — Vercel Serverless Function
// Handles token, location lookup, and product search

const KROGER_BASE = 'https://api.kroger.com/v1';
const CLIENT_ID = process.env.KROGER_CLIENT_ID;
const CLIENT_SECRET = process.env.KROGER_CLIENT_SECRET;

// In-memory token cache (per cold-start, fine for serverless)
let tokenCache = null;
let tokenExpiry = 0;

const ALLOWED_ORIGIN = 'https://grocedash.vercel.app';

function corsHeaders(req) {
  const origin = req.headers.origin || '';
  // Allow grocedash.vercel.app and localhost for dev
  const allowed =
    origin === ALLOWED_ORIGIN ||
    origin.startsWith('http://localhost') ||
    origin.startsWith('http://127.0.0.1');
  return {
    'Access-Control-Allow-Origin': allowed ? origin : ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
}

async function getToken() {
  const now = Date.now();
  if (tokenCache && now < tokenExpiry) return tokenCache;

  const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  const res = await fetch(`${KROGER_BASE}/connect/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials&scope=product.compact',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token fetch failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  tokenCache = data.access_token;
  // Expire 60s early to be safe
  tokenExpiry = now + (data.expires_in - 60) * 1000;
  return tokenCache;
}

async function getLocations(zip) {
  const token = await getToken();
  const url =
    `${KROGER_BASE}/locations?filter.zipCode=${encodeURIComponent(zip)}` +
    `&filter.limit=5&filter.chain=KROGER`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Locations fetch failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return (data.data || []).map(loc => ({
    locationId: loc.locationId,
    name: loc.name,
    chain: loc.chain,
    address: loc.address ? `${loc.address.addressLine1}, ${loc.address.city}, ${loc.address.state}` : '',
    distance: loc.geolocation ? loc.geolocation.latLng : null,
  }));
}

async function getProducts(term, locationId) {
  const token = await getToken();
  const url =
    `${KROGER_BASE}/products?filter.term=${encodeURIComponent(term)}` +
    `&filter.locationId=${encodeURIComponent(locationId)}&filter.limit=5`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Products fetch failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return (data.data || []).map(prod => {
    const priceInfo =
      prod.items && prod.items[0] && prod.items[0].price
        ? prod.items[0].price
        : null;
    return {
      productId: prod.productId,
      description: prod.description,
      brand: prod.brand || '',
      size: prod.items && prod.items[0] ? prod.items[0].size : '',
      price: priceInfo ? priceInfo.regular : null,
      salePrice: priceInfo && priceInfo.promo > 0 ? priceInfo.promo : null,
      inStock: prod.items && prod.items[0] ? prod.items[0].inventory?.stockLevel !== 'TEMPORARILY_OUT_OF_STOCK' : true,
    };
  });
}

module.exports = async function handler(req, res) {
  const headers = corsHeaders(req);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, headers);
    res.end();
    return;
  }

  if (req.method !== 'GET') {
    res.writeHead(405, headers);
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  const { action, zip, term, locationId } = req.query || {};

  try {
    if (action === 'token') {
      const token = await getToken();
      res.writeHead(200, headers);
      res.end(JSON.stringify({ ok: true, cached: Date.now() < tokenExpiry }));
      return;
    }

    if (action === 'locations') {
      if (!zip) {
        res.writeHead(400, headers);
        res.end(JSON.stringify({ error: 'zip parameter required' }));
        return;
      }
      const locations = await getLocations(zip);
      res.writeHead(200, headers);
      res.end(JSON.stringify({ ok: true, locations }));
      return;
    }

    if (action === 'products') {
      if (!term || !locationId) {
        res.writeHead(400, headers);
        res.end(JSON.stringify({ error: 'term and locationId parameters required' }));
        return;
      }
      const products = await getProducts(term, locationId);
      res.writeHead(200, headers);
      res.end(JSON.stringify({ ok: true, products }));
      return;
    }

    res.writeHead(400, headers);
    res.end(JSON.stringify({ error: 'Unknown action. Use: token, locations, or products' }));
  } catch (err) {
    console.error('Kroger API error:', err.message);
    res.writeHead(500, headers);
    res.end(JSON.stringify({ error: err.message }));
  }
};
