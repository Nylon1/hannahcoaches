import { getAirport } from './airports.js';
import { dateValue } from './stays-engine.js';
const text = (value, max) => String(value || '').trim().slice(0, max);
export const flightNumber = value => text(value,20).toUpperCase().replace(/\s+/g,'');
export function flightEnquiry(base, data) {
  const airport = getAirport(data.airport);
  if (!airport) throw new Error('Choose a listed airport.');
  const arriving = data.direction === 'arrivals';
  const terminal = text(data.terminal,30);
  const airportStop = `${airport.name} Airport (${airport.code})${terminal ? ', terminal '+terminal : ''}`;
  const otherStop = text(data.location,200);
  const params = new URLSearchParams({ service:'Airport transfer', pickup:arriving ? airportStop : otherStop, destination:arriving ? otherStop : airportStop });
  const count = Number(data.passengers);
  if (Number.isInteger(count) && count >= 1 && count <= 100) params.set('passengers',String(count));
  if (dateValue(data.transferDate) !== null) params.set('date',data.transferDate);
  if (data.accessible) params.set('accessible','yes');
  const notes = [arriving ? 'Pickup after an arriving flight' : 'Drop-off before a departing flight'];
  if (flightNumber(data.flight)) notes.push(`Flight: ${flightNumber(data.flight)}`);
  if (dateValue(data.flightDate) !== null) notes.push(`Flight date at UK airport: ${data.flightDate}`);
  if (/^([01]\d|2[0-3]):[0-5]\d$/.test(data.flightTime || '')) notes.push(`Scheduled ${arriving ? 'landing' : 'departure'}: ${data.flightTime} (UK local time, not pickup time)`);
  if (data.bags !== '' && data.bags != null && Number.isInteger(Number(data.bags)) && Number(data.bags)>=0 && Number(data.bags)<=200) notes.push(`Luggage items: ${Number(data.bags)}`);
  if (!params.has('date')) notes.push('Transfer date to agree');
  notes.push('Confirm pickup time, meeting point and arrangements directly');
  params.set('topics',notes.join('; '));
  return `${base}contact/?${params}#enquiry`;
}
