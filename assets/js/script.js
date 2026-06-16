gsap.registerPlugin(ScrollTrigger);

// ============================================
// LENIS SMOOTH SCROLL
// ============================================
const lenis = new Lenis({
  duration: 1.4,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  direction: 'vertical',
  gestureDirection: 'vertical',
  smoothWheel: true,
  wheelMultiplier: 1.3,
  infinite: false,
});

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
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




// ── Navbar scroll — hide at top, show on scroll up, hide on scroll down ──
// ── Navbar scroll — Lenis-aware ──
const navbar = document.getElementById('navbar');

if (navbar) {
  let tickingNav = false;

  lenis.on('scroll', ({ scroll }) => {
    if (tickingNav) return;
    tickingNav = true;

    requestAnimationFrame(() => {
      if (scroll <= 100) {
        navbar.classList.remove('navbar--scrolled');
      } else {
        navbar.classList.add('navbar--scrolled');
      }
      tickingNav = false;
    });
  });
}
// ── Mobile menu toggle (unchanged) ──
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

if (hamburger && mobileMenu) {
  const hamTop = hamburger.querySelector('.ham-top');
  const hamMid = hamburger.querySelector('.ham-mid');
  const hamBot = hamburger.querySelector('.ham-bot');
  let menuOpen = false;

  const toggleMenu = () => {
    menuOpen = !menuOpen;

    if (menuOpen) {
      mobileMenu.style.maxHeight = mobileMenu.scrollHeight + 'px';
      navbar.classList.add('navbar--menu-open');
      hamTop.style.transform = 'translateY(0px) rotate(45deg)';
      hamMid.style.opacity   = '0';
      hamMid.style.transform = 'scaleX(0)';
      hamBot.style.width     = '24px';
      hamBot.style.transform = 'translateY(0px) rotate(-45deg)';
    } else {
      mobileMenu.style.maxHeight = '0';
      navbar.classList.remove('navbar--menu-open');
      hamTop.style.transform = '';
      hamMid.style.opacity   = '';
      hamMid.style.transform = '';
      hamBot.style.width     = '';
      hamBot.style.transform = '';
    }
  };

  hamburger.addEventListener('click', toggleMenu);

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (menuOpen) toggleMenu();
    });
  });
}

// ── Active nav item (unchanged) ──
(function () {
  const navbar   = document.getElementById('navbar');
  if (!navbar) return;
  const navItems = navbar.querySelectorAll('.nav-item');

  navItems.forEach(function (item) {
    const link = item.querySelector('a');
    if (!link) return;
    link.addEventListener('click', function (e) {
      e.preventDefault();
      navItems.forEach(el => el.classList.remove('active'));
      item.classList.add('active');
    });
  });
})();










//banner 

gsap.registerPlugin(ScrollTrigger);
 
// ── Utility: get total path length
function initSvgDraw(pathEl) {
  const len = pathEl.getTotalLength();
  pathEl.style.strokeDasharray  = len;
  pathEl.style.strokeDashoffset = len;
  return len;
}
 
window.addEventListener('DOMContentLoaded', () => {
 
  const path      = document.getElementById('upwork-path-main');
  const person    = document.getElementById('heroPerson');
  const statsBar  = document.getElementById('heroStats');
  const stats     = [
    document.getElementById('stat1'),
    document.getElementById('stat2'),
    document.getElementById('stat3'),
  ];
 
  // ── 1. Prep SVG path for draw
  const pathLen = initSvgDraw(path);
 
  // ── Master timeline
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#heroRight',
      start: 'top 80%',
      once: true,
    },
    defaults: { ease: 'power3.out' }
  });
 
  // ── Step 1: Draw the SVG stroke
  tl.to(path, {
    strokeDashoffset: 0,
    duration: 1.8,
    ease: 'power2.inOut',
  })
 
  // ── Step 2: Fill fades in (stroke → filled shape)
  .to(path, {
    duration: 0.5,
    ease: 'power1.inOut',
    onStart() {
      // Animate fill colour from transparent to brand green
      gsap.to(path, {
        duration: 0.5,
        attr: {},
        onStart() {
          path.style.fill = '#7D963D';
          path.style.stroke = 'none';
          gsap.from(path, { opacity: 0, duration: 0.5 });
        }
      });
    }
  }, '-=0.15')
 
  // ── Step 3: Person image slides up and fades in
  .to(person, {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 0.9,
    ease: 'power3.out',
  }, '-=0.2')
 
  // ── Step 4: Stats bar fades in
  .to(statsBar, {
    opacity: 1,
    duration: 0.3,
  }, '-=0.3')
 
  // ── Step 5: Each stat chip staggers up
  .to(stats, {
    opacity: 1,
    y: 0,
    duration: 0.45,
    stagger: 0.12,
    ease: 'back.out(1.4)',
  }, '-=0.1');
 
  // ── Subtle idle float on person (after timeline completes)
  tl.eventCallback('onComplete', () => {
    gsap.to(person, {
      y: -12,
      duration: 3,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });
  });
 
});






