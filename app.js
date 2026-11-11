/* उत्तर प्रदेश ग्राम पंचायत अधिकारी संघ — web app (TechGaon AI Services)
   Plain JS, no build. Data: Firestore (project petpyaar-a3ea6), collections prefixed "gpa".
   On localhost / ?local=1 everything is kept in localStorage so the site can be tried offline. */

const FB = {
  apiKey: 'AIzaSyCTemhSPOGUWqESTBu3ebzfQZGJv2XyMWg', authDomain: 'petpyaar-a3ea6.firebaseapp.com', projectId: 'petpyaar-a3ea6',
  storageBucket: 'petpyaar-a3ea6.firebasestorage.app', messagingSenderId: '938080790202', appId: '1:938080790202:web:0da609eac45f9d54bf0483',
};
const FBV = '12.4.0';
const LOCAL = /^(localhost|127\.0\.0\.1|)$/.test(location.hostname) || /[?&]local=1/.test(location.search);
const OTP = '1234';
const FEE = 600;
const DEF = { // first-run defaults (can be changed from the state login)
  state_president: { name: 'डॉ. प्रदीप सिंह', nameEn: 'Dr. Pradeep Singh', mobile: '9415892666',
    msg: 'प्रदेश के सभी ग्राम पंचायत अधिकारी साथियों को सादर नमस्कार। संघ का एकमात्र लक्ष्य है — हर साथी की समस्या का समाधान और संवर्ग की न्यायोचित माँगों को शासन तक मज़बूती से पहुँचाना। शैक्षिक अर्हता, वेतनमान, पदोन्नति और कार्य-सुविधाओं से जुड़ी हमारी माँगों पर संघ निरंतर संघर्षरत है। आप सब एकजुट रहें, संगठन से जुड़े रहें — आपकी एकता ही हमारी शक्ति है।',
    msgEn: 'Warm greetings to all Gram Panchayat Adhikari colleagues of the state. The Sangh has one goal — to resolve every colleague’s problems and to take the just demands of our cadre firmly to the Government. We are working continuously on our demands on educational qualification, pay scale, promotion and working facilities. Stay united and stay connected with the organisation — your unity is our strength.' },
  state_secretary: { name: 'नागेंद्र प्रताप कुशवाहा', nameEn: 'Nagendra Pratap Kushwaha', mobile: '' },
  state_treasurer: { name: '', mobile: '' },
  dp_BARABANKI: { name: 'अभय शुक्ला', nameEn: 'Abhay Shukla', mobile: '9415213754' },
};
const DEMO_GPA = { mobile: '9129203268', name: 'डेमो ग्राम पंचायत अधिकारी', father: '', gender: 'M', district: 'BARABANKI', fixedOtp: true };
const DISTRICTS = ['AGRA', 'ALIGARH', 'AMBEDKAR NAGAR', 'AMETHI', 'AMROHA', 'AURAIYA', 'AYODHYA', 'AZAMGARH', 'BAGHPAT', 'BAHRAICH', 'BALLIA', 'BALRAMPUR', 'BANDA', 'BARABANKI', 'BAREILLY', 'BASTI', 'BHADOHI', 'BIJNOR', 'BUDAUN', 'BULANDSHAHR', 'CHANDAULI', 'CHITRAKOOT', 'DEORIA', 'ETAH', 'ETAWAH', 'FARRUKHABAD', 'FATEHPUR', 'FIROZABAD', 'GAUTAM BUDDHA NAGAR', 'GHAZIABAD', 'GHAZIPUR', 'GONDA', 'GORAKHPUR', 'HAMIRPUR', 'HAPUR', 'HARDOI', 'HATHRAS', 'JALAUN', 'JAUNPUR', 'JHANSI', 'KANNAUJ', 'KANPUR DEHAT', 'KANPUR NAGAR', 'KASGANJ', 'KAUSHAMBI', 'KUSHINAGAR', 'LAKHIMPUR KHERI', 'LALITPUR', 'LUCKNOW', 'MAHARAJGANJ', 'MAHOBA', 'MAINPURI', 'MATHURA', 'MAU', 'MEERUT', 'MIRZAPUR', 'MORADABAD', 'MUZAFFARNAGAR', 'PILIBHIT', 'PRATAPGARH', 'PRAYAGRAJ', 'RAEBARELI', 'RAMPUR', 'SAHARANPUR', 'SAMBHAL', 'SANT KABIR NAGAR', 'SHAHJAHANPUR', 'SHAMLI', 'SHRAVASTI', 'SIDDHARTHNAGAR', 'SITAPUR', 'SONBHADRA', 'SULTANPUR', 'UNNAO', 'VARANASI'];
const STATIC_GALLERY = Array.from({ length: 11 }, (_, i) => `img/g${i + 1}.jpg`);

/* ---------- tiny helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ls = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }, del(k) { try { localStorage.removeItem(k); } catch {} } };
let LANG = ls.get('gpa.lang', 'hi');
const L = (hi, en) => (LANG === 'en' ? (en ?? hi) : hi);
const rupee = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
const fdate = (ms) => (ms ? new Date(ms).toLocaleDateString(LANG === 'en' ? 'en-IN' : 'hi-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
function toast(msg, kind = '') { const d = document.createElement('div'); d.className = kind; d.textContent = msg; $('#toast').append(d); setTimeout(() => d.remove(), 3200); }
function modal(html, cls = 'box') { $('#modal').innerHTML = `<button class="close" data-close>✕</button><div class="${cls}">${html}</div>`; return $('#modal > div'); }
function closeModal() { $('#modal').innerHTML = ''; }
document.addEventListener('click', (e) => { if (e.target.closest('[data-close]') || e.target.id === 'modal') closeModal(); });
const distLabel = (d) => `${d} ${L('जिलाध्यक्ष', 'District President')}`;
const POSTS = { state_president: ['प्रदेश अध्यक्ष', 'State President'], state_secretary: ['प्रदेश महामंत्री', 'State General Secretary'], state_treasurer: ['प्रदेश कोषाध्यक्ष', 'State Treasurer'] };
const postLabel = (key) => (POSTS[key] ? L(...POSTS[key]) : distLabel(key.replace(/^dp_/, '').replace(/_/g, ' ')));
const dpKey = (d) => 'dp_' + d.replace(/ /g, '_');
const initials = (n) => (nameCore(n || '?').slice(0, 1) || '?');

/* ---------- name → password rule ---------- */
const HON = /^(श्रीमती|श्रीमति|श्री|सुश्री|कुमारी|कु0|कु|डॉ0|डॉ|डा0|डा|स्व0|स्व|mrs|mr|ms|miss|smt|shrimati|shrimti|sushri|shri|sri|shree|km|kumari|ku|dr|late)(?:[\s.\-:,०0]+|$)/i;
function nameCore(name) { let s = String(name || '').normalize('NFC').trim(); for (let i = 0; i < 4; i++) { const m = s.match(HON); if (!m || m[0].length >= s.length) break; s = s.slice(m[0].length).trim(); } return s; }
function nameKey(name) { return nameCore(name).replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase(); }
const isEnglishName = (n) => /^[A-Za-z][A-Za-z .'\-]*$/.test(String(n || '').trim());
const passFor = (m) => (m.fixedOtp ? OTP : nameKey(m.name) + String(m.mobile).slice(-4));
const norm = (x) => String(x).replace(/\s/g, '').toUpperCase();
const passOk = (typed, m) => norm(typed) === norm(passFor(m));

/* ---------- data store ---------- */
let fs = null, fauth = null, F = null, A = null;
async function fbInit() {
  if (LOCAL || fs) return;
  const [app, fsm, am] = await Promise.all([
    import(`https://www.gstatic.com/firebasejs/${FBV}/firebase-app.js`),
    import(`https://www.gstatic.com/firebasejs/${FBV}/firebase-firestore.js`),
    import(`https://www.gstatic.com/firebasejs/${FBV}/firebase-auth.js`),
  ]);
  const a = app.initializeApp(FB, 'gpasangh'); F = fsm; A = am; fs = fsm.getFirestore(a); fauth = am.getAuth(a);
  await new Promise((r) => { const un = am.onAuthStateChanged(fauth, () => { un(); r(); }); });
}
const lk = (c) => 'gpa.db.' + c;
const db = {
  async get(col, id) {
    if (LOCAL) return (ls.get(lk(col), {})[id]) || null;
    const s = await F.getDoc(F.doc(fs, col, id)); return s.exists() ? { id: s.id, ...s.data() } : null;
  },
  async list(col, where = {}) {
    if (LOCAL) return Object.entries(ls.get(lk(col), {})).map(([id, v]) => ({ id, ...v })).filter((r) => Object.entries(where).every(([k, v]) => r[k] === v));
    const cs = Object.entries(where).map(([k, v]) => F.where(k, '==', v));
    const s = await F.getDocs(cs.length ? F.query(F.collection(fs, col), ...cs) : F.collection(fs, col)); return s.docs.map((d) => ({ id: d.id, ...d.data() }));
  },
  async set(col, id, data, merge = false) {
    if (LOCAL) { const all = ls.get(lk(col), {}); all[id] = merge ? { ...(all[id] || {}), ...data } : data; ls.set(lk(col), all); return; }
    await F.setDoc(F.doc(fs, col, id), data, merge ? { merge: true } : {});
  },
  async del(col, id) {
    if (LOCAL) { const all = ls.get(lk(col), {}); delete all[id]; ls.set(lk(col), all); return; }
    await F.deleteDoc(F.doc(fs, col, id));
  },
};
const authEmail = (m) => `91${m}@gpasangh.techgaon.in`;
const authPass = (m) => `GPA-${m}-up26`;
async function signIn(mobile) {
  if (LOCAL) return;
  if (fauth.currentUser && fauth.currentUser.email === authEmail(mobile)) return;
  try { await A.signInWithEmailAndPassword(fauth, authEmail(mobile), authPass(mobile)); } catch (e) {
    if (!/user-not-found|invalid-credential|invalid-login/.test(e.code || '')) throw e;
    await A.createUserWithEmailAndPassword(fauth, authEmail(mobile), authPass(mobile));
  }
}
async function signOutAll() { if (!LOCAL && fauth) { try { await A.signOut(fauth); } catch {} } }

/* ---------- state ---------- */
let S = ls.get('gpa.session', null);          // {type:'gpa'|'officer', mobile, key, district, name, gender}
let CFG = {}, OFF = {};                       // public config + officers map
const isState = () => S && S.type === 'officer' && S.key.startsWith('state_');
const isDp = () => S && S.type === 'officer' && S.key.startsWith('dp_');
async function loadPublic() {
  try {
    const [cfg, offs] = await Promise.all([db.get('gpaConfig', 'main'), db.list('gpaOfficers')]);
    CFG = cfg || {}; OFF = {}; offs.forEach((o) => (OFF[o.id] = o));
  } catch (e) { console.warn('public load', e); }
  for (const k in DEF) OFF[k] = OFF[k] ? { ...DEF[k], ...Object.fromEntries(Object.entries(OFF[k]).filter(([, v]) => v !== '' && v != null)) } : { ...DEF[k], id: k, _default: true };
}
const offName = (key) => { const o = OFF[key]; if (!o) return ''; return LANG === 'en' ? (o.nameEn || o.name || '') : (o.name || o.nameEn || ''); };

/* ---------- files, images, progress ---------- */
function pick(accept, capture) {
  return new Promise((res) => {
    const i = document.createElement('input'); i.type = 'file'; i.accept = accept; if (capture) i.capture = 'environment';
    i.onchange = () => res(i.files[0] || null); i.click();
  });
}
const readAs = (file, how) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r[how](file); });
async function compressImage(file, maxW = 1100, maxLen = 240000) {
  const url = typeof file === 'string' ? file : await readAs(file, 'readAsDataURL');
  const img = await new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = url; });
  let w = Math.min(maxW, img.width), q = 0.8, out = '';
  for (let i = 0; i < 7; i++) {
    const c = document.createElement('canvas'); c.width = w; c.height = Math.round(img.height * w / img.width);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); out = c.toDataURL('image/jpeg', q);
    if (out.length <= maxLen) break; if (q > 0.5) q -= 0.12; else w = Math.round(w * 0.8);
  }
  return out;
}
/* progress widget: returns {set(pct), done()} */
function progress(host, blue = false) {
  host.innerHTML = `<div class="prog ${blue ? 'blue' : ''}"><div class="track"><div class="bar"></div></div><div class="lbl"><span class="what">${L('अपलोड हो रहा है…', 'Uploading…')}</span><span class="pct">0%</span></div></div>`;
  const bar = $('.bar', host), pct = $('.pct', host), what = $('.what', host);
  return {
    set(p) { p = Math.max(0, Math.min(100, Math.round(p))); bar.style.width = p + '%'; pct.textContent = p + '%'; },
    done(msg) { bar.style.width = '100%'; pct.innerHTML = `100% <span class="tick ${blue ? 'blue' : ''}">✓</span>`; what.textContent = msg || L('अपलोड पूरा हुआ', 'Upload complete'); },
    fail(msg) { what.textContent = msg; what.style.color = 'var(--bad)'; },
  };
}
async function animateTo(pr, from, to, ms = 350) { const n = 6; for (let i = 1; i <= n; i++) { pr.set(from + (to - from) * i / n); await sleep(ms / n); } }
/* big files (pdf / images) → chunks in Firestore */
const CHUNK = 700000;
async function saveFileDoc(meta, dataUrl, pr) {
  const id = uid(); const n = Math.ceil(dataUrl.length / CHUNK);
  for (let i = 0; i < n; i++) {
    await db.set('gpaDocChunks', `${id}_${i}`, { docId: id, n: i, district: meta.district, data: dataUrl.slice(i * CHUNK, (i + 1) * CHUNK) });
    pr.set(30 + 65 * (i + 1) / n);
  }
  await db.set('gpaDocs', id, { ...meta, chunks: n, size: dataUrl.length, createdMs: Date.now() });
  return id;
}
async function openFileDoc(d) {
  toast(L('फ़ाइल खुल रही है…', 'Opening file…'));
  const parts = []; for (let i = 0; i < d.chunks; i++) { const c = await db.get('gpaDocChunks', `${d.id}_${i}`); parts.push(c ? c.data : ''); }
  const url = parts.join('');
  if (/^data:image/.test(url)) return void modal(`<img class="imgview" src="${url}">`, 'imgwrap');
  const blob = await (await fetch(url)).blob(); const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.target = '_blank'; a.download = d.fileName || (d.title + '.pdf'); a.click();
}
async function loadScript(src) { if ($(`script[src="${src}"]`)) return; await new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.append(s); }); }

