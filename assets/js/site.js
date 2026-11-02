/* Island Integration — shared behaviour (no dependencies).
   Everything here is progressive enhancement: the site is fully usable
   and readable if this file fails to load. */
(function () {
  'use strict';

  var doc = document;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Mobile navigation ------------------------------------------------ */
  var toggle = doc.querySelector('.nav-toggle');
  var nav = doc.getElementById('site-nav');
  if (toggle && nav) {
    var setOpen = function (open, returnFocus) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      nav.classList.toggle('is-open', open);
      if (!open && returnFocus) toggle.focus();
    };
    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setOpen(false, true);
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    doc.addEventListener('click', function (e) {
      if (toggle.getAttribute('aria-expanded') === 'true' && !e.target.closest('.site-header')) setOpen(false);
    });
    // leaving the mobile layout (rotate / resize) closes the panel
    var mq = window.matchMedia('(min-width: 56.3em)');
    var onMq = function () { if (mq.matches) setOpen(false); };
    if (mq.addEventListener) mq.addEventListener('change', onMq); else if (mq.addListener) mq.addListener(onMq);
  }

  /* ---- Header border once the page scrolls ----------------------------- */
  var header = doc.querySelector('.site-header');
  if (header) {
    var stick = function () { header.classList.toggle('is-stuck', (window.scrollY || 0) > 8); };
    window.addEventListener('scroll', stick, { passive: true });
    stick();
  }

  /* ---- Reveal on scroll (once; never hides content if IO is missing) --- */
  var revealEls = doc.querySelectorAll('.reveal');
  if (revealEls.length) {
    if (!('IntersectionObserver' in window) || reduceMotion) {
      revealEls.forEach(function (el) { el.classList.add('is-in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { entry.target.classList.add('is-in'); io.unobserve(entry.target); }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      revealEls.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---- Hero video: only for people who will benefit -------------------- */
  var video = doc.querySelector('video[data-hero-video]');
  if (video) {
    var conn = navigator.connection || {};
    var slow = conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '');
    var wide = window.matchMedia('(min-width: 48em)').matches;
    if (!reduceMotion && !slow && wide) {
      var sources = [
        { src: video.getAttribute('data-webm'), type: 'video/webm' },
        { src: video.getAttribute('data-mp4'), type: 'video/mp4' }
      ];
      sources.forEach(function (s) {
        if (!s.src) return;
        var el = doc.createElement('source');
        el.src = s.src; el.type = s.type;
        video.appendChild(el);
      });
      video.muted = true; // required for autoplay in every browser
      video.addEventListener('canplay', function () { video.classList.add('is-ready'); }, { once: true });
      video.load();
      var btn = doc.querySelector('.hero__pause');
      var p = video.play();
      if (p && p.then) {
        p.then(function () { if (btn) btn.hidden = false; })
         .catch(function () { /* autoplay blocked: the poster stays visible */ });
      }
      // WCAG 2.2.2: moving content that lasts > 5s needs a pause control
      if (btn) {
        btn.addEventListener('click', function () {
          var paused = video.paused;
          if (paused) { video.play(); } else { video.pause(); }
          btn.setAttribute('aria-pressed', String(!paused));
          btn.querySelector('span').textContent = paused ? 'Pause video' : 'Play video';
        });
      }
    }
  }

  /* ---- Contact form: composes an email (no backend on GitHub Pages) ---- */
  var form = doc.querySelector('form[data-mailto]');
  if (form) {
    var status = form.querySelector('.form__status');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var v = function (n) { var el = form.elements[n]; return el ? String(el.value || '').trim() : ''; };
      var to = form.getAttribute('data-mailto');
      var subject = 'Consultation request' + (v('interest') ? ' — ' + v('interest') : '') + ' — ' + v('name');
      var body = [
        'Name: ' + v('name'),
        'Email: ' + v('email'),
        'Phone: ' + (v('phone') || '—'),
        'Interested in: ' + (v('interest') || '—'),
        '',
        'Message:',
        v('message') || '—'
      ].join('\n');
      var href = 'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      if (status) {
        status.textContent = 'Opening your email app… If nothing happens, email ' + to + ' or call +1 (242) 820-9013.';
      }
      window.location.href = href;
    });
  }

  /* ---- Footer year ----------------------------------------------------- */
  var y = doc.getElementById('year');
  if (y) y.textContent = String(new Date().getFullYear());
})();
