const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { getPool, isDatabaseConfigured } = require('./config/database');
const misionesRoutes = require('./routes/misiones.routes');
const estudiantesRoutes = require('./routes/estudiantes.routes');
const registroRoutes = require('./routes/registro.routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', async (req, res) => {
  if (!isDatabaseConfigured()) {
    return res.status(503).json({ ok: false, api: 'online', database: 'not_configured' });
  }
  try {
    const pool = await getPool();
    await pool.request().query('SELECT 1 AS connected;');
    return res.json({ ok: true, api: 'online', database: 'connected' });
  } catch (error) {
    return res.status(503).json({ ok: false, api: 'online', database: 'unavailable' });
  }
});

app.use('/api/misiones', misionesRoutes);
app.use('/api/estudiantes', estudiantesRoutes);
app.use('/api/registro', registroRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
