/* =========================================================
   PROMOSI.JS — data owner & daftar website/apk
   Edit bagian ini aja kalau mau ganti link, ga perlu sentuh
   file index.html / script.js / style.css.
   ========================================================= */

/* ---------- DATA OWNER ---------- */
const OWNER_INFO = {
  name: 'CikRorw',
  role: 'Owner & Developer',
  avatar: '', // isi path/URL foto profil, kosongkan buat pakai inisial
  verified: true, // true = tampilin centang biru (akun IG asli)
  igUrl: 'https://instagram.com/USERNAME_IG',       // ganti dengan link IG asli
  tiktokUrl: 'https://tiktok.com/@cikhub_',  // ganti dengan link TikTok asli
  waChannelUrl: 'https://whatsapp.com/channel/0029Vb5aoKwEwEjpsmaQol3A' // ganti dengan link saluran WA asli
};

/* ---------- DAFTAR WEBSITE & APK ---------- */
/* type: "website" atau "apk" — dipakai buat nentuin ikon & label badge */
const PROMO_LIST = [
  {
    name: 'HC MUSIFY [ REKOMENDARI VERSI WEBSITE ]',
    type: 'website',
    desc: 'dengerin music gratis tanpa iklan.',
    url: 'https://hcmusify.netlify.app/'
  },
  {
    name: 'HC MUSIFY [ SUPPORT OFFLINE ]',
    type: 'apk',
    desc: 'dengerin music gratis tanpa iklan - Support offline.',
    url: 'https://www.mediafire.com/file/iswybhhbz388jw0/HC_MUSIFY.apk/file'
  },
  {
    name: 'CIK STORE',
    type: 'website',
    desc: 'Jual script, source code, dan bahan-bahan map roblox.',
    url: 'https://cikstore.vercel.app/'
  }
];

/* ---------- LOG PROSES KERJA WEBSITE ---------- */
/* Tambah/ubah/hapus baris di array ini buat update halaman "Logs" */
const LOG_LIST = [
  {
    date: '26 Sep 2026',
    title: 'Nambahin fitur Cari Model',
    desc: 'Halaman baru buat cari model Roblox langsung dari Creator Store (create.roblox.com/store/models) pakai kata kunci bebas.'
  },
  {
    date: '26 Sep 2026',
    title: 'Nambahin halaman Logs',
    desc: 'Bikin navigasi bawah baru (Home, Model, Logs, Profile) buat nampilin riwayat proses pengerjaan website.'
  },
  {
    date: '2026',
    title: 'Profile Owner diperbagus',
    desc: 'Tambah centang biru verifikasi dan tombol saluran TikTok & WhatsApp di halaman Profile.'
  },
  {
    date: '2026',
    title: 'Rilis RBX Finder v1',
    desc: 'Fitur pencarian Asset ID Roblox langsung dari API resmi Roblox mulai aktif.'
  }
];
