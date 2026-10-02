const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');
function closeMenu() {
  menuButton?.setAttribute('aria-expanded', 'false');
  nav?.classList.remove('is-open');
}
menuButton?.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!expanded));
  nav.classList.toggle('is-open', !expanded);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuButton.focus();
  }
});
document.addEventListener('click', (event) => {
  if (!event.target.closest('.header-inner')) closeMenu();
});
matchMedia('(min-width: 1241px)').addEventListener('change', closeMenu);

const form = document.querySelector('#quote-form');
if (form) {
  const params = new URLSearchParams(location.search);
  const service = document.querySelector('#service');
  if ([...service.options].some(option => option.value === params.get('service'))) service.value = params.get('service');
  const seats = params.get('seats');
  if (['15', '17', '21', '25'].includes(seats)) {
    document.querySelector('#passengers').value = seats;
    document.querySelector('#details').value = `I’m interested in a ${seats}-seater. `;
  }
  const passengers = Number(params.get('passengers'));
  if (Number.isInteger(passengers) && passengers >= 1 && passengers <= 100) document.querySelector('#passengers').value = passengers;
  if (params.get('destination')) document.querySelector('#destination').value = params.get('destination').slice(0, 200);
  if (params.get('pickup')) document.querySelector('#pickup').value = params.get('pickup').slice(0, 200);
  if (/^\d{4}-\d{2}-\d{2}$/.test(params.get('date') || '')) document.querySelector('#date').value = params.get('date');
  const notes = [];
  if (params.get('accessible') === 'yes') notes.push('I would like to discuss accessible travel.');
  if (params.get('topics')) notes.push(`I would like to discuss: ${params.get('topics').slice(0, 500)}.`);
  if (notes.length) document.querySelector('#details').value += notes.join('\n');
  const date = document.querySelector('#date');
  const today = new Date();
  date.min = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const get = (key) => String(data.get(key) || '').trim();
    const body = `Hello M Latif,\n\nI’d like to enquire about a journey with Hannah Coaches UK.\n\nName: ${get('name')}\nEmail: ${get('email')}\nPhone: ${get('phone')}\nJourney: ${get('service')}\nTravel date: ${get('date') || 'To be confirmed'}\nPassengers: ${get('passengers')}\nPickup: ${get('pickup')}\nDestination: ${get('destination')}\n\nAdditional details:\n${get('details') || 'None provided'}\n\nPlease let me know availability and a quote.\nThank you.`;
    document.querySelector('#enquiry-text').textContent = body;
    document.querySelector('#send-email').href = `mailto:safetravel77@outlook.com?subject=${encodeURIComponent('Journey enquiry: ' + get('service'))}&body=${encodeURIComponent(body)}`;
    document.querySelector('#copy-status').textContent = '';
    const preview = document.querySelector('#email-preview');
    preview.hidden = false;
    preview.focus({ preventScroll: true });
    preview.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' });
  });
  form.addEventListener('input', () => {
    document.querySelector('#email-preview').hidden = true;
  });
  document.querySelector('#copy-enquiry').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(document.querySelector('#enquiry-text').textContent);
      document.querySelector('#copy-status').textContent = 'Copied. Paste your enquiry into an email to safetravel77@outlook.com.';
    } catch {
      document.querySelector('#copy-status').textContent = 'Copying isn’t available in this browser. Select the enquiry text above and copy it manually.';
    }
  });
}

// Motion is progressive enhancement: all content is visible without JavaScript.
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
document.documentElement.classList.add('js-ready');
const revealTargets = document.querySelectorAll('.section-heading, .service-card, .fleet-card, .trip-card, .step, .welcome-grid, .split-section, .about-grid, .manager-card, .feature-grid article, .explorer-panel, .fleet-finder, .access-grid, .access-planner, .review-strip .container, .cta-inner, .contact-details, .enquiry-card, .stay-panel, .stay-separate');
let revealObserver;
if ('IntersectionObserver' in window && !motionPreference.matches) {
  revealObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.remove('reveal-pending');
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    }
  }, { threshold: 0.07, rootMargin: '0px 0px -25px 0px' });
  revealTargets.forEach((element, index) => {
    element.classList.add('reveal-item');
    element.style.setProperty('--reveal-delay', `${index % 3 * 65}ms`);
    if (element.getBoundingClientRect().top > innerHeight && !element.contains(document.querySelector(':target'))) {
      element.classList.add('reveal-pending');
      revealObserver.observe(element);
    }
  });
}
function showFocusedContent(event) {
  event.target.closest?.('.reveal-pending')?.classList.remove('reveal-pending');
}
document.addEventListener('focusin', showFocusedContent);
motionPreference.addEventListener('change', () => {
  if (motionPreference.matches) {
    revealObserver?.disconnect();
    document.querySelectorAll('.reveal-pending').forEach(el => el.classList.remove('reveal-pending'));
    document.querySelector('.hero-photo')?.style.removeProperty('transform');
  }
});

const progress = document.querySelector('.scroll-progress span');
const backTop = document.querySelector('.back-top');
let scrollFrame;
function updateScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
  backTop.hidden = scrollY < 600;
  document.querySelector('.site-header').classList.toggle('has-scrolled', scrollY > 30);
  const photo = document.querySelector('.hero-photo');
  if (photo && !motionPreference.matches && scrollY < innerHeight) photo.style.transform = `translateY(${Math.min(24, scrollY * 0.04)}px) scale(1.09)`;
  scrollFrame = null;
}
addEventListener('scroll', () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll); }, { passive: true });
addEventListener('resize', () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll); });
updateScroll();
backTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: motionPreference.matches ? 'instant' : 'smooth' });
  document.querySelector('.site-header .brand').focus({ preventScroll: true });
});

