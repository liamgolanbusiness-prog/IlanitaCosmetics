/* ============================================
   ILANITA — interactions, scroll animations, 3D
   ============================================ */
(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------- Loader -------- */
  window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    if (loader) {
      setTimeout(() => loader.classList.add('hide'), 1100);
    }
    document.getElementById('year').textContent = new Date().getFullYear();
  });

  /* -------- Header scroll state -------- */
  const header = document.getElementById('header');
  const scrollProgress = document.getElementById('scrollProgress');

  function onScroll() {
    const y = window.scrollY;
    if (header) header.classList.toggle('scrolled', y > 30);

    if (scrollProgress) {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docH > 0 ? (y / docH) * 100 : 0;
      scrollProgress.style.width = pct + '%';
    }

    // Active nav link
    const sections = document.querySelectorAll('section[id]');
    const links = document.querySelectorAll('.nav-link');
    let active = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 120;
      if (y >= top) active = sec.id;
    });
    links.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === '#' + active);
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* -------- Mobile menu -------- */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  function toggleMenu(open) {
    const isOpen = open !== undefined ? open : !mobileMenu.classList.contains('open');
    mobileMenu.classList.toggle('open', isOpen);
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    mobileMenu.setAttribute('aria-hidden', String(!isOpen));
    document.body.classList.toggle('no-scroll', isOpen);
  }
  hamburger?.addEventListener('click', () => toggleMenu());
  mobileMenu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggleMenu(false)));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') toggleMenu(false);
  });

  /* -------- Smooth anchor scroll -------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length > 1 && document.querySelector(id)) {
        e.preventDefault();
        const target = document.querySelector(id);
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* -------- IntersectionObserver reveal -------- */
  const revealEls = document.querySelectorAll('[data-reveal], [data-reveal-letters]');
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        // staggered children inside reveal containers (basic)
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  revealEls.forEach(el => io.observe(el));

  /* -------- GSAP scroll-driven animations -------- */
  if (window.gsap && window.ScrollTrigger && !prefersReducedMotion) {
    gsap.registerPlugin(ScrollTrigger);

    // Hero title letters
    const titleEl = document.querySelector('.title-line');
    if (titleEl) {
      const text = titleEl.textContent.trim();
      titleEl.innerHTML = text.split('').map(ch => `<span>${ch === ' ' ? '&nbsp;' : ch}</span>`).join('');
      gsap.to('.title-line span', {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 1.2,
        stagger: 0.06,
        delay: 1.3,
        ease: 'power3.out'
      });
    }

    // Hero subtitle/desc/cta/stats fade-in. Use fromTo so GSAP doesn't capture
    // the CSS [data-reveal] opacity:0 as its destination (which would leave
    // these elements permanently invisible).
    gsap.fromTo('.hero-eyebrow', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, delay: 1.2, ease: 'power2.out' });
    gsap.fromTo('.title-sub',    { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1, delay: 1.9, ease: 'power2.out' });
    gsap.fromTo('.hero-desc',    { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1, delay: 2.1, ease: 'power2.out' });
    gsap.fromTo('.hero-cta',     { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1, delay: 2.3, ease: 'power2.out' });
    gsap.fromTo('.hero-stats',   { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1, delay: 2.5, ease: 'power2.out' });

    // Parallax on hero blobs
    gsap.to('.blob-1', { yPercent: 30, ease: 'none', scrollTrigger: { trigger: '.hero', scrub: true } });
    gsap.to('.blob-2', { yPercent: -30, ease: 'none', scrollTrigger: { trigger: '.hero', scrub: true } });
    gsap.to('.blob-3', { yPercent: 20, ease: 'none', scrollTrigger: { trigger: '.hero', scrub: true } });

    // Image parallax
    gsap.utils.toArray('.about-image').forEach(el => {
      gsap.to(el.querySelector('img'), {
        yPercent: -8,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });

    // Service cards stagger reveal
    gsap.fromTo('.service-card',
      { opacity: 0, y: 60 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.services-grid', start: 'top 75%' }
      });

    // Gallery items fade
    gsap.utils.toArray('.gallery-item').forEach((el, i) => {
      gsap.fromTo(el,
        { opacity: 0, scale: 0.92, y: 40 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1,
          delay: i * 0.06,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%' }
        });
    });

    // Why cards stagger
    gsap.fromTo('.why-card',
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.why-grid', start: 'top 78%' }
      });

    // Section title gradient on scroll into view
    gsap.utils.toArray('.section-title').forEach(t => {
      gsap.fromTo(t,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: t, start: 'top 85%' }
        });
    });
  }

  /* -------- Counter animation for stats -------- */
  const counters = document.querySelectorAll('[data-count]');
  const counterIO = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.textContent.replace(/[\d,]/g, '').trim();
        let current = 0;
        const duration = 1800;
        const start = performance.now();
        function tick(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          current = Math.floor(target * eased);
          el.textContent = current.toLocaleString('he-IL') + (progress === 1 ? suffix : '+');
          if (progress < 1) requestAnimationFrame(tick);
          else el.textContent = target.toLocaleString('he-IL') + suffix;
        }
        requestAnimationFrame(tick);
        counterIO.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => counterIO.observe(c));

  /* -------- Testimonial slider -------- */
  const track = document.getElementById('testimonialTrack');
  const prevBtn = document.getElementById('prevTestimonial');
  const nextBtn = document.getElementById('nextTestimonial');
  const dotsContainer = document.getElementById('sliderDots');

  if (track) {
    const slides = track.querySelectorAll('.testimonial');
    let current = 0;
    let auto;
    // RTL: index 0 should be visually on the right; flex with row-reverse direction inherits dir.
    // We use translateX with dir-aware value.
    const isRTL = document.documentElement.dir === 'rtl';

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'slider-dot';
      dot.setAttribute('aria-label', `המלצה ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    });
    const dots = dotsContainer.querySelectorAll('.slider-dot');

    function goTo(i) {
      current = (i + slides.length) % slides.length;
      const offset = isRTL ? current * 100 : -current * 100;
      track.style.transform = `translateX(${offset}%)`;
      dots.forEach((d, idx) => d.classList.toggle('active', idx === current));
      restartAuto();
    }
    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    nextBtn?.addEventListener('click', next);
    prevBtn?.addEventListener('click', prev);

    function restartAuto() {
      clearInterval(auto);
      auto = setInterval(next, 6000);
    }
    goTo(0);

    // Touch / swipe
    let startX = 0, deltaX = 0, dragging = false;
    track.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX; dragging = true;
    }, { passive: true });
    track.addEventListener('touchmove', e => {
      if (!dragging) return;
      deltaX = e.touches[0].clientX - startX;
    }, { passive: true });
    track.addEventListener('touchend', () => {
      if (!dragging) return;
      dragging = false;
      if (Math.abs(deltaX) > 60) {
        if (isRTL) deltaX < 0 ? prev() : next();
        else deltaX < 0 ? next() : prev();
      }
      deltaX = 0;
    });

    // Pause on hover
    const slider = document.getElementById('testimonialSlider');
    slider?.addEventListener('mouseenter', () => clearInterval(auto));
    slider?.addEventListener('mouseleave', restartAuto);
  }

  /* -------- Custom cursor -------- */
  const cursor = document.getElementById('cursor');
  const cursorDot = document.getElementById('cursorDot');
  if (cursor && window.matchMedia('(hover: hover) and (pointer: fine)').matches && window.innerWidth >= 1024) {
    let x = 0, y = 0, tx = 0, ty = 0;
    document.addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; });
    function loop() {
      tx += (x - tx) * 0.18;
      ty += (y - ty) * 0.18;
      cursor.style.left = tx + 'px'; cursor.style.top = ty + 'px';
      cursorDot.style.left = x + 'px'; cursorDot.style.top = y + 'px';
      requestAnimationFrame(loop);
    }
    loop();
    document.querySelectorAll('a, button, [data-tilt]').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
  }

  /* -------- 3D tilt on cards -------- */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !prefersReducedMotion) {
    document.querySelectorAll('[data-tilt]').forEach(card => {
      card.style.transformStyle = 'preserve-3d';
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const cx = (e.clientX - r.left) / r.width - 0.5;
        const cy = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `translateY(-8px) perspective(900px) rotateY(${cx * 6}deg) rotateX(${-cy * 6}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* -------- Three.js — hero floating particles -------- */
  if (window.THREE && !prefersReducedMotion) {
    const canvas = document.getElementById('heroCanvas');
    if (canvas) {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
      camera.position.z = 30;

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

      const count = window.innerWidth < 768 ? 90 : 180;
      const geo = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const sizes = new Float32Array(count);
      const velocities = [];

      const palette = [
        new THREE.Color(0xC9A26B), // gold
        new THREE.Color(0xB8556E), // rose
        new THREE.Color(0xDCA0AE), // soft rose
        new THREE.Color(0xF5D5DC)  // blush
      ];

      for (let i = 0; i < count; i++) {
        positions[i * 3]     = (Math.random() - 0.5) * 80;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
        const c = palette[Math.floor(Math.random() * palette.length)];
        colors[i * 3]     = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
        sizes[i] = Math.random() * 1.4 + 0.4;
        velocities.push({
          x: (Math.random() - 0.5) * 0.012,
          y: (Math.random() - 0.5) * 0.012,
          z: (Math.random() - 0.5) * 0.005
        });
      }

      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

      // Soft circular sprite via canvas
      const dotCanvas = document.createElement('canvas');
      dotCanvas.width = 64; dotCanvas.height = 64;
      const ctx = dotCanvas.getContext('2d');
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.4, 'rgba(255,255,255,0.7)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
      const sprite = new THREE.CanvasTexture(dotCanvas);

      const mat = new THREE.PointsMaterial({
        size: 0.8,
        map: sprite,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true
      });

      const points = new THREE.Points(geo, mat);
      scene.add(points);

      // Add a soft 3D ring shape
      const torusGeo = new THREE.TorusGeometry(8, 0.05, 16, 100);
      const torusMat = new THREE.MeshBasicMaterial({ color: 0xC9A26B, transparent: true, opacity: 0.18 });
      const torus = new THREE.Mesh(torusGeo, torusMat);
      torus.rotation.x = Math.PI / 3;
      scene.add(torus);

      const torusGeo2 = new THREE.TorusGeometry(11, 0.03, 16, 100);
      const torusMat2 = new THREE.MeshBasicMaterial({ color: 0xB8556E, transparent: true, opacity: 0.22 });
      const torus2 = new THREE.Mesh(torusGeo2, torusMat2);
      torus2.rotation.x = Math.PI / 4;
      torus2.rotation.y = Math.PI / 6;
      scene.add(torus2);

      let mouseX = 0, mouseY = 0;
      window.addEventListener('mousemove', e => {
        mouseX = (e.clientX / window.innerWidth) - 0.5;
        mouseY = (e.clientY / window.innerHeight) - 0.5;
      });

      function resize() {
        const w = canvas.clientWidth, h = canvas.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
      }
      window.addEventListener('resize', resize);
      resize();

      let rafId;
      function animate(time) {
        const pos = geo.attributes.position.array;
        for (let i = 0; i < count; i++) {
          pos[i * 3]     += velocities[i].x;
          pos[i * 3 + 1] += velocities[i].y;
          pos[i * 3 + 2] += velocities[i].z;
          if (Math.abs(pos[i * 3])     > 40) velocities[i].x *= -1;
          if (Math.abs(pos[i * 3 + 1]) > 30) velocities[i].y *= -1;
          if (Math.abs(pos[i * 3 + 2]) > 20) velocities[i].z *= -1;
        }
        geo.attributes.position.needsUpdate = true;

        points.rotation.y = time * 0.00006 + mouseX * 0.3;
        points.rotation.x = mouseY * 0.2;

        torus.rotation.z += 0.0015;
        torus2.rotation.z -= 0.0008;

        renderer.render(scene, camera);
        rafId = requestAnimationFrame(animate);
      }
      rafId = requestAnimationFrame(animate);

      // Pause when not visible (perf)
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) cancelAnimationFrame(rafId);
        else rafId = requestAnimationFrame(animate);
      });
    }
  }

  /* -------- Contact form -------- */
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const data = new FormData(form);
      const name = encodeURIComponent(data.get('name') || '');
      const phone = encodeURIComponent(data.get('phone') || '');
      const service = encodeURIComponent(data.get('service') || '');
      const message = encodeURIComponent(data.get('message') || '');
      const text = `היי אילנית, %0Aשמי ${name}.%0Aטלפון: ${phone}%0Aמעוניינת ב: ${service}%0A${message ? 'הודעה: ' + message : ''}`;
      window.open(`https://wa.me/972523828382?text=${text}`, '_blank', 'noopener');
    });
  }

})();
