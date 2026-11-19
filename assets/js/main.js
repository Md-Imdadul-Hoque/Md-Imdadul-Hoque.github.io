/* Md Imdadul Hoque · portfolio script. Plain JavaScript, no dependencies.
   1 Language  2 Mobile menu  3 E-mail links  4 CV button  5 Image viewer  6 Header */
(function () {
  'use strict';

  var doc = document;
  var html = doc.documentElement;
  function all(sel) { return Array.prototype.slice.call(doc.querySelectorAll(sel)); }

  /* 1 · Language. German pages live in /de/ and have lang="de" */
  var lang = (html.getAttribute('lang') || 'en').slice(0, 2) === 'de' ? 'de' : 'en';
  var TEXT = {
    en: { subject: 'CV request', copied: 'Copied' },
    de: { subject: 'Anfrage Lebenslauf', copied: 'Kopiert' }
  }[lang];

  /* 2 · Mobile menu */
  var menuBtn = doc.querySelector('.menu-btn');
  var nav = doc.getElementById('site-nav');
  function setMenu(open) {
    if (!menuBtn || !nav) return;
    menuBtn.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  }
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () {
      setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
    });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    window.addEventListener('resize', function () { if (window.innerWidth > 1240) setMenu(false); });
  }

  /* 3 · E-mail links: the address is put together here, so it is not sitting in the HTML for spam bots */
  var address = 'imdadul.mhoque' + '@' + 'gmail.com';
  all('[data-mail]').forEach(function (a) {
    a.setAttribute('href', 'mailto:' + address);
    if (a.hasAttribute('data-mail-text')) a.textContent = address;
  });
  all('[data-mail-show]').forEach(function (el) { el.textContent = address; });
  var copyBtn = doc.querySelector('[data-copy-mail]');
  if (copyBtn && navigator.clipboard && navigator.clipboard.writeText) {
    copyBtn.hidden = false;
    copyBtn.addEventListener('click', function () {
      navigator.clipboard.writeText(address).then(function () {
        var label = copyBtn.querySelector('span');
        if (!label) return;
        var before = label.textContent;
        label.textContent = TEXT.copied;
        setTimeout(function () { label.textContent = before; }, 1800);
      });
    });
  }

  /* 4 · CV buttons. They open the PDFs in assets/cv/ in a new tab (the links are in the HTML, so
       they work without JavaScript and from a local copy):
       English pages: CV_Md_Imdadul_Hoque.pdf
       German pages:  Lebenslauf_Md_Imdadul_Hoque.pdf
     Online, if a file is missing, the buttons fall back to an e-mail asking for the CV. */
  var cvLinks = all('[data-cv]');
  function cvByMail() {
    cvLinks.forEach(function (a) {
      a.setAttribute('href', 'mailto:' + address + '?subject=' + encodeURIComponent(TEXT.subject));
      a.removeAttribute('target');
    });
  }
  if (cvLinks.length && window.fetch && location.protocol.indexOf('http') === 0) {
    fetch(cvLinks[0].href, { method: 'HEAD' }).then(function (res) {
      var type = res.headers.get('content-type') || '';
      if (!res.ok || type.indexOf('html') !== -1) cvByMail();
    }).catch(function () {});
  }

  /* 5 · Viewer for certificates, diagrams and screenshots.
       data-lightbox         one image, shown whole
       data-lightbox="doc"   a document: its pages below each other, scrollable.
                             data-pages lists the page images, separated by spaces (default: the link's href) */
  var box = doc.getElementById('lightbox');
  var boxPages = box && box.querySelector('.lightbox-pages');
  if (box && boxPages && typeof box.showModal === 'function') {
    var boxCap = box.querySelector('figcaption');
    var openBox = function (link) {
      var thumb = link.querySelector('img');
      var caption = link.getAttribute('data-caption') || (thumb ? thumb.getAttribute('alt') : '') || '';
      var urls = (link.getAttribute('data-pages') || link.getAttribute('href') || '').split(/\s+/).filter(Boolean);
      boxPages.textContent = '';
      urls.forEach(function (url, i) {
        var img = doc.createElement('img');
        img.setAttribute('src', url);
        var alt = thumb ? thumb.getAttribute('alt') : caption;
        img.setAttribute('alt', urls.length > 1 ? alt + ' (' + (i + 1) + '/' + urls.length + ')' : alt);
        boxPages.appendChild(img);
      });
      box.classList.toggle('is-doc', link.getAttribute('data-lightbox') === 'doc');
      boxCap.textContent = caption;
      if (!box.open) box.showModal();
      boxPages.scrollTop = 0;
    };
    all('[data-lightbox]').forEach(function (link) {
      link.addEventListener('click', function (e) { e.preventDefault(); openBox(link); });
    });
    /* a link on the same page to a document (href="#cert-…") opens that document */
    all('a[href^="#"]').forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      var target = id ? doc.getElementById(id) : null;
      if (target && target.hasAttribute('data-lightbox')) {
        a.addEventListener('click', function (e) { e.preventDefault(); openBox(target); });
      }
    });
    /* a link from another page (certificates.html#cert-…) scrolls to the document and opens it */
    if (location.hash.length > 1) {
      var wanted = null;
      try { wanted = doc.getElementById(decodeURIComponent(location.hash.slice(1))); } catch (err) { wanted = null; }
      if (wanted && wanted.hasAttribute('data-lightbox')) openBox(wanted);
    }
    box.querySelector('.lightbox-close').addEventListener('click', function () { box.close(); });
    box.addEventListener('click', function (e) { if (e.target === box) box.close(); });
    box.addEventListener('close', function () { boxPages.textContent = ''; });
  }

  /* 6 · Header: see-through over the navy band at the top of the page, solid navy once the page scrolls */
  var header = doc.querySelector('.site-header');
  if (header) {
    var queued = false;
    var setSolid = function () {
      header.classList.toggle('is-solid', window.scrollY > 8);
      queued = false;
    };
    setSolid();
    window.addEventListener('scroll', function () {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(setSolid);
    }, { passive: true });
  }
})();
