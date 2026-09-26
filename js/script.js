/* ---------- NAV: highlight Home/Info sesuai scroll ---------- */
const navLinks = document.querySelectorAll('.nav-link');
const sections = ['home', 'info'].map(id => document.getElementById(id));

function setActiveNav(id){
  navLinks.forEach(l => l.classList.toggle('active', l.dataset.nav === id));
}
navLinks.forEach(link => {
  link.addEventListener('click', () => setActiveNav(link.dataset.nav));
});
const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting) setActiveNav(entry.target.id);
  });
}, { rootMargin: '-40% 0px -55% 0px' });
sections.forEach(sec => sec && navObserver.observe(sec));

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
  const direct = `https://economy.roblox.com/v2/assets/${id}/details`;
  try{
    return await tryFetch(direct);
  }catch(e){
    const proxied = `https://api.allorigins.win/raw?url=${encodeURIComponent(direct)}`;
    return await tryFetch(proxied);
  }
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
    return;
  }

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
  }catch(e){
    setStage(-1, 1);
    showConsoleError(`Tidak bisa menemukan aset dengan ID ${id}. Kemungkinan sudah dihapus, privat, atau API Roblox sedang membatasi permintaan.`);
  }finally{
    goBtn.disabled = false;
    goBtn.classList.remove('loading');
  }
}

goBtn.addEventListener('click', runSearch);
input.addEventListener('keydown', e => { if(e.key === 'Enter') runSearch(); });
