/* Original contour field: decorative, finite, no data or external services. */
(() => {
  const figure = document.querySelector('[data-hero-system]');
  const canvas = figure?.querySelector('.signal-field');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(pointer: coarse)');
  let width = 560, height = 360, frame = 0, deadline = 0, phase = 0;
  let visible = false, entered = false, pointer = 0, previous = 0;
  const reduced = () => preference.matches || document.body.dataset.motion === 'reduce';
  function draw(t) {
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.scale(width / 560, height / 360);
    for (let line = 0; line < 26; line++) {
      const depth = line / 25;
      ctx.beginPath();
      for (let step = 0; step <= 72; step++) {
        const x = step / 72 * 620 - 30;
        const wave = Math.sin(x / 104 + depth * 4 + t * .32 + pointer * .3);
        const envelope = Math.exp(-Math.pow((x - 285) / 235, 2));
        const y = 265 - depth * 122 + wave * 58 * envelope + Math.cos(x / 150 + depth * 5) * 28;
        if (step === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(183,220,139,${.055 + Math.sin(depth * Math.PI) * .15})`;
      ctx.lineWidth = line % 5 === 0 ? 1.1 : .55;
      ctx.stroke();
    }
    ctx.restore();
  }
  function stop() { cancelAnimationFrame(frame); frame = 0; previous = 0; }
  function tick(now) {
    if (!visible || document.hidden || reduced()) { stop(); draw(phase); return; }
    if (previous) phase += Math.min(now - previous, 50) / 1000;
    previous = now;
    draw(phase);
    if (now < deadline) frame = requestAnimationFrame(tick); else stop();
  }
  function animate(duration) {
    if (!visible || document.hidden || reduced()) return;
    deadline = performance.now() + duration;
    if (!frame) frame = requestAnimationFrame(tick);
  }
  function size() {
    const box = canvas.getBoundingClientRect();
    width = Math.max(1, box.width); height = Math.max(1, box.height);
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(phase);
  }
  size();
  if ('ResizeObserver' in window) new ResizeObserver(size).observe(figure);
  else window.addEventListener('resize', size, {passive:true});
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (!visible) stop();
      else if (!entered) { entered = true; animate(4800); }
    }, {threshold:.15}).observe(figure);
  } else { visible = true; animate(4800); }
  figure.addEventListener('pointermove', event => {
    if (reduced() || coarse.matches) return;
    const bounds = figure.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - .5;
    const y = (event.clientY - bounds.top) / bounds.height - .5;
    pointer = x;
    figure.style.setProperty('--scene-x', `${-y * 5}deg`);
    figure.style.setProperty('--scene-y', `${x * 6}deg`);
    animate(900);
  }, {passive:true});
  const reset = () => { figure.style.removeProperty('--scene-x'); figure.style.removeProperty('--scene-y'); pointer = 0; };
  figure.addEventListener('pointerleave', reset, {passive:true});
  const motionChanged = () => { if (reduced()) { stop(); reset(); draw(0); } };
  preference.addEventListener('change', motionChanged);
  new MutationObserver(motionChanged).observe(document.body, {attributes:true, attributeFilter:['data-motion']});
  document.addEventListener('visibilitychange', () => { if (document.hidden) { stop(); reset(); } });
})();
