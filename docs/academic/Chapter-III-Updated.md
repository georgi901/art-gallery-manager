---
title: "Art Gallery Management System — Chapter III"
author: "Georgiana Valentina Spătaru — Group 263 CTI"
lang: en
geometry: margin=2.5cm
fontsize: 11pt
---

> **Documentation status:** This chapter is an updated English version of the
> original Chapter III template. It keeps the original requirements while
> documenting the current implementation.

# Chapter III — Web application

## Introduction

A full-stack web application was implemented to interact with the art gallery
database. The interface allows users to view and manage data, while the
Express server exposes a secured REST API.

## Technologies used

- Oracle Database XE;
- Node.js and Express;
- `oracledb` driver in Thin mode;
- HTML5, CSS3 and Vanilla JavaScript;
- JWT and bcrypt;
- Multer for file uploads;
- Jest and Supertest;
- Docker and Docker Compose;
- GitHub Actions and Dependabot.

## Application architecture

The browser communicates with the Express application through HTTP. The server
validates each request, checks authentication and authorization, and then
calls services that use the Oracle connection pool.

The API uses the `GET`, `POST`, `PUT` and `DELETE` methods. Responses are
standardized as JSON envelopes, and list endpoints support pagination.

## Authentication and roles

Users authenticate with either a username or an email address. The server
checks the password with bcrypt and issues a JWT. The frontend stores the token
in `sessionStorage` and sends it through the `Authorization` header.

Available roles:

- `VIEWER` — read-only access;
- `CURATOR` — create, update and upload artwork images;
- `ADMIN` — full CRUD and role administration.

## Listing, search and sorting

Each resource supports:

- paginated listing;
- debounced search;
- sorting by permitted columns;
- loading and empty states;
- explicit error messages.

Example:

```text
GET /api/artworks?page=1&limit=20&search=landscape&sortBy=TITLU&sortOrder=ASC
```

All request parameters are validated on the server. SQL values use bind
variables, while table and column identifiers are selected from allowlists.

## Updating and deleting records

Users with the `CURATOR` or `ADMIN` role can create and update records.
Deletion is restricted to administrators. Junction table operations use
composite keys.

The shared frontend API client:

- checks `response.ok`;
- interprets the JSON response envelope;
- handles HTTP errors by status class;
- removes the token when the session expires.

## Reports and dashboard

The dashboard displays totals for galleries, artists, artworks, exhibitions,
locations, sponsors and awards. The API can also return chart series.

The reports include:

1. exposed artworks filtered by entrance fee and exhibition year;
2. artists grouped by exposure count using `HAVING`;
3. additional reports for galleries, sponsors, awards and locations.

## CASCADE and RESTRICT

The demonstration page allows the user to select a record and preview its
dependent records before deletion. The backend returns the expected impact,
while Oracle applies the `ON DELETE CASCADE` or restrictive behavior defined
by the schema.

## Database views

The application uses two views:

- `VIEW_OPERE_ARTISTI`, for reading artworks together with artists;
- `VIEW_STATISTICI_GALERII_PICTURA`, for aggregated painting-gallery
  statistics.

View names and SQL definitions are controlled exclusively on the server. The
client cannot submit arbitrary SQL.

## Image uploads

Curators and administrators can upload artwork images. JPEG, PNG and WebP are
accepted. The file is checked through its MIME type and binary signature, and
the filename is generated as a UUID to prevent collisions and user-controlled
filenames.

## Testing and delivery

The application includes Jest and Supertest tests, ESLint and Prettier
checks, coverage reporting and a GitHub Actions workflow. Docker Compose can
start the application together with Oracle XE.

This implementation extends the initial requirements with authentication,
authorization, validation, automated testing, CI and containerized delivery.
