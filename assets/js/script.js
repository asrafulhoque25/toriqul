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