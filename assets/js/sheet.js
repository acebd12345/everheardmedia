/* ==========================================================================
   sheet.js — 用 Google Sheet 當網站後台
   --------------------------------------------------------------------------
   運作方式：
     1. 到 Google Sheet 的「檔案 → 共用 → 發布到網路」，
        分別把 works 與 clients 兩個工作表發布為「逗號分隔值 (.csv)」。
     2. 把 Google 給的兩個網址貼到下面 SHEET_URLS 裡。
     3. 網頁載入時會抓這兩份 CSV，蓋掉 HTML 內建的預設內容。
        抓不到（沒設定、斷網、Google 掛掉）就沿用 HTML 內建內容，畫面不會壞。
   （詳細圖文步驟見 README.md）
   ========================================================================== */

/* ===== 只需要改這裡 ======================================================== */
const SHEET_URLS = {
  // works 工作表的 CSV 發布網址
  works: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQmC7NS61sgE2cjafVEh3-rMfiA570Zt5_QELoG6selEa5-FMlOFrOmZxRqjcvzcwmCrwW1e1BOYNzP/pub?gid=0&single=true&output=csv',

  // clients 工作表的 CSV 發布網址（gid 與 works 不同）
  clients: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQmC7NS61sgE2cjafVEh3-rMfiA570Zt5_QELoG6selEa5-FMlOFrOmZxRqjcvzcwmCrwW1e1BOYNzP/pub?gid=1933858924&single=true&output=csv',
};
/* ========================================================================== */

