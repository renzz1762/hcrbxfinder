/* =========================================================
   API SERVER-SIDE (Vercel Serverless Function)
   Endpoint: /api/asset-details?id=17311713870
   Ambil detail asset Roblox lewat server 
   bukan langsung dari browser.
   ========================================================= */
const { guard } = require('./_guard');

module.exports = async (req, res) => {
  try {
    if (guard(req, res)) return;
    const id = (req.query.id || '').toString().trim();
    if (!id) {
      res.status(400).json({ error: 'Parameter id wajib diisi' });
      return;
    }

    const base = process.env.ROBLOX_ECONOMY_API;
    if (!base) {
      res.status(500).json({ error: 'ROBLOX_ECONOMY_API belum di-set di Environment Variables' });
      return;
    }
    const url = `${base}/${encodeURIComponent(id)}/details`;
    const r = await fetch(url, { headers: { Accept: 'application/json' } });

    if (!r.ok) {
      res.status(r.status).json({ error: `Roblox API status ${r.status}` });
      return;
    }

    const data = await r.json();
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=90');
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Gagal fetch asset' });
  }
};
