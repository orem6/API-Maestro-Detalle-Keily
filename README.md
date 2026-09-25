# API Maestro-Detalle con Catalogo y Control de Estado

Aplicacion compuesta por una API Node.js/Express y un dashboard HTML, CSS y JavaScript. Registra en una sola solicitud el maestro (estudiante) y su detalle de misiones, usando una base SQL Server existente.

## Arquitectura y tecnologias

- `backend/`: Node.js, Express, `mssql`, `dotenv`, `cors` y `helmet`.
- `frontend/`: HTML5, CSS3, JavaScript y Fetch API.
- SQL Server: tablas existentes `Estudiantes`, `Misiones` y `EstudianteMisiones`. La aplicacion no crea ni modifica el esquema ni el catalogo `Misiones`.

## Instalacion y ejecucion

1. En `backend`, ejecuta `npm install`.
2. Crea localmente `backend/.env` a partir de `backend/.env.example` y completa los valores con las variables de entorno autorizadas. Nunca copies credenciales en codigo, documentacion o control de versiones.
3. Inicia la API con `npm run dev` o `npm start`.
4. Publica o sirve `frontend/` de forma independiente. En desarrollo, la API esperada es `http://localhost:8080`.

`backend/.env` esta ignorado por Git. No debe agregarse forzadamente ni compartirse. Para hosting, configura las mismas variables en el panel seguro del proveedor y usa `PORT` proporcionado por el entorno.

## Endpoints

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | `/api/health` | Estado de la API y conectividad SQL. Sin configuracion SQL responde `database: not_configured`. |
| GET | `/api/misiones` | Catalogo de misiones de solo lectura. |
| GET | `/api/estudiantes` | Estudiantes con progreso calculado dinamicamente. |
| GET | `/api/estudiantes/:carnet` | Estudiante y todas las misiones; una mision sin detalle se presenta como pendiente. |
| POST | `/api/registro` | Upsert transaccional maestro-detalle. |

Ejemplo de cuerpo para `POST /api/registro` (use un correo real autorizado, no el marcador):

```json
{
  "maestro": {
    "carnet": "CARNET_AUTORIZADO",
    "nombre": "NOMBRE_AUTORIZADO",
    "correo": "CORREO_REAL_AUTORIZADO"
  },
  "detalle": [
    { "misionId": 1, "estado": true },
    { "misionId": 2, "estado": false }
  ]
}
```

Ejemplo `curl` local:

```bash
curl http://localhost:8080/api/health
curl http://localhost:8080/api/misiones
```

## Reglas de datos y seguridad

Todas las consultas que reciben valores usan parametros de `mssql`. El POST valida el cuerpo antes de abrir operaciones de escritura, valida todas las referencias a misiones dentro de una transaccion y hace rollback ante cualquier error. El carnet no se modifica; para un estudiante existente solo se actualizan nombre y correo. Cada detalle se inserta o actualiza por la combinacion carnet-mision.

No se exponen secretos en respuestas de error. En produccion no se devuelven trazas. Antes de cualquier POST contra la base compartida, verifica por `SELECT` la identidad y correo del estudiante autorizado y solicita aprobacion explicita.

## Pruebas

Desde `backend`, ejecuta `npm test`. Las pruebas incluidas validan JSON maestro-detalle y calculos de progreso sin conectarse a SQL Server. La conectividad, esquema y operaciones contra SQL Server requieren configuracion local y verificaciones separadas de solo lectura antes de cualquier POST autorizado.

## Despliegue

Despliega `backend/` en un hosting Node.js, configura sus variables de entorno de forma segura y permite el puerto indicado por `PORT`. Publica `frontend/` como sitio estatico y actualiza solamente `frontend/js/config.js` si la URL publica de la API cambia.
