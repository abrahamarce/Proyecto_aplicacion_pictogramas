const NOMBRE_CACHE = 'comunica-v1';

const ARCHIVOS_A_GUARDAR = [
  'index.html',
  'css/estilos.css',
  'js/app.js',
  'manifest.json'
];

// Se ejecuta una sola vez, cuando el service worker se instala por primera vez.
// Guarda una copia de los archivos esenciales.
self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches.open(NOMBRE_CACHE).then((cache) => {
      return cache.addAll(ARCHIVOS_A_GUARDAR);
    })
  );
});

// Se ejecuta en cada pedido que hace la página (cargar el CSS, el JS, etc.)
// Si existe una copia guardada, la usa. Si no, va a buscarlo a internet.
self.addEventListener('fetch', (evento) => {
  evento.respondWith(
    caches.match(evento.request).then((respuestaGuardada) => {
      return respuestaGuardada || fetch(evento.request);
    })
  );
});