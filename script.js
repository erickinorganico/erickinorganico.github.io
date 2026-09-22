const cases = [...document.querySelectorAll('.case')];
cases.forEach((item) => {
  item.querySelector('summary').addEventListener('click', () => {
    cases.forEach((other) => { if (other !== item) other.open = false; });
  });
});
const filters = document.querySelector('.case-filters');
if (filters) {
  filters.hidden = false;
  filters.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-filter]');
    if (!button) return;
    const selected = button.dataset.filter;
    filters.querySelectorAll('button').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    cases.forEach((item) => {
      item.hidden = selected !== 'all' && item.dataset.category !== selected;
      item.open = false;
    });
    const visible = cases.filter((item) => !item.hidden);
    if (visible[0]) visible[0].open = true;
    document.querySelector('.filter-status').textContent = visible.length === 1 ? '1 caso disponible' : `${visible.length} casos disponibles`;
  });
}
function revealLinkedCase() {
  const target = cases.find((item) => `#${item.id}` === window.location.hash);
  if (!target) return;
  if (target.hidden) filters.querySelector('[data-filter="all"]').click();
  cases.forEach((item) => { item.open = item === target; });
  target.scrollIntoView({block: 'start'});
}
window.addEventListener('hashchange', revealLinkedCase);
revealLinkedCase();