/* ---------- UPI / QR ---------- */
const upiLink = (u, amount, note) => `upi://pay?pa=${encodeURIComponent(u.upiId)}&pn=${encodeURIComponent(u.upiName || 'GPA Sangh')}${amount ? `&am=${amount}` : ''}&cu=INR&tn=${encodeURIComponent(note || '')}`;
async function qrDataUrl(text) {
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js');
  const q = window.qrcode(0, 'M'); q.addData(text); q.make(); return q.createDataURL(8, 16);
}
async function decodeQr(dataUrl) {
  try {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jsQR/1.4.0/jsQR.min.js');
    const img = await new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = dataUrl; });
    const c = document.createElement('canvas'); const sc = Math.min(1, 1000 / img.width); c.width = img.width * sc; c.height = img.height * sc;
    const x = c.getContext('2d'); x.drawImage(img, 0, 0, c.width, c.height); const d = x.getImageData(0, 0, c.width, c.height);
    const r = window.jsQR(d.data, c.width, c.height); if (!r) return null;
    const m = r.data.match(/[?&]pa=([^&]+)/i); const pn = r.data.match(/[?&]pn=([^&]+)/i);
    return m ? { upiId: decodeURIComponent(m[1]), upiName: pn ? decodeURIComponent(pn[1].replace(/\+/g, ' ')) : '' } : null;
  } catch { return null; }
}
const hasUpi = (u) => !!(u && (u.upiId || u.upiQr));
async function qrFor(u, amount, note) { return u.upiQr || (u.upiId ? await qrDataUrl(upiLink(u, amount, note)) : ''); }
/* card image the member downloads: QR + amount + what it is for */
async function qrCard(u, amount, title) {
  const qr = await qrFor(u, amount, title); if (!qr) return '';
  const img = await new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.src = qr; });
  const W = 900, H = 1280, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); x.fillStyle = '#7a1420'; x.fillRect(0, 0, W, 150);
  x.textAlign = 'center'; x.fillStyle = '#fff'; x.font = '700 40px "Noto Sans Devanagari", sans-serif'; x.fillText('उ.प्र. ग्राम पंचायत अधिकारी संघ', W / 2, 92);
  const s = Math.min(700 / img.width, 700 / img.height); const w = img.width * s, h = img.height * s; x.drawImage(img, (W - w) / 2, 190, w, h);
  let y = 190 + h + 70; x.fillStyle = '#23161a'; x.font = '800 64px sans-serif'; x.fillText('₹' + amount, W / 2, y);
  y += 60; x.font = '600 34px "Noto Sans Devanagari", sans-serif'; x.fillText(title.slice(0, 44), W / 2, y);
  if (u.upiId) { y += 54; x.font = '500 30px sans-serif'; x.fillStyle = '#6f5d61'; x.fillText('UPI: ' + u.upiId, W / 2, y); }
  y += 70; x.fillStyle = '#17924f'; x.font = '600 28px "Noto Sans Devanagari", sans-serif'; x.fillText('भुगतान के बाद स्क्रीनशॉट वेबसाइट पर अपलोड करें', W / 2, y);
  return c.toDataURL('image/jpeg', 0.92);
}
function download(dataUrl, name) { const a = document.createElement('a'); a.href = dataUrl; a.download = name; document.body.append(a); a.click(); a.remove(); }

/* ---------- dues ---------- */
function feePeriods() {
  const d = new Date(); const y = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
  return [
    { id: `F-${y}-H1`, kind: 'district', amount: (CFG.fee || FEE), title: L(`सदस्यता शुल्क: अप्रैल – सितंबर ${y}`, `Membership fee: April – September ${y}`) },
    { id: `F-${y}-H2`, kind: 'district', amount: (CFG.fee || FEE), title: L(`सदस्यता शुल्क: अक्टूबर ${y} – मार्च ${y + 1}`, `Membership fee: October ${y} – March ${y + 1}`) },
  ];
}
const payId = (mobile, levyId) => `${mobile}_${levyId}`;
const stBadge = (p) => !p ? `<span class="badge b-pend">${L('लंबित', 'Pending')}</span>`
  : p.status === 'verified' ? `<span class="badge b-ok">✓ ${L('सत्यापित', 'Verified')}</span>`
  : p.status === 'rejected' ? `<span class="badge b-rej">${L('अस्वीकृत', 'Rejected')}</span>`
  : `<span class="badge b-claim">${L('जाँच में', 'Under review')}</span>`;

