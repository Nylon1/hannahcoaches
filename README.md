# Hannah Coaches UK

A responsive seven-page website for Hannah Coaches UK, with a royal blue executive identity, accessible navigation and a client-side email enquiry builder.

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
6. About Us `/about/`
7. Contact & Enquiries `/contact/`

Edit copy and shared page structure in `src/site.mjs`, design in `src/styles.css` and browser interactions in `src/client.js`.

Visual components and the journey planner live in `src/experience.mjs`. The site includes an interactive trip gallery with keyboard-accessible tabs, a seat finder, airport selection, an accessibility discussion checklist, and an enquiry completion indicator. The floating planner carries selected travel details into the contact page. The seat finder is an illustrative starting point, not a guarantee of vehicle suitability or availability.

Scroll reveals use IntersectionObserver and run once per element. All ordinary content stays visible without JavaScript. The site honours `prefers-reduced-motion`, reveals keyboard-focused content, and provides a reading-progress bar and back-to-top control. No tracking is used. Only the trip companion uses persistent browser storage, when the visitor explicitly selects it.

## Group organiser trip companion

Open `/trips-events/#trip-tool`. This keeps the requested seven-page structure. Home, footer and quick-planner links also lead to it.

- Personalised checklists for airport, school, golf, football, wedding, weekend and other journeys, with additional tasks for accessibility, children, equipment and overnight stays.
- Confirmed passenger count, luggage count, capacity guidance, incomplete key arrangements, custom reminders with remove/undo, and checklist filters.
- Draft meeting and departure times calculated backwards from a target arrival, user-entered driving time, planned stops and buffer. Dates roll across midnight correctly. No live routing, traffic or flight data is implied.
- An exact penny-preserving split of a user-entered agreed group cost. No transport prices are generated.
- Optional save/restore on the current device, using `hannah-trip-companion-v1` in local storage. Saving is off by default. Switching it off removes the saved copy; blocked storage falls back to an in-tab plan. Stored fields are normalised and bounded before use. No passenger names or medical records are collected by the planner.
- Downloadable text pack, print/save-as-PDF layout, and a copyable group day plan. These actions do not send anything to passengers or to Hannah Coaches. The organiser chooses what to share.
- Transport enquiry prefill carrying destination, date, pickup, group size and practical requirements into the contact form. This still does not confirm a booking.

Template: `src/trip-tool.mjs`. Browser behaviour: `src/trip-tool.js`. Pure calculations: `src/trip-engine.js`. Styling: `src/trip-tool.css`. Tests cover midnight/month/leap-year boundaries, incomplete dates, penny-preserving costs, adaptive checklist progress and malformed saved data.

## Enquiries

The form validates required fields, prepares a plain-text enquiry and lets the visitor review it, open a prefilled email, or copy the text. It **does not send emails from a server** or confirm bookings. M Latif receives an enquiry only after the visitor sends it from their own email account. No form data is saved, tracked or posted to a server. Click-to-call and direct email links also work without JavaScript.

Fleet and service links prefill relevant enquiry fields. Accessible transport copy asks visitors to confirm their individual requirements and vehicle suitability before booking.

The Google link searches Maps for Hannah Coaches UK Ltd in Nelson, Lancashire. A unique verified Google Business Profile URL and review score were not available; no reviews, review counts or ratings have been invented. Replace `googleReviews` in `src/site.mjs` with the owner's exact profile URL when available.

## Hosting

Upload the contents of `dist/` to any static host. All pages are pre-rendered HTML with unique titles, descriptions and shared LocalBusiness structured data. No client-side routing fallback is needed.

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
