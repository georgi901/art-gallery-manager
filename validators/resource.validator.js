const AppError = require('../utils/AppError');

function isIsoDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function validateResourceBody(resource, body, { partial = false } = {}) {
  const fields = {};
  const data = {};

  for (const [key, rawValue] of Object.entries(body || {})) {
    if (rawValue === null || rawValue === '') {
      data[key] = null;
      continue;
    }

    if (typeof rawValue === 'string') {
      data[key] = rawValue.trim();
    } else {
      data[key] = rawValue;
    }
  }

  if (resource === 'artists') {
    if (!partial || data.NUME !== undefined) {
      if (!data.NUME) fields.NUME = 'Name is required';
    }
    if (data.DATA_NASTERE && !isIsoDate(data.DATA_NASTERE)) fields.DATA_NASTERE = 'Use YYYY-MM-DD';
    if (data.DATA_DECES && !isIsoDate(data.DATA_DECES)) fields.DATA_DECES = 'Use YYYY-MM-DD';
    if (data.DATA_NASTERE && data.DATA_DECES && data.DATA_DECES < data.DATA_NASTERE) {
      fields.DATA_DECES = 'Death date cannot be before birth date';
    }
  }

  if (resource === 'artworks') {
    if (!partial || data.TITLU !== undefined) {
      if (!data.TITLU) fields.TITLU = 'Title is required';
    }
    ['AN_REALIZARE', 'ID_ARTIST', 'INALTIME_CM', 'LATIME_CM'].forEach((field) => {
      if (
        data[field] !== undefined &&
        (!Number.isFinite(Number(data[field])) || Number(data[field]) <= 0)
      ) {
        fields[field] = 'Must be a positive number';
      }
    });
  }

  if (resource === 'exhibitions') {
    if (!partial || data.NUME !== undefined) {
      if (!data.NUME) fields.NUME = 'Name is required';
    }
    if (!partial || data.DATA_START !== undefined) {
      if (!isIsoDate(data.DATA_START)) fields.DATA_START = 'Use YYYY-MM-DD';
    }
    if (data.DATA_SFARSIT && !isIsoDate(data.DATA_SFARSIT)) fields.DATA_SFARSIT = 'Use YYYY-MM-DD';
    if (data.DATA_START && data.DATA_SFARSIT && data.DATA_SFARSIT < data.DATA_START) {
      fields.DATA_SFARSIT = 'End date cannot be before start date';
    }
    if (data.TAXA_INTRARE !== undefined && Number(data.TAXA_INTRARE) < 0) {
      fields.TAXA_INTRARE = 'Cannot be negative';
    }
  }

  if (resource === 'locations') {
    if (!partial || data.NUME !== undefined) {
      if (!data.NUME) fields.NUME = 'Name is required';
    }
    ['SUPRAFATA_MP', 'CAPACITATE_MAXIMA'].forEach((field) => {
      if (data[field] !== undefined && Number(data[field]) <= 0) fields[field] = 'Must be positive';
    });
  }

  if (resource === 'sponsors') {
    if (!partial || data.NUME !== undefined) {
      if (!data.NUME) fields.NUME = 'Name is required';
    }
    if (data.EMAIL_CONTACT && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.EMAIL_CONTACT)) {
      fields.EMAIL_CONTACT = 'Must be a valid email';
    }
  }

  if (resource === 'galleries' || resource === 'awards') {
    if (!partial || data.NUME !== undefined) {
      if (!data.NUME) fields.NUME = 'Name is required';
    }
  }

  if (Object.keys(fields).length > 0) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Request validation failed', fields);
  }

  return data;
}

module.exports = {
  validateResourceBody,
};
