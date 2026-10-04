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
      mnav.style.top = Math.max(0, document.querySelector('.site-header').getBoundingClientRect().bottom) + 'px';
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

  /* 슬라이더 (data-slider): 자동 넘김 + 점 + 화살표 + 손가락 넘기기 */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-slider]').forEach(function (box) {
    var slides = box.querySelectorAll('.slide');
    var dots = box.querySelector('.slider-dots');
    var cur = 0, timer = null;
    var ms = parseInt(box.getAttribute('data-interval'), 10) || 5000;
    var dotBtns = [];
    slides.forEach(function (_, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', (i + 1) + '번째 사진 보기');
      b.addEventListener('click', function () { go(i); restart(); });
      if (dots) dots.appendChild(b);
      dotBtns.push(b);
    });
    function go(n) {
      cur = (n + slides.length) % slides.length;
      slides.forEach(function (s, i) { s.classList.toggle('is-active', i === cur); });
      dotBtns.forEach(function (b, i) { b.setAttribute('aria-current', i === cur ? 'true' : 'false'); });
      var cnt = box.querySelector('.slider-count');
      if (cnt) cnt.textContent = ('0' + (cur + 1)).slice(-2) + ' / ' + ('0' + slides.length).slice(-2);
    }
    function restart() {
      clearInterval(timer);
      if (!reduce) timer = setInterval(function () { go(cur + 1); }, ms);
    }
    var prev = box.querySelector('.slider-arrow.prev');
    var next = box.querySelector('.slider-arrow.next');
    if (prev) prev.addEventListener('click', function () { go(cur - 1); restart(); });
    if (next) next.addEventListener('click', function () { go(cur + 1); restart(); });
    var x0 = null;
    box.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) { go(cur + (dx < 0 ? 1 : -1)); restart(); }
      x0 = null;
    });
    box.addEventListener('mouseenter', function () { clearInterval(timer); });
    box.addEventListener('mouseleave', restart);
    go(0); restart();
  });

  /* 사진 카드 캐러셀 (data-carousel): 이전/다음 버튼으로 한 장씩 */
  document.querySelectorAll('[data-carousel]').forEach(function (car) {
    var track = car.querySelector('.car-track');
    var scope = car.closest('section') || document;
    var step = function () { var c = track.querySelector('a'); return c ? c.getBoundingClientRect().width + 14 : 280; };
    var prev = scope.querySelector('.car-prev'), next = scope.querySelector('.car-next');
    if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
    if (next) next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
  });

  /* 맨 위로 버튼 */
  var toTop = document.querySelector('.to-top');
  if (toTop) {
    var onScroll = function () { toTop.classList.toggle('show', window.scrollY > 500); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    toTop.addEventListener('click', function (e) { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  /* 가까운 거리 동심원: 화면에 들어오면 퍼지는 연출 시작 */
  var nearMap = document.querySelector('.near-map');
  if (nearMap) {
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es, ob) {
        es.forEach(function (e) { if (e.isIntersecting) { nearMap.classList.add('in'); ob.disconnect(); } });
      }, { threshold: 0.35 }).observe(nearMap);
    } else { nearMap.classList.add('in'); }
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