/* ================= LAYOUT ================= */
const NAV = [['home', 'होम', 'Home'], ['about', 'संघ परिचय', 'About'], ['officers', 'पदाधिकारी', 'Office Bearers'], ['districts', 'जिलाध्यक्ष', 'District Presidents'], ['gallery', 'फ़ोटो गैलरी', 'Photo Gallery'], ['contact', 'संपर्क', 'Contact']];
function route() { return (location.hash.replace(/^#\/?/, '') || 'home').split('/')[0]; }
function shell(inner) {
  const r = route();
  return `
  <div class="strip"><div class="wrap"><span>${L('पंजीकृत कर्मचारी संगठन · उत्तर प्रदेश', 'Registered employees’ organisation · Uttar Pradesh')}</span>
    <span class="lang"><button data-lang="hi" class="${LANG === 'hi' ? 'on' : ''}">हिन्दी</button><button data-lang="en" class="${LANG === 'en' ? 'on' : ''}">English</button></span></div></div>
  <header class="top"><div class="wrap">
    <a class="brand" href="#home"><img src="img/logo.svg" alt=""><span><b>${L('उत्तर प्रदेश ग्राम पंचायत अधिकारी संघ', 'Uttar Pradesh Gram Panchayat Adhikari Sangh')}</b><small>${L('संगठन · सेवा · सम्मान', 'Unity · Service · Dignity')}</small></span></a>
    <button class="menu-btn" data-menu aria-label="menu">☰</button></div>
    <nav class="main" id="nav"><div class="wrap">${NAV.map(([k, hi, en]) => `<a href="#${k}" class="${r === k ? 'on' : ''}">${L(hi, en)}</a>`).join('')}
      <a class="cta ${r === 'login' || r === 'panel' ? 'on' : ''}" href="#${S ? 'panel' : 'login'}">${S ? L('मेरा खाता', 'My Account') : L('लॉग इन', 'Log in')}</a></div></nav>
  </header>
  ${S ? `<div class="userbar"><div class="wrap"><span>👤 <b>${esc(S.name || S.mobile)}</b> · ${esc(S.type === 'gpa' ? L('ग्राम पंचायत अधिकारी', 'Gram Panchayat Adhikari') : postLabel(S.key))}</span><button class="btn sm ghost" data-logout>${L('लॉग आउट', 'Log out')}</button></div></div>` : ''}
  <main>${inner}</main>
  <footer class="site"><div class="wrap"><b>${L('उत्तर प्रदेश ग्राम पंचायत अधिकारी संघ', 'Uttar Pradesh Gram Panchayat Adhikari Sangh')}</b><br>
    ${L('वेबसाइट निर्माण', 'Website by')}: <a href="https://techgaon.in" target="_blank" rel="noopener">TechGaon AI Services</a> · contact@techgaon.in</div></footer>`;
}
let slideTimer = null;
async function render() {
  clearInterval(slideTimer);
  document.documentElement.lang = LANG;
  const r = route(); const app = $('#app');
  const views = { home: vHome, about: vAbout, officers: vOfficers, districts: vDistricts, gallery: vGallery, contact: vContact, login: vLogin, panel: vPanel };
  if (r === 'panel' && !S) { location.hash = '#login'; return; }
  if (r === 'login' && S) { location.hash = '#panel'; return; }
  const v = views[r] || vHome;
  app.innerHTML = shell(await v());
  if (v.after) await v.after();
  window.scrollTo(0, 0);
}
document.addEventListener('click', async (e) => {
  const t = e.target;
  if (t.closest('[data-menu]')) $('#nav').classList.toggle('open');
  const lg = t.closest('[data-lang]'); if (lg) { LANG = lg.dataset.lang; ls.set('gpa.lang', LANG); render(); }
  if (t.closest('[data-logout]')) { if (confirm(L('क्या आप लॉग आउट करना चाहते हैं?', 'Do you want to log out?'))) { S = null; ls.del('gpa.session'); await signOutAll(); location.hash = '#home'; render(); } }
  const im = t.closest('[data-img]'); if (im) { e.preventDefault(); modal(`<img class="imgview" src="${im.dataset.img}">`, 'imgwrap'); }
});
window.addEventListener('hashchange', render);

/* ================= PUBLIC PAGES ================= */
function avatar(o, cls = 'av') { return `<div class="${cls}">${o && o.photo ? `<img src="${o.photo}" alt="">` : esc(initials(o && (o.name || o.nameEn)))}</div>`; }
function quoteSlides() {
  const ph = L('संदेश शीघ्र प्रकाशित होगा।', 'Message will be published soon.');
  return ['state_president', 'state_secretary'].map((k) => ({ o: OFF[k] || {}, key: k, text: (LANG === 'en' ? (OFF[k]?.msgEn || OFF[k]?.msg) : (OFF[k]?.msg || OFF[k]?.msgEn)) || ph }));
}
async function vHome() {
  let extra = []; try { extra = (await db.list('gpaGallery')).sort((a, b) => b.createdMs - a.createdMs).map((g) => g.img); } catch {}
  const pics = [...extra, ...STATIC_GALLERY].slice(0, 8);
  const sl = quoteSlides();
  const dps = DISTRICTS.filter((d) => OFF[dpKey(d)] && OFF[dpKey(d)].name).length;
  return `
  <div class="hero"><div class="wrap"><span class="tag">${L('स्थापना से संगठित · सदैव समर्पित', 'United · Committed')}</span>
    <h1>${L('उत्तर प्रदेश ग्राम पंचायत अधिकारी संघ', 'Uttar Pradesh Gram Panchayat Adhikari Sangh')}</h1>
    <p>${L('प्रदेश के ग्राम पंचायत अधिकारियों का अपना संगठन', 'The organisation of Gram Panchayat Adhikaris of the state')}</p></div></div>
  <section><div class="wrap">
    <div class="quotes"><div class="qtrack" id="qtrack">${sl.map((s) => `
      <div class="qslide">${avatar(s.o, 'qphoto')}<div><div class="qtext">${esc(s.text)}</div>
        <div class="qwho"><b>${esc(offName(s.key) || '—')}</b><span>${postLabel(s.key)}</span></div></div></div>`).join('')}</div>
      <div class="qdots" id="qdots">${sl.map((_, i) => `<i class="${i ? '' : 'on'}" data-i="${i}"></i>`).join('')}</div></div>
    <div class="stats"><div class="stat"><b>75</b><span>${L('जनपद', 'Districts')}</span></div><div class="stat"><b>${dps}</b><span>${L('जिलाध्यक्ष दर्ज', 'District presidents listed')}</span></div><div class="stat"><b>₹${CFG.fee || FEE}</b><span>${L('अर्धवार्षिक सदस्यता शुल्क', 'Half-yearly membership fee')}</span></div></div>
  </div></section>
  <section><div class="wrap"><h2 class="sec">${L('सदस्य लॉग इन', 'Member Login')}</h2>
    <div class="grid g2">
      <div class="card"><b>${L('ग्राम पंचायत अधिकारी', 'Gram Panchayat Adhikari')}</b><p class="muted small">${L('अपना सदस्यता शुल्क और चंदा देखें, QR से भुगतान करें और स्क्रीनशॉट अपलोड करें।', 'See your membership fee and contributions, pay by QR and upload the screenshot.')}</p><a class="btn" href="#login">${L('लॉग इन करें', 'Log in')}</a></div>
      <div class="card"><b>${L('पदाधिकारी (प्रदेश / जिलाध्यक्ष)', 'Office bearers (State / District)')}</b><p class="muted small">${L('सदस्य सूची, शुल्क सत्यापन, संदेश और पत्र/रिपोर्ट।', 'Member list, fee verification, messages and letters/reports.')}</p><a class="btn ghost" href="#login/officer">${L('पदाधिकारी लॉग इन', 'Office bearer login')}</a></div>
    </div></div></section>
  <section><div class="wrap"><h2 class="sec">${L('फ़ोटो गैलरी', 'Photo Gallery')}</h2>
    <div class="gal">${pics.map((p) => `<a href="${p}" data-img="${p}"><img loading="lazy" src="${p}" alt=""></a>`).join('')}</div>
    <p class="center" style="margin-top:14px"><a class="btn ghost" href="#gallery">${L('सभी फ़ोटो देखें', 'View all photos')}</a></p></div></section>`;
}
vHome.after = () => {
  const tr = $('#qtrack'); if (!tr) return; const n = tr.children.length; let i = 0;
  const go = (k) => { i = (k + n) % n; tr.style.transform = `translateX(-${i * 100}%)`; $$('#qdots i').forEach((d, j) => d.classList.toggle('on', j === i)); };
  $('#qdots').onclick = (e) => { if (e.target.dataset.i) go(+e.target.dataset.i); };
  let x0 = null; tr.ontouchstart = (e) => (x0 = e.touches[0].clientX); tr.ontouchend = (e) => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1)); x0 = null; };
  slideTimer = setInterval(() => go(i + 1), 6000);
};
async function vAbout() {
  return `<section><div class="wrap"><h2 class="sec">${L('संघ परिचय', 'About the Sangh')}</h2><div class="card">
    <p>${L('उत्तर प्रदेश ग्राम पंचायत अधिकारी संघ प्रदेश के सभी जनपदों में कार्यरत ग्राम पंचायत अधिकारियों का संगठन है। संघ अपने सदस्यों की सेवा संबंधी समस्याओं, वेतनमान, शैक्षिक अर्हता, पदोन्नति और कार्य-परिस्थितियों से जुड़े विषयों को शासन एवं विभाग के समक्ष रखता है।', 'Uttar Pradesh Gram Panchayat Adhikari Sangh is the organisation of Gram Panchayat Adhikaris working in all districts of the state. It takes up members’ service matters, pay scale, educational qualification, promotion and working conditions with the Government and the Department.')}</p>
    <p>${L('इस वेबसाइट पर सदस्य अपना अर्धवार्षिक सदस्यता शुल्क और प्रदेश द्वारा निर्धारित चंदा देख सकते हैं, QR से भुगतान कर स्क्रीनशॉट अपलोड कर सकते हैं, और जिलाध्यक्ष उसका सत्यापन करते हैं।', 'On this website members can see their half-yearly membership fee and contributions fixed by the state body, pay by QR and upload the screenshot, which the District President verifies.')}</p>
    <div class="kv" style="margin-top:8px"><span>${L('सदस्यता शुल्क', 'Membership fee')}</span><b>${rupee(CFG.fee || FEE)} ${L('अर्धवार्षिक (अप्रैल–सितंबर, अक्टूबर–मार्च)', 'half-yearly (Apr–Sep, Oct–Mar)')}</b></div></div></div></section>`;
}
async function vOfficers() {
  return `<section><div class="wrap"><h2 class="sec">${L('प्रदेश पदाधिकारी', 'State Office Bearers')}</h2><div class="grid g3">
    ${Object.keys(POSTS).map((k) => `<div class="card off">${avatar(OFF[k])}<b>${esc(offName(k) || '—')}</b><span>${postLabel(k)}</span></div>`).join('')}</div></div></section>`;
}
async function vDistricts() {
  return `<section><div class="wrap"><h2 class="sec">${L('जिलाध्यक्ष', 'District Presidents')}</h2>
    <input class="in" id="dq" placeholder="${L('जनपद खोजें…', 'Search district…')}" style="margin-bottom:12px">
    <div class="grid g2" id="dlist">${DISTRICTS.map((d, i) => `<div class="card dist" data-d="${d}"><span class="n">${i + 1}</span><div><b>${distLabel(d)}</b><span>${esc(offName(dpKey(d)) || L('नाम दर्ज नहीं', 'Not listed yet'))}</span></div></div>`).join('')}</div></div></section>`;
}
vDistricts.after = () => { $('#dq').oninput = (e) => { const q = e.target.value.trim().toUpperCase(); $$('#dlist .dist').forEach((c) => (c.style.display = c.dataset.d.includes(q) ? '' : 'none')); }; };
async function vGallery() {
  let extra = []; try { extra = (await db.list('gpaGallery')).sort((a, b) => b.createdMs - a.createdMs); } catch {}
  const pics = [...extra.map((g) => g.img), ...STATIC_GALLERY];
  return `<section><div class="wrap"><h2 class="sec">${L('फ़ोटो गैलरी', 'Photo Gallery')}</h2><div class="gal">${pics.map((p) => `<a href="${p}" data-img="${p}"><img loading="lazy" src="${p}" alt=""></a>`).join('')}</div></div></section>`;
}
async function vContact() {
  return `<section><div class="wrap"><h2 class="sec">${L('संपर्क', 'Contact')}</h2><div class="card">
    <p>${L('संघ से जुड़ी जानकारी के लिए अपने जनपद के जिलाध्यक्ष से संपर्क करें।', 'For information about the Sangh, contact the District President of your district.')}</p>
    <p class="muted small">${L('वेबसाइट से जुड़ी तकनीकी सहायता', 'Technical help for this website')}: TechGaon AI Services · <a href="mailto:contact@techgaon.in">contact@techgaon.in</a></p>
    <a class="btn ghost" href="#districts">${L('जिलाध्यक्ष सूची', 'District Presidents')}</a></div></div></section>`;
}

