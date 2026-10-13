# Entity relationship diagram

> The original academic diagrams are available in the repository and are
> embedded in the README. They are preserved as historical project
> documentation; this Mermaid diagram reflects the current schema, including
> authentication users and artwork image URLs.

```mermaid
erDiagram
    ARTIST ||--o{ OPERA : creates
    SEDIU ||--o{ EXPOZITIE : hosts
    LOCATIE ||--o{ EXPOZITIE : contains
    EXPOZITIE ||--o{ EXPOZITIE_OPERA : includes
    OPERA ||--o{ EXPOZITIE_OPERA : displayed_in
    SEDIU ||--o{ SPONSORIZARE : receives
    SPONSOR ||--o{ SPONSORIZARE : funds
    OPERA ||--o{ OPERA_PREMIU : receives
    PREMIU ||--o{ OPERA_PREMIU : recognizes

    ARTIST {
        NUMBER ID_ARTIST PK
        VARCHAR2 NUME
        DATE DATA_NASTERE
        DATE DATA_DECES
        VARCHAR2 NATIONALITATE
        VARCHAR2 STILURI_ABORDATE
    }
    OPERA {
        NUMBER ID_OPERA PK
        VARCHAR2 TITLU
        NUMBER AN_REALIZARE
        VARCHAR2 TEHNICA
        VARCHAR2 SUPORT
        NUMBER INALTIME_CM
        NUMBER LATIME_CM
        NUMBER ID_ARTIST FK
        VARCHAR2 IMAGE_URL
    }
    SEDIU {
        NUMBER ID_SEDIU PK
        VARCHAR2 NUME
        VARCHAR2 TIP_GALERIE
        VARCHAR2 WEBSITE
    }
    EXPOZITIE {
        NUMBER ID_EXPOZITIE PK
        VARCHAR2 NUME
        DATE DATA_START
        DATE DATA_SFARSIT
        NUMBER TAXA_INTRARE
        NUMBER ID_SEDIU FK
        NUMBER ID_LOCATIE FK
    }
    LOCATIE {
        NUMBER ID_LOCATIE PK
        VARCHAR2 NUME
        NUMBER SUPRAFATA_MP
        NUMBER CAPACITATE_MAXIMA
    }
    SPONSOR {
        NUMBER ID_SPONSOR PK
        VARCHAR2 NUME
        VARCHAR2 EMAIL_CONTACT
    }
    PREMIU {
        NUMBER ID_PREMIU PK
        VARCHAR2 NUME
        NUMBER EDITIE
    }
    SPONSORIZARE {
        NUMBER ID_SEDIU PK, FK
        NUMBER ID_SPONSOR PK, FK
        NUMBER SUMA_SPONSORIZARE
        DATE DATA_CONTRACT
    }
    EXPOZITIE_OPERA {
        NUMBER ID_EXPOZITIE PK, FK
        NUMBER ID_OPERA PK, FK
        VARCHAR2 POZITIE_SALA
    }
    OPERA_PREMIU {
        NUMBER ID_OPERA PK, FK
        NUMBER ID_PREMIU PK, FK
        DATE DATA_ACORDARE
        VARCHAR2 EVENIMENT
    }
    USERS {
        NUMBER ID_USER PK
        VARCHAR2 USERNAME UK
        VARCHAR2 EMAIL UK
        VARCHAR2 PASSWORD_HASH
        VARCHAR2 ROLE
        TIMESTAMP CREATED_AT
    }
```

`OPERA -> ARTIST`, sponsorship links and exhibition links use `ON DELETE
CASCADE`. Exhibition references to `SEDIU` and `LOCATIE` are restrictive.
