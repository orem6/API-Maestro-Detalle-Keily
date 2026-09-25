const test = require('node:test');
const assert = require('node:assert/strict');
const { withProgress } = require('../src/services/estudiantes.service');

test('calculates dynamic mission progress', () => {
  assert.deepEqual(withProgress({ total: 5, completadas: 3 }), { misiones: 5, total: 5, completadas: 3, pendientes: 2, porcentaje: 60 });
});

test('returns zero percentage when catalog is empty', () => {
  assert.deepEqual(withProgress({ total: 0, completadas: 0 }), { misiones: 0, total: 0, completadas: 0, pendientes: 0, porcentaje: 0 });
});
