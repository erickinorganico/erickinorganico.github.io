(() => {
  const lab = document.querySelector('[data-agent-lab]');
  if (!lab) return;
  const scenarios = {
    infra: {
      kind: 'infraestructura',
      signal: 'La tarea de actualización terminó con éxito, pero el dashboard sigue desactualizado.',
      source: 'Fuentes: Airflow y logs · dbt y SQL · Metabase',
      title: 'Éxito técnico ≠ dato actualizado',
      check: 'Contrastar la ejecución con la frescura del dato de origen, la transformación y el consumidor final.',
      output: 'Identificar la capa que necesita atención y preparar el diagnóstico y la acción propuesta para revisión.',
      state: 'Requiere revisión', href: '#caso-5', link: 'Ver el caso de agentes',
      steps: ['Leer el estado de tareas, modelos y dashboard.', 'Recuperar los criterios de actualización de cada fuente.', 'Contrastar ejecución exitosa con datos realmente actualizados.', 'Preparar el diagnóstico y una propuesta de intervención.', 'El agente prepara evidencia. La persona conserva el control de las intervenciones.']
    },
    kpi: {
      kind: 'indicadores de negocio',
      signal: 'Un indicador cambia. ¿Es una señal del negocio o un problema en la medición?',
      source: 'Fuentes: indicadores diarios y semanales · definiciones · calidad de datos',
      title: 'Una variación necesita contexto',
      check: 'Revisar la ventana de comparación, la frescura y la cobertura antes de interpretar el cambio.',
      output: 'Un resumen de señales, controles y preguntas que merecen investigación. Si falta evidencia, mantener la conclusión abierta.',
      state: 'Interpretar con contexto', href: '#caso-4', link: 'Ver la base de metadata y métricas',
      steps: ['Leer la señal y la ventana de comparación.', 'Consultar qué significa la métrica y cómo se calcula.', 'Revisar frescura y calidad para separar negocio de medición.', 'Preparar un resumen con hallazgos y preguntas abiertas.', 'El monitoreo señala qué revisar. La interpretación conserva sus supuestos y límites.']
    },
    research: {
      kind: 'investigación comercial',
      signal: 'Una empresa publica vacantes fuera de la plataforma. ¿Qué actividad podemos observar?',
      source: 'Fuentes: portales públicos · vacantes observables · evidencia de origen',
      title: 'Cobertura antes que una cifra',
      check: 'Validar la fuente, revisar duplicados y distinguir información faltante de ausencia real de actividad.',
      output: 'Evidencia trazable sobre vacantes y cobertura para apoyar la investigación comercial de Share of Hiring.',
      state: 'Cobertura documentada', href: '#caso-1', link: 'Explorar Share of Hiring',
      steps: ['Localizar actividad en fuentes públicas.', 'Confirmar organización, fuente y alcance de la búsqueda.', 'Revisar duplicados, solapamientos y evidencia incompleta.', 'Preparar la comparación y sus fuentes.', 'El resultado describe vacantes observables, con sus límites de cobertura.']
    }
  };
  const controls = lab.querySelector('.agent-scenarios');
  const buttons = [...controls.querySelectorAll('button')];
  const nodes = [...lab.querySelectorAll('.agent-pipeline li')];
  const replay = lab.querySelector('[data-agent-replay]');
  const progress = lab.querySelector('[data-agent-progress]');
  const announcement = lab.querySelector('.agent-announcement');
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  let selected = 'infra';
  let timer = null;
  let playing = false;
  const reduced = () => media.matches || document.body.dataset.motion === 'reduce';
  const setText = (name, text) => { lab.querySelector(`[data-agent-${name}]`).textContent = text; };
  function phase(index) {
    nodes.forEach((node, position) => {
      node.classList.toggle('is-complete', position <= index);
      if (position === index) node.setAttribute('aria-current', 'step');
      else node.removeAttribute('aria-current');
    });
    progress.textContent = scenarios[selected].steps[index];
  }
  function finish(announce = false) {
    window.clearTimeout(timer);
    playing = false;
    lab.classList.remove('is-playing');
    phase(4);
    if (announce) announcement.textContent = `Recorrido completo: ${scenarios[selected].steps[4]}`;
  }
  function play() {
    finish();
    if (reduced() || document.hidden) { finish(true); return; }
    playing = true;
    lab.classList.add('is-playing');
    let step = 0;
    phase(step);
    const next = () => {
      if (!playing) return;
      step += 1;
      phase(step);
      if (step === 4) { finish(true); return; }
      timer = window.setTimeout(next, 650);
    };
    timer = window.setTimeout(next, 650);
  }
  function select(key) {
    if (!scenarios[key]) return;
    finish(); selected = key;
    const example = scenarios[key];
    buttons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.agentScenario === key)));
    ['kind', 'signal', 'source', 'check', 'output', 'state'].forEach((name) => setText(name, example[name]));
    setText('check-title', example.title);
    const link = lab.querySelector('[data-agent-case]');
    link.href = example.href;
    link.firstChild.textContent = `${example.link} `;
    announcement.textContent = `Ejemplo seleccionado: ${example.kind}. ${example.signal}`;
    play();
  }
  controls.hidden = false; replay.hidden = false;
  buttons.forEach((button) => button.addEventListener('click', () => select(button.dataset.agentScenario)));
  replay.addEventListener('click', play);
  media.addEventListener('change', () => { if (reduced()) finish(); });
  new MutationObserver(() => { if (reduced() && playing) finish(); }).observe(document.body, { attributes: true, attributeFilter: ['data-motion'] });
  document.addEventListener('visibilitychange', () => { if (document.hidden && playing) finish(); });
  if ('IntersectionObserver' in window) {
    let introduced = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !introduced) { introduced = true; if (!reduced()) play(); }
      else if (!entry.isIntersecting && playing) finish();
    }, { threshold: .2 });
    observer.observe(lab);
  }
})();
