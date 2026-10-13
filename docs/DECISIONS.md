# Architecture decisions

- Use Oracle Thin mode through the `oracledb` package; Oracle Instant Client is not required.
- Use `DB_CONNECT_STRING` as one Oracle connection-string variable instead of separate host, port and SID variables.
- Use the MIT license unless a different license is requested.
- Use identity columns starting at 1000 so the fictional seed IDs 1-20 cannot collide with later generated records.
- Keep the existing frontend view names `VIEW_OPERE_ARTISTI` and `VIEW_STATISTICI_GALERII_PICTURA` for compatibility.
- Do not initialize the database pool when database environment variables are absent; this keeps health and frontend smoke tests runnable before Oracle is configured.
- Keep report, view and cascade SQL server-side; clients may select only fixed report and view names, never submit SQL.
- Protect all API routes except health and authentication endpoints; enforce write permissions with ADMIN, CURATOR and VIEWER roles.
- Store uploaded artwork images under generated UUID filenames and persist only the `/uploads/...` URL in Oracle.
- Keep role administration at `PUT /api/users/:id/role`; authentication actions remain under `/api/auth`.
