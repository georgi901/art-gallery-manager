# Cascade behavior

`GET /api/cascade/check/:table/:id` is read-only. It counts dependent rows and
labels each relationship as `CASCADE` or `RESTRICT`.

| Parent | Dependent table | Rule |
|---|---|---|
| `SEDIU` | `SPONSORIZARE` | CASCADE |
| `SEDIU` | `EXPOZITIE` | RESTRICT |
| `ARTIST` | `OPERA` | CASCADE |
| `OPERA` | `EXPOZITIE_OPERA` | CASCADE |
| `OPERA` | `OPERA_PREMIU` | CASCADE |
| `EXPOZITIE` | `EXPOZITIE_OPERA` | CASCADE |
| `LOCATIE` | `EXPOZITIE` | RESTRICT |
| `SPONSOR` | `SPONSORIZARE` | CASCADE |
| `PREMIU` | `OPERA_PREMIU` | CASCADE |

The counts and deletion outcomes will be added after the Oracle integration
tests have been run against the test schema.
