---
title: "Art Gallery Management System"
author: "Georgiana Valentina Spătaru — Group 263 CTI"
lang: en
geometry: margin=2.5cm
fontsize: 11pt
---

> **Documentation status:** This document is an updated English version of the
> original project documentation. It preserves the original academic content
> while incorporating the current full-stack implementation, security model,
> testing strategy and deployment configuration.

# Chapter I — System analysis and data modeling

## Introduction

This project implements a management system for a network of art galleries.
Its purpose is to centralize information about gallery branches, artists,
artworks, exhibitions, locations, sponsors and awards, while also providing a
web interface for managing this data.

The system is not limited to a single gallery. A branch can organize multiple
exhibitions, collaborate with multiple sponsors and display artworks created by
different artists.

## Entities and relationships

The main entities are:

- `SEDIU` — galleries in the network;
- `ARTIST` — artwork creators;
- `OPERA` — artworks;
- `EXPOZITIE` — exhibitions organized by galleries;
- `LOCATIE` — physical exhibition locations;
- `SPONSOR` — companies or individuals providing support;
- `PREMIU` — artistic awards;
- `USERS` — application users.

Many-to-many relationships are modeled through:

- `SPONSORIZARE` between `SEDIU` and `SPONSOR`;
- `EXPOZITIE_OPERA` between `EXPOZITIE` and `OPERA`;
- `OPERA_PREMIU` between `OPERA` and `PREMIU`.

The updated relational diagram is available in `docs/ERD.md`.

## Integrity rules

The Oracle schema uses primary keys, foreign keys, `NOT NULL`, `UNIQUE` and
`CHECK` constraints.

Examples:

- an artwork must have a title and an artist;
- an exhibition must have a name and a start date;
- artwork dimensions must be positive;
- entrance fees cannot be negative;
- an exhibition end date, when present, cannot precede its start date;
- user usernames and email addresses are unique;
- accepted roles are `ADMIN`, `CURATOR` and `VIEWER`.

Generated identifiers start at 1000. Demo data uses explicit identifiers and
does not require separate ID ranges for different entity types.

# Chapter II — Database design and implementation

## Oracle Database

The database is implemented in Oracle Database and accessed from Node.js
through the `oracledb` driver in Thin mode. The database layer is organized as
follows:

- `db/schema.sql` — table definitions;
- `db/constraints.sql` — keys and integrity rules;
- `db/views.sql` — application views;
- `db/seed.sql` — demo data;
- `scripts/db-setup.js` — setup, seed and controlled reset operations.

The Oracle pool is not initialized when database variables are missing. This
allows the health endpoint and database-independent tests to run before Oracle
is configured.

## Delete propagation

Relationships using `ON DELETE CASCADE` are used for dependencies that can be
removed automatically:

- deleting an artist removes the associated artworks;
- deleting an artwork removes links from `EXPOZITIE_OPERA` and `OPERA_PREMIU`;
- deleting a gallery branch removes its sponsorship links;
- deleting a sponsor removes its sponsorship links;
- deleting an exhibition removes its artwork links.

No delete propagation is defined for `EXPOZITIE -> SEDIU` and
`EXPOZITIE -> LOCATIE`; existing references therefore restrict deletion of the
parent record.

The application also provides a read-only impact endpoint:
`GET /api/cascade/check/:table/:id`.

## Database views

`VIEW_OPERE_ARTISTI` combines artworks with artist information.
`VIEW_STATISTICI_GALERII_PICTURA` calculates the number of artworks, number of
artists, average artwork area and largest artwork for painting galleries.

Views can only be recreated from a server-side allowlist. The client cannot
submit arbitrary SQL. In the application, views are used for reading; data
modifications are performed through CRUD endpoints for the underlying tables.

## Reports

The application includes reports for:

- exposed artworks filtered by minimum entrance fee and exhibition year;
- artists with a minimum number of exposures using `GROUP BY` and `HAVING`;
- artists ordered by exposure count;
- galleries ordered by exhibition count;
- sponsors ordered by sponsorship value;
- artworks without exhibitions;
- artists whose artworks received awards;
- locations and their capacities.

Queries are defined server-side and use bind variables for request values.

# Chapter III — Web application

## Architecture

The application follows a client-server architecture:

1. the browser loads the static frontend;
2. the frontend sends HTTP requests to the Express API;
3. Node.js services execute operations against Oracle;
4. the API returns standardized JSON responses.

The main technologies are Node.js, Express, OracleDB, HTML, CSS and Vanilla
JavaScript. The application can run locally or through Docker Compose.

## REST API and response contract

Successful responses use the following structure:

```json
{
  "data": {},
  "message": "Operation completed successfully"
}
```

Paginated lists additionally include:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

Errors use explicit codes and messages:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request",
    "fields": {}
  }
}
```

## Authentication and authorization

Authentication uses JWT, while passwords are hashed with bcrypt. Users can
authenticate with either their username or email address.

Roles:

- `VIEWER` — read-only access;
- `CURATOR` — create, update and upload artwork images;
- `ADMIN` — all CRUD operations and role management.

All API routes except the health check and authentication endpoints require a
Bearer token. Roles are checked by authorization middleware.

## CRUD, search and pagination

The interface provides CRUD operations for the main entities and operations
for junction tables. Lists support:

```text
page=1&limit=20&search=painting&sortBy=NUME&sortOrder=ASC
```

Resource names, column names and sort directions are validated through
server-side allowlists. User-provided values are passed through bind
variables.

## Image uploads

Artwork images are uploaded through:

```text
POST /api/artworks/:id/image
```

The upload uses the multipart field `image` and accepts JPEG, PNG and WebP.
The application verifies both the MIME type and binary file signature, limits
file size and generates UUID-based filenames. Only the image URL is stored in
the database.

## Security

The implementation includes:

- Helmet and Content Security Policy;
- configurable CORS;
- rate limiting for authentication;
- JWT and bcrypt;
- server-side validation;
- bind variables;
- allowlists for SQL identifiers;
- centralized error handling;
- role-based route protection;
- validation of the actual image file content.

# Chapter IV — Testing and delivery

## Automated testing

The project uses Jest and Supertest for:

- application smoke tests;
- protected API route checks;
- authentication helpers;
- request validation;
- frontend utility functions;
- Oracle pool tests when database variables are available.

Validation commands:

```bash
npm run format:check
npm run lint
npm test
npm run test:coverage
```

Oracle integration tests are skipped automatically when the database is not
configured.

## Docker and CI/CD

The `Dockerfile` builds the Node.js application image. `docker-compose.yml`
starts the application and Oracle XE, with persistent volumes for database
data and uploaded images.

The GitHub Actions workflow runs:

- reproducible installation through `npm ci`;
- formatting checks;
- ESLint;
- Jest tests and coverage.

Dependabot is configured to update npm dependencies and GitHub Actions.

# Conclusions

The project has evolved from a static interface into a full-stack application
with an Oracle database, REST API, authentication, authorization, image
uploads, reports, automated tests and containerized delivery.

Complete Oracle behavior must be verified against a configured Oracle
instance. Dashboard and report values must not be invented before the seed
data and integration tests have been executed.
