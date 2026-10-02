import test from 'node:test';
import assert from 'node:assert/strict';
import { stayDates, staySearch, stayEnquiry } from '../src/stays-engine.js';

test('Stay dates handle flexible plans, invalid dates, leap years and reversed stays', () => {
  assert.deepEqual(stayDates('', ''), { nights: null, error: '' });
  for (const pair of [['2028-02-29',''], ['','2028-03-01'], ['2027-02-29','2027-03-01'], ['2028-04-31','2028-05-02'], ['2028-05-02','2028-05-01'], ['2028-05-01','2028-05-01']]) assert.ok(stayDates(...pair).error);
  assert.ok(stayDates('2026-10-01','2026-10-04','2026-10-03').error);
  assert.equal(stayDates('2028-02-28','2028-03-01').nights, 2);
  assert.equal(stayDates('2028-03-25','2028-03-27').nights, 2);
});

test('Provider searches encode destination and dates without leaking coach or property details', () => {
  const data = { destination: 'York & the Dales #1', checkin:'2028-04-02', checkout:'2028-04-05', passengers: 30, pickup:'Private pickup', property:'Private property', address:'Private address' };
  for (const provider of ['booking','airbnb']) {
    const url = new URL(staySearch(provider, data));
    assert.equal(url.hostname, provider === 'booking' ? 'www.booking.com' : 'www.airbnb.co.uk');
    assert.equal(url.searchParams.get(provider === 'booking' ? 'ss' : 'query'), data.destination);
    assert.equal(url.searchParams.get('checkin'), data.checkin);
    assert.equal(url.searchParams.get('checkout'), data.checkout);
    assert.equal([...url.searchParams].length, 3);
    assert.equal(url.hash, '');
    const flexible = new URL(staySearch(provider, { destination:'York' }));
    assert.equal(flexible.searchParams.has('checkin'), false);
  }
});

test('Transport handoff preserves full group, accommodation details and return for both hosting paths', () => {
  const data = { destination:'Lake District', passengers:30, checkin:'2028-04-02', checkout:'2028-04-05', pickup:'Nelson', accessible:true, property:'A & B Cottage', address:'Windermere, LA23', status:'Booked' };
  for (const base of ['/','/hannahcoaches/']) {
    const url = new URL(stayEnquiry(base,data),'https://example.com');
    assert.equal(url.pathname,base+'contact/');
    assert.equal(url.hash,'#enquiry');
    assert.equal(url.searchParams.get('passengers'),'30');
    assert.equal(url.searchParams.get('date'),data.checkin);
    assert.equal(url.searchParams.get('destination'),data.destination);
    assert.equal(url.searchParams.get('pickup'),data.pickup);
    assert.equal(url.searchParams.get('accessible'),'yes');
    assert.match(url.searchParams.get('topics'),/Requested return: 2028-04-05/);
    assert.match(url.searchParams.get('topics'),/Property: A & B Cottage/);
    assert.match(url.searchParams.get('topics'),/Address: Windermere, LA23/);
    assert.match(url.searchParams.get('topics'),/Accommodation: Booked/);
  }
  const long = new URL(stayEnquiry('/',{...data,property:'P'.repeat(80),address:'A'.repeat(140)}),'https://example.com');
  assert.ok(long.searchParams.get('topics').length <= 500, 'Contact form must not truncate stay details');
});
