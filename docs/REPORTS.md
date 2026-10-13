# Reports

The report endpoints are implemented in `services/report.service.js` and use
fixed SQL statements with bind variables. Results below are intentionally not
filled in until the Oracle demo schema has been configured and queried.

| Endpoint | Purpose | Main tables |
|---|---|---|
| `GET /api/reports/exposed-artworks` | Artworks exposed after the requested year and above the requested entrance fee | `OPERA`, `ARTIST`, `EXPOZITIE_OPERA`, `EXPOZITIE`, `SEDIU`, `LOCATIE` |
| `GET /api/reports/artists-exposed` | Artists with at least the requested number of exhibitions | `ARTIST`, `OPERA`, `EXPOZITIE_OPERA` |
| `GET /api/reports/top-artists` | Artists ordered by total exposures | `ARTIST`, `OPERA`, `EXPOZITIE_OPERA` |
| `GET /api/reports/galleries-by-exhibitions` | Galleries ordered by exhibition count | `SEDIU`, `EXPOZITIE` |
| `GET /api/reports/sponsors-by-value` | Sponsors ordered by total sponsorship value | `SPONSOR`, `SPONSORIZARE` |
| `GET /api/reports/top-entry-fees` | Exhibitions ordered by entrance fee | `EXPOZITIE` |
| `GET /api/reports/unexhibited-artworks` | Artworks without an exhibition relationship | `OPERA`, `EXPOZITIE_OPERA` |
| `GET /api/reports/awarded-artists` | Artists whose artworks received awards | `ARTIST`, `OPERA`, `OPERA_PREMIU` |
| `GET /api/reports/locations-capacity` | Locations with capacity and exhibition count | `LOCATIE`, `EXPOZITIE` |

Legacy frontend aliases:

- `/api/rapoarte/opere-expuse?taxaMin=0&anStart=2020`
- `/api/rapoarte/artisti-expusi?minExpuneri=2`

All paginated endpoints accept `page` and `limit`.

## Dashboard

`GET /api/dashboard/stats` returns total counters and chart series for
artworks by artist, exhibitions by year, sponsorships by gallery, artworks by
technique and exhibitions by location. Values will be recorded here only
after they have been obtained from a configured Oracle seed database.