/* ================= LOGIN ================= */
let loginMode = 'gpa';
async function vLogin() {
  loginMode = location.hash.includes('/officer') ? 'officer' : 'gpa';
  return `<section><div class="wrap" style="max-width:520px"><h2 class="sec">${L('लॉग इन', 'Log in')}</h2><div class="card">
    <div class="seg"><button data-mode="gpa" class="${loginMode === 'gpa' ? 'on' : ''}">${L('ग्राम पंचायत अधिकारी', 'Gram Panchayat Adhikari')}</button><button data-mode="officer" class="${loginMode === 'officer' ? 'on' : ''}">${L('पदाधिकारी', 'Office Bearer')}</button></div>
    <div id="lform"></div></div></div></section>`;
}
vLogin.after = () => {
  $$('[data-mode]').forEach((b) => (b.onclick = () => { loginMode = b.dataset.mode; $$('[data-mode]').forEach((x) => x.classList.toggle('on', x === b)); drawLogin(); }));
  drawLogin();
};
function drawLogin() { loginMode === 'gpa' ? gpaLoginStep1() : officerLogin(); }
function gpaLoginStep1() {
  const h = $('#lform');
  h.innerHTML = `<label class="f">${L('मोबाइल नंबर', 'Mobile number')}</label><input class="in" id="mob" inputmode="numeric" maxlength="10" placeholder="10 ${L('अंक', 'digits')}">
    <div id="lmsg"></div><button class="btn full" id="go" style="margin-top:14px">${L('आगे बढ़ें', 'Continue')}</button>
    <p class="muted small">${L('वही नंबर डालें जो आपके जिलाध्यक्ष ने सदस्य सूची में दर्ज किया है।', 'Enter the number your District President has registered in the member list.')}</p>`;
  $('#mob').oninput = (e) => (e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10));
  $('#go').onclick = async () => {
    const m = $('#mob').value; if (!/^\d{10}$/.test(m)) return void ($('#lmsg').innerHTML = `<div class="err">${L('10 अंकों का सही मोबाइल नंबर डालें।', 'Enter a valid 10-digit mobile number.')}</div>`);
    $('#go').disabled = true;
    try {
      let mem = await db.get('gpaMembers', m); if (!mem && m === DEMO_GPA.mobile) mem = { ...DEMO_GPA };
      if (!mem) { $('#lmsg').innerHTML = `<div class="err">${L('यह नंबर पंजीकृत नहीं है। अपने जिलाध्यक्ष से सदस्य सूची में नाम जुड़वाएँ।', 'This number is not registered. Ask your District President to add you to the member list.')}</div>`; $('#go').disabled = false; return; }
      gpaLoginStep2(mem);
    } catch (e) { console.error(e); $('#lmsg').innerHTML = `<div class="err">${L('जाँच नहीं हो सकी। इंटरनेट देखें और दोबारा कोशिश करें।', 'Could not check. Check the internet and try again.')}</div>`; $('#go').disabled = false; }
  };
}
function gpaLoginStep2(mem) {
  const h = $('#lform'); const g = mem.gender === 'F' ? L('महिला', 'Female') : mem.gender === 'M' ? L('पुरुष', 'Male') : L('अन्य', 'Other');
  h.innerHTML = `<div class="verified"><span class="tick">✓</span> ${L('सत्यापित (Verified)', 'Verified')}</div>
    <div class="kv" style="margin:12px 2px"><span>${L('नाम', 'Name')}</span><b>${esc(mem.name)}</b><span>${L('लिंग', 'Gender')}</span><b>${g}</b><span>${L('मोबाइल', 'Mobile')}</span><b>${esc(mem.mobile)}</b><span>${L('जनपद', 'District')}</span><b>${esc(mem.district)}</b></div>
    <div class="note">${mem.fixedOtp ? L('इस डेमो खाते का पासवर्ड OTP <b>1234</b> है।', 'The password for this demo account is OTP <b>1234</b>.')
      : L('<b>आपका पासवर्ड:</b> आपके नाम के पहले चार अक्षर + मोबाइल नंबर के आख़िरी चार अंक।<br>उदाहरण: नाम RAMESH KUMAR, मोबाइल ••••••4321 → <b>RAME4321</b><br><span class="small">नाम के आगे लगा SHRI / SMT / KM / DR नहीं गिना जाता। अक्षर अंग्रेज़ी में लिखें।</span>',
        '<b>Your password:</b> first four letters of your name + last four digits of your mobile number.<br>Example: name RAMESH KUMAR, mobile ••••••4321 → <b>RAME4321</b><br><span class="small">Shri / Smt / Km / Dr before the name is not counted.</span>')}</div>
    <label class="f">${L('पासवर्ड', 'Password')}</label><input class="in" id="pw" autocomplete="off" autocapitalize="characters" placeholder="${mem.fixedOtp ? '1234' : 'RAME4321'}">
    <div id="lmsg"></div><button class="btn full" id="go" style="margin-top:14px">${L('लॉग इन', 'Log in')}</button>
    <p class="center small"><a href="#" id="back">${L('नंबर बदलें', 'Change number')}</a></p>`;
  $('#back').onclick = (e) => { e.preventDefault(); gpaLoginStep1(); };
  const go = async () => {
    if (!passOk($('#pw').value, mem)) return void ($('#lmsg').innerHTML = `<div class="err">${L('पासवर्ड गलत है।', 'Wrong password.')}</div>`);
    $('#go').disabled = true;
    try {
      await signIn(mem.mobile);
      if (mem.fixedOtp && !(await db.get('gpaMembers', mem.mobile).catch(() => null))) { try { await db.set('gpaMembers', mem.mobile, { ...mem, createdMs: Date.now() }); } catch {} }
      S = { type: 'gpa', mobile: mem.mobile, name: mem.name, gender: mem.gender, district: mem.district }; ls.set('gpa.session', S); location.hash = '#panel';
    } catch (e) { console.error(e); $('#lmsg').innerHTML = `<div class="err">${L('लॉग इन नहीं हो सका। दोबारा कोशिश करें।', 'Could not log in. Try again.')}</div>`; $('#go').disabled = false; }
  };
  $('#go').onclick = go; $('#pw').onkeydown = (e) => e.key === 'Enter' && go(); $('#pw').focus();
}
function officerLogin() {
  const h = $('#lform'); const keys = [...Object.keys(POSTS), ...DISTRICTS.map(dpKey)];
  h.innerHTML = `<label class="f">${L('पद चुनें', 'Select post')}</label><select class="in" id="post">${keys.map((k) => `<option value="${k}">${postLabel(k)}</option>`).join('')}</select>
    <label class="f">${L('मोबाइल नंबर', 'Mobile number')}</label><input class="in" id="mob" inputmode="numeric" maxlength="10" placeholder="10 ${L('अंक', 'digits')}">
    <div id="vbox"></div><div id="otpbox"></div><div id="lmsg"></div><button class="btn full" id="go" style="margin-top:14px">${L('आगे बढ़ें', 'Continue')}</button>`;
  $('#post').value = ls.get('gpa.lastPost', 'state_president');
  $('#mob').oninput = (e) => (e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10));
  let ok = null;
  const reset = () => { ok = null; $('#vbox').innerHTML = ''; $('#otpbox').innerHTML = ''; $('#lmsg').innerHTML = ''; $('#go').textContent = L('आगे बढ़ें', 'Continue'); };
  $('#post').onchange = reset; $('#mob').addEventListener('input', reset);
  $('#go').onclick = async () => {
    const key = $('#post').value, m = $('#mob').value;
    if (!ok) {
      if (!/^\d{10}$/.test(m)) return void ($('#lmsg').innerHTML = `<div class="err">${L('10 अंकों का सही मोबाइल नंबर डालें।', 'Enter a valid 10-digit mobile number.')}</div>`);
      await loadPublic(); const o = OFF[key];
      if (!o || o.mobile !== m) return void ($('#lmsg').innerHTML = `<div class="err">${L('इस पद के लिए यह नंबर दर्ज नहीं है।', 'This number is not registered for this post.')}</div>`);
      ok = o; $('#lmsg').innerHTML = '';
      $('#vbox').innerHTML = `<div class="verified"><span class="tick">✓</span> ${L('सत्यापित', 'Verified')}: ${esc(offName(key) || postLabel(key))}</div>`;
      $('#otpbox').innerHTML = `<label class="f">OTP</label><input class="in" id="otp" inputmode="numeric" maxlength="4" placeholder="••••"><div class="note">${L('परीक्षण अवधि में OTP <b>1234</b> है।', 'During testing the OTP is <b>1234</b>.')}</div>`;
      $('#go').textContent = L('लॉग इन', 'Log in'); $('#otp').focus(); return;
    }
    if ($('#otp').value !== OTP) return void ($('#lmsg').innerHTML = `<div class="err">${L('OTP गलत है।', 'Wrong OTP.')}</div>`);
    $('#go').disabled = true;
    try {
      await signIn(m); ls.set('gpa.lastPost', key);
      S = { type: 'officer', mobile: m, key, name: ok.name || ok.nameEn || postLabel(key), district: key.startsWith('dp_') ? key.slice(3).replace(/_/g, ' ') : '' }; ls.set('gpa.session', S);
      await seedDefaults(); location.hash = '#panel';
    } catch (e) { console.error(e); $('#lmsg').innerHTML = `<div class="err">${L('लॉग इन नहीं हो सका। दोबारा कोशिश करें।', 'Could not log in. Try again.')}</div>`; $('#go').disabled = false; }
  };
}
/* the first state login writes the default officers so that everybody sees them */
async function seedDefaults() {
  if (!isState()) return;
  for (const k in DEF) if (OFF[k] && OFF[k]._default) { const { _default, id, ...o } = OFF[k]; try { await saveOfficer(k, o); } catch (e) { console.warn(e); } }
  await loadPublic();
}
async function saveOfficer(key, o) {
  const prev = OFF[key] && !OFF[key]._default ? OFF[key] : null;
  await db.set('gpaOfficers', key, { ...o, role: key.startsWith('dp_') ? 'dp' : 'state', district: key.startsWith('dp_') ? key.slice(3).replace(/_/g, ' ') : '', updatedMs: Date.now() }, true);
  if (prev && prev.mobile && prev.mobile !== o.mobile && o.mobile !== undefined) { try { await db.del('gpaRoles', prev.mobile); } catch {} }
  if (o.mobile) await db.set('gpaRoles', o.mobile, { role: key.startsWith('dp_') ? 'dp' : 'state', key, district: key.startsWith('dp_') ? key.slice(3).replace(/_/g, ' ') : '' });
}

/* ================= PANELS ================= */
let TAB = null;
async function vPanel() { return `<section><div class="wrap"><div id="panel"><div class="boot"><div class="spin"></div></div></div></div></section>`; }
vPanel.after = async () => {
  try { if (!LOCAL && (!fauth.currentUser || fauth.currentUser.email !== authEmail(S.mobile))) await signIn(S.mobile); } catch (e) { console.warn(e); }
  if (S.type === 'gpa') return gpaPanel();
  const tabs = isState()
    ? [['dues', 'प्रदेश चंदा', 'State contribution'], ['officers', 'पदाधिकारी', 'Office bearers'], ['docs', 'पत्र / रिपोर्ट', 'Letters / reports'], ['msg', 'संदेश', 'Messages'], ['upi', 'UPI / QR', 'UPI / QR'], ['members', 'सदस्य', 'Members'], ['gal', 'गैलरी', 'Gallery']]
    : [['members', 'सदस्य सूची', 'Member list'], ['dues', 'शुल्क / चंदा', 'Fee / contribution'], ['upi', 'UPI / QR', 'UPI / QR'], ['msg', 'संदेश', 'Message'], ['docs', 'पत्र / रिपोर्ट', 'Letter / report']];
  if (!TAB || !tabs.some((t) => t[0] === TAB)) TAB = tabs[0][0];
  $('#panel').innerHTML = `<h2 class="sec">${esc(postLabel(S.key))}</h2><div class="tabs">${tabs.map(([k, hi, en]) => `<button data-tab="${k}" class="${TAB === k ? 'on' : ''}">${L(hi, en)}</button>`).join('')}</div><div id="tab"></div>`;
  $$('[data-tab]').forEach((b) => (b.onclick = () => { TAB = b.dataset.tab; $$('[data-tab]').forEach((x) => x.classList.toggle('on', x === b)); drawTab(); }));
  drawTab();
};
async function drawTab() {
  const host = $('#tab'); host.innerHTML = '<div class="boot" style="min-height:120px"><div class="spin"></div></div>';
  const f = { members: isState() ? tStateMembers : tMembers, dues: isState() ? tStateDues : tDpDues, upi: tUpi, msg: tMsg, docs: isState() ? tStateDocs : tDpDocs, officers: tOfficers, gal: tGallery }[TAB];
  try { await f(host); } catch (e) { console.error(e); host.innerHTML = `<div class="card err">${L('जानकारी नहीं खुल सकी। पेज दोबारा खोलें।', 'Could not load. Reload the page.')}<br><span class="small muted">${esc(e.code || e.message || '')}</span></div>`; }
}
function bannerQuote(m) {
  return `<div class="bq ${m.scope === 'state' ? 'state' : ''}"><span class="mark">“</span><p>${esc(m.text)}</p><footer><span><b>${esc(m.byName)}</b> · ${esc(m.scope === 'state' ? L(...(POSTS[m.byKey] || ['प्रदेश', 'State'])) : distLabel(m.district))}</span><span>${fdate(m.createdMs)}</span></footer></div>`;
}
async function messagesFor(district) {
  const [a, b] = await Promise.all([db.list('gpaMessages', { district }).catch(() => []), district === 'STATE' ? [] : db.list('gpaMessages', { district: 'STATE' }).catch(() => [])]);
  return [...a, ...b].sort((x, y) => y.createdMs - x.createdMs);
}

