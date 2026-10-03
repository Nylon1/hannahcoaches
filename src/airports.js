// Official airport sources reviewed 3 October 2026. Combined boards use the
// same URL for both directions; users select the matching tab on the source.
const airport = (code, name, region, arrivals, departures = arrivals) => ({ code, name, region, arrivals, departures });
export const airports = [
  airport('MAN','Manchester','Northern England','https://www.manchesterairport.co.uk/arrivals/','https://www.manchesterairport.co.uk/departures/'),
  airport('LPL','Liverpool John Lennon','Northern England','https://www.liverpoolairport.com/flights/arrivals-and-departures'),
  airport('LBA','Leeds Bradford','Northern England','https://www.leedsbradfordairport.co.uk/flights/arrivals','https://www.leedsbradfordairport.co.uk/flights/departures'),
  airport('NCL','Newcastle','Northern England','https://www.newcastleairport.com/arrivals-departures/'),
  airport('MME','Teesside International','Northern England','https://www.teessideinternational.com/arrivals-departures/'),
  airport('HUY','Humberside','Northern England','https://www.humbersideairport.com/'),
  airport('LHR','London Heathrow','London & South East','https://www.heathrow.com/arrivals','https://www.heathrow.com/departures'),
  airport('LGW','London Gatwick','London & South East','https://www.gatwickairport.com/flights'),
  airport('STN','London Stansted','London & South East','https://www.stanstedairport.com/arrivals/','https://www.stanstedairport.com/departures/'),
  airport('LTN','London Luton','London & South East','https://www.london-luton.co.uk/arrivals','https://www.london-luton.co.uk/departures'),
  airport('LCY','London City','London & South East','https://www.londoncityairport.com/flight-info/departures-arrivals'),
  airport('SEN','London Southend','London & South East','https://londonsouthendairport.com/flights/arrivals/','https://londonsouthendairport.com/flights/departures/'),
  airport('BHX','Birmingham','Midlands & East','https://www.birminghamairport.co.uk/flights/arrivals/','https://www.birminghamairport.co.uk/flights/departures/'),
  airport('EMA','East Midlands','Midlands & East','https://www.eastmidlandsairport.com/arrivals/','https://www.eastmidlandsairport.com/departures/'),
  airport('NWI','Norwich','Midlands & East','https://www.norwichairport.co.uk/arrivals-departures/'),
  airport('BRS','Bristol','South & South West','https://www.bristolairport.co.uk/arrivals-and-departures/arrivals/','https://www.bristolairport.co.uk/arrivals-and-departures/departures/'),
  airport('SOU','Southampton','South & South West','https://www.southamptonairport.com/departures-arrivals/'),
  airport('BOH','Bournemouth','South & South West','https://www.bournemouthairport.com/arrivals-departures/'),
  airport('EXT','Exeter','South & South West','https://exeter-airport.co.uk/arrivals-departures/'),
  airport('NQY','Cornwall Airport Newquay','South & South West','https://www.cornwallairportnewquay.com/live-flights/#live-arrivals','https://www.cornwallairportnewquay.com/live-flights/#live-departures'),
  airport('EDI','Edinburgh','Scotland','https://www.edinburghairport.com/flights/live-flight-arrivals','https://www.edinburghairport.com/flights/live-flight-departures'),
  airport('GLA','Glasgow','Scotland','https://www.glasgowairport.com/flight-info/'),
  airport('ABZ','Aberdeen','Scotland','https://www.aberdeenairport.com/flight-information/'),
  airport('INV','Inverness','Scotland','https://www.hial.co.uk/inverness-airport#arrivals','https://www.hial.co.uk/inverness-airport#departures'),
  airport('PIK','Glasgow Prestwick','Scotland','https://www.glasgowprestwick.com/arrivals-and-departures/'),
  airport('CWL','Cardiff','Wales','https://cardiff-airport.com/arrivals-departures/'),
  airport('BFS','Belfast International','Northern Ireland','https://www.belfastairport.com/flights/live-flight-information'),
  airport('BHD','George Best Belfast City','Northern Ireland','https://www.belfastcityairport.com/Flight-Info/Arrivals','https://www.belfastcityairport.com/Flight-Info/Departures'),
  airport('LDY','City of Derry','Northern Ireland','https://www.cityofderryairport.com/flight-information/live-flight-information/'),
];
export const regions = [...new Set(airports.map(item => item.region))];
export function findAirports(query = '', region = '') {
  const search = String(query).trim().toLowerCase();
  return airports.filter(item => (!region || item.region === region) && `${item.code} ${item.name} ${item.region}`.toLowerCase().includes(search));
}
export function getAirport(code) { return airports.find(item => item.code === code); }
