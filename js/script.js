/* ---------- NAV: switch halaman Home / Model / Logs / Terminal / Profile ---------- */
const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page');

function showPage(id){
  navLinks.forEach(l => l.classList.toggle('active', l.dataset.nav === id));
  pages.forEach(p => p.classList.toggle('active', p.dataset.page === id));
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  if(typeof terminalLog === 'function') terminalLog('info', `Pindah ke halaman "${id}".`);
}
navLinks.forEach(link => {
  link.addEventListener('click', () => showPage(link.dataset.nav));
});
document.getElementById('brandHome')?.addEventListener('click', (e) => {
  e.preventDefault();
  showPage('home');
});

/* ---------- TERMINAL: log proses & error biar kelihatan langsung di HP ---------- */
const terminalBody = document.getElementById('terminalBody');
const terminalStatusEl = document.getElementById('terminalStatus');
const TERMINAL_MAX_LINES = 200;

function termEscape(str){
  const d = document.createElement('div');
  d.textContent = str ?? '';
  return d.innerHTML;
}

function terminalLog(type, msg){
  if(!terminalBody) return;
  const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const line = document.createElement('div');
  line.className = `term-line term-${type}`;
  line.innerHTML = `<span class="term-time">${time}</span><span class="term-tag">${type.toUpperCase()}</span><span class="term-msg">${termEscape(String(msg))}</span>`;
  terminalBody.appendChild(line);
  while(terminalBody.children.length > TERMINAL_MAX_LINES) terminalBody.removeChild(terminalBody.firstChild);
  terminalBody.scrollTop = terminalBody.scrollHeight;

  if(terminalStatusEl){
    terminalStatusEl.className = `term-status ${type === 'error' ? 'err' : 'ok'}`;
    terminalStatusEl.innerHTML = `<span class="sdot"></span> ${type === 'error' ? 'Ada error' : 'Berjalan normal'}`;
  }
}

/* Tangkap error runtime & promise yang gagal, biar ketahuan lokasinya */
window.addEventListener('error', (e) => {
  const file = (e.filename || '').split('/').pop() || '?';
  terminalLog('error', `${e.message} (${file}:${e.lineno}:${e.colno})`);
});
window.addEventListener('unhandledrejection', (e) => {
  terminalLog('error', `Promise gagal: ${e.reason?.message || e.reason}`);
});

/* Semua console.log/warn/error otomatis nongol juga di halaman Terminal */
['log', 'warn', 'error'].forEach(fn => {
  const original = console[fn].bind(console);
  console[fn] = (...args) => {
    original(...args);
    const text = args.map(a => typeof a === 'string' ? a : (() => { try{ return JSON.stringify(a); }catch(_){ return String(a); } })()).join(' ');
    terminalLog(fn === 'log' ? 'info' : fn, text);
  };
});

terminalLog('info', 'Terminal siap. Menunggu aktivitas...');

/* ---------- TABS: Cara Kerja / FAQ ---------- */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

/* ---------- FAQ accordion ---------- */
document.querySelectorAll('.faq-q').forEach(q => {
  q.addEventListener('click', () => {
    q.parentElement.classList.toggle('open');
  });
});

/* ---------- STAGES ---------- */
const stageEls = document.querySelectorAll('.stage');
function setStage(activeIndex, doneUpTo){
  stageEls.forEach((el, i) => {
    el.classList.remove('active', 'done');
    if(i < doneUpTo) el.classList.add('done');
    else if(i === activeIndex) el.classList.add('active');
  });
}
function resetStages(){
  stageEls.forEach(el => el.classList.remove('active', 'done'));
}

/* ---------- LOOKUP LOGIC ---------- */
const input = document.getElementById('assetInput');
const goBtn = document.getElementById('goBtn');
const consoleBox = document.getElementById('console');
const consoleStatus = document.getElementById('consoleStatus');
const consoleBody = document.getElementById('consoleBody');

const ASSET_TYPES = {
  1:'Image',2:'T-Shirt',3:'Audio',4:'Mesh',5:'Lua',8:'Hat',9:'Place',10:'Model',
  11:'Shirt',12:'Pants',13:'Decal',16:'Avatar',17:'Head',18:'Face',19:'Gear',
  21:'Badge',24:'Animation',27:'Torso',28:'RightArm',29:'LeftArm',30:'LeftLeg',
  31:'RightLeg',32:'Package',34:'GamePass',38:'Plugin',40:'MeshPart',41:'HairAccessory',
  42:'FaceAccessory',43:'NeckAccessory',44:'ShoulderAccessory',45:'FrontAccessory',
  46:'BackAccessory',47:'WaistAccessory',48:'ClimbAnimation',49:'DeathAnimation',
  50:'FallAnimation',51:'IdleAnimation',52:'JumpAnimation',53:'RunAnimation',
  54:'SwimAnimation',55:'WalkAnimation',56:'PoseAnimation',61:'LocalizationTableManifest',
  62:'LocalizationTableTranslation',64:'EmoteAnimation',66:'Video',71:'DynamicHead'
};

