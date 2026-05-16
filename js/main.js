/* ============================================
   ADONAI ELECTRICAL — Main JavaScript
   ============================================ */

// ── Navbar scroll effect ──────────────────────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ── Active nav link on scroll ────────────────────────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');
const observeNav = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      const link = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
      if (link) link.classList.add('active');
    }
  });
}, { rootMargin: '-40% 0px -40% 0px' });
sections.forEach(s => observeNav.observe(s));

// ── Mobile hamburger menu ────────────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
if (hamburger && navMenu) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navMenu.classList.toggle('open');
    document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
  });
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// ── Hero canvas particle system ──────────────────────────────────────────────
(function initCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animId;

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.r = Math.random() * 1.5 + 0.5;
      this.alpha = Math.random() * 0.5 + 0.1;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(245, 197, 24, ${this.alpha})`;
      ctx.fill();
    }
  }

  function initParticles() {
    const count = Math.min(Math.floor(canvas.width * canvas.height / 10000), 120);
    particles = Array.from({ length: count }, () => new Particle());
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(245, 197, 24, ${0.06 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    animId = requestAnimationFrame(animate);
  }

  resize();
  initParticles();
  animate();

  const resizeObs = new ResizeObserver(() => {
    resize();
    initParticles();
  });
  resizeObs.observe(canvas);
})();

// ── Scroll-triggered animations ──────────────────────────────────────────────
const animObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      entry.target.style.transitionDelay = `${(i % 4) * 0.08}s`;
      entry.target.classList.add('visible');
      animObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('[data-animate]').forEach(el => animObserver.observe(el));

// ── Stats counter animation ──────────────────────────────────────────────────
function animateCount(el) {
  const target = parseInt(el.dataset.count, 10);
  const duration = 2000;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = target.toLocaleString();
  }
  requestAnimationFrame(tick);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('[data-count]').forEach(animateCount);
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const statsSection = document.querySelector('.stats');
if (statsSection) statsObserver.observe(statsSection);

// ── Portfolio filter ─────────────────────────────────────────────────────────
const filterBtns = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    portfolioItems.forEach(item => {
      const show = filter === 'all' || item.dataset.category === filter;
      item.style.opacity = show ? '' : '0.2';
      item.style.transform = show ? '' : 'scale(0.95)';
      item.style.pointerEvents = show ? '' : 'none';
    });
  });
});

// ── Testimonials carousel ────────────────────────────────────────────────────
(function initCarousel() {
  const track = document.getElementById('testimonialsTrack');
  const dotsContainer = document.getElementById('testDots');
  const prevBtn = document.getElementById('testPrev');
  const nextBtn = document.getElementById('testNext');
  if (!track) return;

  const cards = track.querySelectorAll('.testimonial-card');
  let current = 0;
  let autoInterval;

  function getPerPage() {
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 640) return 2;
    return 1;
  }

  function totalPages() { return Math.ceil(cards.length / getPerPage()); }

  function buildDots() {
    dotsContainer.innerHTML = '';
    for (let i = 0; i < totalPages(); i++) {
      const dot = document.createElement('button');
      dot.classList.add('test-dot');
      if (i === current) dot.classList.add('active');
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    }
  }

  function goTo(index) {
    current = Math.max(0, Math.min(index, totalPages() - 1));
    const cardWidth = cards[0].offsetWidth + 24;
    track.style.transform = `translateX(-${current * getPerPage() * cardWidth}px)`;
    dotsContainer.querySelectorAll('.test-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  prevBtn.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
  nextBtn.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

  function resetAuto() {
    clearInterval(autoInterval);
    autoInterval = setInterval(() => {
      current = (current + 1) % totalPages();
      goTo(current);
    }, 5000);
  }

  buildDots();
  resetAuto();
  window.addEventListener('resize', () => { buildDots(); goTo(0); }, { passive: true });
})();

// ── FAQ accordion ────────────────────────────────────────────────────────────
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const answer = item.querySelector('.faq-answer');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(openItem => {
      openItem.classList.remove('open');
      openItem.querySelector('.faq-answer').style.maxHeight = '0';
    });
    if (!isOpen) {
      item.classList.add('open');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  });
});

// ── Contact form (demo submit handler) ───────────────────────────────────────
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
const btnText = document.getElementById('btnText');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    btnText.textContent = 'Sending...';
    setTimeout(() => {
      formSuccess.classList.add('visible');
    }, 1200);
  });
}

// ── Scroll to top button ─────────────────────────────────────────────────────
const scrollTopBtn = document.getElementById('scrollTop');
window.addEventListener('scroll', () => {
  scrollTopBtn.classList.toggle('visible', window.scrollY > 600);
}, { passive: true });
scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ── Smooth scroll for anchor links ───────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = navbar.offsetHeight + 8;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});
