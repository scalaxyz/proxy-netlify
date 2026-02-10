// Netlify Functions v2 format
export default async (req, context) => {
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
    const res = await fetch(
      `https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(spotifyUrl)}&userCountry=US&songIfSingle=true`,
      { headers: { 'User-Agent': 'HausnationNetlify/1.0' } }
    );

    if (!res.ok) {
      return new Response(JSON.stringify({ error: `upstream_${res.status}` }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const body = await res.text();
    return new Response(body, {
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

export const config = {
  path: "/api/proxy"
};
