# Database views

The API exposes only two predefined views. Clients cannot submit arbitrary SQL.

| View | Type | Definition |
|---|---|---|
| `VIEW_OPERE_ARTISTI` | Joined view | Combines `OPERA` and `ARTIST` |
| `VIEW_STATISTICI_GALERII_PICTURA` | Aggregate view | Uses gallery, exhibition, artwork and artist joins with `GROUP BY`, `HAVING`, `COUNT`, `AVG` and `MAX` |

Endpoints:

- `GET /api/views`
- `GET /api/views/:viewName?page=1&limit=20`
- `POST /api/views/create`

LMD behavior for the joined view must be verified against the configured test
schema before being documented as permitted or rejected.
