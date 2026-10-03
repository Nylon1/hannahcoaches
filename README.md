# Hannah Coaches UK

A responsive nine-page website for Hannah Coaches UK, with a royal blue executive identity, accessible navigation and a client-side email enquiry builder.

## Run locally

Requires Node.js 22 or newer. No runtime dependencies, API keys or installation are needed.

```sh
npm run dev
```

Open http://localhost:4173. The server builds the site at startup. After editing a file, run `npm run build` and refresh the browser. Alternatively restart the server.

```sh
npm run build
npm test
npm run preview
```

`dist/` contains the complete static website. `npm run preview` serves an existing build on port 4173. Use `-- --port 4174` for another port.

## Pages

1. Home `/`
2. Our Fleet `/our-fleet/`
3. School & Accessible Transport `/school-transport/`
4. Airport Transfers `/airport-transfers/`
5. Trips & Events `/trips-events/`
6. Stays & Travel `/stays-travel/`
7. Flight Checker `/flight-checker/`
8. About Us `/about/`
9. Contact & Enquiries `/contact/`

Edit copy and shared page structure in `src/site.mjs`, design in `src/styles.css` and browser interactions in `src/client.js`.

Visual components and the journey planner live in `src/experience.mjs`. The site includes an interactive trip gallery with keyboard-accessible tabs, a seat finder, airport selection, an accessibility discussion checklist, and an enquiry completion indicator. The floating planner carries selected travel details into the contact page. The seat finder is an illustrative starting point, not a guarantee of vehicle suitability or availability.

Scroll reveals use IntersectionObserver and run once per element. All ordinary content stays visible without JavaScript. The site honours `prefers-reduced-motion`, reveals keyboard-focused content, and provides a reading-progress bar and back-to-top control. No tracking is used. Only the trip companion uses persistent browser storage, when the visitor explicitly selects it.

## Group organiser trip companion

Open `/trips-events/#trip-tool`. Home, footer and quick-planner links also lead to it.

- Personalised checklists for airport, school, golf, football, wedding, weekend and other journeys, with additional tasks for accessibility, children, equipment and overnight stays.
- Confirmed passenger count, luggage count, capacity guidance, incomplete key arrangements, custom reminders with remove/undo, and checklist filters.
- Draft meeting and departure times calculated backwards from a target arrival, user-entered driving time, planned stops and buffer. Dates roll across midnight correctly. No live routing, traffic or flight data is implied.
- An exact penny-preserving split of a user-entered agreed group cost. No transport prices are generated.
- Optional save/restore on the current device, using `hannah-trip-companion-v1` in local storage. Saving is off by default. Switching it off removes the saved copy; blocked storage falls back to an in-tab plan. Stored fields are normalised and bounded before use. No passenger names or medical records are collected by the planner.
- Downloadable text pack, print/save-as-PDF layout, and a copyable group day plan. These actions do not send anything to passengers or to Hannah Coaches. The organiser chooses what to share.
- Transport enquiry prefill carrying destination, date, pickup, group size and practical requirements into the contact form. This still does not confirm a booking.

Template: `src/trip-tool.mjs`. Browser behaviour: `src/trip-tool.js`. Pure calculations: `src/trip-engine.js`. Styling: `src/trip-tool.css`. Tests cover midnight/month/leap-year boundaries, incomplete dates, penny-preserving costs, adaptive checklist progress and malformed saved data.

## Stays & Travel

Open `/stays-travel/` to build an accommodation and transport plan. Booking.com and Airbnb links pass destination and optional dates to independent searches in new tabs. Guests, children, rooms, access needs and accommodation payments are handled on the provider. Coach passenger counts are not passed as accommodation guest counts. No accommodation API, inventory, affiliate relationship or automatic booking import is implied.

The form validates paired dates and check-out order, provides group capacity guidance, and carries pickup, the full passenger count, dates, property/address and access discussion into the existing transport enquiry. Check-in and check-out provide initial outward and return dates for the organiser to review. Flexible dates and unchosen properties are supported. Nothing is booked or sent automatically.

Template: `src/stays.mjs`. Behaviour: `src/stays.js`. Pure date and URL helpers: `src/stays-engine.js`. Styling: `src/stays.css`.

## Flight checker

