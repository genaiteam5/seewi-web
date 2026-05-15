/* =========================================
   SEEWI — interactions
   Quiet, slow, restrained
   ========================================= */
(function () {
  'use strict';

  /* ---- mobile nav toggle ---- */
  const navToggle = document.querySelector('.nav__toggle');
  const navLeft   = document.querySelector('.nav__left');
  const navRight  = document.querySelector('.nav__right');
  if (navToggle && navLeft) {
    navToggle.addEventListener('click', () => {
      const open = navLeft.classList.toggle('is-open');
      if (navRight) navRight.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', String(open));
    });
    navLeft.addEventListener('click', (e) => {
      if (e.target.matches('a')) {
        navLeft.classList.remove('is-open');
        if (navRight) navRight.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---- HERO: cursor parallax on product visual ---- */
  const heroVisual = document.getElementById('heroVisual');
  const heroStage  = heroVisual?.querySelector('.visual__stage');

  if (heroVisual && heroStage && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    const tick = () => {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      heroStage.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`;
      if (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) {
        raf = requestAnimationFrame(tick);
      } else { raf = null; }
    };
    window.addEventListener('mousemove', (e) => {
      const rect = heroVisual.getBoundingClientRect();
      const cxx = rect.left + rect.width / 2;
      const cyy = rect.top + rect.height / 2;
      tx = ((e.clientX - cxx) / rect.width) * 22;
      ty = ((e.clientY - cyy) / rect.height) * 22;
      if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: true });
    document.addEventListener('mouseleave', () => {
      tx = 0; ty = 0;
      if (!raf) raf = requestAnimationFrame(tick);
    });
  }

  /* ---- thumbnail row + colour swatches ---- */
  document.querySelectorAll('.detail__thumbs .thumb').forEach((t, _, all) => {
    t.addEventListener('click', () => {
      all.forEach((x) => x.classList.remove('is-active'));
      t.classList.add('is-active');
    });
  });
  document.querySelectorAll('.bottombar__variants .swatch').forEach((s, _, all) => {
    s.addEventListener('click', () => {
      all.forEach((x) => x.classList.remove('is-active'));
      s.classList.add('is-active');
    });
  });

  /* ---- CUSTOMIZATION sliders → preview ---- */
  const root = document.documentElement;
  const breathLine = document.getElementById('breathLine');

  const applySlider = (key, value) => {
    const n = Number(value);
    const out = document.querySelector(`output[data-out="${key}"]`);
    if (out) out.textContent = String(n);

    if (key === 'breath') {
      root.style.setProperty('--preview-breath', String(0.2 + (n / 100) * 0.8));
      if (breathLine) {
        const mag = 4 + (n / 100) * 22;
        breathLine.style.transform = `translateY(${mag}px)`;
      }
    }
    if (key === 'aim')      root.style.setProperty('--preview-aim',      String(n / 100));
    if (key === 'contrast') root.style.setProperty('--preview-contrast', String(0.15 + (n / 100) * 0.7));
  };

  document.querySelectorAll('[data-slider]').forEach((s) => {
    applySlider(s.dataset.slider, s.value);
    s.addEventListener('input', (e) => applySlider(s.dataset.slider, e.target.value));
  });

  /* ---- breathing oscillation on preview line ---- */
  if (breathLine && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let up = true;
    setInterval(() => {
      const v = Number(document.querySelector('[data-slider="breath"]')?.value ?? 50);
      const mag = 4 + (v / 100) * 22;
      breathLine.style.transform = `translateY(${up ? -mag : mag}px)`;
      up = !up;
    }, 2400);
  }

  /* ---- reveal on scroll ---- */
  const revealEls = [
    ...document.querySelectorAll('.detail, .product, .features, .customize, .footer__top')
  ];
  revealEls.forEach((el) => el.setAttribute('data-reveal', ''));

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---- quiet cursor companion (desktop only) ---- */
  if (!matchMedia('(pointer: coarse)').matches) {
    const cur = document.createElement('div');
    Object.assign(cur.style, {
      position: 'fixed', top: '0', left: '0',
      width: '6px', height: '6px',
      borderRadius: '50%',
      background: 'transparent',
      border: '1px solid #191919',
      pointerEvents: 'none',
      transform: 'translate(-50%, -50%)',
      transition: 'opacity 240ms ease, background 240ms ease, border-color 240ms ease, width 240ms ease, height 240ms ease',
      opacity: '0',
      zIndex: '100',
      mixBlendMode: 'difference',
    });
    document.body.appendChild(cur);
    let cx = 0, cy = 0, x = 0, y = 0, rid = null;
    const tick = () => {
      x += (cx - x) * 0.18;
      y += (cy - y) * 0.18;
      cur.style.left = `${x}px`;
      cur.style.top  = `${y}px`;
      rid = requestAnimationFrame(tick);
    };
    window.addEventListener('mousemove', (e) => {
      cx = e.clientX; cy = e.clientY;
      cur.style.opacity = '0.6';
      if (!rid) tick();
    });
    window.addEventListener('mouseleave', () => { cur.style.opacity = '0'; });

    document.querySelectorAll('a, button, input[type="range"], .thumb, .swatch').forEach((el) => {
      el.addEventListener('mouseenter', () => {
        cur.style.width = '18px';
        cur.style.height = '18px';
        cur.style.background = '#A52020';
        cur.style.borderColor = '#A52020';
      });
      el.addEventListener('mouseleave', () => {
        cur.style.width = '6px';
        cur.style.height = '6px';
        cur.style.background = 'transparent';
        cur.style.borderColor = '#191919';
      });
    });
  }

})();
