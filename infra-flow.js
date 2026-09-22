(() => {
  const map = document.querySelector('[data-infra-map]');
  if (!map) return;
  const steps = [...map.querySelectorAll('.infra-chain > li')];
  const button = map.querySelector('[data-infra-play]');
  const description = map.querySelector('[data-infra-description]');
  const announcement = map.querySelector('.infra-announcement');
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  const summary = description.textContent;
  const descriptions = [
    'Ingesta: replicar las fuentes y sostener la continuidad de los datos.',
    'Plataforma: almacenar los datos, revisar capacidad y diagnosticar la operación.',
    'Transformación: convertir datos de origen en modelos y tablas listos para el análisis.',
    'Decisión: conectar dashboards, metadata y equipos para consultar los datos con contexto.'
  ];
  let timer;
  let playing = false;
  const reduced = () => media.matches || document.body.dataset.motion === 'reduce';
  function finish(announce = false) {
    window.clearTimeout(timer);
    playing = false;
    map.classList.remove('is-playing');
    steps.forEach(step => { step.removeAttribute('aria-current'); step.classList.remove('is-passed'); });
    description.textContent = summary;
    if (announce) announcement.textContent = `Recorrido completo. ${summary}`;
  }
  function play() {
    finish();
    if (reduced() || document.hidden) { finish(true); return; }
    playing = true;
    map.classList.add('is-playing');
    let active = 0;
    const advance = () => {
      if (!playing) return;
      steps.forEach((step, index) => {
        if (index === active) step.setAttribute('aria-current', 'step');
        else step.removeAttribute('aria-current');
        step.classList.toggle('is-passed', index < active);
      });
      description.textContent = descriptions[active];
      active += 1;
      timer = window.setTimeout(active === steps.length ? () => finish(true) : advance, 800);
    };
    advance();
  }
  button.hidden = false;
  button.addEventListener('click', play);
  media.addEventListener('change', () => { if (reduced()) finish(); });
  new MutationObserver(() => { if (reduced() && playing) finish(); }).observe(document.body, { attributes: true, attributeFilter: ['data-motion'] });
  document.addEventListener('visibilitychange', () => { if (document.hidden && playing) finish(); });
  if ('IntersectionObserver' in window) {
    let introduced = false;
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !introduced) { introduced = true; play(); }
      else if (!entry.isIntersecting && playing) finish();
    }, { threshold: .3 }).observe(map);
  }
})();
