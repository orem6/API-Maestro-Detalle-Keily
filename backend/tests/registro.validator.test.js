const test = require('node:test');
const assert = require('node:assert/strict');
const { validateRegistro } = require('../src/validators/registro.validator');

const valid = {
  maestro: { carnet: 'CARNET-PRUEBA', nombre: 'Estudiante de Prueba', correo: 'estudiante@example.test' },
  detalle: [{ misionId: 1, estado: true }]
};

test('accepts a valid maestro-detalle payload', () => {
  assert.deepEqual(validateRegistro(valid), valid);
});

for (const [name, payload] of [
  ['empty carnet', { ...valid, maestro: { ...valid.maestro, carnet: '' } }],
  ['invalid email', { ...valid, maestro: { ...valid.maestro, correo: 'invalid-email' } }],
  ['empty detail', { ...valid, detalle: [] }],
  ['duplicate mission', { ...valid, detalle: [{ misionId: 1, estado: true }, { misionId: 1, estado: false }] }],
  ['string state', { ...valid, detalle: [{ misionId: 1, estado: 'true' }] }],
  ['numeric state', { ...valid, detalle: [{ misionId: 1, estado: 1 }] }],
  ['null state', { ...valid, detalle: [{ misionId: 1, estado: null }] }]
]) {
  test(`rejects ${name}`, () => assert.throws(() => validateRegistro(payload), { status: 400 }));
}