/* ---------- GPA panel ---------- */
async function gpaPanel() {
  const host = $('#panel');
  await loadPublic();
  const [pays, levies, msgs] = await Promise.all([db.list('gpaPayments', { mobile: S.mobile }).catch(() => []), db.list('gpaLevies').catch(() => []), messagesFor(S.district)]);
  const pm = {}; pays.forEach((p) => (pm[p.levyId] = p));
  const dues = [...feePeriods(), ...levies.filter((l) => l.active !== false).sort((a, b) => b.createdMs - a.createdMs).map((l) => ({ id: l.id, kind: 'state', amount: l.amount, title: l.title, reason: l.reason }))];
  const g = S.gender === 'F' ? L('महिला', 'Female') : S.gender === 'M' ? L('पुरुष', 'Male') : '';
  const pending = dues.filter((d) => !pm[d.id] || pm[d.id].status === 'rejected');
  host.innerHTML = `
    <div class="card" style="margin-bottom:14px"><div class="row sp"><div><b style="font-size:1.15rem">${esc(S.name)}</b><div class="muted small">${g ? g + ' · ' : ''}${esc(S.mobile)} · ${esc(S.district)}</div>
      <div class="small">${L('जिलाध्यक्ष', 'District President')}: <b>${esc(offName(dpKey(S.district)) || '—')}</b></div></div>
      <span class="badge ${pending.length ? 'b-pend' : 'b-ok'}">${pending.length ? L(`${pending.length} भुगतान लंबित`, `${pending.length} payment(s) pending`) : L('कोई बकाया नहीं', 'Nothing pending')}</span></div></div>
    ${msgs.slice(0, 5).map(bannerQuote).join('')}
    <h2 class="sec">${L('सदस्यता शुल्क और चंदा', 'Membership fee and contributions')}</h2>
    <div class="grid">${dues.map((d) => { const p = pm[d.id]; const can = !p || p.status === 'rejected'; return `
      <div class="card"><div class="due"><div><h4>${esc(d.title)}</h4><div class="muted small">${d.kind === 'state' ? L('प्रदेश द्वारा निर्धारित चंदा', 'Contribution fixed by the state body') : L('जनपद का अर्धवार्षिक सदस्यता शुल्क', 'Half-yearly district membership fee')}${d.reason ? ' · ' + esc(d.reason) : ''}</div></div>
        <div class="row"><span class="amt">${rupee(d.amount)}</span>${stBadge(p)}</div></div>
        ${p && p.status === 'rejected' ? `<div class="err">${L('स्क्रीनशॉट अस्वीकृत हुआ। कृपया दोबारा अपलोड करें।', 'Screenshot was rejected. Please upload again.')}</div>` : ''}
        ${can ? `<button class="btn full blue" style="margin-top:10px" data-pay="${d.id}">${L('भुगतान करें', 'Pay now')}</button>` : ''}</div>`; }).join('')}</div>`;
  $$('[data-pay]').forEach((b) => (b.onclick = () => payScreen(dues.find((d) => d.id === b.dataset.pay))));
}
async function payScreen(due) {
  const host = $('#panel'); host.innerHTML = '<div class="boot"><div class="spin"></div></div>';
  await loadPublic();
  const u = due.kind === 'state' ? (CFG.stateUpi || {}) : ((OFF[dpKey(S.district)] || {}).upi || {});
  const back = `<p class="center"><a href="#" id="pback">← ${L('वापस', 'Back')}</a></p>`;
  if (!hasUpi(u)) { host.innerHTML = `<div class="card center"><b>${L('भुगतान का QR अभी उपलब्ध नहीं है', 'Payment QR is not available yet')}</b><p class="muted">${due.kind === 'state' ? L('प्रदेश पदाधिकारी द्वारा UPI / QR जोड़ा जाना बाकी है।', 'The state office bearers have not added UPI / QR yet.') : L('आपके जिलाध्यक्ष द्वारा UPI / QR जोड़ा जाना बाकी है।', 'Your District President has not added UPI / QR yet.')}</p></div>${back}`; $('#pback').onclick = (e) => { e.preventDefault(); gpaPanel(); }; return; }
  const qr = await qrFor(u, due.amount, due.title);
  const imgs = [];
  host.innerHTML = `<div class="card" style="max-width:520px;margin:0 auto">
    <div class="due"><h4>${esc(due.title)}</h4><span class="amt">${rupee(due.amount)}</span></div>
    <div class="note"><b>यह QR डाउनलोड करके पे करें या स्कैन करके पे करें, फिर नीचे स्क्रीनशॉट / फ़ोटो अपलोड करें।</b>${LANG === 'en' ? '<br><span class="small">Download this QR and pay, or scan and pay, then upload the screenshot / photo below.</span>' : ''}</div>
    <div class="qrbox" style="margin-top:12px"><img src="${qr}" alt="QR">${u.upiName ? `<div><b>${esc(u.upiName)}</b></div>` : ''}${u.upiId ? `<div class="muted small">${esc(u.upiId)}</div>` : ''}
      <button class="btn gold" id="dl" style="margin-top:10px">⬇ ${L('QR डाउनलोड करें', 'Download QR')}</button></div>
    <label class="f">${L('भुगतान का स्क्रीनशॉट / फ़ोटो', 'Payment screenshot / photo')}</label>
    <button class="btn ghost full" id="pickss">🖼 ${L('गैलरी से अपलोड करें', 'Upload from gallery')}</button>
    <div id="upprog"></div><div class="thumbs" id="thumbs"></div>
    <div id="pmsg"></div><button class="btn full ok" id="send" style="margin-top:14px" disabled>${L('स्क्रीनशॉट भेजें', 'Submit screenshot')}</button></div>${back}`;
  $('#pback').onclick = (e) => { e.preventDefault(); gpaPanel(); };
  $('#dl').onclick = async () => { const c = await qrCard(u, due.amount, due.title); download(c, `GPA-Sangh-QR-${due.amount}.jpg`); toast(L('QR डाउनलोड हो गया', 'QR downloaded'), 'ok'); };
  const draw = () => { $('#thumbs').innerHTML = imgs.map((s, i) => `<div class="th"><img src="${s}" data-img="${s}"><button class="x" data-rm="${i}">×</button><span class="tick blue">✓</span></div>`).join(''); $('#send').disabled = !imgs.length; $$('[data-rm]').forEach((b) => (b.onclick = () => { imgs.splice(+b.dataset.rm, 1); draw(); })); };
  $('#pickss').onclick = async () => {
    if (imgs.length >= 3) return toast(L('अधिकतम 3 स्क्रीनशॉट', 'Maximum 3 screenshots'));
    const f = await pick('image/*'); if (!f) return;
    const pr = progress($('#upprog'), true); pr.set(8);
    try { await animateTo(pr, 8, 55); const d = await compressImage(f, 1000, 200000); await animateTo(pr, 55, 96); imgs.push(d); pr.done(L('स्क्रीनशॉट जुड़ गया', 'Screenshot added')); draw(); }
    catch { pr.fail(L('फ़ोटो नहीं खुल सकी', 'Could not read the photo')); }
  };
  $('#send').onclick = async () => {
    $('#send').disabled = true; const pr = progress($('#pmsg'), true); pr.set(10);
    try {
      const id = payId(S.mobile, due.id);
      await db.set('gpaProofs', id, { mobile: S.mobile, district: S.district, kind: due.kind, imgs, createdMs: Date.now() }); pr.set(65);
      await db.set('gpaPayments', id, { mobile: S.mobile, name: S.name, district: S.district, levyId: due.id, levyTitle: due.title, kind: due.kind, amount: due.amount, status: 'claimed', proofCount: imgs.length, createdMs: Date.now() });
      pr.done(L('भेज दिया गया', 'Submitted')); toast(L('स्क्रीनशॉट भेज दिया गया। सत्यापन के बाद स्थिति बदल जाएगी।', 'Screenshot submitted. Status will change after verification.'), 'ok');
      await sleep(900); gpaPanel();
    } catch (e) { console.error(e); pr.fail(L('भेजा नहीं जा सका। दोबारा कोशिश करें।', 'Could not submit. Try again.')); $('#send').disabled = false; }
  };
}

/* ---------- District president: members ---------- */
const normGender = (g) => { const s = String(g || '').trim().toLowerCase(); return /^(f|female|महिला|स्त्री|म0|w)/.test(s) ? 'F' : /^(m|male|पुरुष|पु)/.test(s) ? 'M' : ''; };
const guessGender = (name) => (/^(श्रीमती|श्रीमति|सुश्री|कुमारी|कु0|कु\.|smt|mrs|ms|miss|km|kumari)[\s.]/i.test(String(name).trim()) ? 'F' : /^(श्री|shri|sri|mr)[\s.]/i.test(String(name).trim()) ? 'M' : '');
const cleanMobile = (v) => { const d = String(v ?? '').replace(/\D/g, ''); const m = d.length > 10 ? d.slice(-10) : d; return /^[6-9]\d{9}$/.test(m) ? m : ''; };
function rowsFromTable(table) {
  // table: array of arrays. Find the header row, map columns, else guess by content.
  let hi = table.findIndex((r) => r.some((c) => /नाम|name/i.test(String(c))) && r.some((c) => /मो|mob|phone|संपर्क|contact/i.test(String(c))));
  let col = { name: -1, father: -1, gender: -1, mobile: -1 };
  if (hi >= 0) table[hi].forEach((c, i) => { const s = String(c).toLowerCase();
    if (col.mobile < 0 && /मो|mob|phone|संपर्क|contact/.test(s)) col.mobile = i;
    else if (col.father < 0 && /पिता|पति|father|husband|w\/o|s\/o|d\/o/.test(s)) col.father = i;
    else if (col.gender < 0 && /लिंग|gender|sex/.test(s)) col.gender = i;
    else if (col.name < 0 && /नाम|name/.test(s)) col.name = i; });
  const out = [];
  table.slice(hi + 1).forEach((r) => {
    const cells = r.map((c) => String(c ?? '').trim());
    let mi = col.mobile >= 0 && cleanMobile(cells[col.mobile]) ? col.mobile : cells.findIndex((c) => cleanMobile(c) && c.replace(/\D/g, '').length <= 12);
    if (mi < 0) return;
    const texts = cells.map((c, i) => ({ c, i })).filter((x) => x.i !== mi && /\p{L}{2,}/u.test(x.c) && !normGender(x.c));
    const name = col.name >= 0 ? cells[col.name] : (texts[0] || {}).c; if (!name) return;
    const father = col.father >= 0 ? cells[col.father] : ((texts.find((x) => x.c !== name) || {}).c || '');
    const gcell = col.gender >= 0 ? cells[col.gender] : (cells.find((c) => c.length <= 8 && normGender(c)) || '');
    out.push({ name, father, gender: normGender(gcell) || guessGender(name), mobile: cleanMobile(cells[mi]) });
  });
  return out;
}
async function parseExcel(file) {
  await loadScript('https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js');
  const wb = window.XLSX.read(await readAs(file, 'readAsArrayBuffer'), { type: 'array' });
  let rows = []; wb.SheetNames.forEach((n) => { rows = rows.concat(rowsFromTable(window.XLSX.utils.sheet_to_json(wb.Sheets[n], { header: 1, raw: false, defval: '' }))); });
  return rows;
}
async function parsePdf(file) {
  const pdfjs = await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.7.76/pdf.min.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.7.76/pdf.worker.min.mjs';
  const pdf = await pdfjs.getDocument({ data: await readAs(file, 'readAsArrayBuffer') }).promise; const table = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const tc = await (await pdf.getPage(p)).getTextContent(); const lines = {};
    tc.items.forEach((it) => { if (!it.str.trim()) return; const y = Math.round(it.transform[5] / 4); (lines[y] = lines[y] || []).push({ x: it.transform[4], s: it.str, w: it.width }); });
    Object.keys(lines).sort((a, b) => b - a).forEach((y) => {
      const its = lines[y].sort((a, b) => a.x - b.x); const cells = []; let cur = '', end = null;
      its.forEach((it) => { if (end != null && it.x - end > 9) { cells.push(cur.trim()); cur = ''; } cur += (cur && !cur.endsWith(' ') ? ' ' : '') + it.s; end = it.x + it.w; });
      if (cur.trim()) cells.push(cur.trim()); table.push(cells);
    });
  }
  return rowsFromTable(table);
}
async function parseImageAI(dataUrl) {
  if (LOCAL) throw new Error('no ai in local mode');
  const [app, ai] = await Promise.all([import(`https://www.gstatic.com/firebasejs/${FBV}/firebase-app.js`), import(`https://www.gstatic.com/firebasejs/${FBV}/firebase-ai.js`)]);
  const model = ai.getGenerativeModel(ai.getAI(app.getApp('gpasangh'), { backend: new ai.GoogleAIBackend() }), { model: 'gemini-2.5-flash', generationConfig: { responseMimeType: 'application/json' } });
  const [, mime, b64] = dataUrl.match(/^data:(.*?);base64,(.*)$/);
  const r = await model.generateContent([{ inlineData: { mimeType: mime, data: b64 } }, 'This is a list of employees. Return a JSON array, one object per person, with keys: name, father (father or husband name, "" if absent), gender ("M", "F" or ""), mobile (10 digits). Copy names exactly as written, in English capital letters. Skip rows without a mobile number.']);
  const arr = JSON.parse(r.response.text()); return arr.map((x) => ({ name: String(x.name || ''), father: String(x.father || ''), gender: normGender(x.gender) || guessGender(x.name), mobile: cleanMobile(x.mobile) })).filter((x) => x.name && x.mobile);
}
async function tMembers(host) {
  const D = S.district; const list = (await db.list('gpaMembers', { district: D })).sort((a, b) => nameCore(a.name).localeCompare(nameCore(b.name)));
  host.innerHTML = `
    <div class="card"><b>${L('सदस्य सूची अपलोड करें', 'Upload member list')}</b>
      <p class="muted small">${L('सूची में नाम, पिता/पति का नाम, लिंग और मोबाइल नंबर होना चाहिए। <b>नाम अंग्रेज़ी में लिखें</b> (जैसे RAMESH KUMAR) — इसी से पासवर्ड बनेगा। यही मोबाइल नंबर अपने-आप पंजीकृत हो जाएगा और ग्राम पंचायत अधिकारी उससे लॉग इन कर सकेंगे।', 'The list should have name, father/husband name, gender and mobile number. <b>Write names in English</b> (e.g. RAMESH KUMAR) — the password is made from it. The mobile number is registered automatically and the GPA can log in with it.')}</p>
      <div class="pickrow"><button data-up="cam"><span>📷</span>${L('कैमरा', 'Camera')}</button><button data-up="img"><span>🖼</span>${L('गैलरी', 'Gallery')}</button><button data-up="xls"><span>📊</span>Excel</button><button data-up="pdf"><span>📄</span>PDF</button><button data-up="one"><span>➕</span>${L('एक सदस्य', 'One member')}</button></div>
      <div id="mprog"></div><div id="preview"></div></div>
    <h2 class="sec" style="margin-top:18px">${L('पंजीकृत सदस्य', 'Registered members')} (${list.length})</h2>
    <div class="card scroll">${list.length ? `<table class="t"><tr><th>#</th><th>${L('नाम', 'Name')}</th><th>${L('पिता / पति', 'Father / Husband')}</th><th>${L('लिंग', 'Gender')}</th><th>${L('मोबाइल', 'Mobile')}</th><th>${L('पासवर्ड', 'Password')}</th><th></th></tr>
      ${list.map((m, i) => `<tr><td>${i + 1}</td><td><b>${esc(m.name)}</b></td><td>${esc(m.father || '')}</td><td>${m.gender === 'F' ? L('महिला', 'F') : m.gender === 'M' ? L('पुरुष', 'M') : ''}</td><td>${esc(m.mobile)}</td><td><code>${esc(passFor(m))}</code></td><td><button class="btn sm bad" data-del="${m.mobile}">${L('हटाएँ', 'Remove')}</button></td></tr>`).join('')}</table>` : `<p class="muted center">${L('अभी कोई सदस्य दर्ज नहीं है।', 'No members yet.')}</p>`}</div>`;
  $$('[data-del]').forEach((b) => (b.onclick = async () => { if (!confirm(L('इस सदस्य को सूची से हटाएँ?', 'Remove this member from the list?'))) return; await db.del('gpaMembers', b.dataset.del); toast(L('हटा दिया गया', 'Removed'), 'ok'); drawTab(); }));
  const preview = (rows, src) => {
    const P = $('#preview'); if (!rows.length) rows = [{ name: '', father: '', gender: '', mobile: '' }];
    P.innerHTML = `${src ? `<img src="${src}" data-img="${src}" style="max-height:220px;margin:10px auto;border-radius:10px">` : ''}
      <p class="small" style="margin:10px 0 4px"><b>${L('जाँच लें, ज़रूरत हो तो सुधारें, फिर सेव करें', 'Check, correct if needed, then save')}</b></p>
      <div class="scroll"><table class="t" id="ptab"><tr><th>${L('नाम', 'Name')}</th><th>${L('पिता / पति', 'Father / Husband')}</th><th>${L('लिंग', 'Gender')}</th><th>${L('मोबाइल', 'Mobile')}</th><th></th></tr>
      ${rows.map(rowHtml).join('')}</table></div>
      <div class="row" style="margin-top:10px"><button class="btn sm ghost" id="addrow">+ ${L('पंक्ति जोड़ें', 'Add row')}</button><button class="btn ok" id="saverows">${L('सूची सेव करें', 'Save list')}</button></div><div id="sprog"></div>`;
    $('#addrow').onclick = () => { $('#ptab').insertAdjacentHTML('beforeend', rowHtml({})); bindRm(); };
    const bindRm = () => $$('#ptab [data-rmrow]').forEach((b) => (b.onclick = () => b.closest('tr').remove())); bindRm();
    $('#saverows').onclick = async () => {
      const data = $$('#ptab tr').slice(1).map((tr) => { const [n, f, g, m] = $$('input,select', tr).map((x) => x.value.trim()); return { name: n.toUpperCase(), father: f.toUpperCase(), gender: g || guessGender(n), mobile: cleanMobile(m) }; }).filter((r) => r.name || r.mobile);
      const bad = data.filter((r) => !r.name || !r.mobile || nameKey(r.name).length < 1);
      const hin = data.filter((r) => r.name && !isEnglishName(r.name));
      if (hin.length) return toast(L(`${hin.length} नाम अंग्रेज़ी (CAPITAL) में नहीं हैं — कृपया नाम अंग्रेज़ी में लिखें, जैसे RAMESH KUMAR`, `${hin.length} name(s) are not in English — write names in English, e.g. RAMESH KUMAR`), 'err');
      if (!data.length) return toast(L('कोई पंक्ति नहीं है', 'No rows'), 'err');
      if (bad.length) return toast(L(`${bad.length} पंक्ति में नाम या सही मोबाइल नंबर नहीं है`, `${bad.length} row(s) lack a name or a valid mobile number`), 'err');
      $('#saverows').disabled = true; const pr = progress($('#sprog')); let done = 0, skipped = 0;
      for (const r of data) {
        try { await db.set('gpaMembers', r.mobile, { ...r, district: D, addedBy: S.mobile, createdMs: Date.now() }); } catch (e) { console.warn(e); skipped++; }
        pr.set(100 * ++done / data.length);
      }
      pr.done(L(`${data.length - skipped} सदस्य पंजीकृत हुए`, `${data.length - skipped} members registered`) + (skipped ? L(` · ${skipped} नहीं जुड़ सके (नंबर दूसरे जनपद में दर्ज)`, ` · ${skipped} could not be added (number registered in another district)`) : ''));
      await sleep(1400); drawTab();
    };
  };
  const rowHtml = (r) => `<tr><td><input value="${esc(r.name || '')}"></td><td><input value="${esc(r.father || '')}"></td><td><select><option value="">—</option><option value="M" ${r.gender === 'M' ? 'selected' : ''}>${L('पुरुष', 'M')}</option><option value="F" ${r.gender === 'F' ? 'selected' : ''}>${L('महिला', 'F')}</option></select></td><td><input inputmode="numeric" maxlength="10" value="${esc(r.mobile || '')}"></td><td><button class="btn sm bad" data-rmrow>×</button></td></tr>`;
  $$('[data-up]').forEach((b) => (b.onclick = async () => {
    const k = b.dataset.up; if (k === 'one') return preview([], '');
    const f = await pick({ cam: 'image/*', img: 'image/*', xls: '.xlsx,.xls,.csv', pdf: 'application/pdf' }[k], k === 'cam'); if (!f) return;
    const pr = progress($('#mprog')); pr.set(10); $('#preview').innerHTML = '';
    try {
      let rows = [], src = '';
      if (k === 'xls') { await animateTo(pr, 10, 60); rows = await parseExcel(f); }
      else if (k === 'pdf') { await animateTo(pr, 10, 50); rows = await parsePdf(f); }
      else { src = await compressImage(f, 1600, 900000); await animateTo(pr, 10, 60); try { rows = await parseImageAI(src); } catch (e) { console.warn('ai', e); } }
      pr.done(rows.length ? L(`${rows.length} नाम पढ़े गए`, `${rows.length} names read`) : L('फ़ाइल आ गई — नाम अपने-आप नहीं पढ़े जा सके, नीचे हाथ से भरें', 'File received — names could not be read automatically, enter them below'));
      preview(rows, src);
    } catch (e) { console.error(e); pr.fail(L('फ़ाइल नहीं पढ़ी जा सकी', 'Could not read the file')); }
  }));
}
async function tStateMembers(host) {
  const all = await db.list('gpaMembers'); const by = {}; all.forEach((m) => (by[m.district] = (by[m.district] || 0) + 1));
  host.innerHTML = `<div class="card"><b>${L('कुल पंजीकृत सदस्य', 'Total registered members')}: ${all.length}</b><div class="scroll" style="margin-top:8px"><table class="t"><tr><th>${L('जनपद', 'District')}</th><th>${L('जिलाध्यक्ष', 'District President')}</th><th>${L('सदस्य', 'Members')}</th></tr>
    ${DISTRICTS.map((d) => `<tr><td>${d}</td><td>${esc(offName(dpKey(d)) || '—')}</td><td><b>${by[d] || 0}</b></td></tr>`).join('')}</table></div></div>`;
}

