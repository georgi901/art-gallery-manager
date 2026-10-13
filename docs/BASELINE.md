# Frontend baseline

This document records the API contract implied by the existing static frontend.
The files under `public/` were not modified during the baseline inventory.

## API endpoints currently called

| Method | URL | Purpose | Request data | Expected response |
|---|---|---|---|---|
| GET | `/api/stats/dashboard` | Dashboard counters | None | Object with `sediu`, `artist`, `opera`, `expozitie`, `locatie`, `sponsor`, `premiu` counts |
| GET | `/api/expozitie?sortBy=DATA_START&sortOrder=DESC` | Recent exhibitions | Query parameters | Array of exhibition rows |
| GET | `/api/{table}` | List a configured entity | Optional `sortBy`, `sortOrder` | Array of rows |
| GET | `/api/{table}/{id}` | Load one record for editing | Path ID | One record object |
| POST | `/api/{table}` | Create a record | JSON object containing form fields | Object containing `message` or `error` |
| PUT | `/api/{table}/{id}` | Update a record | JSON object containing changed form fields | Object containing `message` or `error` |
| DELETE | `/api/{table}/{id}` | Delete a main-table record | Path ID | Object containing `message` or `error` |
| DELETE | `/api/{junction}/{id1}/{id2}` | Delete a junction-table record | Composite-key path values | Object containing `message` or `error` |
| GET | `/api/rapoarte/opere-expuse?taxaMin={number}&anStart={year}` | Multi-table artwork report | Query filters | Array of report rows |
| GET | `/api/rapoarte/artisti-expusi?minExpuneri={number}` | Grouped artist report | Query filter | Array of report rows |
| GET | `/api/{table}` | Load cascade record options | Table selected in the UI | Array of rows |
| GET | `/api/cascade/check/{table}/{id}` | Preview cascade/restrict effects | Table and record ID | Object with `affectedRecords` |
| DELETE | `/api/{table}/{id}` | Execute cascade deletion | Path table and ID | Object containing `message` or `error` |
| POST | `/api/views/create` | Create the predefined SQL views | None | Object containing `message` or `error` |
| GET | `/api/views/{viewName}` | Read a predefined view | View name | Array of view rows or an `error` object |

The `{table}` value is generated from these frontend table names:

```text
SEDIU, ARTIST, OPERA, EXPOZITIE, LOCATIE, SPONSOR, PREMIU,
SPONSORIZARE, EXPOZITIE_OPERA, OPERA_PREMIU
```

The current frontend lowercases the table name when constructing URLs. The
backend will later provide the documented plural English routes and temporary
compatibility aliases for these existing URLs.

## Entities and columns inferred from the UI

### Main entities

| Table | Columns used by the frontend |
|---|---|
| `SEDIU` | `ID_SEDIU`, `NUME`, `DIRECTOR_GENERAL`, `ADRESA_SEDIU_ADM`, `AN_INFIINTARE`, `PROGRAM_STANDARD`, `TIP_GALERIE`, `WEBSITE` |
| `ARTIST` | `ID_ARTIST`, `NUME`, `DATA_NASTERE`, `DATA_DECES`, `NATIONALITATE`, `STILURI_ABORDATE` |
| `OPERA` | `ID_OPERA`, `TITLU`, `AN_REALIZARE`, `TEHNICA`, `SUPORT`, `INALTIME_CM`, `LATIME_CM`, `ID_ARTIST` |
| `EXPOZITIE` | `ID_EXPOZITIE`, `NUME`, `TEMA`, `TITLU`, `DATA_START`, `DATA_SFARSIT`, `PUBLIC_TINTA`, `TAXA_INTRARE`, `ID_SEDIU`, `ID_LOCATIE` |
| `LOCATIE` | `ID_LOCATIE`, `NUME`, `TIP_LOCATIE`, `SUPRAFATA_MP`, `TARA`, `ADRESA`, `TIP_SPATIU`, `CAPACITATE_MAXIMA` |
| `SPONSOR` | `ID_SPONSOR`, `NUME`, `TIP_SPONSOR`, `DOMENIU_ACTIVITATE`, `TIP_SPONSORIZARE`, `EMAIL_CONTACT`, `TELEFON_CONTACT` |
| `PREMIU` | `ID_PREMIU`, `NUME`, `TIP_PREMIU`, `LOC_OBTINUT`, `CATEGORIE`, `CRITERIU_ACORDARE`, `EDITIE` |

### Junction entities

| Table | Composite key | Additional columns |
|---|---|---|
| `SPONSORIZARE` | `ID_SEDIU`, `ID_SPONSOR` | `SUMA_SPONSORIZARE`, `DATA_CONTRACT` |
| `EXPOZITIE_OPERA` | `ID_EXPOZITIE`, `ID_OPERA` | `POZITIE_SALA` |
| `OPERA_PREMIU` | `ID_OPERA`, `ID_PREMIU` | `DATA_ACORDARE`, `EVENIMENT` |

## Existing frontend functionality

- Dashboard counters and a recent-exhibitions table.
- Generic table pages for all main and junction entities.
- Add and edit forms generated from the configured columns.
- Delete actions for main entities and junction rows.
- Client-side sorting controls.
- Two filtered reports:
  - exposed artworks filtered by minimum entrance fee and starting year;
  - artists grouped by exhibition count with a minimum threshold.
- A cascade preview and cascade deletion flow.
- Creation and display of two predefined database views.
- Responsive layout, loading states, empty states, modal dialogs and toast notifications.

## Problems to address in later stages

- There is no backend, `package.json`, database schema or API implementation in the current project.
- Fetch calls do not consistently check `response.ok` before parsing JSON.
- The frontend expects inconsistent, legacy-style singular/table-name routes.
- API responses are expected as raw arrays or ad-hoc `{ error }`/`{ message }` objects rather than one consistent envelope.
- Dynamic API values are inserted through `innerHTML`, creating an XSS risk.
- Forms are generated without field-level validation or server-side validation support.
- Foreign-key fields are rendered as numeric inputs instead of relationship-aware selects.
- There is no pagination, search, debounce, URL-persisted filtering or server-side filtering.
- Sort columns are sent to the server without a frontend-visible whitelist contract.
- Error handling is mostly toast-based and does not distinguish HTTP status classes.
- There is no authentication, authorization, rate limiting, image upload, automated test suite, CI or deployment configuration.
- The current cascade UI assumes a scalar primary key even though junction tables use composite keys.
- The current view-create action must be replaced by a server-side whitelist; the client must never submit arbitrary SQL.
