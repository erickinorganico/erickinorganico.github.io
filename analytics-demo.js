(() => {
  const root = document.querySelector('[data-analytics-demo]');
  if (!root) return;

  const segments = {
    all: { name: 'Todos', visits: 1240, leads: 248, activations: 126, customers: 42 },
    'self-serve': { name: 'Autogestión', visits: 760, leads: 182, activations: 103, customers: 39 },
    enterprise: { name: 'Venta asistida', visits: 480, leads: 66, activations: 23, customers: 3 }
  };
  const stageNames = { visits: 'visitas', leads: 'leads', activations: 'activaciones', customers: 'clientes' };
  const buttons = [...root.querySelectorAll('[data-analytics-segment]')];
  const numberFormat = new Intl.NumberFormat('en-US');
  const controls = root.querySelector('.analytics-demo-controls');
  const finalNode = root.querySelector('[data-analytics-final]');
  const insightNode = root.querySelector('[data-analytics-insight]');
  const announcement = root.querySelector('.analytics-demo-announcement');
  const mobileChart = root.querySelector('.analytics-demo-mobile-chart');
  const chartTitle = root.querySelector('#analytics-chart-title');
  const chartDescription = root.querySelector('#analytics-chart-desc');

  root.dataset.jsReady = 'true';
  controls.hidden = false;

  function percentage(value) {
    return `${value.toFixed(1)}%`;
  }

  function selectSegment(key, announce = true) {
    const segment = segments[key] || segments.all;
    const max = segments.all.visits;
    const stages = ['visits', 'leads', 'activations', 'customers'];
    buttons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.analyticsSegment === key)));
    stages.forEach((stage) => {
      const value = segment[stage];
      const row = root.querySelector(`[data-analytics-row="${stage}"]`);
      row.querySelector('.analytics-demo-bar').style.setProperty('--bar-scale', String(value / max));
      row.querySelector(`[data-analytics-value="${stage}"]`).textContent = numberFormat.format(value);
      root.querySelector(`[data-analytics-mobile-bar="${stage}"]`).style.setProperty('--bar-scale', String(value / max));
      root.querySelector(`[data-analytics-mobile-value="${stage}"]`).textContent = numberFormat.format(value);
    });

    const finalRate = segment.customers / segment.visits * 100;
    const rates = [
      { label: `${stageNames.visits} → ${stageNames.leads}`, rate: segment.leads / segment.visits * 100 },
      { label: `${stageNames.leads} → ${stageNames.activations}`, rate: segment.activations / segment.leads * 100 },
      { label: `${stageNames.activations} → ${stageNames.customers}`, rate: segment.customers / segment.activations * 100 }
    ];
    const weakest = rates.reduce((current, rate) => rate.rate < current.rate ? rate : current);
    finalNode.textContent = percentage(finalRate);
    insightNode.textContent = `${segment.name} convierte ${percentage(finalRate)} de visitas en clientes. El mayor quiebre está en ${weakest.label}: solo ${percentage(weakest.rate)} avanza a la siguiente etapa.`;
    chartTitle.textContent = `Embudo de conversión para ${segment.name.toLowerCase()}`;
    chartDescription.textContent = `${numberFormat.format(segment.visits)} visitas, ${numberFormat.format(segment.leads)} leads, ${numberFormat.format(segment.activations)} activaciones y ${numberFormat.format(segment.customers)} clientes. La conversión final es de ${percentage(finalRate)}.`;
    mobileChart.setAttribute('aria-label', `Conteos del embudo para ${segment.name.toLowerCase()}`);
    if (announce) announcement.textContent = `Segmento ${segment.name} seleccionado. ${numberFormat.format(segment.visits)} visitas y ${numberFormat.format(segment.customers)} clientes; conversión final ${percentage(finalRate)}.`;
  }

  buttons.forEach((button) => button.addEventListener('click', () => selectSegment(button.dataset.analyticsSegment)));
  selectSegment('all', false);
})();
