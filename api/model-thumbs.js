/* =========================================================
   API SERVER-SIDE (Vercel Serverless Function)
   Endpoint: /api/model-thumbs?ids=123,456,789
   Ambil thumbnail gambar model dari Roblox lewat server,
   bukan langsung dari browser.
   ========================================================= */
module.exports = async (req, res) => {
  try {
    const ids = (req.query.ids || '').toString().trim();
    if (!ids) {
      res.status(200).json({ data: [] });
      return;
    }

    const url = `https://thumbnails.roblox.com/v1/assets?assetIds=${encodeURIComponent(ids)}&size=150x150&format=Png&isCircular=false`;
    const r = await fetch(url, { headers: { Accept: 'application/json' } });

    if (!r.ok) {
      res.status(r.status).json({ error: `Roblox API status ${r.status}` });
      return;
    }

    const data = await r.json();
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Gagal fetch thumbnail' });
  }
};
