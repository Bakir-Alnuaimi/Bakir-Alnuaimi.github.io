(function () {
  'use strict';

  var root = document.documentElement;
  var body = document.body;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function store(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, value);
    } catch (e) { return null; }
  }

  function copyText(text, onDone, onFail) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(onDone, onFail);
    } else {
      onFail();
    }
  }

  // language
  var langButtons = document.querySelectorAll('.seg button');

  function setLang(lang) {
    body.setAttribute('data-lang', lang);
    root.lang = lang;
    langButtons.forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
    });
    store('bz-lang', lang);
  }

  var browserLang = (navigator.language || 'de').slice(0, 2) === 'de' ? 'de' : 'en';
  setLang(store('bz-lang') || browserLang);
  langButtons.forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.dataset.lang); });
  });

  // theme
  document.getElementById('themeBtn').addEventListener('click', function () {
    var current = root.getAttribute('data-theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    var next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    store('bz-theme', next);
  });

  // mobile menu
  var menuBtn = document.getElementById('menuBtn');
  var mobileNav = document.getElementById('mobileNav');

  function setMenu(open) {
    mobileNav.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
  }

  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', function () { setMenu(mobileNav.hidden); });
    mobileNav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    window.addEventListener('resize', function () { if (window.innerWidth > 900) setMenu(false); });
  }

  // progress bar + active nav link
  var bar = document.createElement('div');
  bar.className = 'progress';
  body.appendChild(bar);

  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));
  var sections = navLinks.map(function (a) { return document.querySelector(a.getAttribute('href')); });

  function onScroll() {
    var max = root.scrollHeight - root.clientHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? root.scrollTop / max : 0) + ')';

    var current = -1;
    sections.forEach(function (s, i) {
      if (s && s.getBoundingClientRect().top < 120) current = i;
    });
    navLinks.forEach(function (a, i) { a.classList.toggle('active', i === current); });
  }

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // copy e-mail buttons
  var contactBtn = document.getElementById('copyMail');
  if (contactBtn) {
    contactBtn.addEventListener('click', function () {
      var mail = document.getElementById('mail');
      var label = contactBtn.innerHTML;
      copyText(mail.textContent.trim(), function () {
        contactBtn.textContent = '✓';
        setTimeout(function () { contactBtn.innerHTML = label; }, 1500);
      }, function () {
        var range = document.createRange();
        range.selectNodeContents(mail);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      });
    });
  }

  var glanceBtn = document.getElementById('copyMail2');
  if (glanceBtn) {
    glanceBtn.addEventListener('click', function () {
      var mail = glanceBtn.getAttribute('data-mail');
      var label = glanceBtn.querySelector('.lbl');
      var original = label.innerHTML;
      copyText(mail, function () {
        label.textContent = '✓ ' + mail;
        setTimeout(function () { label.innerHTML = original; }, 1800);
      }, function () {
        label.textContent = mail;
      });
    });
  }

  if (reduceMotion) {
    document.querySelectorAll('.diagram svg').forEach(function (svg) {
      if (svg.pauseAnimations) svg.pauseAnimations();
    });
    return;
  }

  // everything below is animation only

  function whenVisible(el, cb, options) {
    if (!('IntersectionObserver' in window)) { cb(el, true, { unobserve: function () {} }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { cb(entry.target, entry.isIntersecting, io); });
    }, options);
    io.observe(el);
  }

  // stats count up
  document.querySelectorAll('[data-count]').forEach(function (el) {
    var end = Number(el.getAttribute('data-count'));
    var start = null;
    el.textContent = '0';

    function step(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / 900, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }

    setTimeout(function () { requestAnimationFrame(step); }, 700);
  });

  // fade in sections below the fold
  document.querySelectorAll('.reveal').forEach(function (el) {
    if (el.getBoundingClientRect().top <= window.innerHeight) return;
    el.classList.add('pre');
    whenVisible(el, function (target, visible, io) {
      if (!visible) return;
      target.classList.remove('pre');
      io.unobserve(target);
    }, { rootMargin: '0px 0px -8% 0px' });
  });

  // terminal: print lines once it scrolls into view
  var term = document.getElementById('term');
  if (term) {
    var lines = term.querySelectorAll('.term-line');
    lines.forEach(function (l) { l.classList.add('pending'); });
    whenVisible(term, function (target, visible, io) {
      if (!visible) return;
      io.unobserve(target);
      lines.forEach(function (l, i) {
        setTimeout(function () {
          l.classList.remove('pending');
          l.classList.add('show');
        }, 150 + i * 230);
      });
    }, { threshold: 0.3 });
  }

  // run diagram animations only while on screen
  document.querySelectorAll('.diagram').forEach(function (d) {
    var svg = d.querySelector('svg');
    if (svg && svg.pauseAnimations) svg.pauseAnimations();
    whenVisible(d, function (target, visible) {
      target.classList.toggle('play', visible);
      if (svg && svg.pauseAnimations) {
        if (visible) svg.unpauseAnimations(); else svg.pauseAnimations();
      }
    }, { threshold: 0.25 });
  });
})();
