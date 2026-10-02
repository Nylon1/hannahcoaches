import { stayDates, staySearch, stayEnquiry } from './stays-engine.js';

const form = document.querySelector('#stay-form');
const field = name => form.elements.namedItem(name);
const date = new Date();
const today = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
field('checkin').min = today;
field('checkout').min = today;
function data() {
  return { ...Object.fromEntries(new FormData(form)), accessible: field('accessible').checked };
}
function update() {
  const values = data();
  const dates = stayDates(values.checkin, values.checkout, today);
  field('destination').setCustomValidity(values.destination.trim() ? '' : 'Enter a destination for your stay.');
  field('checkout').setCustomValidity(dates.error);
  document.querySelector('#stay-date-error').textContent = dates.error;
  document.querySelector('#stay-summary-destination').textContent = values.destination.trim() || 'Somewhere to look forward to';
  document.querySelector('#stay-summary-nights').textContent = dates.error ? 'Check your dates' : dates.nights === null ? 'Flexible dates' : `${dates.nights} ${dates.nights === 1 ? 'night' : 'nights'} away`;
  const count = Number(values.passengers);
  const validCount = Number.isInteger(count) && count >= 1 && count <= 100;
  document.querySelector('#stay-summary-people').textContent = validCount ? `${count} ${count === 1 ? 'passenger' : 'passengers'}` : 'Choose 1 to 100 passengers';
  document.querySelector('#stay-summary-status').textContent = values.status;
  const seats = [15,17,21,25].find(size => size >= count);
  document.querySelector('#stay-capacity').textContent = !validCount ? 'Add your group size to explore seating.' : count > 25 ? 'More than 25 travelling? Ask M Latif about options for your whole group.' : values.accessible ? 'Let’s discuss a suitable accessible vehicle for your group.' : `Explore our ${seats}-seater as a starting point.`;
  for (const provider of ['booking', 'airbnb']) document.querySelector(`#stay-${provider}`).href = staySearch(provider, values);
}
form.addEventListener('input', update);
form.addEventListener('change', update);
window.addEventListener('pageshow', update);
document.querySelectorAll('[data-stay-place]').forEach(button => button.addEventListener('click', () => {
  field('destination').value = button.dataset.stayPlace;
  update();
  field('destination').focus({ preventScroll: true });
}));
for (const provider of ['booking', 'airbnb']) document.querySelector(`#stay-${provider}`).addEventListener('click', event => {
  update();
  // Accommodation searches do not depend on transport-only fields.
  for (const name of ['destination','checkin','checkout']) {
    if (!field(name).reportValidity()) { event.preventDefault(); break; }
  }
});
form.addEventListener('submit', event => {
  event.preventDefault();
  update();
  if (form.reportValidity()) location.assign(stayEnquiry(form.dataset.base, data()));
});
document.querySelector('#stay-copy').addEventListener('click', async () => {
  update();
  if (!['destination','checkin','checkout'].every(name => field(name).reportValidity())) return;
  const values = data();
  const brief = `${values.destination.trim()}\n${values.checkin ? `Check-in: ${values.checkin}\nCheck-out: ${values.checkout}` : 'Flexible dates'}`;
  const status = document.querySelector('#stay-copy-status');
  try {
    await navigator.clipboard.writeText(brief);
    status.textContent = 'Copied. Keep these details handy for your accommodation search.';
  } catch {
    status.textContent = `Select and copy: ${brief}`;
  }
});
update();
