const { validateResourceBody } = require('../validators/resource.validator');
const { parsePagination } = require('../utils/pagination');
const { parseSort } = require('../utils/sort');
const { getResource } = require('../utils/resourceConfig');

describe('request validation helpers', () => {
  test('accepts a valid artist', () => {
    expect(
      validateResourceBody('artists', {
        NUME: '  Artist Demo ',
        DATA_NASTERE: '1990-01-01',
      })
    ).toEqual({
      NUME: 'Artist Demo',
      DATA_NASTERE: '1990-01-01',
    });
  });

  test('rejects an invalid exhibition date range', () => {
    expect(() =>
      validateResourceBody('exhibitions', {
        NUME: 'Expozitie',
        DATA_START: '2025-05-02',
        DATA_SFARSIT: '2025-05-01',
      })
    ).toThrow('Request validation failed');
  });

  test('parses pagination with safe defaults', () => {
    expect(parsePagination({})).toEqual({ page: 1, limit: 20, offset: 0 });
    expect(parsePagination({ page: '2', limit: '10' })).toEqual({
      page: 2,
      limit: 10,
      offset: 10,
    });
  });

  test('sort accepts only configured columns and directions', () => {
    const config = getResource('artists');
    expect(parseSort({ sort: 'NUME', order: 'DESC' }, config)).toEqual({
      sort: 'NUME',
      order: 'DESC',
    });
    expect(() => parseSort({ sort: 'DROP_TABLE' }, config)).toThrow('Invalid sort column');
  });
});
