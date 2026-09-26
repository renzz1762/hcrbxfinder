/* =========================================================
   API SERVER-SIDE (Vercel Serverless Function)
   Endpoint: /api/model-search?keyword=...&limit=24
   Tugasnya: manggil Creator Store Roblox dari SERVER, bukan
   dari browser — jadi endpoint asli Roblox ga kelihatan kalau
   situs ini di-inspect/download, dan ga kena masalah CORS.
   ========================================================= */
const { guard } = require('./_guard');

module.exports = async (req, res) => {
  try {
    if (guard(req, res)) return;
    const keyword = (req.query.keyword || '').toString().trim();
    const limit = (req.query.limit || '24').toString();

    const params = new URLSearchParams({ limit });
    if (keyword) params.set('keyword', keyword);

    const base = process.env.ROBLOX_TOOLBOX_API;
    if (!base) {
      res.status(500).json({ error: 'ROBLOX_TOOLBOX_API belum di-set di Environment Variables' });
      return;
    }
    const url = `${base}?${params.toString()}`;
    const r = await fetch(url, { headers: { Accept: 'application/json' } });

    if (!r.ok) {
      res.status(r.status).json({ error: `Roblox API status ${r.status}` });
      return;
    }

    const data = await r.json();
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=90');
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Gagal fetch Creator Store' });
  }
};
