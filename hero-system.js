(() => {
  const system = document.querySelector('[data-hero-system]');
  if (!system) return;

  const body = document.body;
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const modules = [...system.querySelectorAll('.hero-module[data-hero-part]')];
  const keys = [...system.querySelectorAll('[data-system-key]')];
  const map = system.closest('.work-map');
  const links = map ? [...map.querySelectorAll('.map-links a[data-hero-part]')] : [];
  let isInView = false;
  let isRunning = false;
  let hasEntered = false;
  const completedModules = new Set();

  const shouldReduce = () => motionQuery.matches || body.dataset.motion === 'reduce';

  const settle = () => {
    isRunning = false;
    system.classList.remove('is-assembling');
    system.classList.add('is-assembled');
  };

  const assemble = () => {
    if (!isInView || document.visibilityState === 'hidden' || hasEntered) return;
    hasEntered = true;
    if (shouldReduce()) {
      settle();
      return;
    }
    isRunning = true;
    system.classList.remove('is-assembled');
    system.classList.add('is-assembling');
  };

  const cancelOffscreen = () => {
    if (!isRunning) return;
    settle();
  };

  const setRelated = (part, related) => {
    const module = modules.find((item) => item.dataset.heroPart === part);
    const key = keys.find((item) => item.dataset.systemKey === part);
    if (module) module.classList.toggle('is-related', related);
    if (key) key.classList.toggle('is-related', related);
    if (related) system.classList.add('has-related');
    else if (!modules.some((item) => item.classList.contains('is-related'))) system.classList.remove('has-related');
  };

  links.forEach((link) => {
    const part = link.dataset.heroPart;
    let hovered = false;
    let focused = false;
    const update = () => {
      link.classList.toggle('is-related', hovered || focused);
      setRelated(part, hovered || focused);
    };
    link.addEventListener('pointerenter', () => { hovered = true; update(); }, { passive: true });
    link.addEventListener('pointerleave', () => { hovered = false; update(); }, { passive: true });
    link.addEventListener('focusin', () => { focused = true; update(); });
    link.addEventListener('focusout', (event) => {
      if (!link.contains(event.relatedTarget)) { focused = false; update(); }
    });
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isInView = entry.isIntersecting;
        if (isInView) assemble();
        else cancelOffscreen();
      });
    }, { threshold: .22 });
    observer.observe(system);
  } else {
    isInView = true;
    assemble();
  }

  system.addEventListener('animationend', (event) => {
    if (event.animationName !== 'hero-module-arrive') return;
    completedModules.add(event.target);
    if (completedModules.size === modules.length) settle();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') cancelOffscreen();
    else if (isInView && !hasEntered) assemble();
  });

  const motionChanged = () => {
    if (shouldReduce()) settle();
    else if (isInView && !hasEntered) assemble();
  };

  if (typeof motionQuery.addEventListener === 'function') motionQuery.addEventListener('change', motionChanged);
  else if (typeof motionQuery.addListener === 'function') motionQuery.addListener(motionChanged);

  const motionObserver = new MutationObserver(motionChanged);
  motionObserver.observe(body, { attributes: true, attributeFilter: ['data-motion'] });
})();
