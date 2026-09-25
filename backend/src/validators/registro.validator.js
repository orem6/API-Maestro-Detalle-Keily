const { AppError } = require('../middleware/errorHandler');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const carnetPattern = /^[A-Za-z0-9-]{3,25}$/;

function validationError(mensaje) {
  throw new AppError(400, 'SOLICITUD_INVALIDA', mensaje);
}

function validateRegistro(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    validationError('El cuerpo de la solicitud debe ser un objeto JSON.');
  }

  const { maestro, detalle } = body;
  if (!maestro || typeof maestro !== 'object' || Array.isArray(maestro)) validationError('El maestro es obligatorio.');

  const carnet = typeof maestro.carnet === 'string' ? maestro.carnet.trim() : '';
  const nombre = typeof maestro.nombre === 'string' ? maestro.nombre.trim() : '';
  const correo = typeof maestro.correo === 'string' ? maestro.correo.trim() : '';

  if (!carnet || !carnetPattern.test(carnet)) validationError('El carnet es obligatorio y debe tener un formato valido.');
  if (!nombre || nombre.length > 150) validationError('El nombre es obligatorio y no puede exceder 150 caracteres.');
  if (!correo || correo.length > 150 || !emailPattern.test(correo)) validationError('El correo es obligatorio y debe tener un formato valido.');
  if (!Array.isArray(detalle) || detalle.length === 0) validationError('El detalle debe ser un arreglo no vacio.');

  const missionIds = new Set();
  const normalizedDetail = detalle.map((item, index) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) validationError(`El detalle en la posicion ${index} no es valido.`);
    if (!Number.isInteger(item.misionId) || item.misionId <= 0) validationError(`misionId en la posicion ${index} debe ser un entero positivo.`);
    if (typeof item.estado !== 'boolean') validationError(`estado en la posicion ${index} debe ser booleano.`);
    if (missionIds.has(item.misionId)) validationError(`misionId ${item.misionId} esta repetido en el detalle.`);
    missionIds.add(item.misionId);
    return { misionId: item.misionId, estado: item.estado };
  });

  return { maestro: { carnet, nombre, correo }, detalle: normalizedDetail };
}

module.exports = { validateRegistro };