/* ---------- dues (district + state) ---------- */
async function showProof(p) {
  const pr = await db.get('gpaProofs', p.id).catch(() => null);
  modal(`<b>${esc(p.name)}</b> · ${esc(p.mobile)}<div class="muted small">${esc(p.levyTitle)} · ${rupee(p.amount)} · ${fdate(p.createdMs)}</div>
    ${pr && pr.imgs && pr.imgs.length ? pr.imgs.map((s) => `<img src="${s}" style="margin-top:10px;border-radius:10px;width:100%">`).join('') : `<p class="muted">${L('स्क्रीनशॉट नहीं मिला', 'No screenshot found')}</p>`}`);
}
function claimCard(p, canVerify) {
  return `<div class="card"><div class="due"><div><h4>${esc(p.name)} <span class="muted small">· ${esc(p.mobile)}${isState() ? ' · ' + esc(p.district) : ''}</span></h4><div class="muted small">${esc(p.levyTitle)} · ${fdate(p.createdMs)}</div></div><div class="row"><span class="amt">${rupee(p.amount)}</span>${stBadge(p)}</div></div>
    <div class="row" style="margin-top:10px"><button class="btn sm ghost" data-proof="${p.id}">🖼 ${L('स्क्रीनशॉट देखें', 'View screenshot')} (${p.proofCount || 0})</button>
    ${canVerify && p.status !== 'verified' ? `<button class="btn sm ok" data-ver="${p.id}">✓ ${L('सत्यापित करें', 'Verify')}</button>` : ''}${canVerify && p.status === 'claimed' ? `<button class="btn sm bad" data-rej="${p.id}">${L('अस्वीकार', 'Reject')}</button>` : ''}</div></div>`;
}
function bindClaims(pays) {
  const by = Object.fromEntries(pays.map((p) => [p.id, p]));
  $$('[data-proof]').forEach((b) => (b.onclick = () => showProof(by[b.dataset.proof])));
  const setSt = async (id, status) => { await db.set('gpaPayments', id, { status, verifiedBy: S.mobile, verifiedMs: Date.now() }, true); toast(status === 'verified' ? L('सत्यापित हो गया', 'Verified') : L('अस्वीकार किया गया', 'Rejected'), 'ok'); drawTab(); };
  $$('[data-ver]').forEach((b) => (b.onclick = () => setSt(b.dataset.ver, 'verified')));
  $$('[data-rej]').forEach((b) => (b.onclick = () => confirm(L('यह स्क्रीनशॉट अस्वीकार करें? सदस्य को दोबारा अपलोड करना होगा।', 'Reject this screenshot? The member will have to upload again.')) && setSt(b.dataset.rej, 'rejected')));
}
async function tDpDues(host) {
  const D = S.district;
  const [mem, pays, levies] = await Promise.all([db.list('gpaMembers', { district: D }), db.list('gpaPayments', { district: D }), db.list('gpaLevies').catch(() => [])]);
  const fees = feePeriods(); const st = levies.filter((l) => l.active !== false).sort((a, b) => b.createdMs - a.createdMs); const cols = [...fees, ...st.map((l) => ({ id: l.id, title: l.title, kind: 'state', amount: l.amount }))];
  const pm = {}; pays.forEach((p) => (pm[p.id] = p));
  const waiting = pays.filter((p) => p.kind === 'district' && p.status === 'claimed').sort((a, b) => a.createdMs - b.createdMs);
  const stClaims = pays.filter((p) => p.kind === 'state').sort((a, b) => b.createdMs - a.createdMs);
  const got = pays.filter((p) => p.kind === 'district' && p.status === 'verified').reduce((s, p) => s + p.amount, 0);
  mem.sort((a, b) => nameCore(a.name).localeCompare(nameCore(b.name)));
  const short = (c) => c.kind === 'state' ? esc(c.title.slice(0, 16)) : (c.id.endsWith('H1') ? L('अप्रैल–सितंबर', 'Apr–Sep') : L('अक्टूबर–मार्च', 'Oct–Mar'));
  host.innerHTML = `
    <div class="stats" style="margin:0 0 14px"><div class="stat"><b>${mem.length}</b><span>${L('सदस्य', 'Members')}</span></div><div class="stat"><b>${waiting.length}</b><span>${L('सत्यापन बाकी', 'To verify')}</span></div><div class="stat"><b>${rupee(got)}</b><span>${L('सत्यापित शुल्क', 'Verified fee')}</span></div></div>
    <h2 class="sec">${L('सत्यापन के लिए (सदस्यता शुल्क)', 'For verification (membership fee)')}</h2>
    <div class="grid">${waiting.length ? waiting.map((p) => claimCard(p, true)).join('') : `<div class="card muted center">${L('कोई स्क्रीनशॉट लंबित नहीं।', 'No screenshots pending.')}</div>`}</div>
    <h2 class="sec" style="margin-top:18px">${L('किसने दिया, किसका बाकी', 'Who has paid, who is pending')}</h2>
    <div class="card scroll"><table class="t"><tr><th>${L('नाम', 'Name')}</th>${cols.map((c) => `<th>${short(c)}<br>${rupee(c.amount)}</th>`).join('')}</tr>
      ${mem.map((m) => `<tr><td><b>${esc(m.name)}</b><br><span class="muted">${esc(m.mobile)}</span></td>${cols.map((c) => { const p = pm[payId(m.mobile, c.id)]; return `<td>${stBadge(p)}${p ? `<br><a href="#" data-proof="${p.id}" class="small">${L('स्क्रीनशॉट', 'screenshot')}</a>` : ''}</td>`; }).join('')}</tr>`).join('') || `<tr><td colspan="9" class="muted center">${L('पहले सदस्य सूची अपलोड करें।', 'Upload the member list first.')}</td></tr>`}</table></div>
    ${stClaims.length ? `<h2 class="sec" style="margin-top:18px">${L('प्रदेश चंदा (आपके जनपद के सदस्य)', 'State contribution (members of your district)')}</h2><p class="muted small">${L('इसका सत्यापन प्रदेश पदाधिकारी करते हैं।', 'This is verified by the state office bearers.')}</p><div class="grid">${stClaims.map((p) => claimCard(p, false)).join('')}</div>` : ''}`;
  bindClaims(pays); $$('a[data-proof]').forEach((a) => a.addEventListener('click', (e) => e.preventDefault()));
}
async function tStateDues(host) {
  const [levies, pays] = await Promise.all([db.list('gpaLevies'), db.list('gpaPayments', { kind: 'state' })]);
  levies.sort((a, b) => b.createdMs - a.createdMs); const waiting = pays.filter((p) => p.status === 'claimed').sort((a, b) => a.createdMs - b.createdMs);
  host.innerHTML = `
    <div class="card"><b>${L('नया चंदा लगाएँ', 'Create a new contribution')}</b><p class="muted small">${L('किसी साथी के निधन या दुर्घटना जैसी स्थिति में। यह प्रदेश के हर ग्राम पंचायत अधिकारी के लॉग इन पर लंबित दिखेगा।', 'For situations such as the death or accident of a colleague. It will show as pending in every GPA’s login across the state.')}</p>
      <label class="f">${L('शीर्षक', 'Title')}</label><input class="in" id="lt" placeholder="${L('जैसे: स्व. … के परिवार हेतु सहयोग', 'e.g. Support for the family of late …')}">
      <label class="f">${L('राशि (₹ प्रति सदस्य)', 'Amount (₹ per member)')}</label><input class="in" id="la" inputmode="numeric" placeholder="100">
      <label class="f">${L('कारण / विवरण', 'Reason / details')}</label><input class="in" id="lr">
      <button class="btn" id="ladd" style="margin-top:12px">${L('चंदा लागू करें', 'Apply contribution')}</button></div>
    <h2 class="sec" style="margin-top:18px">${L('सत्यापन के लिए', 'For verification')} (${waiting.length})</h2>
    <div class="grid">${waiting.length ? waiting.map((p) => claimCard(p, true)).join('') : `<div class="card muted center">${L('कोई स्क्रीनशॉट लंबित नहीं।', 'No screenshots pending.')}</div>`}</div>
    <h2 class="sec" style="margin-top:18px">${L('लागू चंदे', 'Contributions')}</h2>
    <div class="grid">${levies.length ? levies.map((l) => { const ps = pays.filter((p) => p.levyId === l.id); const v = ps.filter((p) => p.status === 'verified'); return `<div class="card"><div class="due"><div><h4>${esc(l.title)}</h4><div class="muted small">${esc(l.reason || '')} · ${fdate(l.createdMs)}${l.active === false ? ' · ' + L('बंद', 'closed') : ''}</div></div><span class="amt">${rupee(l.amount)}</span></div>
      <div class="small" style="margin-top:6px">${L('सत्यापित', 'Verified')}: <b>${v.length}</b> (${rupee(v.reduce((s, p) => s + p.amount, 0))}) · ${L('जाँच में', 'Under review')}: <b>${ps.filter((p) => p.status === 'claimed').length}</b></div>
      <div class="row" style="margin-top:8px"><button class="btn sm ghost" data-lv="${l.id}">${L('भुगतान सूची', 'Payments')}</button>${l.active === false ? '' : `<button class="btn sm bad" data-close-lv="${l.id}">${L('बंद करें', 'Close')}</button>`}</div></div>`; }).join('') : `<div class="card muted center">${L('अभी कोई चंदा लागू नहीं।', 'No contributions yet.')}</div>`}</div>`;
  bindClaims(pays);
  $('#ladd').onclick = async () => {
    const title = $('#lt').value.trim(), amount = parseInt($('#la').value, 10), reason = $('#lr').value.trim();
    if (!title || !(amount > 0)) return toast(L('शीर्षक और राशि भरें', 'Enter title and amount'), 'err');
    if (!confirm(L(`₹${amount} का चंदा "${title}" सभी सदस्यों पर लागू करें?`, `Apply contribution "${title}" of ₹${amount} to all members?`))) return;
    await db.set('gpaLevies', 'L-' + uid(), { title, amount, reason, active: true, by: S.mobile, byKey: S.key, createdMs: Date.now() }); toast(L('चंदा लागू हो गया', 'Contribution applied'), 'ok'); drawTab();
  };
  $$('[data-close-lv]').forEach((b) => (b.onclick = async () => { if (!confirm(L('यह चंदा बंद करें? नए सदस्यों को यह लंबित नहीं दिखेगा।', 'Close this contribution? It will no longer show as pending.'))) return; await db.set('gpaLevies', b.dataset.closeLv, { active: false }, true); drawTab(); }));
  $$('[data-lv]').forEach((b) => (b.onclick = () => { const ps = pays.filter((p) => p.levyId === b.dataset.lv).sort((a, c) => a.district.localeCompare(c.district));
    modal(`<b>${L('भुगतान सूची', 'Payments')}</b><div class="scroll"><table class="t"><tr><th>${L('जनपद', 'District')}</th><th>${L('नाम', 'Name')}</th><th>${L('स्थिति', 'Status')}</th></tr>${ps.map((p) => `<tr><td>${esc(p.district)}</td><td>${esc(p.name)}<br><span class="muted">${esc(p.mobile)}</span></td><td>${stBadge(p)}</td></tr>`).join('') || `<tr><td colspan="3" class="muted center">—</td></tr>`}</table></div>`); }));
}

