const text = (value, max) => String(value || '').trim().slice(0, max);

export function dateValue(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null;
  const stamp = Date.parse(value + 'T00:00:00Z');
  return Number.isFinite(stamp) && new Date(stamp).toISOString().slice(0, 10) === value ? stamp : null;
}

export function stayDates(checkin, checkout, today) {
  if (!checkin && !checkout) return { nights: null, error: '' };
  const start = dateValue(checkin), end = dateValue(checkout);
  if (start === null || end === null) return { nights: null, error: 'Choose both check-in and check-out dates, or leave both blank for flexible dates.' };
  if (today && checkin < today) return { nights: null, error: 'Choose a check-in date today or later.' };
  if (end <= start) return { nights: null, error: 'Check-out must be after check-in.' };
  return { nights: (end - start) / 86400000, error: '' };
}

export function staySearch(provider, data) {
  const url = new URL(provider === 'booking' ? 'https://www.booking.com/searchresults.html' : 'https://www.airbnb.co.uk/s/homes');
  url.searchParams.set(provider === 'booking' ? 'ss' : 'query', text(data.destination, 100));
  if (!stayDates(data.checkin, data.checkout).error && data.checkin) {
    url.searchParams.set('checkin', data.checkin);
    url.searchParams.set('checkout', data.checkout);
  }
  // Coach passengers are not accommodation guests/rooms. The organiser sets
  // adults, children and room/property requirements directly with the provider.
  return url.href;
}

export function stayEnquiry(base, data) {
  const params = new URLSearchParams({ service: 'UK resort or weekend trip', destination: text(data.destination, 100) });
  const passengers = Number(data.passengers);
  if (Number.isInteger(passengers) && passengers >= 1 && passengers <= 100) params.set('passengers', String(passengers));
  if (text(data.pickup, 200)) params.set('pickup', text(data.pickup, 200));
  if (data.accessible) params.set('accessible', 'yes');
  const dates = stayDates(data.checkin, data.checkout);
  const notes = [];
  if (!dates.error && data.checkin) {
    params.set('date', data.checkin);
    notes.push(`Stay: ${data.checkin} to ${data.checkout} (${dates.nights} nights)`, `Requested return: ${data.checkout}`, 'Travel dates follow stay dates; timings to agree');
  } else notes.push('Stay and travel dates flexible');
  notes.push(`Accommodation: ${['Shortlisted', 'Booked'].includes(data.status) ? data.status : 'Still choosing'}`);
  if (text(data.property, 80)) notes.push(`Property: ${text(data.property, 80)}`);
  if (text(data.address, 140)) notes.push(`Address: ${text(data.address, 140)}`);
  params.set('topics', notes.join('; '));
  return `${base}contact/?${params}#enquiry`;
}
