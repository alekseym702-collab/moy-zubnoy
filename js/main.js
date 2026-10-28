/* МОЙ ЗУБНОЙ — интерактив */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  /* ---------- ШАПКА ---------- */
  var hdr = $('#hdr');
  if (hdr) {
    var onScroll = function () { hdr.classList.toggle('scrolled', window.scrollY > 10); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- МОБИЛЬНОЕ МЕНЮ ---------- */
  var nav = $('#nav'), burger = $('#burger'), veil = $('#menuVeil'), navClose = $('#navClose');
  function setMenu(open) {
    if (!nav) return;
    nav.classList.toggle('open', open);
    if (veil) veil.classList.toggle('open', open);
    if (burger) burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (burger) burger.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  if (navClose) navClose.addEventListener('click', function () { setMenu(false); });
  if (veil) veil.addEventListener('click', function () { setMenu(false); });
  if (nav) $$('.faq-q', document); // no-op
  if (nav) $$('.faq-q', document);
  if (nav) {
    $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* ---------- ПОЯВЛЕНИЕ БЛОКОВ ---------- */
  var rvs = $$('.rv');
  if (reduce || !('IntersectionObserver' in window)) {
    rvs.forEach(function (el) { el.classList.add('on'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('on'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    rvs.forEach(function (el) { io.observe(el); });
  }

  /* ---------- ЦИФРЫ ---------- */
  $$('.count').forEach(function (el) {
    if (reduce) { el.textContent = el.dataset.to; return; }
    el.textContent = '0';
    if (!('IntersectionObserver' in window)) { el.textContent = el.dataset.to; return; }
    var seen = false;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting || seen) return;
        seen = true;
        var target = Number(el.dataset.to), start = null;
        function step(t) {
          if (!start) start = t;
          var p = Math.min((t - start) / 1200, 1);
          el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        obs.disconnect();
      });
    }, { threshold: 0.6 });
    obs.observe(el);
  });

  /* ---------- FAQ ---------- */
  $$('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.parentElement, ans = $('.faq-a', item);
      var isOpen = item.classList.contains('open');
      $$('.faq-item.open').forEach(function (other) {
        other.classList.remove('open');
        $('.faq-a', other).style.maxHeight = null;
        $('.faq-q', other).setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        ans.style.maxHeight = ans.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------- ФИЛЬТР ДОКУМЕНТОВ ---------- */
  $$('.filter-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      $$('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var f = btn.dataset.filter;
      $$('.cert').forEach(function (card) {
        card.hidden = !(f === 'all' || card.dataset.type === f);
      });
    });
  });

  /* ---------- МОДАЛКА ДОКУМЕНТОВ ---------- */
  var modal = $('#docModal'), lastFocus = null;
  function openDoc(card) {
    if (!modal) return;
    lastFocus = card;
    $('#modalTitle').textContent = card.dataset.title;
    $('#modalCode').textContent = card.dataset.code;
    $('#modalDesc').textContent = card.dataset.desc;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    $('#modalClose').focus();
  }
  function closeDoc() {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  $$('.cert').forEach(function (card) {
    card.addEventListener('click', function () { openDoc(card); });
  });
  if (modal) {
    $('#modalClose').addEventListener('click', closeDoc);
    modal.addEventListener('click', function (e) { if (e.target === modal) closeDoc(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hidden) closeDoc();
    });
  }

  /* ---------- COOKIE ---------- */
  var cookie = $('#cookie');
  if (cookie && !store.get('mz_cookie', false)) {
    setTimeout(function () { cookie.classList.add('show'); }, 1000);
    $('#cookieOk').addEventListener('click', function () {
      store.set('mz_cookie', true);
      cookie.classList.remove('show');
    });
  }

  /* ==========================================================
     ВЕРСИЯ ДЛЯ СЛАБОВИДЯЩИХ — работает и сохраняется
     ========================================================== */
  var aBtn = $('#a11yBtn'), aPanel = $('#a11yPanel');
  if (aBtn && aPanel) {
    var root = document.documentElement;
    var state = store.get('mz_a11y', { size: 0, contrast: false, noimg: false });
    var contrastBox = $('#a11yContrast'), noimgBox = $('#a11yNoImg');

    function apply() {
      root.classList.remove('a11y-on', 'a11y-1', 'a11y-2', 'a11y-contrast', 'a11y-noimg');
      root.classList.add('a11y-on');
      if (state.size === 1) root.classList.add('a11y-1');
      if (state.size === 2) root.classList.add('a11y-2');
      if (state.contrast) root.classList.add('a11y-contrast');
      if (state.noimg) root.classList.add('a11y-noimg');
      $$('[data-size]').forEach(function (b) {
        b.classList.toggle('active', Number(b.dataset.size) === state.size);
        b.setAttribute('aria-pressed', String(Number(b.dataset.size) === state.size));
      });
      if (contrastBox) contrastBox.checked = !!state.contrast;
      if (noimgBox) noimgBox.checked = !!state.noimg;
      store.set('mz_a11y', state);
    }
    apply();

    aBtn.addEventListener('click', function () {
      var open = aPanel.hidden;
      aPanel.hidden = !open;
      aBtn.setAttribute('aria-expanded', String(open));
    });

    $$('[data-size]').forEach(function (b) {
      b.addEventListener('click', function () {
        state.size = Number(b.dataset.size);
        apply();
      });
    });
    if (contrastBox) contrastBox.addEventListener('change', function () {
      state.contrast = contrastBox.checked; apply();
    });
    if (noimgBox) noimgBox.addEventListener('change', function () {
      state.noimg = noimgBox.checked; apply();
    });
    $('#a11yReset').addEventListener('click', function () {
      state = { size: 0, contrast: false, noimg: false };
      root.classList.remove('a11y-on', 'a11y-1', 'a11y-2', 'a11y-contrast', 'a11y-noimg');
      store.set('mz_a11y', state);
      apply();
    });

    document.addEventListener('click', function (e) {
      if (!aPanel.hidden && !aPanel.contains(e.target) && !aBtn.contains(e.target)) {
        aPanel.hidden = true;
        aBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- ПЕЧАТЬ ЮРИДИЧЕСКИХ СТРАНИЦ ---------- */
  var printBtn = $('#printBtn');
  if (printBtn) printBtn.addEventListener('click', function () { window.print(); });
})();