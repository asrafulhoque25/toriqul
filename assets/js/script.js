/* =====================================================================
   GLOBAL SETUP
   Each section is wrapped + element-guarded so a missing element on one
   page never throws and never blocks the other sections.
   ===================================================================== */

gsap.registerPlugin(ScrollTrigger);

/* ---------------------------------------------------------------------
   LENIS SMOOTH SCROLL  (single instance — used everywhere)
   --------------------------------------------------------------------- */
let lenis = null;

if (typeof Lenis !== 'undefined') {
  lenis = new Lenis({
    duration: 1.4,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1.3,
    infinite: false,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);

  ScrollTrigger.scrollerProxy(document.body, {
    scrollTop(value) {
      if (arguments.length) { lenis.scrollTo(value, { immediate: true }); }
      return lenis.scroll;
    },
    getBoundingClientRect() {
      return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
    },
    pinType: document.body.style.transform ? 'transform' : 'fixed',
  });
}

/* small helper: run a block and never let it crash the rest of the file */
function safe(name, fn) {
  try { fn(); } catch (err) { console.warn('[' + name + '] skipped:', err.message); }
}

/* ---------------------------------------------------------------------
   NAVBAR — scrolled state
   --------------------------------------------------------------------- */
safe('navbar-scroll', function () {
  const navbar = document.getElementById('navbar');
  if (!navbar || !lenis) return;

  let tickingNav = false;
  lenis.on('scroll', ({ scroll }) => {
    if (tickingNav) return;
    tickingNav = true;
    requestAnimationFrame(() => {
      navbar.classList.toggle('navbar--scrolled', scroll > 100);
      tickingNav = false;
    });
  });
});

/* ---------------------------------------------------------------------
   MOBILE MENU
   --------------------------------------------------------------------- */
safe('mobile-menu', function () {
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const navbar     = document.getElementById('navbar');
  if (!hamburger || !mobileMenu) return;

  const hamTop = hamburger.querySelector('.ham-top');
  const hamMid = hamburger.querySelector('.ham-mid');
  const hamBot = hamburger.querySelector('.ham-bot');
  let menuOpen = false;

  const toggleMenu = () => {
    menuOpen = !menuOpen;
    if (menuOpen) {
      mobileMenu.style.maxHeight = mobileMenu.scrollHeight + 'px';
      navbar && navbar.classList.add('navbar--menu-open');
      if (hamTop) hamTop.style.transform = 'translateY(0px) rotate(45deg)';
      if (hamMid) { hamMid.style.opacity = '0'; hamMid.style.transform = 'scaleX(0)'; }
      if (hamBot) { hamBot.style.width = '24px'; hamBot.style.transform = 'translateY(0px) rotate(-45deg)'; }
    } else {
      mobileMenu.style.maxHeight = '0';
      navbar && navbar.classList.remove('navbar--menu-open');
      if (hamTop) hamTop.style.transform = '';
      if (hamMid) { hamMid.style.opacity = ''; hamMid.style.transform = ''; }
      if (hamBot) { hamBot.style.width = ''; hamBot.style.transform = ''; }
    }
  };

  hamburger.addEventListener('click', toggleMenu);
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => { if (menuOpen) toggleMenu(); });
  });
});

/* ---------------------------------------------------------------------
   ACTIVE NAV ITEM
   --------------------------------------------------------------------- */
safe('active-nav', function () {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  const navItems = navbar.querySelectorAll('.nav-item');

  navItems.forEach(function (item) {
    const link = item.querySelector('a');
    if (!link) return;
    link.addEventListener('click', function (e) {
      const href = link.getAttribute('href');

      // set active state
      navItems.forEach(el => el.classList.remove('active'));
      item.classList.add('active');

      // only block placeholder links ("#"); real links navigate normally
      if (!href || href === '#') {
        e.preventDefault();
      }
    });
  });
});

/* ---------------------------------------------------------------------
   BANNER HERO ANIMATION  (home page only)
   --------------------------------------------------------------------- */
