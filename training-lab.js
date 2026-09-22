(() => {
  const root = document.querySelector('.training-lab');
  if (!root) return;

  const buttons = [...root.querySelectorAll('[data-training-role]')];
  const panels = [...root.querySelectorAll('[data-training-panel]')];
  const status = root.querySelector('[data-training-status]');
  const replay = root.querySelector('[data-training-replay]');
  if (!buttons.length || !panels.length) return;
  let panelAnimationTimer;
  let replayTimer;
  let replayFrame;

  const roleNames = {
    growth: 'Growth y Marketing',
    operations: 'Operaciones',
    analytics: 'Analytics',
    direction: 'Dirección'
  };

  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reducedMotion = () => media.matches || document.body?.dataset.motion === 'reduce';

  root.dataset.jsReady = 'true';

  function selectRole(role, announce = true) {
    const selected = roleNames[role] ? role : buttons[0].dataset.trainingRole;
    buttons.forEach((button) => {
      const active = button.dataset.trainingRole === selected;
      button.setAttribute('aria-pressed', String(active));
    });
    panels.forEach((panel) => {
      const active = panel.dataset.trainingPanel === selected;
      panel.hidden = !active;
      panel.setAttribute('aria-hidden', String(!active));
      if (active) {
        panel.classList.remove('is-lab-entering');
        if (!reducedMotion()) {
          void panel.offsetWidth;
          panel.classList.add('is-lab-entering');
          window.clearTimeout(panelAnimationTimer);
          panelAnimationTimer = window.setTimeout(() => panel.classList.remove('is-lab-entering'), 520);
        }
      }
    });
    root.dataset.role = selected;
    if (status && announce) status.textContent = `Mostrando la ruta de capacitación para ${roleNames[selected]}.`;
  }

  buttons.forEach((button, index) => {
    button.addEventListener('click', () => selectRole(button.dataset.trainingRole));
    button.addEventListener('keydown', (event) => {
      if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(event.key)) return;
      event.preventDefault();
      const direction = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1;
      const next = (index + direction + buttons.length) % buttons.length;
      buttons[next].focus();
      selectRole(buttons[next].dataset.trainingRole);
    });
  });

  function stopReplay() {
    window.clearTimeout(replayTimer);
    window.cancelAnimationFrame(replayFrame);
    root.dataset.replay = 'false';
  }
  function play() {
    stopReplay();
    if (reducedMotion() || document.hidden) return;
    replayFrame = window.requestAnimationFrame(() => {
      root.dataset.replay = 'true';
      replayTimer = window.setTimeout(stopReplay, 2100);
    });
  }
  replay?.addEventListener('click', play);
  media.addEventListener('change', () => { if (reducedMotion()) stopReplay(); });
  new MutationObserver(() => { if (reducedMotion()) stopReplay(); }).observe(document.body, { attributes: true, attributeFilter: ['data-motion'] });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopReplay(); });
  if ('IntersectionObserver' in window) {
    let introduced = false;
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !introduced) { introduced = true; play(); }
      else if (!entry.isIntersecting) stopReplay();
    }, { threshold: .3 }).observe(root.querySelector('.training-lab-visual'));
  }

  selectRole(buttons[0].dataset.trainingRole, false);
})();
