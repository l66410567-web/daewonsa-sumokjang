/* =========================================================
   대원사 꽃길숲 수목장 — 공용 스크립트
   이 파일을 고치면 모든 HTML의 script.js?v= 값을 함께 올릴 것
   ========================================================= */
(function () {
  'use strict';

  /* 모바일 메뉴 */
  var menuBtn = document.querySelector('.menu-btn');
  var mnav = document.getElementById('mnav');
  if (menuBtn && mnav) {
    menuBtn.addEventListener('click', function () {
      var open = mnav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.querySelector('.label').textContent = open ? '닫기' : '메뉴';
      document.body.style.overflow = open ? 'hidden' : '';
    });
  }

  /* 사진 자리: data-photo 파일이 실제로 있으면 자동으로 표시 */
  document.querySelectorAll('.photo[data-photo]').forEach(function (el) {
    var src = el.getAttribute('data-photo');
    var img = new Image();
    img.onload = function () {
      el.style.backgroundImage = 'url("' + src + '")';
      el.classList.add('has-img');
    };
    img.src = src;
  });

  /* 사계절 탭 */
  var tabs = document.querySelectorAll('.tab');
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTab(tab); });
    tab.addEventListener('keydown', function (e) {
      var n = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!n) return;
      var next = tabs[(i + n + tabs.length) % tabs.length];
      selectTab(next); next.focus();
    });
  });
  function selectTab(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
  }

  /* 꽃길 따라가기: 스크롤하면 진행선이 채워지고 지점이 나타남 */
  var trail = document.querySelector('.trail');
  if (trail) {
    var fill = trail.querySelector('.trail-fill');
    var walker = trail.querySelector('.trail-walker');
    var stops = trail.querySelectorAll('.trail-stop');
    var ticking = false;
    var update = function () {
      ticking = false;
      var r = trail.getBoundingClientRect();
      var vh = window.innerHeight;
      var max = trail.offsetHeight - 16;
      var p = (vh * 0.6 - r.top) / max;
      p = Math.max(0, Math.min(1, p));
      var h = Math.round(p * max);
      fill.style.height = h + 'px';
      walker.style.top = (8 + h) + 'px';
      stops.forEach(function (s) {
        var sr = s.getBoundingClientRect();
        if (sr.top < vh * 0.72) s.classList.add('on');
      });
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }
})();