function extractId(raw){
  raw = raw.trim();
  const m = raw.match(/asset\/(\d+)/);
  if(m) return m[1];
  const digits = raw.match(/\d+/);
  return digits ? digits[0] : null;
}
function slugify(name){
  if(!name) return 'item';
  let s = name.trim().replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return s.length ? s : 'item';
}
function escapeHtml(str){
  const d = document.createElement('div');
  d.textContent = str ?? '';
  return d.innerHTML;
}
function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

async function tryFetch(url){
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if(!res.ok) throw new Error('status ' + res.status);
  return res.json();
}
async function fetchAssetDetails(id){
  return await tryFetch(`/api/asset-details?id=${encodeURIComponent(id)}`);
}

function showConsoleError(text){
  consoleBox.classList.add('show');
  consoleStatus.innerHTML = `<span class="sdot"></span> Gagal`;
  consoleStatus.className = 'console-status err';
  consoleBody.innerHTML = `<div class="field"><div class="field-k">Status</div><div class="field-v msg">${escapeHtml(text)}</div></div>`;
}

function showConsoleResult(data, id){
  const name = data.Name || 'Tanpa nama';
  const slug = slugify(name);
  const link = `https://create.roblox.com/store/asset/${id}/${slug}`;
  const typeLabel = ASSET_TYPES[data.AssetTypeId] || `Tipe #${data.AssetTypeId ?? '?'}`;
  const creatorName = data.Creator?.Name || 'Tidak diketahui';
  const creatorType = data.Creator?.CreatorType === 'Group' ? 'Grup' : 'Pengguna';
  const creatorId = data.Creator?.Id;
  const creatorProfile = creatorId
    ? (data.Creator.CreatorType === 'Group'
        ? `https://www.roblox.com/groups/${creatorId}`
        : `https://www.roblox.com/users/${creatorId}/profile`)
    : null;
  const price = (data.PriceInRobux === null || data.PriceInRobux === undefined)
    ? 'Gratis / tidak dijual'
    : `${data.PriceInRobux} Robux`;
  const created = data.Created ? new Date(data.Created).toLocaleDateString('id-ID') : '-';

  consoleBox.classList.add('show');
  consoleStatus.innerHTML = `<span class="sdot"></span> Ditemukan`;
  consoleStatus.className = 'console-status ok';
  consoleBody.innerHTML = `
    <div class="field"><div class="field-k">Nama Aset</div><div class="field-v">${escapeHtml(name)}</div></div>
    <div class="row-2">
      <div class="field"><div class="field-k">Tipe</div><div class="field-v">${escapeHtml(typeLabel)}</div></div>
      <div class="field"><div class="field-k">Harga</div><div class="field-v">${escapeHtml(price)}</div></div>
    </div>
    <div class="row-2">
      <div class="field"><div class="field-k">Dibuat oleh</div><div class="field-v">${escapeHtml(creatorName)} (${creatorType})</div></div>
      <div class="field"><div class="field-k">Tanggal Dibuat</div><div class="field-v">${created}</div></div>
    </div>
    <div class="field">
      <div class="field-k">Link create.roblox.com</div>
      <div class="field-v link"><a href="${link}" target="_blank" rel="noopener">${link}</a><button class="copy-btn" id="copyBtn">Salin</button></div>
    </div>
    ${creatorProfile ? `<a class="open-link" href="${creatorProfile}" target="_blank" rel="noopener">Lihat profil pembuat →</a>` : ''}
  `;

  document.getElementById('copyBtn')?.addEventListener('click', (e) => {
    navigator.clipboard?.writeText(link);
    e.target.textContent = 'Tersalin!';
    setTimeout(() => e.target.textContent = 'Salin', 1200);
  });
}