/* ---------- UPI / QR settings ---------- */
async function tUpi(host) {
  await loadPublic(); const st = isState(); let u = { ...(st ? (CFG.stateUpi || {}) : ((OFF[S.key] || {}).upi || {})) };
  host.innerHTML = `<div class="card" style="max-width:520px"><b>${st ? L('प्रदेश चंदे के लिए UPI / QR', 'UPI / QR for state contributions') : L('सदस्यता शुल्क के लिए UPI / QR', 'UPI / QR for membership fee')}</b>
    <p class="muted small">${L('अपने बैंक / UPI ऐप का QR सीधे अपलोड करें। सदस्य इसी QR से भुगतान करेंगे।', 'Upload the QR from your bank / UPI app. Members will pay using this QR.')}</p>
    <div class="qrbox" id="qrprev">${u.upiQr ? `<img src="${u.upiQr}">` : `<span class="muted">${L('अभी कोई QR नहीं', 'No QR yet')}</span>`}</div>
    <div class="pickrow"><button data-q="cam"><span>📷</span>${L('कैमरा', 'Camera')}</button><button data-q="img"><span>🖼</span>${L('गैलरी', 'Gallery')}</button>${u.upiQr ? `<button data-q="rm"><span>🗑</span>${L('QR हटाएँ', 'Remove QR')}</button>` : ''}</div><div id="qprog"></div>
    <label class="f">UPI ID</label><input class="in" id="uid" value="${esc(u.upiId || '')}" placeholder="name@bank">
    <label class="f">${L('UPI मोबाइल नंबर', 'UPI mobile number')}</label><input class="in" id="umob" inputmode="numeric" maxlength="10" value="${esc(u.upiMobile || '')}">
    <label class="f">${L('खाताधारक का नाम', 'Account holder name')}</label><input class="in" id="uname" value="${esc(u.upiName || '')}">
    <button class="btn full" id="usave" style="margin-top:14px">${L('सेव करें', 'Save')}</button></div>`;
  $$('[data-q]').forEach((b) => (b.onclick = async () => {
    if (b.dataset.q === 'rm') { u.upiQr = ''; $('#qrprev').innerHTML = `<span class="muted">${L('QR हटाया गया — सेव दबाएँ', 'QR removed — press Save')}</span>`; return; }
    const f = await pick('image/*', b.dataset.q === 'cam'); if (!f) return; const pr = progress($('#qprog')); pr.set(10);
    try { await animateTo(pr, 10, 50); const d = await compressImage(f, 900, 260000); await animateTo(pr, 50, 85); const q = await decodeQr(d); u.upiQr = d; $('#qrprev').innerHTML = `<img src="${d}">`;
      if (q) { if (!$('#uid').value) $('#uid').value = q.upiId; if (!$('#uname').value && q.upiName) $('#uname').value = q.upiName; }
      pr.done(q ? L('QR पढ़ लिया गया — सेव दबाएँ', 'QR read — press Save') : L('QR फ़ोटो आ गई — सेव दबाएँ', 'QR photo added — press Save')); } catch { pr.fail(L('फ़ोटो नहीं खुल सकी', 'Could not read the photo')); }
  }));
  $('#usave').onclick = async () => {
    u = { upiQr: u.upiQr || '', upiId: $('#uid').value.trim(), upiMobile: $('#umob').value.trim(), upiName: $('#uname').value.trim() };
    if (!u.upiQr && !u.upiId) return toast(L('QR अपलोड करें या UPI ID भरें', 'Upload a QR or enter a UPI ID'), 'err');
    $('#usave').disabled = true;
    try { st ? await db.set('gpaConfig', 'main', { stateUpi: u, updatedMs: Date.now() }, true) : await db.set('gpaOfficers', S.key, { upi: u, updatedMs: Date.now() }, true); toast(L('सेव हो गया', 'Saved'), 'ok'); drawTab(); }
    catch (e) { console.error(e); toast(L('सेव नहीं हो सका', 'Could not save'), 'err'); $('#usave').disabled = false; }
  };
}

