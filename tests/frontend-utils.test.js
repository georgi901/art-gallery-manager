const fs = require('node:fs');
const { URLSearchParams } = require('node:url');
const vm = require('node:vm');
const path = require('node:path');

function loadUtils() {
  const source = fs.readFileSync(path.join(__dirname, '..', 'public/js/utils.js'), 'utf8');
  const context = { URLSearchParams, window: {} };
  vm.runInNewContext(source, context);
  return context.window.galleryUtils;
}

describe('frontend utilities', () => {
  const utils = loadUtils();

  test('formats dates and null values for the Romanian interface', () => {
    expect(utils.formatDate(null)).toBe('-');
    expect(utils.formatCell(null, 'NUME')).toBe('-');
    expect(utils.formatCell(125, 'TAXA_INTRARE')).toContain('RON');
  });

  test('builds query strings without empty values', () => {
    expect(utils.queryString({ page: 2, search: '', limit: 20 })).toBe('?page=2&limit=20');
  });
});