Open `/flight-checker/`. The page links to official arrivals/departures boards for 29 airports across England, Scotland, Wales and Northern Ireland. It includes airport name/code search, region filters, arrival/departure selection and flight-number copying. Flight information opens on airport websites; the site does not fetch, cache, display or monitor live flight statuses and never invents flight data. Combined boards require selecting the corresponding tab on the airport site. Humberside links to its official homepage for flight information. Some airport sites block automated requests; their official navigation/help links were used where available.

The transfer handoff maps arriving flights to an airport pickup, and departing flights to an airport destination. The enquiry carries the full passenger count, luggage, accessibility request, terminal and flight details. Flight date/time are separate from the requested transfer date, preserving overnight journeys. Collection times and all routes must be agreed with Hannah Coaches. No automatic delay monitoring or booking changes are promised. No API key or paid service is required.

Official source directory: `src/airports.js` (reviewed 3 October 2026). Template: `src/flights.mjs`. UI: `src/flights.js`. Enquiry mapping: `src/flights-engine.js`. Tests cover direction, overnight transfer dates, malformed dates, all four UK nations and filtering.

## Enquiries

The form validates required fields, prepares a plain-text enquiry and lets the visitor review it, open a prefilled email, or copy the text. It **does not send emails from a server** or confirm bookings. M Latif receives an enquiry only after the visitor sends it from their own email account. No form data is saved, tracked or posted to a server. Click-to-call and direct email links also work without JavaScript.

Fleet and service links prefill relevant enquiry fields. Accessible transport copy asks visitors to confirm their individual requirements and vehicle suitability before booking.

The Google link searches Maps for Hannah Coaches UK Ltd in Nelson, Lancashire. A unique verified Google Business Profile URL and review score were not available; no reviews, review counts or ratings have been invented. Replace `googleReviews` in `src/site.mjs` with the owner's exact profile URL when available.

## Hosting

Upload the contents of `dist/` to any static host. All pages are pre-rendered HTML with unique titles, descriptions and shared LocalBusiness structured data. No client-side routing fallback is needed.

### Vercel

The `hannahcoaches` project in Hamza's projects is connected to `Nylon1/hannahcoaches`. Pushes to `main` deploy to production. `vercel.json` sets the build command to `npm run build`, the output directory to `dist`, and trailing slashes for directory routes. The site does not need environment variables; leave `BASE_PATH` unset for the Vercel domain. Local `.vercel/` settings and `.env` files must stay out of Git.

### GitHub Pages (alternative)

For GitHub Pages, a manual workflow is included in `.github/workflows/deploy.yml`:

1. In repository **Settings → Pages**, select **GitHub Actions** as the build source.
2. In **Actions → Deploy website → Run workflow**, run the workflow on the default branch.
3. The workflow builds with `BASE_PATH=/hannahcoaches/` and publishes the resulting static files. It is manual so saving source changes does not automatically publish the site.

For a custom-domain deployment at the domain root, leave `BASE_PATH` unset. No canonical URL or sitemap domain is fabricated because the production domain has not been chosen.

## Images & fonts

Images are locally hosted scenic photographs, not photographs of Hannah Coaches vehicles. The fleet uses seating illustrations rather than presenting stock vehicles as the actual fleet.

- `assets/lake-district.jpg`: Peter Wilkinson, [Lake District valley road on Unsplash](https://unsplash.com/photos/r9WdWXQg5hY).
- `assets/country-road.jpg`: [Lake District road on Unsplash](https://unsplash.com/photos/rcG2VqAKJdA).
- `assets/airport.jpg`: [Aeroplane wing, Unsplash photo](https://images.unsplash.com/photo-1436491865332-7a61a109cc05).
- `assets/golf.jpg`: [Golfer on a course, Unsplash photo](https://images.unsplash.com/photo-1535131749006-b7f58c99034b).
- `assets/football.jpg`: [Football stadium, Unsplash photo](https://images.unsplash.com/photo-1522778119026-d647f0596c20).
- `assets/wedding.jpg`: [Wedding couple with bouquet, Unsplash photo](https://images.unsplash.com/photo-1519741497674-611481863552).
- DM Sans is self-hosted from [Google Fonts](https://github.com/google/fonts/tree/main/ofl/dmsans) under the SIL Open Font License; see `assets/FONT-LICENSE.txt`.

The website makes no third-party font or image requests. Google Maps opens only when the visitor follows its link.

## Business content

Contact: M Latif, licensed transport manager. Telephone: 07971 117677. Email: safetravel77@outlook.com. Established 2010. Business claims and vehicle capacities follow the supplied brief; no licence numbers, fixed prices, vehicle equipment, office hours or postal address have been invented.
