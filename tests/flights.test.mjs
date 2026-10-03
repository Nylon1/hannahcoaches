import test from 'node:test';
import assert from 'node:assert/strict';
import { airports, findAirports } from '../src/airports.js';
import { flightEnquiry, flightNumber } from '../src/flights-engine.js';

test('Airport directory covers the main UK hubs and filters codes, names and regions', () => {
  assert.equal(airports.length,29);
  assert.equal(new Set(airports.map(a=>a.code)).size,29);
  for(const code of ['LHR','LGW','MAN','STN','LTN','EDI','BHX','BRS','GLA','BFS','BHD','CWL','LPL','LBA','NCL','EMA','LCY']) assert.ok(airports.some(a=>a.code===code));
  assert.deepEqual(findAirports(' man ').map(a=>a.code),['MAN']);
  assert.equal(findAirports('belfast','Northern Ireland').length,2);
  assert.equal(findAirports('heathrow','Scotland').length,0);
  assert.equal(findAirports('unknown').length,0);
  for(const airport of airports) for(const direction of ['arrivals','departures']) {
    const url=new URL(airport[direction]);
    assert.equal(url.protocol,'https:');
    assert.ok(!url.searchParams.has('flight'), 'Flight numbers are not sent through unsupported airport search parameters');
  }
});

test('Arrivals and departures map the airport to the correct end of the coach journey', () => {
  const data={airport:'MAN',direction:'arrivals',location:'Nelson & Colne',passengers:30,terminal:'2',flight:'ls 123',flightDate:'2028-04-05',flightTime:'00:30',transferDate:'2028-04-05',bags:'30',accessible:true};
  for(const base of ['/','/hannahcoaches/']) {
    const arriving=new URL(flightEnquiry(base,data),'https://example.com');
    assert.equal(arriving.pathname,base+'contact/');
    assert.equal(arriving.hash,'#enquiry');
    assert.equal(arriving.searchParams.get('pickup'),'Manchester Airport (MAN), terminal 2');
    assert.equal(arriving.searchParams.get('destination'),data.location);
    assert.equal(arriving.searchParams.get('passengers'),'30');
    assert.equal(arriving.searchParams.get('accessible'),'yes');
    assert.match(arriving.searchParams.get('topics'),/Flight: LS123/);
    assert.match(arriving.searchParams.get('topics'),/Luggage items: 30/);
    const departing=new URL(flightEnquiry(base,{...data,direction:'departures',flightTime:'04:30',transferDate:'2028-04-04'}),'https://example.com');
    assert.equal(departing.searchParams.get('pickup'),data.location);
    assert.equal(departing.searchParams.get('destination'),'Manchester Airport (MAN), terminal 2');
    assert.equal(departing.searchParams.get('date'),'2028-04-04');
    assert.match(departing.searchParams.get('topics'),/Flight date at UK airport: 2028-04-05/);
    assert.match(departing.searchParams.get('topics'),/04:30 \(UK local time, not pickup time\)/);
  }
});

test('Unknown airports, impossible dates and missing luggage do not produce misleading enquiries', () => {
  assert.throws(()=>flightEnquiry('/',{airport:'FAKE'}));
  assert.equal(flightNumber(' ba 123 '),'BA123');
  const url=new URL(flightEnquiry('/',{airport:'LHR',direction:'arrivals',passengers:0,flightDate:'2027-02-29',transferDate:'2027-04-31',flightTime:'25:10',bags:''}),'https://example.com');
  assert.equal(url.searchParams.has('date'),false);
  assert.equal(url.searchParams.has('passengers'),false);
  assert.doesNotMatch(url.searchParams.get('topics'),/Flight date|Luggage items|25:10/);
  assert.match(url.searchParams.get('topics'),/Transfer date to agree/);
  const bounded=new URL(flightEnquiry('/',{airport:'MAN',flight:'X'.repeat(100),terminal:'T'.repeat(100),location:'L'.repeat(400),flightDate:'2028-04-05',transferDate:'2028-04-04',flightTime:'04:30',bags:200,passengers:100}),'https://example.com');
  assert.ok(bounded.searchParams.get('topics').length<=500);
  assert.ok(bounded.searchParams.get('pickup').length<=200);
  assert.ok(bounded.searchParams.get('destination').length<=200);
});
