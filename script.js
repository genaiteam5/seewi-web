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

  /* HERO parallax disabled — Three.js OrbitControls handles bow interaction now. */

  /* ---- thumbnail row + colour swatches ---- */
  document.querySelectorAll('.detail__thumbs .thumb').forEach((t, _, all) => {
    t.addEventListener('click', () => {
      all.forEach((x) => x.classList.remove('is-active'));
      t.classList.add('is-active');
    });
  });
  const SWATCH_COLOR = {
    'swatch--ash':   0xffffff, // pure white
    'swatch--stone': 0x2a2a2a, // deep charcoal
    'swatch--clay':  0xA52020, // accent red
  };

  document.querySelectorAll('.bottombar__variants .swatch').forEach((s, _, all) => {
    s.addEventListener('click', () => {
      all.forEach((x) => x.classList.remove('is-active'));
      s.classList.add('is-active');

      const key = [...s.classList].find((c) => c in SWATCH_COLOR);
      if (!key) return;
      document.dispatchEvent(new CustomEvent('seewi:bow-color', {
        detail: { color: SWATCH_COLOR[key] },
      }));
    });
  });


  /* ---- reveal on scroll ---- */
  const revealEls = [
    ...document.querySelectorAll('.product, .footer__top')
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
