/* CHASOVSHIK.UZ — все цены и контакты меняются только здесь.
   Цены в сумах, «от». null = услуга не применяется. */
window.SITE = {
  phone: '+998 95 838 99 99',
  phoneHref: 'tel:+998958389999',
  telegram: 'https://t.me/+998958389999', // TODO: заменить на username, напр. https://t.me/chasovshik_uz
  instagram: '',                          // TODO: https://instagram.com/...
  map: 'https://yandex.uz/maps/org/chasovshik_uz/70462933949/',
  address: 'Ташкент, Мирабад авеню, 66 — внутри автомойки Blackstar',
  hours: 'Ежедневно с 10:00 до 21:00'
};

/* group: раздел тарифа; q — кварц, m — механика; w — гарантия */
window.PRICES = [
  { id: 'diag',     group: 'Механизм', name: 'Диагностика',                       q: 0,      m: 0,      w: '' },
  { id: 'repass',   group: 'Механизм', name: 'Репассаж механизма',                q: 400000, m: 700000, w: '180 дней' },
  { id: 'repair',   group: 'Механизм', name: 'Ремонт часов',                      q: 400000, m: 600000, w: '180 дней' },
  { id: 'manuf',    group: 'Механизм', name: 'Ремонт мануфактурных калибров',     q: null,   m: 800000, w: '180 дней' },
  { id: 'clean',    group: 'Механизм', name: 'Ультразвуковая чистка',             q: 150000, m: 150000, w: '' },

  { id: 'polish',   group: 'Корпус и браслет', name: 'Полировка корпуса',          q: 600000, m: 600000, w: '' },
  { id: 'rhodium',  group: 'Корпус и браслет', name: 'Родирование корпуса или браслета', q: 800000, m: 800000, w: '' },
  { id: 'strap',    group: 'Корпус и браслет', name: 'Замена ремешка или браслета', q: 250000, m: 250000, w: '' },
  { id: 'braceRep', group: 'Корпус и браслет', name: 'Ремонт браслета или застёжки', q: 100000, m: 100000, w: '' },
  { id: 'fit',      group: 'Корпус и браслет', name: 'Подгонка браслета по руке',  q: 50000,  m: 50000,  w: '' },

  { id: 'glass',    group: 'Стекло и циферблат', name: 'Замена или полировка стекла', q: 150000, m: 150000, w: '' },
  { id: 'hands',    group: 'Стекло и циферблат', name: 'Установка или замена стрелок и цифр', q: 100000, m: 100000, w: '' },

  { id: 'batt',     group: 'Батарейки', name: 'Замена батарейки',                    q: 50000,  m: null,   w: '' },
  { id: 'renata',   group: 'Батарейки', name: 'Швейцарская батарейка Renata',        q: 100000, m: null,   w: '1 год' }
];

/* Подписи этапов сборки в hero: какая деталь — какая услуга */
window.STAGES = [
  { title: 'Механизм',  service: 'Репассаж механизма',          price: 'repass' },
  { title: 'Циферблат', service: 'Установка стрелок и цифр',    price: 'hands' },
  { title: 'Корпус',    service: 'Ультразвуковая чистка',       price: 'clean' },
  { title: 'Браслет',   service: 'Замена и подгонка браслетов', price: 'fit' },
  { title: 'Безель',    service: 'Полировка корпуса и безеля',  price: 'polish' },
  { title: 'Стекло',    service: 'Замена стекла',               price: 'glass' }
];

window.fmtPrice = function (v) {
  if (v === 0) return 'бесплатно';
  if (v == null) return '—';
  return 'от ' + String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' сум';
};
window.priceOf = function (id) {
  var p = window.PRICES.find(function (x) { return x.id === id; });
  if (!p) return '';
  var v = p.q == null ? p.m : (p.m == null ? p.q : Math.min(p.q, p.m));
  return window.fmtPrice(v);
};