function initSvgDraw(pathEl) {
  const len = pathEl.getTotalLength();
  pathEl.style.strokeDasharray  = len;
  pathEl.style.strokeDashoffset = len;
  return len;
}

window.addEventListener('DOMContentLoaded', () => {
  safe('hero-banner', function () {
    const path     = document.getElementById('upwork-path-main');
    const person   = document.getElementById('heroPerson');
    const statsBar = document.getElementById('heroStats');
    const heroRight = document.getElementById('heroRight');

    // Bail out cleanly on pages without the hero (e.g. service page)
    if (!path || !person || !statsBar || !heroRight) return;

    const stats = [
      document.getElementById('stat1'),
      document.getElementById('stat2'),
      document.getElementById('stat3'),
    ].filter(Boolean);

    initSvgDraw(path);

    const tl = gsap.timeline({
      scrollTrigger: { trigger: '#heroRight', start: 'top 80%', once: true },
      defaults: { ease: 'power3.out' }
    });

    tl.to(path, { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut' })
      .to(path, {
        duration: 0.5, ease: 'power1.inOut',
        onStart() {
          path.style.fill = '#7D963D';
          path.style.stroke = 'none';
          gsap.from(path, { opacity: 0, duration: 0.5 });
        }
      }, '-=0.15')
      .to(person,   { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'power3.out' }, '-=0.2')
      .to(statsBar, { opacity: 1, duration: 0.3 }, '-=0.3');

    if (stats.length) {
      tl.to(stats, { opacity: 1, y: 0, duration: 0.45, stagger: 0.12, ease: 'back.out(1.4)' }, '-=0.1');
    }

    tl.eventCallback('onComplete', () => {
      gsap.to(person, { y: -12, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    });
  });
});

/* ---------------------------------------------------------------------
   BRAND / PARTNER SLIDER
   --------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  safe('partner-slider', function () {
    const partnerSliderEl = document.getElementById('partner-slider');
    if (!partnerSliderEl || typeof Splide === 'undefined') return;

    const partnerSplide = new Splide('#partner-slider', {
      type: 'loop', drag: 'free', focus: 'center',
      perPage: 6, gap: '0px', arrows: false, pagination: false,
      autoScroll: { speed: 1, pauseOnHover: true, pauseOnFocus: false },
      breakpoints: {
        1280: { perPage: 5 }, 1024: { perPage: 4 },
        768: { perPage: 3 },  640: { perPage: 3, gap: '8px' }
      }
    });

    if (window.splide && window.splide.Extensions) {
      partnerSplide.mount(window.splide.Extensions);
    } else {
      partnerSplide.mount();
    }
  });
});

/* ---------------------------------------------------------------------
   IMAGE PARALLAX  (skips .no-parallax)
   --------------------------------------------------------------------- */
safe('img-parallax', function () {
  gsap.utils.toArray('img').forEach(img => {
    if (img.closest('.no-parallax')) return;
    gsap.fromTo(img,
      { y: '-20%' },
      {
        y: '20%', ease: 'none',
        scrollTrigger: {
          trigger: img.parentElement,
          start: 'top bottom', end: 'bottom top',
          scrub: 1.5, invalidateOnRefresh: true
        }
      }
    );
  });
});

/* ---------------------------------------------------------------------
   COUNTER  (Why Work With Me — home page only)
   --------------------------------------------------------------------- */
safe('counter', function () {
  const section = document.getElementById('statsSection');
  if (!section) return;                       // <-- guard (was crashing service page)
  const counters = section.querySelectorAll('.counter');
  if (!counters.length) return;
  let started = false;

  function formatNum(n, format) {
    return format === 'comma' ? n.toLocaleString() : n;
  }

  function runCounters() {
    counters.forEach(el => {
      const target   = +el.dataset.target;
      const suffix   = el.dataset.suffix || '';
      const prefix   = el.dataset.prefix || '';
      const format   = el.dataset.format || '';
      const duration = 1800;
      const steps    = 60;
      const interval = duration / steps;
      let current    = 0;

      const timer = setInterval(() => {
        current += target / steps;
        if (current >= target) { current = target; clearInterval(timer); }
        el.textContent = prefix + formatNum(Math.floor(current), format) + suffix;
      }, interval);
    });
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !started) {
        started = true;
        runCounters();
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });

  observer.observe(section);
});

/* ---------------------------------------------------------------------
   PORTFOLIO  — reveal + "View Work" cursor-follow (home page only)
   --------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  safe('portfolio', function () {
    if (!window.gsap) return;
    const grid = document.getElementById('works-grid');
    if (!grid) return;                         // bail on pages without portfolio

    gsap.registerPlugin(ScrollTrigger);

    gsap.from('.reveal-head', {
      y: 30, opacity: 0, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: '#works', start: 'top 80%' }
    });
    gsap.from('.work-card', {
      y: 60, opacity: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out',
      scrollTrigger: { trigger: '#works-grid', start: 'top 85%' }
    });

    const medias  = [...grid.querySelectorAll('.work-media')];
    const buttons = medias.map((m) => m.querySelector('.view-work')).filter(Boolean);
    if (!medias.length) return;

    buttons.forEach((btn) =>
      gsap.set(btn, { xPercent: -50, yPercent: -50, scale: 0, opacity: 0 })
    );

    const showBtn = (btn) => gsap.to(btn, { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(1.8)' });
    const hideBtn = (btn) => gsap.to(btn, { scale: 0, opacity: 0, duration: 0.3, ease: 'power2.in' });

    medias.forEach((media) => {
      const btn = media.querySelector('.view-work');
      if (!btn) return;
      const xTo = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3' });
      const yTo = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3' });

      const pos = (e) => {
        const r = media.getBoundingClientRect();
        return { x: e.clientX - r.left, y: e.clientY - r.top };
      };

      media.addEventListener('mouseenter', (e) => {
        buttons.forEach((b) => { if (b !== btn) hideBtn(b); });
        const p = pos(e);
        gsap.set(btn, { x: p.x, y: p.y });
        showBtn(btn);
      });
      media.addEventListener('mousemove', (e) => { const p = pos(e); xTo(p.x); yTo(p.y); });
      media.addEventListener('mouseleave', () => hideBtn(btn));
    });

    grid.addEventListener('mouseleave', () => buttons.forEach(hideBtn));
  });
});

/* ---------------------------------------------------------------------
   TESTIMONIAL SLIDER
   --------------------------------------------------------------------- */
function initContentTestimonialSlider() {
  if (typeof Splide === 'undefined') return;
  if (!document.getElementById('testimonialSlider')) return;

  const arrowSVG = `<svg width="7" height="18" viewBox="0 0 7 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6.51528 8.96788L1.76758 0L0 0.93578L4.25228 8.96788L0 17L1.76758 17.9358L6.51528 8.96788Z" fill="white"/>
</svg>`;

  const testimonialSplide = new Splide('#testimonialSlider', {
    type: 'loop', perPage: 2, perMove: 1, gap: '2rem',
    autoplay: true, interval: 4000, pauseOnHover: true,
    arrows: true, pagination: false,
    breakpoints: { 1024: { perPage: 1, gap: '1.5rem' } }
  });

  testimonialSplide.mount();

  const testimonialWrapper = document.getElementById('testimonialSlider').closest('.content-our-testimonial');
  if (!testimonialWrapper) return;

  const originalArrows           = testimonialWrapper.querySelector('.splide__arrows');
  const testimonialArrowsDesktop = testimonialWrapper.querySelector('.testimonial-real-content-slider-arrows-desktop');
  const testimonialArrowsMobile  = testimonialWrapper.querySelector('.testimonial-real-content-slider-arrows-mobile');

  if (!originalArrows || !testimonialArrowsDesktop || !testimonialArrowsMobile) return;

  testimonialArrowsDesktop.innerHTML = originalArrows.innerHTML;
  testimonialArrowsMobile.innerHTML  = originalArrows.innerHTML;

  [testimonialArrowsDesktop, testimonialArrowsMobile].forEach(container => {
    container.querySelectorAll('.splide__arrow').forEach(arrow => { arrow.innerHTML = arrowSVG; });
    const prevBtn = container.querySelector('.splide__arrow--prev');
    const nextBtn = container.querySelector('.splide__arrow--next');
    if (prevBtn) prevBtn.addEventListener('click', () => testimonialSplide.go('<'));
    if (nextBtn) nextBtn.addEventListener('click', () => testimonialSplide.go('>'));
  });

  originalArrows.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
  safe('testimonial', initContentTestimonialSlider);
});

/* ---------------------------------------------------------------------
   FAQ ACCORDION  (scoped, works on any page that has .faq-section)
   --------------------------------------------------------------------- */
(function () {
  document.querySelectorAll('.faq-item').forEach(function (item) {
    item.addEventListener('click', function (e) {
      // ignore clicks inside the open answer (so reading/selecting text won't close it)
      if (e.target.closest('.faq-a-wrap')) return;
 
      var willOpen = !item.classList.contains('open');
      var scope = item.closest('.faq-section') || document;
      scope.querySelectorAll('.faq-item').forEach(function (i) { i.classList.remove('open'); });
      if (willOpen) item.classList.add('open');
    });
  });
})();








// featrue work tab

(function () {
  const root = document.getElementById('featured-work');
  if (!root) return;

  const PAGE_SIZE = 6;
  const tabsEl  = root.querySelector('#fw-tabs');
  const featEl  = root.querySelector('#fw-featured');
  const titleEl = root.querySelector('#fw-all-title');
  const gridEl  = root.querySelector('#fw-grid');
  const pagEl   = root.querySelector('#fw-pagination');
  const allCards = [].slice.call(gridEl.querySelectorAll('.work-card'));

  let currentFilter = 'all';
  let currentLabel  = 'All Industries';
  let currentPage   = 1;

  const arrowSVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* read one card's data straight from its HTML */
  function readCard(card) {
    return {
      href:  card.getAttribute('href') || '#',
      img:   card.querySelector('img') ? card.querySelector('img').getAttribute('src') : '',
      title: (card.querySelector('.fw-title') || {}).textContent || '',
      desc:  card.dataset.featuredDesc || ((card.querySelector('.fw-desc') || {}).textContent || ''),
      meta:  (card.querySelector('.fw-meta') || {}).textContent || '',
      chips: [].slice.call(card.querySelectorAll('.fw-chip')).map(function (c) { return c.textContent.trim(); })
    };
  }

  function getMatching() {
    return currentFilter === 'all'
      ? allCards
      : allCards.filter(function (c) { return c.dataset.industry === currentFilter; });
  }

  function pickFeatured(matching) {
    if (!matching.length) return null;
    if (currentFilter === 'all') {
      return matching.find(function (c) { return c.dataset.featuredDefault === 'true'; })
          || matching.find(function (c) { return c.dataset.featured === 'true'; })
          || matching[0];
    }
    return matching.find(function (c) { return c.dataset.featured === 'true'; }) || matching[0];
  }

  /* ---- featured ---- */
  function renderFeatured(card) {
    if (!card) { featEl.innerHTML = ''; return; }
    const d = readCard(card);
    const chips = d.chips.map(function (l) {
      return '<span class="flex items-center gap-2 font-medium text-sm md:text-base lg:text-lg"><span class="md:w-2.5 md:h-2.5 w-1.5 h-1.5 rounded-[3px] bg-main shrink-0"></span>' + l + '</span>';
    }).join('<span class="w-px h-3 bg-dark2/30"></span>');

    featEl.innerHTML =
      '<div class="grid lg:grid-cols-2 bg-[#F6F6F6] rounded-3xl overflow-hidden ">' +
        '<div class="relative aspect-[4/3] lg:aspect-auto lg:min-h-[440px]">' +
          '<img src="' + d.img + '" alt="" class="absolute inset-0 w-full h-full object-cover">' +
          '<span class="absolute top-5 left-5 bg-white text-main text-sm font-bold uppercase tracking-wide px-3 py-1.5 rounded-full shadow-sm">Featured Work</span>' +
        '</div>' +
        '<div class="lg:p-10 md:p-8 p-6 flex flex-col justify-center">' +
          '<div class="flex flex-wrap items-center gap-x-3 gap-y-2 mb-5 text-sm text-dark2">' + chips + '</div>' +
          '<h3 class="text-dark1 font-bold lg:text-[32px] md:text-2xl text-xl leading-[130%] mb-5">' + d.title + '</h3>' +
          '<div class="border-l-2 border-main pl-4 mb-6"><p class="text-dark2 leading-[150%] lg:text-lg md:text-base text-sm font-medium">' + d.desc + '</p></div>' +
          '<p class="text-dark2 lg:text-lg md:text-base text-sm font-medium mb-6">' + d.meta + '</p>' +
          '<a href="' + d.href + '" class="self-start inline-flex items-center gap-2 bg-dark1 hover:bg-main text-white font-bold rounded-full px-6 py-3 transition-colors">View Full Case Study ' + arrowSVG + '</a>' +
        '</div>' +
      '</div>';
  }

  /* ---- grid show/hide + pagination ---- */
  function renderGrid(gridCards) {
    allCards.forEach(function (c) { c.style.display = 'none'; });

    if (!gridCards.length) {
      pagEl.innerHTML = '';
      if (!featEl.innerHTML) featEl.innerHTML = '<div class="bg-white/[0.03] border border-white/10 rounded-3xl p-12 text-center text-dark2">No work in this industry yet — check back soon.</div>';
      return;
    }

    const totalPages = Math.ceil(gridCards.length / PAGE_SIZE);
    if (currentPage > totalPages) currentPage = 1;
    const start = (currentPage - 1) * PAGE_SIZE;
    gridCards.slice(start, start + PAGE_SIZE).forEach(function (c) { c.style.display = ''; });
    renderPagination(totalPages);
  }

  function pageList(total, page) {
    if (total <= 7) { return Array.from({ length: total }, function (_, i) { return i + 1; }); }
    const out = [1];
    if (page > 3) out.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(total - 1, page + 1); i++) out.push(i);
    if (page < total - 2) out.push('...');
    out.push(total);
    return out;
  }

  function renderPagination(total) {
    if (total <= 1) { pagEl.innerHTML = ''; return; }
    const circle = 'flex items-center justify-center w-12 h-12 rounded-full text-xl font-medium';
    let html = '<button data-pg="prev" class="pg-btn ' + circle + '" aria-label="Previous"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>';
    pageList(total, currentPage).forEach(function (p) {
      html += (p === '...')
        ? '<span class="px-1 text-dark2">…</span>'
        : '<button data-pg="' + p + '" class="pg-btn ' + circle + (p === currentPage ? ' is-active' : '') + '">' + p + '</button>';
    });
    html += '<button data-pg="next" class="pg-btn ' + circle + '" aria-label="Next"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>';
    pagEl.innerHTML = html;
  }

  function renderTitle() {
    titleEl.textContent = currentFilter === 'all'
      ? 'Check My All Works'
      : 'Check My All ' + currentLabel + ' Works';
  }

  function render() {
    const matching = getMatching();
    const featured = pickFeatured(matching);
    renderFeatured(featured);
    const gridCards = matching.filter(function (c) { return c !== featured; });
    renderTitle();
    renderGrid(gridCards);
  }

  /* ---- "View Work" cursor-follow (cards are static, attach once) ---- */
  function attachViewWork() {
    if (!window.gsap) return;
    const buttons = allCards.map(function (c) { return c.querySelector('.view-work'); });
    buttons.forEach(function (b) { gsap.set(b, { xPercent: -50, yPercent: -50, scale: 0, opacity: 0 }); });

    allCards.forEach(function (card) {
      const media = card.querySelector('.work-media');
      const btn = card.querySelector('.view-work');
      const xTo = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3' });
      const yTo = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3' });
      const pos = function (e) { const r = media.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };

      media.addEventListener('mouseenter', function (e) {
        buttons.forEach(function (b) { if (b !== btn) gsap.to(b, { scale: 0, opacity: 0, duration: 0.3, ease: 'power2.in' }); });
        const p = pos(e); gsap.set(btn, { x: p.x, y: p.y });
        gsap.to(btn, { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(1.8)' });
      });
      media.addEventListener('mousemove', function (e) { const p = pos(e); xTo(p.x); yTo(p.y); });
      media.addEventListener('mouseleave', function () { gsap.to(btn, { scale: 0, opacity: 0, duration: 0.3, ease: 'power2.in' }); });
    });
  }

  /* ---- events ---- */
  tabsEl.addEventListener('click', function (e) {
    const btn = e.target.closest('.fw-tab');
    if (!btn) return;
    tabsEl.querySelectorAll('.fw-tab').forEach(function (t) { t.classList.remove('is-active'); });
    btn.classList.add('is-active');
    currentFilter = btn.dataset.filter;
    currentLabel  = btn.textContent.trim();
    currentPage   = 1;
    render();
  });

  pagEl.addEventListener('click', function (e) {
    const btn = e.target.closest('.pg-btn');
    if (!btn) return;
    const matching = getMatching();
    const featured = pickFeatured(matching);
    const gridCards = matching.filter(function (c) { return c !== featured; });
    const totalPages = Math.max(1, Math.ceil(gridCards.length / PAGE_SIZE));
    const val = btn.dataset.pg;

    if (val === 'prev') currentPage = Math.max(1, currentPage - 1);
    else if (val === 'next') currentPage = Math.min(totalPages, currentPage + 1);
    else currentPage = +val;

    renderGrid(gridCards);
    root.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* ---- init ---- */
  attachViewWork();
  render();
})();




//about us counter

(function () {
  const section = document.getElementById('upwork-stats');
  if (!section) return;
  const counters = section.querySelectorAll('.stat-num');
  if (!counters.length) return;
  let started = false;
 
  function formatNum(n, format) {
    return format === 'comma' ? n.toLocaleString() : String(n);
  }
 
  function runCounters() {
    counters.forEach(function (el) {
      const target   = +el.dataset.target;
      const prefix   = el.dataset.prefix || '';
      const suffix   = el.dataset.suffix || '';
      const format   = el.dataset.format || '';
      const duration = 1800;
      const steps    = 60;
      const interval = duration / steps;
      let current    = 0;
 
      const timer = setInterval(function () {
        current += target / steps;
        if (current >= target) { current = target; clearInterval(timer); }
        el.textContent = prefix + formatNum(Math.floor(current), format) + suffix;
      }, interval);
    });
  }
 
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && !started) {
        started = true;
        runCounters();
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });
 
  observer.observe(section);
})();



//about timeline 


(function () {
  if (!window.gsap) return;
  const root = document.getElementById('seo-journey');
  if (!root) return;
  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
 
  // title
  gsap.from(root.querySelector('.tl-title'), {
    y: 30, opacity: 0, duration: 0.8, ease: 'power3.out',
    scrollTrigger: { trigger: root, start: 'top 80%' }
  });
 
  // dotted line draws downward — completes fully to the last item (no scrub,
  // so it never stops short when there's no scroll room left at the bottom)
  const line  = root.querySelector('.tl-line');
  const track = root.querySelector('.tl-track');
  if (line && track) {
    gsap.fromTo(line, { scaleY: 0 }, {
      scaleY: 1, transformOrigin: 'top center', duration: 1.4, ease: 'power2.out',
      scrollTrigger: { trigger: track, start: 'top 75%', once: true }
    });
  }
 
  // each item: circle pops, content slides in
  root.querySelectorAll('.tl-item').forEach(function (item) {
    const circle  = item.querySelector('.tl-circle');
    const content = item.querySelector('.tl-content');
    const tl = gsap.timeline({ scrollTrigger: { trigger: item, start: 'top 80%', once: true } });
    tl.from(circle,  { scale: 0, opacity: 0, duration: 0.5, ease: 'back.out(1.7)' })
      .from(content, { x: 40, opacity: 0, duration: 0.6, ease: 'power3.out' }, '-=0.25');
  });
})();