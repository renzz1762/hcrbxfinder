/* =========================================================
   _guard.js — proteksi dasar buat semua endpoint /api/*
   1) Origin/Referer check  -> tolak request yang bukan dari
      domain situs sendiri (browser SELALU kirim header ini
      untuk fetch(), cuma script scraper luar yang nggak punya).
   2) Rate limit per IP      -> tolak kalau satu IP nembak
      endpoint kelewat sering dalam waktu singkat.

   CATATAN JUJUR: ini nge-blok scraper "malas" (curl/python
   requests polos, situs lain yang fetch langsung ke endpoint
   lo). Bukan proteksi mutlak — orang yang niat masih bisa spoof
   header Origin/Referer. Tapi ini udah nutup 90% kasus "orang
   nemu endpoint lo trus dipake di situs dia sendiri".
   ========================================================= */

// Domain yang boleh manggil API ini. Isi dari env ALLOWED_ORIGIN
// (pisah koma kalau lebih dari satu), fallback ke daftar default.
const ALLOWED = (process.env.ALLOWED_ORIGIN || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

function isAllowedOrigin(req) {
  if (ALLOWED.length === 0) return true; // belum di-set = nggak dicek (biar ga ke-block pas dev)
  const origin = req.headers.origin || '';
  const referer = req.headers.referer || '';
  return ALLOWED.some(dom => origin.includes(dom) || referer.includes(dom));
}

// Rate limit in-memory sederhana. RESET tiap cold start Vercel,
// jadi ini bukan rate limit "keras" — buat proteksi serius pasang
// Vercel KV / Upstash Redis. Tapi ini cukup nahan bot kasar.
const hits = new Map();
const WINDOW_MS = 60 * 1000; // 1 menit
const MAX_HITS = 30;          // maks 30 request/menit per IP

function getIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  return (fwd ? fwd.split(',')[0].trim() : req.socket?.remoteAddress) || 'unknown';
}

function isRateLimited(req) {
  const ip = getIp(req);
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || now > rec.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  rec.count++;
  return rec.count > MAX_HITS;
}

// Panggil ini di paling atas tiap handler. Return true kalau request
// DITOLAK (handler tinggal `return`), false kalau boleh lanjut.
function guard(req, res) {
  if (!isAllowedOrigin(req)) {
    res.status(403).json({ error: 'Origin tidak diizinkan' });
    return true;
  }
  if (isRateLimited(req)) {
    res.status(429).json({ error: 'Terlalu banyak request, coba lagi sebentar' });
    return true;
  }
  return false;
}

module.exports = { guard };
