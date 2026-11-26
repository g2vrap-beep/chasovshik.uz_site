/* CHASOVSHIK.UZ — источник визита, кнопка Telegram и события аналитики.
   Источник запоминается при первом заходе на 30 дней и добавляется в сообщение
   менеджеру кодом в квадратных скобках: [IG], [FB-ADS], [G], [Y-ADS] …          */
(function () {
  'use strict';
  var KEY = 'chs_src', DAYS = 30;

  /* ---------- определение источника ---------- */
  function detect() {
    var q = new URLSearchParams(location.search);
    var us = (q.get('utm_source') || '').toLowerCase();
    var um = (q.get('utm_medium') || '').toLowerCase();
    var uc = (q.get('utm_campaign') || '').replace(/[^\w-]/g, '').slice(0, 16);
    var paid = /cpc|ppc|paid|ads|target|cpm/.test(um);
    var code = '';
    if (q.get('gclid') || q.get('gbraid') || q.get('wbraid')) code = 'G-ADS';
    else if (q.get('yclid')) code = 'Y-ADS';
    else if (us) {
      var map = { instagram: 'IG', ig: 'IG', facebook: 'FB', fb: 'FB', meta: 'FB', google: 'G', yandex: 'Y',
                  telegram: 'TG', tg: 'TG', tiktok: 'TT', youtube: 'YT', '2gis': '2GIS' };
      code = map[us] || us.toUpperCase().slice(0, 8);
      if (paid || (q.get('fbclid') && (code === 'IG' || code === 'FB'))) code += '-ADS';
    } else if (q.get('fbclid')) code = 'FB';
    else {
      var r = document.referrer, h = '';
      try { h = r ? new URL(r).hostname : ''; } catch (e) {}
      if (!h || h === location.hostname) code = 'DIRECT';
      else if (/google\./.test(h)) code = 'G';
      else if (/yandex\.|ya\.ru/.test(h)) code = /maps|yandex\.\w+\/maps/.test(r) ? 'Y-MAPS' : 'Y';
      else if (/instagram\.com/.test(h)) code = 'IG';
      else if (/facebook\.com|fb\.com/.test(h)) code = 'FB';
      else if (/t\.me|telegram/.test(h)) code = 'TG';
      else if (/2gis/.test(h)) code = '2GIS';
      else code = 'REF:' + h.replace(/^www\./, '').slice(0, 20);
    }
    if (uc && code.indexOf('ADS') > -1) code += '-' + uc;
    return code;
  }
  function source() {
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
    var fresh = detect();
    var fromAd = fresh !== 'DIRECT' && fresh.indexOf('REF:') !== 0;
    // новый рекламный/поисковый заход перезаписывает; «прямой» повторный — нет
    if (!saved || Date.now() - saved.t > DAYS * 864e5 || fromAd) {
      saved = { c: fresh, t: Date.now() };
      try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) {}
    }
    return saved.c;
  }
  var SRC = source();
  try { if (window.ym) ym(114705394, 'params', { src: SRC }); } catch (e) {}

  /* ---------- события: в Метрику, GA4, Meta Pixel и Clarity, если они подключены ---------- */
  var YM_ID = 114705394;   // Яндекс Метрика: CHASOVSHIK — chasovshik.uz
  function track(name, params) {
    params = params || {};
    params.src = SRC;
    try { if (window.ym && YM_ID) ym(YM_ID, 'reachGoal', name, params); } catch (e) {}
    try { if (window.gtag) gtag('event', name, params); } catch (e) {}
    try {
      if (window.fbq) {
        if (name === 'telegram_click' || name === 'phone_click') fbq('track', 'Contact', params);
        else fbq('trackCustom', name, params);
      }
    } catch (e) {}
    try { if (window.clarity) { clarity('event', name); clarity('set', 'src', SRC); } } catch (e) {}
  }

  /* ---------- Telegram: сразу в приложение, с готовым текстом и кодом источника ---------- */
  var mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  function openTelegram(text, place, service) {
    var user = (window.SITE && window.SITE.telegram) || 'chasovshikuz_mirobod';
    var msg = (text || 'Здравствуйте! Хочу узнать про ремонт часов.') + ' [' + SRC + ']';
    var enc = encodeURIComponent(msg);
    var web = 'https://t.me/' + user + '?text=' + enc;
    track('telegram_click', { place: place || '', service: service || '' });
    if (mobile) { location.href = web; return; }   // телефон: t.me сразу открывает приложение Telegram
    window.open(web, '_blank', 'noopener');         // компьютер: t.me предлагает открыть Telegram Desktop
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a');
    if (!a) return;
    if (a.classList.contains('js-tg')) {
      e.preventDefault();
      openTelegram(a.getAttribute('data-msg'), a.getAttribute('data-place'));
    } else if (/^tel:/.test(a.getAttribute('href') || '')) {
      var sec = a.closest('section, header, footer, .mbar');
      track('phone_click', { place: sec ? (sec.id || sec.className.split(' ')[0]) : '' });
    } else if (a.classList.contains('js-map')) {
      track('map_click');
    } else if (a.classList.contains('js-ig')) {
      track('instagram_click', { place: a.getAttribute('data-place') || '' });
    }
  }, true);

  /* ---------- поведение: какие блоки досмотрели, что открывали ---------- */
  var seen = {};
  function once(name, params) { if (seen[name]) return; seen[name] = 1; track(name, params); }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { once('view_' + en.target.id); io.unobserve(en.target); } });
    }, { threshold: .35 });
    ['prices', 'calc', 'about', 'why', 'process', 'faq', 'contacts'].forEach(function (id) {
      var el = document.getElementById(id); if (el) io.observe(el);
    });
  }
  document.addEventListener('toggle', function (e) {
    if (e.target.tagName === 'DETAILS' && e.target.open) {
      track('faq_open', { q: e.target.querySelector('summary').textContent.slice(0, 60) });
    }
  }, true);
  document.addEventListener('change', function (e) {
    if (e.target.name === 'svc') track('calc_select', { service: e.target.value });
    if (e.target.name === 'kind') track('calc_kind', { kind: e.target.value });
  });

  window.CHS = { source: SRC, track: track, once: once, openTelegram: openTelegram };
})();
