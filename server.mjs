// API REST de Whatapop: json-server 0.17.4 como módulo en lugar de su CLI.
//
// La CLI activa CORS para cualquier origen (responde con el Origin recibido y con
// Access-Control-Allow-Credentials: true), así que cualquier web abierta en el navegador podía
// leer y modificar db.json a través de localhost. Aquí solo se permite el origen de `ng serve`.
//
//   node server.mjs [fichero]   (por defecto, db.json)
import jsonServer from 'json-server';

const PUERTO = 5000;
const ORIGEN_PERMITIDO = 'http://localhost:4200';
const fichero = process.argv[2] ?? 'db.json';

const app = jsonServer.create();

// Nombres con los que se puede llegar a la API. Comprobar Host frena el DNS rebinding: una web
// cuyo dominio pasa a resolver a 127.0.0.1 deja de ser de otro origen para el navegador y podría
// leer y escribir db.json sin pasar por CORS.
const HOSTS_PERMITIDOS = new Set([`localhost:${PUERTO}`, `127.0.0.1:${PUERTO}`]);
const METODOS_SEGUROS = new Set(['GET', 'HEAD', 'OPTIONS']);

app.use((req, res, next) => {
  if (!HOSTS_PERMITIDOS.has(req.headers.host ?? '')) {
    res.statusCode = 403;
    res.end('Host no permitido');
    return;
  }
  // CORS solo impide leer la respuesta: un formulario de otra web (POST urlencoded, sin
  // preflight) llegaba igualmente al router y creaba o cambiaba registros de db.json (CSRF).
  // Las escrituras con un Origin distinto del de `ng serve` se rechazan antes de tocar nada.
  const origen = req.headers.origin;
  if (origen && origen !== ORIGEN_PERMITIDO && !METODOS_SEGUROS.has(req.method)) {
    res.statusCode = 403;
    res.end('Origen no permitido');
    return;
  }
  res.setHeader('Vary', 'Origin');
  if (req.headers.origin === ORIGEN_PERMITIDO) {
    res.setHeader('Access-Control-Allow-Origin', ORIGEN_PERMITIDO);
    // Preflight de las compras y los resets (PATCH con JSON).
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.statusCode = 204;
      res.end();
      return;
    }
  }
  next();
});
// Los mismos middlewares que monta la CLI (compresión, ficheros de public/, log y cabeceras
// sin caché), salvo el de CORS. El router añade body-parser y guarda los cambios en el fichero.
app.use(jsonServer.defaults({ noCors: true }));
app.use(jsonServer.router(fichero));

app.listen(PUERTO, 'localhost', () => {
  console.log(
    `API en http://localhost:${PUERTO} con ${fichero} (CORS solo para ${ORIGEN_PERMITIDO})`,
  );
});