/* ---------- messages ---------- */
async function tMsg(host) {
  await loadPublic(); const st = isState(); const scope = st ? 'STATE' : S.district;
  const mine = (await db.list('gpaMessages', { district: scope })).sort((a, b) => b.createdMs - a.createdMs);
  const homeEd = st ? ['state_president', 'state_secretary'].map((k) => { const o = OFF[k] || {}; return `
    <div class="card" style="margin-bottom:12px"><b>${L('होम पेज का संदेश', 'Home page message')}: ${postLabel(k)}</b>
      <div class="row" style="margin-top:8px">${avatar(o, 'qphoto')}<div class="pickrow" style="flex:1"><button data-ph="${k}" data-cap="1"><span>📷</span>${L('कैमरा', 'Camera')}</button><button data-ph="${k}"><span>🖼</span>${L('गैलरी', 'Gallery')}</button></div></div><div id="pp-${k}"></div>
      <label class="f">${L('संदेश (हिन्दी)', 'Message (Hindi)')}</label><textarea class="in" id="m-${k}">${esc(o.msg || '')}</textarea>
      <label class="f">${L('संदेश (English, वैकल्पिक)', 'Message (English, optional)')}</label><textarea class="in" id="me-${k}" style="min-height:70px">${esc(o.msgEn || '')}</textarea>
      <button class="btn" data-savemsg="${k}" style="margin-top:10px">${L('होम पेज पर प्रकाशित करें', 'Publish on home page')}</button></div>`; }).join('') : '';
  host.innerHTML = `${homeEd}
    <div class="card"><b>${st ? L('सभी सदस्यों के लिए संदेश', 'Message for all members') : L('अपने जनपद के सदस्यों के लिए संदेश', 'Message for members of your district')}</b>
      <p class="muted small">${st ? L('यह प्रदेश के हर लॉग इन में बैनर की तरह दिखेगा।', 'It appears as a banner in every login across the state.') : L('यह आपके जनपद के हर ग्राम पंचायत अधिकारी और प्रदेश पदाधिकारियों के लॉग इन में बैनर की तरह दिखेगा।', 'It appears as a banner in the login of every GPA of your district and of the state office bearers.')}</p>
      <textarea class="in" id="newmsg" maxlength="600" placeholder="${L('संदेश लिखें…', 'Write the message…')}"></textarea>
      <button class="btn" id="pub" style="margin-top:10px">${L('प्रकाशित करें', 'Publish')}</button></div>
    <h2 class="sec" style="margin-top:18px">${L('प्रकाशित संदेश', 'Published messages')}</h2>
    ${mine.length ? mine.map((m) => bannerQuote(m) + `<p style="margin:-6px 0 14px"><button class="btn sm bad" data-delmsg="${m.id}">${L('हटाएँ', 'Delete')}</button></p>`).join('') : `<div class="card muted center">${L('अभी कोई संदेश नहीं।', 'No messages yet.')}</div>`}
    ${st ? `<h2 class="sec" style="margin-top:18px">${L('जिलाध्यक्षों के संदेश', 'Messages from District Presidents')}</h2><div id="allmsg"></div>` : ''}`;
  $('#pub').onclick = async () => { const text = $('#newmsg').value.trim(); if (text.length < 3) return toast(L('संदेश लिखें', 'Write a message'), 'err'); $('#pub').disabled = true;
    await db.set('gpaMessages', 'M-' + uid(), { district: scope, scope: st ? 'state' : 'district', text, byName: S.name, byKey: S.key, by: S.mobile, createdMs: Date.now() }); toast(L('संदेश प्रकाशित हो गया', 'Message published'), 'ok'); drawTab(); };
  $$('[data-delmsg]').forEach((b) => (b.onclick = async () => { if (!confirm(L('यह संदेश हटाएँ?', 'Delete this message?'))) return; await db.del('gpaMessages', b.dataset.delmsg); drawTab(); }));
  if (st) {
    db.list('gpaMessages').then((all) => { const d = all.filter((m) => m.district !== 'STATE').sort((a, b) => b.createdMs - a.createdMs); $('#allmsg').innerHTML = d.length ? d.slice(0, 30).map(bannerQuote).join('') : `<div class="card muted center">${L('अभी कोई संदेश नहीं।', 'No messages yet.')}</div>`; }).catch(() => {});
    const photos = {};
    $$('[data-ph]').forEach((b) => (b.onclick = async () => { const k = b.dataset.ph; const f = await pick('image/*', !!b.dataset.cap); if (!f) return; const pr = progress($('#pp-' + k)); pr.set(10);
      try { await animateTo(pr, 10, 60); photos[k] = await compressImage(f, 420, 90000); b.closest('.row').querySelector('.qphoto').innerHTML = `<img src="${photos[k]}">`; pr.done(L('फ़ोटो जुड़ गई — प्रकाशित करें दबाएँ', 'Photo added — press Publish')); } catch { pr.fail(L('फ़ोटो नहीं खुल सकी', 'Could not read the photo')); } }));
    $$('[data-savemsg]').forEach((b) => (b.onclick = async () => { const k = b.dataset.savemsg; b.disabled = true; const data = { msg: $('#m-' + k).value.trim(), msgEn: $('#me-' + k).value.trim(), updatedMs: Date.now() }; if (photos[k]) data.photo = photos[k];
      try { await db.set('gpaOfficers', k, data, true); toast(L('होम पेज पर प्रकाशित हो गया', 'Published on home page'), 'ok'); await loadPublic(); } catch (e) { console.error(e); toast(L('सेव नहीं हो सका', 'Could not save'), 'err'); } b.disabled = false; }));
  }
}

/* ---------- letters / reports ---------- */
async function tDpDocs(host) {
  const list = (await db.list('gpaDocs', { district: S.district })).sort((a, b) => b.createdMs - a.createdMs);
  host.innerHTML = `<div class="card"><b>${L('प्रदेश को पत्र / रिपोर्ट भेजें', 'Send a letter / report to the state body')}</b>
      <p class="muted small">${L('यह प्रदेश अध्यक्ष, महामंत्री और कोषाध्यक्ष तीनों के लॉग इन में दिखेगा।', 'It will be visible in the logins of the State President, General Secretary and Treasurer.')}</p>
      <label class="f">${L('विषय', 'Subject')}</label><input class="in" id="dt" maxlength="120">
      <div class="pickrow"><button data-d="cam"><span>📷</span>${L('कैमरा', 'Camera')}</button><button data-d="img"><span>🖼</span>${L('गैलरी', 'Gallery')}</button><button data-d="pdf"><span>📄</span>PDF</button></div><div id="dprog"></div></div>
    <h2 class="sec" style="margin-top:18px">${L('भेजे गए पत्र / रिपोर्ट', 'Sent letters / reports')}</h2>${docList(list, true)}`;
  bindDocs(list);
  $$('[data-d]').forEach((b) => (b.onclick = async () => {
    const title = $('#dt').value.trim(); if (!title) return toast(L('पहले विषय लिखें', 'Write the subject first'), 'err');
    const k = b.dataset.d; const f = await pick(k === 'pdf' ? 'application/pdf' : 'image/*', k === 'cam'); if (!f) return;
    if (k === 'pdf' && f.size > 6 * 1024 * 1024) return toast(L('PDF 6 MB से छोटी होनी चाहिए', 'PDF must be smaller than 6 MB'), 'err');
    const pr = progress($('#dprog')); pr.set(5);
    try { await animateTo(pr, 5, 28); const data = k === 'pdf' ? await readAs(f, 'readAsDataURL') : await compressImage(f, 1600, 900000);
      await saveFileDoc({ district: S.district, title, type: k === 'pdf' ? 'pdf' : 'image', fileName: f.name, byName: S.name, by: S.mobile }, data, pr);
      pr.done(L('पत्र प्रदेश को भेज दिया गया', 'Letter sent to the state body')); await sleep(1200); drawTab(); }
    catch (e) { console.error(e); pr.fail(L('अपलोड नहीं हो सका', 'Upload failed')); }
  }));
}
function docList(list, own) {
  return list.length ? `<div class="grid">${list.map((d) => `<div class="card"><div class="due"><div><h4>${d.type === 'pdf' ? '📄' : '🖼'} ${esc(d.title)}</h4><div class="muted small">${own ? '' : `<b>${distLabel(d.district)}</b> · ${esc(d.byName || '')} · `}${fdate(d.createdMs)}</div></div>
    <div class="row"><button class="btn sm" data-open="${d.id}">${L('खोलें', 'Open')}</button>${own ? `<button class="btn sm bad" data-deldoc="${d.id}">${L('हटाएँ', 'Delete')}</button>` : ''}</div></div></div>`).join('')}</div>` : `<div class="card muted center">${L('अभी कोई पत्र नहीं।', 'No letters yet.')}</div>`;
}
function bindDocs(list) {
  const by = Object.fromEntries(list.map((d) => [d.id, d]));
  $$('[data-open]').forEach((b) => (b.onclick = () => openFileDoc(by[b.dataset.open]).catch(() => toast(L('फ़ाइल नहीं खुल सकी', 'Could not open the file'), 'err'))));
  $$('[data-deldoc]').forEach((b) => (b.onclick = async () => { if (!confirm(L('यह पत्र हटाएँ?', 'Delete this letter?'))) return; const d = by[b.dataset.deldoc]; for (let i = 0; i < d.chunks; i++) await db.del('gpaDocChunks', `${d.id}_${i}`).catch(() => {}); await db.del('gpaDocs', d.id); drawTab(); }));
}
async function tStateDocs(host) {
  const list = (await db.list('gpaDocs')).sort((a, b) => b.createdMs - a.createdMs);
  host.innerHTML = `<p class="muted small">${L('जिलाध्यक्षों द्वारा भेजे गए पत्र और रिपोर्ट।', 'Letters and reports sent by District Presidents.')}</p>${docList(list, false)}`; bindDocs(list);
}

/* ---------- state: officers ---------- */
async function tOfficers(host) {
  await loadPublic();
  const row = (k) => { const o = OFF[k] || {}; return `<tr data-k="${k}"><td><b>${postLabel(k)}</b></td><td><input data-f="name" value="${esc(o.name || '')}" placeholder="${L('नाम', 'Name')}"></td><td><input data-f="mobile" inputmode="numeric" maxlength="10" value="${esc(o.mobile || '')}" placeholder="${L('मोबाइल', 'Mobile')}"></td><td><button class="btn sm" data-saveoff>${L('सेव', 'Save')}</button></td></tr>`; };
  host.innerHTML = `<div class="card"><b>${L('प्रदेश पदाधिकारी', 'State office bearers')}</b><p class="muted small">${L('यहाँ दर्ज मोबाइल नंबर से ही वह पदाधिकारी लॉग इन कर सकेगा।', 'The office bearer can log in only with the mobile number entered here.')}</p>
      <div class="scroll"><table class="t">${Object.keys(POSTS).map(row).join('')}</table></div></div>
    <div class="card" style="margin-top:14px"><b>${L('जिलाध्यक्ष (75 जनपद)', 'District Presidents (75 districts)')}</b><input class="in" id="oq" placeholder="${L('जनपद खोजें…', 'Search district…')}" style="margin:8px 0">
      <div class="scroll"><table class="t" id="otab">${DISTRICTS.map((d) => row(dpKey(d))).join('')}</table></div></div>`;
  $('#oq').oninput = (e) => { const q = e.target.value.trim().toUpperCase(); $$('#otab tr').forEach((tr) => (tr.style.display = tr.dataset.k.replace(/_/g, ' ').includes(q) ? '' : 'none')); };
  $$('[data-saveoff]').forEach((b) => (b.onclick = async () => {
    const tr = b.closest('tr'), k = tr.dataset.k; const name = $('[data-f=name]', tr).value.trim(), mobile = $('[data-f=mobile]', tr).value.trim();
    if (mobile && !/^[6-9]\d{9}$/.test(mobile)) return toast(L('सही मोबाइल नंबर डालें', 'Enter a valid mobile number'), 'err');
    if (k === S.key && mobile !== S.mobile && !confirm(L('आप अपना ही नंबर बदल रहे हैं। इसके बाद इसी नए नंबर से लॉग इन होगा। जारी रखें?', 'You are changing your own number. After this you must log in with the new number. Continue?'))) return;
    b.disabled = true;
    try { await saveOfficer(k, { name, mobile }); toast(L('सेव हो गया', 'Saved'), 'ok'); await loadPublic(); } catch (e) { console.error(e); toast(L('सेव नहीं हो सका', 'Could not save'), 'err'); }
    b.disabled = false;
  }));
}
async function tGallery(host) {
  const list = (await db.list('gpaGallery')).sort((a, b) => b.createdMs - a.createdMs);
  host.innerHTML = `<div class="card"><b>${L('गैलरी में फ़ोटो जोड़ें', 'Add a photo to the gallery')}</b><div class="pickrow"><button data-g="cam"><span>📷</span>${L('कैमरा', 'Camera')}</button><button data-g="img"><span>🖼</span>${L('गैलरी', 'Gallery')}</button></div><div id="gprog"></div></div>
    <div class="gal" style="margin-top:14px">${list.map((g) => `<div style="position:relative"><a href="#" data-img="${g.img}"><img src="${g.img}"></a><button class="btn sm bad" data-delg="${g.id}" style="position:absolute;right:6px;top:6px">×</button></div>`).join('')}</div>
    <p class="muted small">${L('पहले से लगी 11 फ़ोटो वेबसाइट में स्थायी रूप से जुड़ी हैं।', 'The 11 original photos are built into the website.')}</p>`;
  $$('[data-g]').forEach((b) => (b.onclick = async () => { const f = await pick('image/*', b.dataset.g === 'cam'); if (!f) return; const pr = progress($('#gprog')); pr.set(10);
    try { await animateTo(pr, 10, 55); const img = await compressImage(f, 1280, 520000); pr.set(75); await db.set('gpaGallery', 'G-' + uid(), { img, by: S.mobile, createdMs: Date.now() }); pr.done(); await sleep(900); drawTab(); } catch (e) { console.error(e); pr.fail(L('अपलोड नहीं हो सका', 'Upload failed')); } }));
  $$('[data-delg]').forEach((b) => (b.onclick = async () => { if (!confirm(L('यह फ़ोटो हटाएँ?', 'Delete this photo?'))) return; await db.del('gpaGallery', b.dataset.delg); drawTab(); }));
}

/* ================= start ================= */
(async () => {
  try { await fbInit(); } catch (e) { console.error('firebase', e); }
  await loadPublic();
  if (LOCAL) window.__gpa = { db, nameKey, nameCore, passFor, rowsFromTable };
  render();
})();
