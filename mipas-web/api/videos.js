// Vercel Serverless Function: GET /api/videos
// Mengambil daftar video terbaru dari RSS channel YouTube MIPAS secara otomatis,
// jadi setiap ada upload baru, website ikut ter-update (cache 1 jam).

const CHANNEL_ID = 'UCvk1zpVnPPLIk5G5-vTjoRg';

function decode(str = '') {
  return str
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .trim();
}

function parseFeed(xml) {
  return xml
    .split('<entry>')
    .slice(1)
    .map((e) => {
      const get = (re) => (e.match(re) || [])[1] || '';
      const link = get(/<link[^>]*href="([^"]+)"/);
      return {
        id: get(/<yt:videoId>([^<]+)<\/yt:videoId>/),
        title: decode(get(/<title>([\s\S]*?)<\/title>/)),
        published: get(/<published>([^<]+)<\/published>/),
        description: decode(get(/<media:description>([\s\S]*?)<\/media:description>/)),
        views: Number(get(/<media:statistics[^>]*views="(\d+)"/)) || 0,
        isShort: /\/shorts\//.test(link),
      };
    })
    .filter((v) => v.id);
}

module.exports = async (req, res) => {
  try {
    const r = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`,
      { headers: { 'User-Agent': 'Mozilla/5.0 (MIPAS website)' } }
    );
    if (!r.ok) throw new Error(`YouTube merespons ${r.status}`);
    const videos = parseFeed(await r.text());
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).json({ videos });
  } catch (err) {
    res.setHeader('Cache-Control', 's-maxage=60');
    res.status(502).json({ error: String(err.message || err), videos: [] });
  }
};

module.exports.parseFeed = parseFeed;
