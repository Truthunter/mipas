(() => {
  const C = window.MIPAS_CONFIG;
  const $ = (s) => document.querySelector(s);
  const PREVIEW = Array.isArray(window.MIPAS_SAMPLE);
  const PAGE = 12;
  const state = { videos: [], shorts: [], subject: '', level: '', q: '', shown: PAGE };
  const uploadsPlaylist = 'UU' + C.channelId.slice(2);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Teks dari config ---------- */
  document.querySelectorAll('[data-channel-link]').forEach((a) => (a.href = C.channelUrl + '?sub_confirmation=1'));
  document.querySelectorAll('[data-hashtag]').forEach((el) => (el.textContent = C.hashtag));
  $('#about-title').textContent = C.teacherName ? `Belajar bersama ${C.teacherName}` : `Tentang ${C.siteName}`;
  $('#about-text').textContent = C.about;
  $('#year').textContent = new Date().getFullYear();
  $('#stat-subjects').textContent = C.subjects.length;
  document.querySelectorAll('[data-mascot-name]').forEach((el) => (el.textContent = C.mascotName || 'Mipa'));
  if (C.whatsapp) {
    const wa = $('#wa-link');
    wa.href = `https://wa.me/${C.whatsapp}?text=${encodeURIComponent('Halo, saya ingin bertanya tentang materi MIPAS.')}`;
    wa.hidden = false;
  }
  const nav = $('.nav');
  addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 8), { passive: true });

  /* ---------- Util ---------- */
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const subjectOf = (id) => C.subjects.find((s) => s.id === id);

  // Judul tampil: buang hashtag
  const cleanTitle = (t) => String(t || '').replace(/\s#[\p{L}\p{N}_]+/gu, '').replace(/\s{2,}/g, ' ').trim();

  const ROMAN = { i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7, viii: 8, ix: 9, x: 10, xi: 11, xii: 12 };
  function parseKelas(t) {
    let m;
    if (/kelas\s*1v\b/i.test(t)) return 4; // salah ketik "1V" = IV
    if ((m = t.match(/kelas\s*(\d{1,2})/i))) return +m[1];
    if ((m = t.match(/kelas\s*([ivx]{1,4})\b/i)) && ROMAN[m[1].toLowerCase()]) return ROMAN[m[1].toLowerCase()];
    if ((m = t.match(/(?:sd\/mi|ips|matematika|mtk)\s*(\d{1,2})\b/i))) return +m[1];
    return 0;
  }
  function parseLevel(t, kelas) {
    if (/\bsma\b/i.test(t) || kelas >= 10) return 'SMA';
    if (/\bsmp\b/i.test(t) || (kelas >= 7 && kelas <= 9)) return 'SMP';
    if (/\bsd\b|\bmi\b|sd\/\s?mi/i.test(t) || (kelas >= 1 && kelas <= 6)) return 'SD';
    return '';
  }

  function classify(v, i) {
    const t = v.title || '';
    let subjects = C.subjects.filter((s) => s.match.test(t)).map((s) => s.id);
    if (!subjects.length && v.description) subjects = C.subjects.filter((s) => s.match.test(v.description)).map((s) => s.id);
    const kelas = +v.kelas || parseKelas(t);
    return { ...v, idx: i, display: cleanTitle(t), subjects, kelas, level: v.level || parseLevel(t, kelas) };
  }

  function timeAgo(iso) {
    if (!iso) return '';
    const days = Math.floor((Date.now() - new Date(iso)) / 864e5);
    if (days < 1) return 'hari ini';
    if (days < 7) return `${days} hari lalu`;
    if (days < 30) return `${Math.floor(days / 7)} minggu lalu`;
    if (days < 365) return `${Math.max(1, Math.round(days / 30.4))} bulan lalu`;
    return `${Math.round(days / 365.25)} tahun lalu`;
  }
  const fmtViews = (n) => (n ? `${new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(n)}× ditonton` : '');
  const thumbUrl = (id) => `https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg`;
  const thumbPH = (v) => {
    const s = subjectOf((v.subjects || [])[0]);
    return `<div class="thumb-ph" data-c="${s ? s.color : ''}">${esc(s ? s.short : 'MIPAS')}</div>`;
  };

  /* ---------- Mapel ---------- */
  function renderSubjects() {
    $('#subject-grid').innerHTML = C.subjects
      .map((s) => {
        const count = [...state.videos, ...state.shorts].filter((v) => v.subjects.includes(s.id)).length;
        return `
        <article class="subject" data-color="${s.color}" data-subject="${s.id}" tabindex="0" role="button" aria-label="Lihat video ${esc(s.label)}">
          <div class="subject-top">
            <div class="subject-icon">${esc(s.short)}</div>
            ${count ? `<span class="subject-count">${count} video</span>` : ''}
          </div>
          <h3>${esc(s.label)}</h3>
          <p>${esc(s.desc)}</p>
          <div class="topics">${s.topics.map((t) => `<button type="button" class="topic" data-q="${esc(t.q)}">${esc(t.label)}</button>`).join('')}</div>
        </article>`;
      })
      .join('');
  }
  $('#subject-grid').addEventListener('click', (e) => {
    const card = e.target.closest('.subject');
    if (!card) return;
    const topic = e.target.closest('.topic');
    state.subject = card.dataset.subject;
    state.q = topic ? topic.dataset.q : '';
    $('#search').value = state.q;
    resetAndRender();
    $('#video').scrollIntoView();
  });
  $('#subject-grid').addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('subject')) { e.preventDefault(); e.target.click(); }
  });

  /* ---------- Filter ---------- */
  function renderChips() {
    const items = [{ id: '', label: 'Semua' }, ...C.subjects];
    $('#chips').innerHTML = items
      .map((s) => `<button type="button" class="chip" role="tab" data-id="${s.id}" aria-selected="${state.subject === s.id}">${esc(s.label)}</button>`)
      .join('');
    requestAnimationFrame(updateChipArrows);
  }
  $('#chips').addEventListener('click', (e) => {
    const b = e.target.closest('.chip');
    if (!b) return;
    state.subject = b.dataset.id;
    resetAndRender();
  });

  // Panah geser untuk deretan chip mapel
  const chipsEl = $('#chips'), chipsWrap = $('#chips-wrap');
  function updateChipArrows() {
    const max = chipsEl.scrollWidth - chipsEl.clientWidth;
    const canPrev = chipsEl.scrollLeft > 4, canNext = chipsEl.scrollLeft < max - 4;
    chipsWrap.classList.toggle('can-prev', canPrev);
    chipsWrap.classList.toggle('can-next', canNext);
    chipsWrap.querySelector('.prev').hidden = !canPrev;
    chipsWrap.querySelector('.next').hidden = !canNext;
  }
  chipsEl.addEventListener('scroll', updateChipArrows, { passive: true });
  addEventListener('resize', updateChipArrows);
  chipsWrap.querySelectorAll('[data-chips]').forEach((b) =>
    b.addEventListener('click', () => chipsEl.scrollBy({ left: (b.dataset.chips === 'next' ? 1 : -1) * chipsEl.clientWidth * 0.6, behavior: reduce ? 'auto' : 'smooth' }))
  );

  /* ---------- Dropdown jenjang & kelas (custom) ---------- */
  const dd = $('#level-dd'), ddBtn = $('#level-btn'), ddList = $('#level-list'), ddLabel = $('#level-label');
  const levelLabel = (val) => (!val ? 'Semua jenjang' : val.includes('-') ? val.replace('-', ' · Kelas ') : `Semua ${val}`);
  const ddOpts = () => [...ddList.querySelectorAll('[role=option]')];

  function renderLevels() {
    const all = [...state.videos, ...state.shorts];
    const n = (fn) => all.filter(fn).length;
    const groups = ['SD', 'SMP', 'SMA']
      .map((lv) => ({ lv, kelas: [...new Set(all.filter((v) => v.level === lv && v.kelas).map((v) => v.kelas))].sort((a, b) => a - b) }))
      .filter((g) => all.some((v) => v.level === g.lv));
    const opt = (val, text, cls, count) =>
      `<div role="option" id="lv-${val || 'all'}" class="${cls}" data-value="${val}" aria-selected="${state.level === val}">` +
      `<span>${text}</span>${count != null ? `<em>${count}</em>` : ''}` +
      `<svg class="dd-check" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg></div>`;
    ddList.innerHTML =
      opt('', 'Semua jenjang', 'dd-opt dd-all', all.length) +
      groups.map((g) => `
        <div class="dd-group" role="group" aria-label="${g.lv}">
          <p class="dd-head" aria-hidden="true">${g.lv}</p>
          ${opt(g.lv, `Semua ${g.lv}`, 'dd-opt', n((v) => v.level === g.lv))}
          <div class="dd-kelas">${g.kelas.map((k) => opt(`${g.lv}-${k}`, `Kelas ${k}`, 'dd-pill', null)).join('')}</div>
        </div>`).join('');
    ddLabel.textContent = levelLabel(state.level);
    dd.classList.toggle('is-set', !!state.level);
  }

  function setActive(el) {
    ddOpts().forEach((o) => o.classList.toggle('active', o === el));
    if (el) { ddList.setAttribute('aria-activedescendant', el.id); el.scrollIntoView({ block: 'nearest' }); }
  }
  function openDD() {
    ddList.hidden = false;
    ddBtn.setAttribute('aria-expanded', 'true');
    dd.classList.add('open');
    setActive(ddOpts().find((o) => o.getAttribute('aria-selected') === 'true') || ddOpts()[0]);
    ddList.focus({ preventScroll: true });
  }
  function closeDD(focusBtn) {
    if (ddList.hidden) return;
    ddList.hidden = true;
    ddBtn.setAttribute('aria-expanded', 'false');
    dd.classList.remove('open');
    if (focusBtn) ddBtn.focus();
  }
  function chooseDD(el) {
    if (!el) return;
    state.level = el.dataset.value;
    renderLevels();
    closeDD(true);
    resetAndRender();
    ddBtn.classList.remove('picked'); void ddBtn.offsetWidth; ddBtn.classList.add('picked');
  }
  ddBtn.addEventListener('click', () => (ddList.hidden ? openDD() : closeDD()));
  ddBtn.addEventListener('keydown', (e) => { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); openDD(); } });
  ddList.addEventListener('click', (e) => chooseDD(e.target.closest('[role=option]')));
  ddList.addEventListener('mousemove', (e) => { const o = e.target.closest('[role=option]'); if (o && !o.classList.contains('active')) setActive(o); });
  ddList.addEventListener('keydown', (e) => {
    const opts = ddOpts();
    const i = opts.findIndex((o) => o.classList.contains('active'));
    const go = (j) => { e.preventDefault(); setActive(opts[Math.max(0, Math.min(opts.length - 1, j))]); };
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') go(i + 1);
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') go(i - 1);
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(opts.length - 1);
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); chooseDD(opts[i]); }
    else if (e.key === 'Escape') { e.preventDefault(); closeDD(true); }
    else if (e.key === 'Tab') closeDD();
  });
  document.addEventListener('pointerdown', (e) => { if (!dd.contains(e.target)) closeDD(); });

  let t;
  $('#search').addEventListener('input', (e) => {
    clearTimeout(t);
    t = setTimeout(() => { state.q = e.target.value; resetAndRender(); }, 150);
  });

  // "a, b" = cocok bila salah satu; tiap bagian harus cocok semua katanya
  function matchQuery(v, q) {
    if (!q.trim()) return true;
    const hay = norm(`${v.title} ${v.description || ''}`);
    return q.split(/[&,/]/).map((p) => norm(p).trim()).filter(Boolean).some((alt) => alt.split(/\s+/).every((w) => hay.includes(w)));
  }
  function matchLevel(v) {
    if (!state.level) return true;
    const [lv, k] = state.level.split('-');
    return v.level === lv && (!k || v.kelas === +k);
  }
  const passes = (v) => (!state.subject || v.subjects.includes(state.subject)) && matchLevel(v) && matchQuery(v, state.q);

  /* ---------- Video ---------- */
  function tagsHTML(v) {
    const tags = v.subjects.slice(0, 2).map((id) => { const s = subjectOf(id); return `<span class="tag ${s.color}">${esc(s.label)}</span>`; });
    if (v.level) tags.push(`<span class="tag">${v.level}${v.kelas ? ' · Kelas ' + v.kelas : ''}</span>`);
    return tags.length ? `<div class="tags">${tags.join('')}</div>` : '';
  }
  function cardHTML(v, i) {
    const meta = [fmtViews(v.views), timeAgo(v.published)].filter(Boolean).join(' · ');
    return `
      <button type="button" class="card" data-id="${esc(v.id)}" style="--i:${i % PAGE}">
        <div class="thumb">
          ${PREVIEW ? thumbPH(v) : `<img src="${thumbUrl(v.id)}" alt="" loading="lazy" />`}
          ${v.duration ? `<span class="badge-dur">${esc(v.duration)}</span>` : ''}
          <div class="play"><span><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span></div>
        </div>
        <div class="card-body">
          ${tagsHTML(v)}
          <h3>${esc(v.display)}</h3>
          ${meta ? `<p class="meta">${meta}</p>` : ''}
        </div>
      </button>`;
  }
  function shortHTML(v, i) {
    return `
      <button type="button" class="short" data-id="${esc(v.id)}" style="--i:${i}">
        <div class="short-thumb">
          ${PREVIEW ? thumbPH(v) : `<img src="${thumbUrl(v.id)}" alt="" loading="lazy" />`}
          <div class="play"><span><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span></div>
          <div class="short-cap"><p>${esc(v.display)}</p>${v.views ? `<span>${fmtViews(v.views)}</span>` : ''}</div>
        </div>
      </button>`;
  }

  function renderShorts() {
    const list = state.shorts.filter(passes);
    $('#shorts-rail').innerHTML = list.map(shortHTML).join('');
    $('#shorts-block').hidden = !list.length;
    $('#shorts-count').textContent = `${list.length} Shorts`;
  }

  function renderVideos() {
    const list = state.videos.filter(passes);
    const page = list.slice(0, state.shown);
    $('#video-grid').innerHTML = page.map(cardHTML).join('');
    $('#empty').hidden = list.length > 0 || state.shorts.some(passes);
    $('#load-more').hidden = list.length <= state.shown;
    $('#load-more').textContent = `Tampilkan lebih banyak (${list.length - page.length} lagi)`;

    const parts = [];
    if (state.subject) parts.push(subjectOf(state.subject).label);
    if (state.level) parts.push(state.level.replace('-', ' · Kelas '));
    if (state.q.trim()) parts.push(`“${state.q.trim()}”`);
    const info = $('#result-info');
    info.textContent = list.length ? `${list.length} video${parts.length ? ' · ' + parts.join(' · ') : ''}` : '';
    info.classList.remove('tick'); void info.offsetWidth; info.classList.add('tick');
  }

  function resetAndRender() {
    state.shown = PAGE;
    renderChips();
    renderShorts();
    renderVideos();
  }

  $('#load-more').addEventListener('click', () => {
    const before = state.shown;
    state.shown += PAGE;
    renderVideos();
    const next = $('#video-grid').children[before];
    if (next) next.focus({ preventScroll: true });
  });

  function renderSkeleton() {
    $('#video-grid').innerHTML = Array.from({ length: 6 }, () => `
      <div class="card skeleton" aria-hidden="true">
        <div class="thumb"></div>
        <div class="card-body"><div class="sk w40"></div><div class="sk"></div><div class="sk w60"></div></div>
      </div>`).join('');
  }

  const byId = (id) => state.videos.find((v) => v.id === id) || state.shorts.find((v) => v.id === id);
  $('#video-grid').addEventListener('click', (e) => { const c = e.target.closest('.card[data-id]'); if (c) openPlayer(byId(c.dataset.id)); });
  $('#shorts-rail').addEventListener('click', (e) => { const c = e.target.closest('.short[data-id]'); if (c) openPlayer(byId(c.dataset.id)); });

  // Geser rel Shorts dengan tombol panah
  document.querySelectorAll('[data-rail]').forEach((b) =>
    b.addEventListener('click', () => {
      const rail = $('#shorts-rail');
      rail.scrollBy({ left: (b.dataset.rail === 'next' ? 1 : -1) * rail.clientWidth * 0.8, behavior: reduce ? 'auto' : 'smooth' });
    })
  );

  /* ---------- Pemutar ---------- */
  const dlg = $('#player');
  function openPlayer(v) {
    const playlist = v.playlist;
    const vertical = !!v.isShort;
    const title = v.display || v.title;
    const params = 'autoplay=1&rel=0&modestbranding=1&playsinline=1';
    const src = playlist
      ? `https://www.youtube-nocookie.com/embed/videoseries?list=${playlist}&${params}`
      : `https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.id)}?${params}`;
    $('#player-title').textContent = title;
    dlg.classList.toggle('is-vertical', vertical);
    $('#player-frame').innerHTML = PREVIEW
      ? `<div class="player-demo">${thumbPH(v)}<p><strong>Di sini videonya diputar langsung.</strong>Pratinjau ini tidak bisa memuat pemutar YouTube. Setelah website live di Vercel, video ini langsung jalan di jendela ini tanpa pindah ke YouTube.</p></div>`
      : `<iframe src="${src}" title="${esc(title)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
    $('#player-yt').href = playlist ? `https://www.youtube.com/playlist?list=${playlist}` : vertical ? `https://www.youtube.com/shorts/${encodeURIComponent(v.id)}` : `https://www.youtube.com/watch?v=${encodeURIComponent(v.id)}`;

    // Tombol "berikutnya" mengikuti daftar yang sedang tampil
    const pool = vertical ? state.shorts.filter(passes) : state.videos.filter(passes);
    const i = pool.findIndex((x) => x.id === v.id);
    const nextV = !playlist && i > -1 ? pool[i + 1] : null;
    const nb = $('#player-next');
    nb.hidden = !nextV;
    nb.onclick = nextV ? () => openPlayer(nextV) : null;

    if (!dlg.open) dlg.showModal();
  }
  function closePlayer() { dlg.close(); }
  dlg.addEventListener('close', () => ($('#player-frame').innerHTML = ''));
  $('#player-close').addEventListener('click', closePlayer);
  dlg.addEventListener('click', (e) => { if (e.target === dlg) closePlayer(); });
  document.querySelectorAll('[data-play-all]').forEach((b) =>
    b.addEventListener('click', () => openPlayer({ playlist: uploadsPlaylist, title: 'Semua video MIPAS Channel', subjects: [] }))
  );

  /* ---------- Micro-interaction ---------- */
  function countUp(el, to) {
    if (!to) { el.textContent = '–'; return; }
    if (reduce) { el.textContent = to; return; }
    const start = performance.now(), dur = 900;
    const step = (now) => {
      const p = Math.min(1, (now - start) / dur);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step); else el.classList.add('bump');
    };
    requestAnimationFrame(step);
  }
  const art = $('.hero-art'), board = $('.board');
  if (art && board && !reduce && matchMedia('(hover: hover)').matches) {
    art.addEventListener('pointermove', (e) => {
      const r = art.getBoundingClientRect();
      board.style.setProperty('--rx', `${((e.clientX - r.left) / r.width - 0.5) * 10}deg`);
      board.style.setProperty('--ry', `${-((e.clientY - r.top) / r.height - 0.5) * 10}deg`);
    });
    art.addEventListener('pointerleave', () => { board.style.setProperty('--rx', '0deg'); board.style.setProperty('--ry', '0deg'); });
  }
  if (reduce) document.querySelectorAll('animateMotion').forEach((a) => a.remove());

  /* ---------- Muat data ---------- */
  async function getJSON(url) {
    try {
      const r = await fetch(url, { cache: 'no-cache' });
      return r.ok ? await r.json() : { videos: [] };
    } catch { return { videos: [] }; }
  }

  async function load() {
    renderSubjects();
    renderChips();
    renderSkeleton();
    // Daftar lengkap (data/videos.json) + video terbaru otomatis dari YouTube (/api/videos)
    const [manual, auto] = PREVIEW
      ? [{ videos: window.MIPAS_SAMPLE }, { videos: [] }]
      : await Promise.all([getJSON('data/videos.json'), getJSON('/api/videos')]);
    const seen = new Set();
    const all = [...(auto.videos || []), ...(manual.videos || [])]
      .filter((v) => v && v.id && !seen.has(v.id) && seen.add(v.id))
      .map(classify);
    const ts = (v) => (v.published ? new Date(v.published).getTime() : 0);
    state.videos = all.filter((v) => !v.isShort).sort((a, b) => ts(b) - ts(a) || a.idx - b.idx);
    state.shorts = all.filter((v) => v.isShort).sort((a, b) => ts(b) - ts(a) || a.idx - b.idx);

    $('#loading').hidden = true;
    countUp($('#stat-videos'), state.videos.length + state.shorts.length);
    renderSubjects();
    renderLevels();
    resetAndRender();

    if (!all.length && !PREVIEW) {
      // Cadangan: tampilkan pemutar semua video channel
      $('#empty').hidden = true;
      document.querySelector('.filters').hidden = true;
      $('#fallback-frame').innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/videoseries?list=${uploadsPlaylist}&rel=0" title="Semua video MIPAS Channel" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
      $('#fallback').hidden = false;
    }
  }
  load();
})();
