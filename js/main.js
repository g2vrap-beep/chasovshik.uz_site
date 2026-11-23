/* CHASOVSHIK.UZ — ссылки, тариф, этапы hero, калькулятор */
(function () {
  'use strict';
  var S = window.SITE, P = window.PRICES, fmt = window.fmtPrice;
  /* в тарифе без «сум» — валюта указана в подзаголовке */
  function short(v) { return fmt(v).replace(/\u00a0сум$/, ''); }

  /* ссылки из data.js */
  document.querySelectorAll('.js-phone').forEach(function (a) { a.href = S.phoneHref; });
  document.querySelectorAll('.js-map').forEach(function (a) { a.href = S.map; });

  /* этапы сборки в hero */
  var ol = document.querySelector('.hero-stages');
  if (ol && window.STAGES) {
    ol.innerHTML = window.STAGES.map(function (s) {
      return '<li><span class="st-part">' + s.title + '</span><span class="st-svc">' + s.service +
        '</span><span class="st-price">' + window.priceOf(s.price) + '</span></li>';
    }).join('');
  }

  /* тариф */
  var box = document.getElementById('tariff');
  if (box) {
    var groups = [];
    P.forEach(function (p) { if (groups.indexOf(p.group) < 0) groups.push(p.group); });
    box.innerHTML = groups.map(function (g) {
      var rows = P.filter(function (p) { return p.group === g; });
      var hasM = rows.some(function (r) { return r.m != null; });
      var hasQ = rows.some(function (r) { return r.q != null; });
      return '<div class="t-group"><h3>' + g + '</h3><table><thead><tr><th scope="col">Услуга</th>' +
        (hasQ ? '<th scope="col">Кварц</th>' : '') + (hasM ? '<th scope="col">Механика</th>' : '') +
        '<th scope="col">Гарантия</th></tr></thead><tbody>' +
        rows.map(function (r) {
          return '<tr><th scope="row"><span>' + r.name + '</span></th>' +
            (hasQ ? '<td data-l="Кварц">' + short(r.q) + '</td>' : '') +
            (hasM ? '<td data-l="Механика">' + short(r.m) + '</td>' : '') +
            '<td class="w' + (r.w ? '' : ' w-empty') + '" data-l="Гарантия">' + (r.w || '—') + '</td></tr>';
        }).join('') + '</tbody></table></div>';
    }).join('');
  }

  /* калькулятор */
  var form = document.getElementById('calcForm');
  if (!form) return;
  var chips = document.getElementById('calcChips');
  var outName = document.getElementById('calcName');
  var outPrice = document.getElementById('calcPrice');
  var outNote = document.getElementById('calcNote');
  var hint = document.getElementById('calcHint');
  var current = 'repass';

  function kind() { return form.querySelector('input[name=kind]:checked').value; }
  function draw() {
    var k = kind();
    var list = P.filter(function (p) { return p[k] != null; });
    if (!list.some(function (p) { return p.id === current; })) current = list[0].id;
    chips.innerHTML = list.map(function (p) {
      return '<label><input type="radio" name="svc" value="' + p.id + '"' + (p.id === current ? ' checked' : '') +
        '><span>' + p.name + '</span></label>';
    }).join('');
    var item = P.find(function (p) { return p.id === current; });
    outName.textContent = item.name + (k === 'q' ? ', кварцевые часы' : ', механические часы');
    outPrice.textContent = fmt(item[k]);
    outNote.textContent = (item[k] === 0 ? 'Без оплаты, даже если ремонт не понадобится.' :
      item.group === 'Батарейки' ? 'Цена включает батарейку и работу.' :
      'Точную цену назовём после бесплатной диагностики.') + (item.w ? ' Гарантия ' + item.w + '.' : '');
    hint.textContent = '';
  }
  form.addEventListener('change', function (e) {
    if (e.target.name === 'svc') current = e.target.value;
    draw();
  });
  document.getElementById('calcSend').addEventListener('click', function () {
    var k = kind(), item = P.find(function (p) { return p.id === current; });
    var msg = 'Здравствуйте! Хочу узнать точную цену: ' + item.name.toLowerCase() + ', ' +
      (k === 'q' ? 'кварцевые' : 'механические') + ' часы. Марка и модель: ';
    window.CHS.openTelegram(msg, 'calculator', item.id);
  });
  draw();
})();
