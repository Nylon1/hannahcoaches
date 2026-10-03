import { airports, getAirport, findAirports } from './airports.js';
import { flightNumber, flightEnquiry } from './flights-engine.js';
const form = document.querySelector('#flight-form');
const field = name => form.elements.namedItem(name);
const values = () => ({...Object.fromEntries(new FormData(form)), accessible:field('accessible').checked});
const params = new URLSearchParams(location.search);
if (getAirport(params.get('airport'))) field('airport').value = params.get('airport');
if (params.get('direction') === 'departures') field('direction').value = 'departures';
const today = new Date();
field('transferDate').min = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
function update() {
  const data = values();
  const airport = getAirport(data.airport);
  const arriving = data.direction === 'arrivals';
  document.querySelector('#flight-code').textContent = airport.code;
  document.querySelector('#flight-airport-name').textContent = airport.name;
  document.querySelector('#flight-board-description').textContent = `${arriving ? 'Arrivals at' : 'Departures from'} ${airport.name}`;
  document.querySelector('#flight-live-link').href = airport[data.direction];
  document.querySelector('#flight-live-label').textContent = `Open live ${data.direction}`;
  document.querySelector('#flight-source').textContent = `Source: ${new URL(airport[data.direction]).hostname.replace(/^www\./,'')}`;
  document.querySelector('#flight-source-note').textContent = airport.code === 'HUY' ? 'Open Arrivals & Departures on the airport website, then search for your flight.' : airport.arrivals === airport.departures ? `Select ${data.direction} on the airport’s combined flight board, then search for your flight.` : 'Use the airport’s flight search to find your flight.';
  document.querySelector('#flight-transfer-title').textContent = arriving ? 'Landing? Let’s get you home.' : 'Flying out? Start together.';
  document.querySelector('#flight-route-summary').textContent = `${arriving ? 'Pickup from' : 'Drop-off at'} ${airport.name} Airport. ${arriving ? 'Tell us where your group is heading.' : 'Tell us where to collect your group.'}`;
  document.querySelector('#flight-time-label').textContent = `Scheduled ${arriving ? 'landing' : 'departure'} time (UK)`;
  document.querySelector('#flight-location-label').textContent = `${arriving ? 'Your destination' : 'Your pickup'} town or postcode *`;
  field('location').setCustomValidity(data.location.trim() ? '' : 'Enter a town or postcode for your transfer.');
  document.querySelector('#flight-capacity').textContent = Number(data.passengers)>25 ? 'More than 25 passengers? Ask M Latif about options for the whole group.' : '15, 17, 21 and 25 seaters. We’ll confirm space for your group and luggage.';
}
form.addEventListener('input', () => { update(); document.querySelector('#flight-copy-status').textContent=''; });
form.addEventListener('change', update);
window.addEventListener('pageshow', update);
form.addEventListener('submit', event => { event.preventDefault(); update(); if (form.reportValidity()) location.assign(flightEnquiry(form.dataset.base, values())); });
document.querySelector('#flight-copy').addEventListener('click', async () => {
  const number = flightNumber(field('flight').value);
  const status = document.querySelector('#flight-copy-status');
  if (!number) { status.textContent='Enter your flight number first.'; field('flight').focus(); return; }
  try { await navigator.clipboard.writeText(number); status.textContent=`Copied ${number}. Paste it into the airport’s flight search.`; }
  catch { status.textContent=`Select and copy your flight number: ${number}`; }
});
function filter() {
  const visible = new Set(findAirports(document.querySelector('#airport-search').value,document.querySelector('#airport-region').value).map(item=>item.code));
  document.querySelectorAll('[data-airport-card]').forEach(card => card.hidden = !visible.has(card.dataset.airportCard));
  document.querySelector('#airport-count').textContent=`${visible.size} of ${airports.length} airports`;
  document.querySelector('#airport-empty').hidden=visible.size>0;
}
document.querySelector('#airport-search').addEventListener('input', filter);
document.querySelector('#airport-region').addEventListener('change', filter);
document.querySelector('#airport-clear').addEventListener('click', () => { document.querySelector('#airport-search').value=''; document.querySelector('#airport-region').value=''; filter(); document.querySelector('#airport-search').focus(); });
document.querySelectorAll('[data-choose-airport]').forEach(link => link.addEventListener('click', event => {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  field('airport').value=link.dataset.chooseAirport;
  // A terminal entered for another airport must not silently follow a switch.
  field('terminal').value='';
  update();
  field('airport').focus({preventScroll:true});
  document.querySelector('#flight-checker').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant':'smooth'});
}));
field('airport').addEventListener('change',()=>{field('terminal').value='';update();});
update();