const plannerDialog = document.querySelector('#journey-planner');
let plannerTrigger;
document.querySelectorAll('[data-open-planner]').forEach(button => button.addEventListener('click', () => {
  plannerTrigger = button;
  plannerDialog.showModal();
  document.body.classList.add('dialog-open');
}));
document.querySelector('.planner-close').addEventListener('click', () => plannerDialog.close());
plannerDialog.addEventListener('click', event => {
  if (event.target === plannerDialog) {
    const rect = plannerDialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) plannerDialog.close();
  }
});
plannerDialog.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
  plannerTrigger?.focus({ preventScroll: true });
});

const tripTabs = [...document.querySelectorAll('[data-trip-tab]')];
function activateTrip(tab) {
  tripTabs.forEach(item => {
    const active = item === tab;
    item.setAttribute('aria-selected', String(active));
    item.tabIndex = active ? 0 : -1;
    const panel = document.getElementById(item.getAttribute('aria-controls'));
    panel.hidden = !active;
    if (active) panel.classList.remove('reveal-pending');
  });
}
tripTabs.forEach((tab,index) => {
  tab.addEventListener('click', () => activateTrip(tab));
  tab.addEventListener('keydown', event => {
    const indices = { ArrowRight: (index + 1) % tripTabs.length, ArrowLeft: (index - 1 + tripTabs.length) % tripTabs.length, Home: 0, End: tripTabs.length - 1 };
    if (Object.hasOwn(indices, event.key)) {
      event.preventDefault();
      const next = tripTabs[indices[event.key]];
      activateTrip(next);
      next.focus();
    }
  });
});

const groupRange = document.querySelector('#group-size');
if (groupRange) {
  const access = document.querySelector('#finder-access');
  const enquiry = document.querySelector('#finder-enquire');
  const enquiryBase = enquiry.href.split('?')[0];
  function updateFleet() {
    const count = Number(groupRange.value);
    const capacity = [15,17,21,25].find(size => size >= count);
    document.querySelector('#group-count').value = `${count} ${count === 1 ? 'person' : 'people'}`;
    groupRange.style.setProperty('--range-fill', `${(count - 1) / 29 * 100}%`);
    document.querySelectorAll('[data-group-size]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.groupSize) === count)));
    document.querySelector('#finder-capacity').textContent = capacity ? `${capacity} seats` : 'Let’s talk';
    document.querySelector('#finder-title').textContent = access.checked ? 'Let’s plan around your access needs' : capacity ? `Explore our ${capacity}-seater` : 'A bigger group? Let’s talk.';
    document.querySelector('#finder-description').textContent = access.checked ? 'Speak to M Latif to confirm a suitable vehicle and seating arrangement.' : capacity ? `A seating starting point for ${count} ${count === 1 ? 'passenger' : 'passengers'}. Confirm space for luggage and equipment with us.` : 'Our largest stated vehicle seats 25. Contact us to discuss whether we can accommodate your group.';
    const params = new URLSearchParams({ passengers: String(count) });
    if (capacity && !access.checked) params.set('seats', String(capacity));
    if (access.checked) { params.set('service','Accessible transport'); params.set('accessible','yes'); }
    enquiry.href = `${enquiryBase}?${params}`;
    const seats = document.querySelector('#finder-seats');
    seats.replaceChildren(...Array.from({length:capacity || 25}, (_,i) => {
      const seat = document.createElement('span');
      seat.className = i < count ? 'occupied' : '';
      return seat;
    }));
  }
  groupRange.addEventListener('input', updateFleet);
  access.addEventListener('change', updateFleet);
  document.querySelectorAll('[data-group-size]').forEach(button => button.addEventListener('click', () => { groupRange.value = button.dataset.groupSize; updateFleet(); }));
  updateFleet();
}

const accessLink = document.querySelector('#access-enquire');
if (accessLink) {
  const accessBase = accessLink.href.split('?')[0];
  document.querySelectorAll('[name="access-topic"]').forEach(input => input.addEventListener('change', () => {
    const choices = [...document.querySelectorAll('[name="access-topic"]:checked')].map(el => el.value);
    document.querySelector('#access-summary').textContent = choices.length ? `${choices.length} ${choices.length === 1 ? 'topic' : 'topics'} ready to discuss.` : 'Choose any that apply, or start a general conversation.';
    accessLink.href = `${accessBase}?${new URLSearchParams({ service:'Accessible transport', topics:choices.join('; ') })}`;
  }));
}

const airportChoice = document.querySelector('#airport-choice');
if (airportChoice) {
  const airportLink = document.querySelector('#airport-enquire');
  const airportBase = airportLink.href.split('?')[0];
  airportChoice.addEventListener('change', () => {
    const airport = airportChoice.value;
    document.querySelector('#airport-ticket-destination').textContent = airport || 'Your airport';
    airportLink.href = `${airportBase}?${new URLSearchParams({ service:'Airport transfer', destination:airport === 'Another UK airport' ? '' : airport })}`;
  });
}

if (form) {
  const required = [...form.querySelectorAll('[required]')];
  function updateCompletion() {
    const complete = required.filter(field => field.value.trim() && field.checkValidity()).length;
    const meter = document.querySelector('#form-completion');
    meter.max = required.length;
    meter.value = complete;
    document.querySelector('#form-completion-label').textContent = `${complete} of ${required.length} essentials completed`;
  }
  form.addEventListener('input', updateCompletion);
  form.addEventListener('change', updateCompletion);
  updateCompletion();
}
