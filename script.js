// ── Page navigation ──────────────────────────────────────────
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach((b, i) => {
    b.classList.toggle('active', (id === 'portfolio' && i === 0) || (id === 'about' && i === 1));
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.getElementById('navLinks').classList.remove('open');
}

// ── Hamburger ────────────────────────────────────────────────
document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('navLinks').classList.toggle('open');
});
document.addEventListener('click', (e) => {
  if (!e.target.closest('.navbar')) {
    document.getElementById('navLinks').classList.remove('open');
  }
});

// ── Tab switching ────────────────────────────────────────────
function switchTab(btn, contentId) {
  const details = btn.closest('.project-details');
  details.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  details.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(contentId).classList.add('active');
}

// ── Scroll reveal ────────────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.05 });

document.querySelectorAll('.project').forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = `opacity 0.5s ease ${i * 0.06}s, transform 0.5s ease ${i * 0.06}s`;
  revealObserver.observe(el);
});

// ── CodeViz expand / close ───────────────────────────────────
function expandCodeviz() {
  document.getElementById('codeviz-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCodeviz() {
  document.getElementById('codeviz-modal').classList.remove('open');
  document.body.style.overflow = '';
}
document.getElementById('codeviz-modal').addEventListener('click', function(e) {
  if (e.target === this) closeCodeviz();
});
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeCodeviz();
});

// ── Console signature ────────────────────────────────────────
console.log('%c[viperkdr] portfolio', 'color:#b8f04a; font-family:monospace; font-size:14px;');