async function runSearch(){
  const raw = input.value;
  const id = extractId(raw);

  if(!id){
    resetStages();
    showConsoleError('Masukkan Asset ID yang valid (angka), atau tempel link create.roblox.com.');
    terminalLog('warn', `Input asset tidak valid: "${raw}"`);
    return;
  }

  terminalLog('info', `Mulai cari asset ID ${id}...`);
  goBtn.disabled = true;
  goBtn.classList.add('loading');
  consoleBox.classList.remove('show');

  setStage(0, 0);
  await sleep(150);
  setStage(1, 1);

  try{
    const data = await fetchAssetDetails(id);
    setStage(2, 2);
    await sleep(150);
    setStage(3, 3);
    await sleep(150);
    setStage(-1, 4);
    showConsoleResult(data, id);
    terminalLog('info', `Berhasil ambil data asset ${id} (${data?.Name || 'tanpa nama'}).`);
  }catch(e){
    setStage(-1, 1);
    showConsoleError(`Tidak bisa menemukan aset dengan ID ${id}. Kemungkinan sudah dihapus, privat, atau API Roblox sedang membatasi permintaan.`);
    terminalLog('error', `Gagal ambil asset ${id}: ${e.message}`);
  }finally{
    goBtn.disabled = false;
    goBtn.classList.remove('loading');
  }
}

goBtn.addEventListener('click', runSearch);
input.addEventListener('keydown', e => { if(e.key === 'Enter') runSearch(); });

/* ---------- WATERMARK ---------- */
console.log('%cWebsite ini by CikRorw', 'color:#ff1f3d; font-weight:800; font-size:14px;');
console.log('%cDilarang klaim/reupload tanpa izin pemilik asli.', 'color:#6c5450; font-size:11px;');

/* ---------- PROFILE OWNER (data dari js/promosi.js) ---------- */
function renderOwner(){
  const info = typeof OWNER_INFO !== 'undefined' ? OWNER_INFO : null;
  if(!info) return;

  const nameEl = document.getElementById('ownerName');
  const roleEl = document.getElementById('ownerRole');
  const avatarEl = document.getElementById('ownerAvatar');
  const verifiedEl = document.getElementById('ownerVerified');
  const tiktokEl = document.getElementById('ownerTiktok');
  const waEl = document.getElementById('ownerWa');

  if(nameEl) nameEl.textContent = info.name || 'Owner';
  if(roleEl) roleEl.textContent = info.role || '';
  if(avatarEl){
    if(info.avatar){
      avatarEl.style.backgroundImage = `url(${info.avatar})`;
      avatarEl.textContent = '';
    } else {
      avatarEl.textContent = (info.name || '?').trim().charAt(0).toUpperCase();
    }
  }
  if(verifiedEl) verifiedEl.style.display = info.verified ? 'inline-flex' : 'none';
  if(tiktokEl && info.tiktokUrl) tiktokEl.href = info.tiktokUrl;
  if(waEl && info.waChannelUrl) waEl.href = info.waChannelUrl;
}

/* ---------- DAFTAR WEBSITE & APK (data dari js/promosi.js) ---------- */
function renderPromoList(){
  const grid = document.getElementById('promoGrid');
  const list = typeof PROMO_LIST !== 'undefined' ? PROMO_LIST : [];
  if(!grid) return;

  if(!list.length){
    grid.innerHTML = `<div class="promo-empty">Belum ada website/apk yang didaftarkan.</div>`;
    return;
  }

  grid.innerHTML = list.map(item => {
    const isApk = (item.type || '').toLowerCase() === 'apk';
    const badge = isApk ? 'APLIKASI' : 'Website';
    const iconSvg = isApk
      ? `<svg viewBox="0 0 24 24" fill="none"><rect x="6" y="2" width="12" height="20" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M10 18h4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`
      : `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.7-3.8-9s1.3-6.4 3.8-9z" stroke="currentColor" stroke-width="1.7"/></svg>`;

    return `
      <a class="promo-card" href="${escapeHtml(item.url || '#')}" target="_blank" rel="noopener">
        <div class="promo-icon">${iconSvg}</div>
        <div class="promo-body">
          <div class="promo-top">
            <span class="promo-name">${escapeHtml(item.name || 'Tanpa nama')}</span>
            <span class="promo-badge ${isApk ? 'apk' : ''}">${badge}</span>
          </div>
          <div class="promo-desc">${escapeHtml(item.desc || '')}</div>
        </div>
        <svg class="promo-arrow" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </a>
    `;
  }).join('');
}

/* ---------- CARI MODEL (Creator Store: create.roblox.com/store/models) ---------- */
const modelInput = document.getElementById('modelInput');
const modelGoBtn = document.getElementById('modelGoBtn');
const modelStatus = document.getElementById('modelStatus');
const modelGrid = document.getElementById('modelGrid');

