// Безопасно приводит значение к обрезанной строке ('' если это не строка)
module.exports = (value) => (typeof value === 'string' ? value.trim() : '');
