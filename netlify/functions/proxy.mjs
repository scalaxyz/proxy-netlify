/**
 * HAUSNATION — Odesli Proxy (Netlify Function)
 * Provider 3/3
 * 
 * Deploy:
 * 1. GitHub'da yeni repo oluştur
 * 2. Bu dosyayı netlify/functions/proxy.mjs olarak koy
 * 3. netlify.toml dosyasını root'a koy
 * 4. netlify.com'dan import et → Deploy
 * URL: https://SITE-ADIN.netlify.app/.netlify/functions/proxy?url=SPOTIFY_URL
 */
export default async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const url = new URL(req.url);
  const spotifyUrl = url.searchParams.get('url');

  if (!spotifyUrl || !spotifyUrl.includes('spotify')) {
    return new Response(JSON.stringify({ error: 'Invalid or missing Spotify URL' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  try {
    const response = await fetch(
      `https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(spotifyUrl)}&userCountry=US&songIfSingle=true`,
      { headers: { 'User-Agent': 'HausnationNetlify/1.0' } }
    );

    if (!response.ok) {
      return new Response(JSON.stringify({ error: `upstream_${response.status}` }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const data = await response.text();
    return new Response(data, {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders, 'Cache-Control': 'public, max-age=3600' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'fetch_failed', message: e.message }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

export const config = { path: '/.netlify/functions/proxy' };
