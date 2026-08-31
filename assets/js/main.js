/* ==========================================================================
   main.js — 全站共用互動（目前只有手機版導覽列開合）
   ========================================================================== */
(function () {
  'use strict';

  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');
  if (!toggle || !nav) return;

  function setOpen(open) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? '關閉選單' : '開啟選單');
  }

  toggle.addEventListener('click', function () {
    setOpen(!nav.classList.contains('is-open'));
  });

  // 點選單連結後自動關閉
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setOpen(false);
  });

  // Esc 關閉、放大到桌機寬度時重置
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      setOpen(false);
      toggle.focus();
    }
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 900) setOpen(false);
  });
})();

/* ==========================================================================
   hero 背景影片
   --------------------------------------------------------------------------
   桌機／平板（≥768px）才把 data-src 設成 src，手機只顯示 poster 圖，
   不浪費行動網路流量。影片檔不存在或載入失敗時直接留在 poster 圖，版面不會壞。
   ========================================================================== */
(function () {
  'use strict';

  const video = document.querySelector('.hero__video');
  if (!video) return;

  const src = video.getAttribute('data-src');
  if (!src) return;

  // 使用者若在系統偏好中關閉動態效果，就不自動播放影片
  const reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wideEnough = !window.matchMedia ||
    window.matchMedia('(min-width: 768px)').matches;

  if (reduceMotion || !wideEnough) return;

  // 影片抓不到（尚未上傳、404、格式不支援）就移除 src，poster 圖照樣顯示
  video.addEventListener('error', function () {
    video.removeAttribute('src');
    video.load();
  }, { once: true });

  video.src = src;
  const play = video.play();
  if (play && typeof play.catch === 'function') play.catch(function () {});
})();
