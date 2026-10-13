const resources = {
  galleries: {
    table: 'SEDIU',
    primaryKey: 'ID_SEDIU',
    columns: [
      'NUME',
      'DIRECTOR_GENERAL',
      'ADRESA_SEDIU_ADM',
      'AN_INFIINTARE',
      'PROGRAM_STANDARD',
      'TIP_GALERIE',
      'WEBSITE',
    ],
    searchColumns: ['NUME', 'DIRECTOR_GENERAL', 'TIP_GALERIE'],
    aliases: ['sediu'],
  },
  artists: {
    table: 'ARTIST',
    primaryKey: 'ID_ARTIST',
    columns: ['NUME', 'DATA_NASTERE', 'DATA_DECES', 'NATIONALITATE', 'STILURI_ABORDATE'],
    searchColumns: ['NUME', 'NATIONALITATE', 'STILURI_ABORDATE'],
    aliases: ['artist'],
  },
  artworks: {
    table: 'OPERA',
    primaryKey: 'ID_OPERA',
    columns: [
      'TITLU',
      'AN_REALIZARE',
      'TEHNICA',
      'SUPORT',
      'INALTIME_CM',
      'LATIME_CM',
      'ID_ARTIST',
      'IMAGE_URL',
    ],
    searchColumns: ['TITLU', 'TEHNICA', 'SUPORT'],
    aliases: ['opera'],
  },
  exhibitions: {
    table: 'EXPOZITIE',
    primaryKey: 'ID_EXPOZITIE',
    columns: [
      'NUME',
      'TEMA',
      'TITLU',
      'DATA_START',
      'DATA_SFARSIT',
      'PUBLIC_TINTA',
      'TAXA_INTRARE',
      'ID_SEDIU',
      'ID_LOCATIE',
    ],
    searchColumns: ['NUME', 'TEMA', 'TITLU', 'PUBLIC_TINTA'],
    aliases: ['expozitie'],
  },
  locations: {
    table: 'LOCATIE',
    primaryKey: 'ID_LOCATIE',
    columns: [
      'NUME',
      'TIP_LOCATIE',
      'SUPRAFATA_MP',
      'TARA',
      'ADRESA',
      'TIP_SPATIU',
      'CAPACITATE_MAXIMA',
    ],
    searchColumns: ['NUME', 'TIP_LOCATIE', 'TARA', 'TIP_SPATIU'],
    aliases: ['locatie'],
  },
  sponsors: {
    table: 'SPONSOR',
    primaryKey: 'ID_SPONSOR',
    columns: [
      'NUME',
      'TIP_SPONSOR',
      'DOMENIU_ACTIVITATE',
      'TIP_SPONSORIZARE',
      'EMAIL_CONTACT',
      'TELEFON_CONTACT',
    ],
    searchColumns: ['NUME', 'DOMENIU_ACTIVITATE', 'TIP_SPONSOR'],
    aliases: ['sponsor'],
  },
  awards: {
    table: 'PREMIU',
    primaryKey: 'ID_PREMIU',
    columns: ['NUME', 'TIP_PREMIU', 'LOC_OBTINUT', 'CATEGORIE', 'CRITERIU_ACORDARE', 'EDITIE'],
    searchColumns: ['NUME', 'TIP_PREMIU', 'CATEGORIE'],
    aliases: ['premiu'],
  },
};

const junctions = {
  sponsorships: {
    table: 'SPONSORIZARE',
    primaryKeys: ['ID_SEDIU', 'ID_SPONSOR'],
    columns: ['ID_SEDIU', 'ID_SPONSOR', 'SUMA_SPONSORIZARE', 'DATA_CONTRACT'],
    aliases: ['sponsorizare'],
  },
  'exhibition-artworks': {
    table: 'EXPOZITIE_OPERA',
    primaryKeys: ['ID_EXPOZITIE', 'ID_OPERA'],
    columns: ['ID_EXPOZITIE', 'ID_OPERA', 'POZITIE_SALA'],
    aliases: ['expozitie_opera'],
  },
  'artwork-awards': {
    table: 'OPERA_PREMIU',
    primaryKeys: ['ID_OPERA', 'ID_PREMIU'],
    columns: ['ID_OPERA', 'ID_PREMIU', 'DATA_ACORDARE', 'EVENIMENT'],
    aliases: ['opera_premiu'],
  },
};

const resourceByRoute = Object.entries(resources).reduce((result, [route, config]) => {
  result[route] = config;
  config.aliases.forEach((alias) => {
    result[alias] = config;
  });
  return result;
}, {});

const junctionByRoute = Object.entries(junctions).reduce((result, [route, config]) => {
  result[route] = config;
  config.aliases.forEach((alias) => {
    result[alias] = config;
  });
  return result;
}, {});

function getResource(route) {
  return resourceByRoute[route];
}

function getJunction(route) {
  return junctionByRoute[route];
}

module.exports = {
  getJunction,
  getResource,
  junctions,
  resources,
};