(function () {
  'use strict';

  /* ---------------------------------------------------------------------
     CSV 解析（支援引號包裹的欄位、欄位內逗號、跳脫的雙引號、CRLF）
     --------------------------------------------------------------------- */
  function parseCSV(text) {
    const rows = [];
    let row = [], field = '', inQuotes = false;
    const src = text.replace(/^﻿/, ''); // 去掉 BOM

    for (let i = 0; i < src.length; i++) {
      const ch = src[i];
      if (inQuotes) {
        if (ch === '"') {
          if (src[i + 1] === '"') { field += '"'; i++; } // "" → 一個雙引號
          else inQuotes = false;
        } else field += ch;
      } else if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        row.push(field); field = '';
      } else if (ch === '\n' || ch === '\r') {
        if (ch === '\r' && src[i + 1] === '\n') i++;
        row.push(field); rows.push(row); row = []; field = '';
      } else field += ch;
    }
    if (field !== '' || row.length) { row.push(field); rows.push(row); }
    return rows.filter(r => r.some(c => c.trim() !== ''));
  }

  /** 把 CSV 轉成物件陣列，第一列當欄位名（小寫、去空白）。 */
  function toObjects(rows) {
    if (!rows.length) return [];
    const head = rows[0].map(h => h.trim().toLowerCase());
    return rows.slice(1).map(cols => {
      const o = {};
      head.forEach((key, i) => { o[key] = (cols[i] || '').trim(); });
      return o;
    });
  }

  /** show 欄位：留空或 TRUE / 1 / yes 都算顯示，只有明確的 FALSE 才隱藏。 */
  function isVisible(row) {
    const v = String(row.show || '').trim().toLowerCase();
    return v === '' || v === 'true' || v === '1' || v === 'yes' || v === 'y';
  }

  /** 從 YouTube 網址或純 ID 取出影片 ID。 */
  function youtubeId(input) {
    const raw = String(input || '').trim();
    if (!raw) return '';
    if (/^[\w-]{11}$/.test(raw)) return raw;               // 已經是純 ID
    const m = raw.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/))([\w-]{11})/
    );
    return m ? m[1] : '';
  }

  const PLAY_ICON =
    '<span class="lite-yt__play" aria-hidden="true">' +
    '<svg viewBox="0 0 68 48" focusable="false">' +
    '<path class="yt-bg" d="M66.5 7.7a8.6 8.6 0 0 0-6-6C55.2 0 34 0 34 0S12.8 0 7.5 1.6a8.6 8.6 0 0 0-6 6A90 90 0 0 0 0 24a90 90 0 0 0 1.5 16.3 8.6 8.6 0 0 0 6 6C12.8 48 34 48 34 48s21.2 0 26.5-1.7a8.6 8.6 0 0 0 6-6A90 90 0 0 0 68 24a90 90 0 0 0-1.5-16.3z"/>' +
    '<path class="yt-tri" d="M27 34V14l18 10z"/>' +
    '</svg></span>';

  /* ---------------------------------------------------------------------
     渲染小工具
     --------------------------------------------------------------------- */
  function el(tag, className, html) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (html != null) node.innerHTML = html;
    return node;
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }

  /** 建立一張「點擊才載入」的影片卡。 */
  function videoCard(item, showCategory) {
    const card = el('article', 'video-card');
    const title = item.title || '影像作品';
    const safeTitle = escapeHtml(title);

    const btn = el('button', 'lite-yt');
    btn.type = 'button';
    btn.setAttribute('data-yt-id', item.id);
    btn.setAttribute('aria-label', '播放影片：' + title);
    btn.innerHTML =
      '<img src="https://i.ytimg.com/vi/' + item.id + '/hqdefault.jpg" ' +
      'alt="' + safeTitle + ' — 影片縮圖" loading="lazy" width="480" height="360">' +
      PLAY_ICON;

    card.appendChild(btn);
    card.appendChild(el('h3', 'video-card__title', safeTitle));
    if (showCategory && item.category) {
      card.appendChild(el('p', 'video-card__cat', escapeHtml(item.category)));
    }
    return card;
  }

  /* ---------------------------------------------------------------------
     lite embed：點擊縮圖才換成 iframe（全站委派，fallback 內容也適用）
     --------------------------------------------------------------------- */
  document.addEventListener('click', function (e) {
    const btn = e.target.closest ? e.target.closest('.lite-yt') : null;
    if (!btn || btn.dataset.loaded === '1') return;
    const id = btn.getAttribute('data-yt-id');
    if (!id) return;

    btn.dataset.loaded = '1';
    const iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube-nocookie.com/embed/' + id +
                 '?autoplay=1&rel=0&modestbranding=1';
    iframe.title = btn.getAttribute('aria-label') || 'YouTube 影片';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; ' +
                   'gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    btn.innerHTML = '';
    btn.appendChild(iframe);
  });

  /* ---------------------------------------------------------------------
     資料整理
     --------------------------------------------------------------------- */
  function normalizeWorks(rows) {
    return rows
      .filter(isVisible)
      .map(r => ({
        category: (r.category || '精選作品').trim(),
        title: (r.title || '').trim(),
        id: youtubeId(r.youtube),
        order: r.order === '' || r.order == null ? Infinity : Number(r.order),
      }))
      .filter(w => w.id)
      .map(w => ({ ...w, order: isNaN(w.order) ? Infinity : w.order }));
  }

  /** 依分類分組；分類順序 = Sheet 中首次出現的順序，組內依 order 排序。 */
  function groupWorks(items) {
    const groups = [];
    const index = new Map();
    items.forEach(item => {
      if (!index.has(item.category)) {
        index.set(item.category, groups.length);
        groups.push({ category: item.category, items: [] });
      }
      groups[index.get(item.category)].items.push(item);
    });
    groups.forEach(g => g.items.sort((a, b) => a.order - b.order));
    return groups;
  }

  /** 依 order 排序的扁平清單（首頁預覽用）。 */
  function flatSorted(items) {
    return items.slice().sort((a, b) => a.order - b.order);
  }

  /* ---------------------------------------------------------------------
     各區塊渲染
     --------------------------------------------------------------------- */
  function renderWorksList(container, groups) {
    container.innerHTML = '';
    groups.forEach(group => {
      const section = el('section', 'works-group');
      section.setAttribute('data-category', group.category);

      const h2 = el('h2', 'works-group__title', escapeHtml(group.category));
      h2.appendChild(el('span', 'works-group__count', group.items.length + ' 部作品'));
      section.appendChild(h2);

      const grid = el('div', 'grid grid--works');
      group.items.forEach(item => grid.appendChild(videoCard(item, false)));
      section.appendChild(grid);
      container.appendChild(section);
    });
  }

  function renderFilters(container, groups) {
    if (!container) return;
    container.innerHTML = '';
    const make = (label, value, pressed) => {
      const b = el('button', 'filter-btn', escapeHtml(label));
      b.type = 'button';
      b.setAttribute('data-filter', value);
      b.setAttribute('aria-pressed', pressed ? 'true' : 'false');
      return b;
    };
    container.appendChild(make('全部作品', '*', true));
    groups.forEach(g => container.appendChild(make(g.category, g.category, false)));
  }

  function renderWorksPreview(container, items) {
    const limit = Number(container.getAttribute('data-limit')) || 6;
    container.innerHTML = '';
    flatSorted(items).slice(0, limit)
      .forEach(item => container.appendChild(videoCard(item, true)));
  }

  function renderClients(containers, rows) {
    const list = rows.filter(isVisible)
      .map(r => ({ name: (r.name || '').trim(), logo: (r.logo || '').trim() }))
      .filter(c => c.name);
    if (!list.length) return; // 沒資料就留著 HTML 內建的 fallback

    containers.forEach(container => {
      container.className = 'clients';
      container.innerHTML = '';
      list.forEach(c => {
        const item = el('div', 'client');
        item.innerHTML = c.logo
          ? '<img src="' + escapeHtml(c.logo) + '" alt="' + escapeHtml(c.name) +
            ' logo" loading="lazy">'
          : escapeHtml(c.name);
        item.title = c.name;
        container.appendChild(item);
      });
    });
  }

  /* ---------------------------------------------------------------------
     分類篩選（事件委派，重繪按鈕後仍有效；fallback 靜態內容也適用）
     --------------------------------------------------------------------- */
  function initFilters() {
    const bar = document.querySelector('[data-works-filters]');
    const list = document.querySelector('[data-works-list]');
    if (!bar || !list) return;

    bar.addEventListener('click', function (e) {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      const value = btn.getAttribute('data-filter');

      bar.querySelectorAll('.filter-btn').forEach(b => {
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      });
      list.querySelectorAll('.works-group').forEach(g => {
        const match = value === '*' || g.getAttribute('data-category') === value;
        g.hidden = !match;
      });
    });
  }

  /* ---------------------------------------------------------------------
     抓資料
     --------------------------------------------------------------------- */
  function fetchCSV(url) {
    if (!url) return Promise.reject(new Error('尚未設定 CSV 網址'));
    return fetch(url, { cache: 'no-store' })
      .then(res => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.text();
      })
      .then(text => toObjects(parseCSV(text)));
  }

  function loadWorks() {
    const listEl = document.querySelector('[data-works-list]');
    const previewEl = document.querySelector('[data-works-preview]');
    const filtersEl = document.querySelector('[data-works-filters]');
    if (!listEl && !previewEl) return;

    fetchCSV(SHEET_URLS.works)
      .then(rows => {
        const items = normalizeWorks(rows);
        if (!items.length) throw new Error('works 工作表沒有可顯示的資料');
        if (listEl) {
          const groups = groupWorks(items);
          renderWorksList(listEl, groups);
          renderFilters(filtersEl, groups);
        }
        if (previewEl) renderWorksPreview(previewEl, items);
      })
      .catch(err => {
        // 保留 HTML 內建的 fallback 內容
        console.info('[sheet.js] works 使用內建預設內容：' + err.message);
      });
  }

  function loadClients() {
    const containers = Array.prototype.slice.call(
      document.querySelectorAll('[data-clients-list]')
    );
    if (!containers.length) return;

    fetchCSV(SHEET_URLS.clients)
      .then(rows => renderClients(containers, rows))
      .catch(err => {
        console.info('[sheet.js] clients 使用內建預設內容：' + err.message);
      });
  }

  function init() {
    initFilters();
    loadWorks();
    loadClients();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
