# API reference

All endpoints below use the `/api` prefix. Except for `/api/health` and the
register/login endpoints, API requests require:

```http
Authorization: Bearer <jwt>
```

## Public endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | Create a `VIEWER` account |
| POST | `/api/auth/login` | Authenticate with username or email |

Login and registration return `{ data: { user, token }, message }`.

## Authentication and users

| Method | Endpoint | Role |
|---|---|---|
| GET | `/api/auth/me` | Authenticated user |
| POST | `/api/auth/logout` | Authenticated user |
| PUT | `/api/users/:id/role` | `ADMIN` |

## CRUD resources

The plural routes are canonical. Singular Romanian aliases are kept for the
original frontend:

| Resource | Canonical route | Alias |
|---|---|---|
| Galleries | `/api/galleries` | `/api/sediu` |
| Artists | `/api/artists` | `/api/artist` |
| Artworks | `/api/artworks` | `/api/opera` |
| Exhibitions | `/api/exhibitions` | `/api/expozitie` |
| Locations | `/api/locations` | `/api/locatie` |
| Sponsors | `/api/sponsors` | `/api/sponsor` |
| Awards | `/api/awards` | `/api/premiu` |

Each resource supports:

- `GET /api/{resource}` — paginated list;
- `GET /api/{resource}/:id` — read one record;
- `POST /api/{resource}` — `ADMIN` or `CURATOR`;
- `PUT /api/{resource}/:id` — `ADMIN` or `CURATOR`;
- `DELETE /api/{resource}/:id` — `ADMIN`.

List query parameters:

```text
page=1&limit=20&search=painting&sortBy=NUME&sortOrder=ASC
```

## Junction resources

| Resource | Endpoints |
|---|---|
| Sponsorships | `/api/sponsorships/:id1/:id2` |
| Exhibition artworks | `/api/exhibition-artworks/:id1/:id2` |
| Artwork awards | `/api/artwork-awards/:id1/:id2` |

Junction aliases are available under `/api/sponsorizare`,
`/api/expozitie_opera` and `/api/opera_premiu`.

## Reports and dashboard

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/stats` | Counters and chart series |
| GET | `/api/reports/exposed-artworks` | Exposed artworks with filters |
| GET | `/api/reports/artists-exposed` | Artists grouped by exposures |
| GET | `/api/reports/top-artists` | Artists ordered by exposures |
| GET | `/api/reports/galleries-by-exhibitions` | Galleries by exhibition count |
| GET | `/api/reports/sponsors-by-value` | Sponsors by sponsorship value |
| GET | `/api/reports/top-entry-fees` | Exhibitions by entrance fee |
| GET | `/api/reports/unexhibited-artworks` | Artworks without exhibitions |
| GET | `/api/reports/awarded-artists` | Artists with awarded artworks |
| GET | `/api/reports/locations-capacity` | Locations and capacities |

The two legacy report routes used by the original UI are also supported:
`/api/rapoarte/opere-expuse` and `/api/rapoarte/artisti-expusi`.

## Views, cascade and uploads

| Method | Endpoint | Role |
|---|---|---|
| GET | `/api/views` | List allowed views |
| GET | `/api/views/:viewName` | Read an allowed view |
| POST | `/api/views/create` | `ADMIN` |
| GET | `/api/cascade/check/:table/:id` | Preview relationship impact |
| POST | `/api/artworks/:id/image` | `ADMIN` or `CURATOR` |

Uploads use multipart field `image` and accept JPEG, PNG and WebP within the
configured `MAX_UPLOAD_MB` limit.
