const NOMBRE_CACHE = 'comunica-v4';

const ARCHIVOS_A_GUARDAR = [
  './',
  'index.html',
  'css/estilos.css',
  'js/app.js',
  'manifest.json',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'pictogramas/yo.png',
  'pictogramas/vos.png',
  'pictogramas/mama.png',
  'pictogramas/papa.png',
  'pictogramas/querer.png',
  'pictogramas/ir.png',
  'pictogramas/comer.png',
  'pictogramas/jugar.png',
  'pictogramas/ayudar.png',
  'pictogramas/feliz.png',
  'pictogramas/triste.png',
  'pictogramas/cansado.png',
  'pictogramas/grande.png',
  'pictogramas/agua.png',
  'pictogramas/comida.png',
  'pictogramas/bano.png',
  'pictogramas/pelota.png',
  'pictogramas/que.png',
  'pictogramas/donde.png',
  'pictogramas/cuando.png',
  'pictogramas/hola.png',
  'pictogramas/gracias.png',
  'pictogramas/si.png',
  'pictogramas/no.png'
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
    caches.match(evento.request, { cacheName: NOMBRE_CACHE }).then((respuestaGuardada) => {
      return respuestaGuardada || fetch(evento.request);
    })
  );
});

// Se ejecuta cuando el service worker nuevo toma control.
// Borra cualquier copia guardada de versiones anteriores.
self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches.keys().then((nombresGuardados) => {
      return Promise.all(
        nombresGuardados
          .filter((nombre) => /^comunica-v\d+$/.test(nombre) && nombre !== NOMBRE_CACHE)
          .map((nombre) => caches.delete(nombre))
      );
    })
  );
});