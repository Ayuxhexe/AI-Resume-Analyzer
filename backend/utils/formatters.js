const normalizeWhitespace = (value = '') =>
  value
    .replace(/\r/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const normalizeStringList = (items = []) =>
  [...new Set((items || []).map((item) => String(item || '').trim()).filter(Boolean))];

module.exports = {
  normalizeStringList,
  normalizeWhitespace,
};