async function fetchModelSearch(keyword){
  const params = new URLSearchParams({ limit: '24' });
  if(keyword) params.set('keyword', keyword);
  return await tryFetch(`/api/model-search?${params.toString()}`);
}

async function fetchModelThumbs(ids){
  if(!ids.length) return {};
  let json;
  try{
    json = await tryFetch(`/api/model-thumbs?ids=${ids.join(',')}`);
  }catch(e){
    return {};
  }
  const map = {};
  (json?.data || []).forEach(t => { if(t?.targetId && t?.imageUrl) map[t.targetId] = t.imageUrl; });
  return map;
}

function modelCard(item, thumbUrl){
  const name = item.name || 'Tanpa nama';
  const slug = slugify(name);
  const link = `https://create.roblox.com/store/asset/${item.id}/${slug}`;
  const thumbInner = thumbUrl
    ? `<img src="${thumbUrl}" alt="${escapeHtml(name)}" loading="lazy">`
    : `<svg viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M4 15l4.5-4.5L12 14l3-3 5 5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  return `
    <div class="model-card">
      <div class="model-thumb">${thumbInner}</div>
      <div class="model-body">
        <div class="model-name">${escapeHtml(name)}</div>
        <div class="model-id">ID ${item.id}</div>
        <a class="model-open" href="${link}" target="_blank" rel="noopener">Buka</a>
      </div>
    </div>
  `;
}

async function searchModels(keyword){
  terminalLog('info', keyword ? `Mulai cari model dengan kata kunci "${keyword}"...` : 'Mulai load daftar model populer...');
  modelGoBtn.disabled = true;
  modelGoBtn.classList.add('loading');
  modelStatus.className = 'model-status';
  modelStatus.textContent = keyword ? 'Mencari model...' : 'Memuat model populer...';
  modelGrid.innerHTML = '';

  try{
    const result = await fetchModelSearch(keyword);
    const items = result?.data || [];

    if(!items.length){
      modelStatus.className = 'model-status err';
      modelStatus.textContent = keyword ? `Tidak ada model ditemukan untuk "${keyword}".` : 'Model tidak ditemukan.';
      terminalLog('warn', keyword ? `Model tidak ditemukan untuk "${keyword}".` : 'Model populer tidak ditemukan.');
      return;
    }

    const ids = items.map(i => i.id).filter(Boolean);
    const thumbs = await fetchModelThumbs(ids);

    modelStatus.className = 'model-status ok';
    modelStatus.textContent = keyword
      ? `Ditemukan ${items.length} model untuk "${keyword}".`
      : `Menampilkan ${items.length} model populer.`;
    modelGrid.innerHTML = items.map(item => modelCard(item, thumbs[item.id])).join('');
    terminalLog('info', `Berhasil ambil ${items.length} model dari Creator Store.`);
  }catch(e){
    modelStatus.className = 'model-status err';
    modelStatus.textContent = 'Gagal ambil data dari Creator Store. Coba lagi sebentar lagi.';
    terminalLog('error', `Gagal fetch Creator Store: ${e.message}`);
  }finally{
    modelGoBtn.disabled = false;
    modelGoBtn.classList.remove('loading');
  }
}

function runModelSearch(){
  const keyword = (modelInput.value || '').trim();
  searchModels(keyword);
}

modelGoBtn?.addEventListener('click', runModelSearch);
modelInput?.addEventListener('keydown', e => { if(e.key === 'Enter') runModelSearch(); });

if(modelGrid) searchModels(''); // langsung tampilkan model populer begitu halaman dibuka

/* ---------- LOG PROSES KERJA (data dari js/promosi.js) ---------- */
function renderLogList(){
  const wrap = document.getElementById('logList');
  const list = typeof LOG_LIST !== 'undefined' ? LOG_LIST : [];
  if(!wrap) return;

  if(!list.length){
    wrap.innerHTML = `<div class="log-empty">Belum ada log proses kerja.</div>`;
    return;
  }

  wrap.innerHTML = list.map(item => `
    <div class="log-item">
      <span class="log-dot"></span>
      <div class="log-body">
        <div class="log-date">${escapeHtml(item.date || '')}</div>
        <div class="log-title">${escapeHtml(item.title || '')}</div>
        <div class="log-desc">${escapeHtml(item.desc || '')}</div>
      </div>
    </div>
  `).join('');
}

renderOwner();
renderPromoList();
renderLogList();
