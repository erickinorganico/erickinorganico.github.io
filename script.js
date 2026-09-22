const cases = [...document.querySelectorAll('.case')];
const filters = document.querySelector('.case-filters');
const filterStatus = document.querySelector('.filter-status');
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const motionToggle = document.querySelector('.motion-toggle');
let userReducedMotion = false;
try { userReducedMotion = localStorage.getItem('portfolio-reduced-motion') === 'true'; } catch { /* Storage is optional. */ }

function syncMotion() {
  const reduced = motionQuery.matches || userReducedMotion;
  document.body.dataset.motion = reduced ? 'reduce' : 'full';
  if (motionToggle) {
    motionToggle.hidden = false;
    motionToggle.setAttribute('aria-pressed', String(reduced));
    motionToggle.disabled = motionQuery.matches;
    motionToggle.textContent = motionQuery.matches ? 'Movimiento reducido por el sistema' : 'Reducir movimiento';
  }
}
syncMotion();
motionQuery.addEventListener('change', syncMotion);
motionToggle?.addEventListener('click', () => {
  userReducedMotion = !userReducedMotion;
  try { localStorage.setItem('portfolio-reduced-motion', String(userReducedMotion)); } catch { /* The control still works without persistence. */ }
  syncMotion();
});

// Animate native disclosures in both directions, keeping links, focus and no-JS behavior intact.
const disclosureAnimations = new Map();
const canAnimateDisclosure = () => document.body.dataset.motion !== 'reduce' && !document.hidden && typeof Element.prototype.animate === 'function';
function finishDisclosure(item) {
  const state = disclosureAnimations.get(item);
  if (!state) return;
  disclosureAnimations.delete(item);
  state.animation.cancel();
  item.open = state.open;
  item.style.removeProperty('overflow');
}
function setDisclosure(item, open, animate = false) {
  const from = item.getBoundingClientRect().height;
  finishDisclosure(item);
  if (!animate || !canAnimateDisclosure() || item.open === open) { item.open = open; return; }
  const summary = item.querySelector('summary');
  item.open = true;
  // Closed height includes the detail's own borders, unlike summary height alone.
  const border = parseFloat(getComputedStyle(item).borderTopWidth) + parseFloat(getComputedStyle(item).borderBottomWidth);
  const to = open ? item.getBoundingClientRect().height : summary.getBoundingClientRect().height + border;
  item.style.overflow = 'hidden';
  const animation = item.animate([{height: `${from}px`}, {height: `${to}px`}], {
    duration: 360, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both'
  });
  disclosureAnimations.set(item, {animation, open});
  animation.onfinish = () => finishDisclosure(item);
}
function finishAllDisclosures() { [...disclosureAnimations.keys()].forEach(finishDisclosure); }
if (typeof Element.prototype.animate === 'function') document.body.dataset.disclosureMotion = 'true';
new MutationObserver(() => { if (!canAnimateDisclosure()) finishAllDisclosures(); }).observe(document.body, {attributes:true, attributeFilter:['data-motion']});
document.addEventListener('visibilitychange', () => { if (document.hidden) finishAllDisclosures(); });
window.addEventListener('resize', finishAllDisclosures, {passive:true});

function applyFilter(selected, openFirst = true) {
  if (!filters) return;
  finishAllDisclosures();
  filters.querySelectorAll('button').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.filter === selected)));
  cases.forEach((item) => {
    item.hidden = selected !== 'all' && item.dataset.category !== selected;
    item.open = false;
  });
  const visible = cases.filter((item) => !item.hidden);
  if (openFirst && visible[0]) visible[0].open = true;
  const label = filters.querySelector(`[data-filter="${selected}"]`)?.textContent.trim();
  if (filterStatus) filterStatus.textContent = `${visible.length} ${visible.length === 1 ? 'caso disponible' : 'casos disponibles'}${selected === 'all' ? '' : ` · ${label}`}`;
}

document.querySelectorAll('.case, .service-example').forEach((item) => {
  item.querySelector('summary').addEventListener('click', (event) => {
    event.preventDefault();
    const nextOpen = !(disclosureAnimations.get(item)?.open ?? item.open);
    if (item.classList.contains('case') && nextOpen) {
      cases.forEach((other) => { if (other !== item) setDisclosure(other, false, true); });
    }
    setDisclosure(item, nextOpen, true);
  });
});
if (filters) {
  filters.hidden = false;
  filters.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-filter]');
    if (button) applyFilter(button.dataset.filter);
  });
}
function revealLinkedCase() {
  const target = cases.find((item) => `#${item.id}` === window.location.hash);
  if (!target) return;
  finishAllDisclosures();
  if (target.hidden) applyFilter('all', false);
  cases.forEach((item) => { item.open = item === target; });
  target.scrollIntoView({ block: 'start' });
}
window.addEventListener('hashchange', revealLinkedCase);
document.querySelectorAll('a[href^="#caso-"]').forEach((link) => {
  link.addEventListener('click', () => {
    // Same-fragment links also reopen a previously collapsed case.
    if (link.hash === window.location.hash) revealLinkedCase();
  });
});
revealLinkedCase();

if ('IntersectionObserver' in window) {
  const navigationLinks = [...document.querySelectorAll('.chapter-nav a, .site-header nav a')];
  const sections = [...document.querySelectorAll('main > section[id]')];
  const visibleSections = new Set();
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) visibleSections.add(entry.target);
      else visibleSections.delete(entry.target);
    });
    // At a boundary choose the later chapter; never depend on callback entry order.
    const current = sections.filter((section) => visibleSections.has(section)).at(-1);
    if (!current) return;
    navigationLinks.forEach((link) => {
      if (link.hash === `#${current.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-12% 0px -70% 0px', threshold: 0 });
  sections.forEach((section) => sectionObserver.observe(section));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const target = entry.target;
      revealObserver.unobserve(target);
      if (document.body.dataset.motion === 'reduce') return;
      target.classList.add('is-entering');
      const clean = () => target.classList.remove('is-entering');
      target.addEventListener('animationend', clean, { once: true });
      // A preference change during the entrance must not leave animation classes behind.
      window.setTimeout(clean, 900);
    });
  }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.agent-cycle, .experience-list').forEach((item) => revealObserver.observe(item));
}