//brand slider
document.addEventListener('DOMContentLoaded', () => {
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







//smooth scroll

if (typeof Lenis !== "undefined" && typeof gsap !== "undefined") {
    const lenis = new Lenis({
        duration: 1.4,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: "vertical",
        gestureDirection: "vertical",
        smoothWheel: true,
        wheelMultiplier: 1.3,
        infinite: false,
    });

    if (typeof ScrollTrigger !== "undefined") {
        lenis.on("scroll", ScrollTrigger.update);
    }

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
}











gsap.registerPlugin(ScrollTrigger);

gsap.utils.toArray('img').forEach(img => {
  if (img.closest('.no-parallax')) return;

  gsap.fromTo(img,
    { y: '-20%' },
    {
      y: '20%',
      ease: 'none',
      scrollTrigger: {
        trigger: img.parentElement,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5,
        invalidateOnRefresh: true
      }
    }
  );
});






//counter

(function () {
  const section  = document.getElementById('statsSection');
  const counters = section.querySelectorAll('.counter');
  let started    = false;

  function formatNum(n, format) {
    if (format === 'comma') return n.toLocaleString();
    return n;
  }

  function runCounters() {
    counters.forEach(el => {
      const target  = +el.dataset.target;
      const suffix  = el.dataset.suffix  || '';
      const prefix  = el.dataset.prefix  || '';
      const format  = el.dataset.format  || '';
      const duration = 1800;
      const steps    = 60;
      const interval = duration / steps;
      let current    = 0;

      const timer = setInterval(() => {
        current += target / steps;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
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
})();


// portfolio view more
document.addEventListener('DOMContentLoaded', () => {
  if (!window.gsap) return;
  gsap.registerPlugin(ScrollTrigger);

  // --- Scroll reveal ---
  gsap.from('.reveal-head', {
    y: 30, opacity: 0, duration: 0.8, ease: 'power3.out',
    scrollTrigger: { trigger: '#works', start: 'top 80%' }
  });
  gsap.from('.work-card', {
    y: 60, opacity: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out',
    scrollTrigger: { trigger: '#works-grid', start: 'top 85%' }
  });

  // --- "View Work" cursor-follow ---
  const medias = [...document.querySelectorAll('.work-media')];
  const buttons = medias.map((m) => m.querySelector('.view-work'));

  // start all hidden + centered on their point
  buttons.forEach((btn) =>
    gsap.set(btn, { xPercent: -50, yPercent: -50, scale: 0, opacity: 0 })
  );

  const showBtn = (btn) =>
    gsap.to(btn, { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(1.8)' });
  const hideBtn = (btn) =>
    gsap.to(btn, { scale: 0, opacity: 0, duration: 0.3, ease: 'power2.in' });

  medias.forEach((media) => {
    const btn = media.querySelector('.view-work');
    const xTo = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3' });
    const yTo = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3' });

    const pos = (e) => {
      const r = media.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    media.addEventListener('mouseenter', (e) => {
      buttons.forEach((b) => { if (b !== btn) hideBtn(b); }); // force-hide the others
      const p = pos(e);
      gsap.set(btn, { x: p.x, y: p.y }); // pop in exactly at cursor
      showBtn(btn);
    });

    media.addEventListener('mousemove', (e) => {
      const p = pos(e);
      xTo(p.x);
      yTo(p.y);
    });

    media.addEventListener('mouseleave', () => hideBtn(btn));
  });

  // safety net: leaving the whole grid fast hides everything
  const grid = document.querySelector('#works-grid');
  if (grid) grid.addEventListener('mouseleave', () => buttons.forEach(hideBtn));
});





//testimonial section end


function initContentTestimonialSlider() {
  if (!document.getElementById('testimonialSlider')) return;
 
  const arrowSVG = `<svg width="7" height="18" viewBox="0 0 7 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6.51528 8.96788L1.76758 0L0 0.93578L4.25228 8.96788L0 17L1.76758 17.9358L6.51528 8.96788Z" fill="white"/>
</svg>

`;
 
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
 
document.addEventListener('DOMContentLoaded', initContentTestimonialSlider);