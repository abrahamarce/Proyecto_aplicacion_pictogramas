/* =========================================================
   DATOS: cada pictograma es un objeto reutilizable también
   desde el backend a futuro. audioUrl queda en null hasta
   que el equipo de voces grabadas entregue los archivos;
   mientras tanto se usa speechSynthesis como respaldo.
   ========================================================= */

// Lista de categorías gramaticales: cada una define su color de fondo/texto (clave Fitzgerald)
const CATEGORIAS = [
  { id: 'personas',    nombre: 'Personas',   color: 'var(--cat-personas)',    colorInk: 'var(--cat-personas-ink)' },
  { id: 'acciones',    nombre: 'Acciones',   color: 'var(--cat-acciones)',    colorInk: 'var(--cat-acciones-ink)' },
  { id: 'descripcion', nombre: 'Descripción',color: 'var(--cat-descripcion)', colorInk: 'var(--cat-descripcion-ink)' },
  { id: 'objetos',     nombre: 'Objetos',    color: 'var(--cat-objetos)',     colorInk: 'var(--cat-objetos-ink)' },
  { id: 'preguntas',   nombre: 'Preguntas',  color: 'var(--cat-preguntas)',   colorInk: 'var(--cat-preguntas-ink)' },
  { id: 'social',      nombre: 'Social',     color: 'var(--cat-social)',      colorInk: 'var(--cat-social-ink)' },
];

// Banco de pictogramas: palabra, categoría a la que pertenece, emoji que se muestra
// y audioUrl (grabación real, hoy en null → se usa síntesis de voz como respaldo)
const PICTOGRAMAS = [
  { id:'p001', palabra:'yo', categoria:'personas', imagen:'pictogramas/yo.png', emoji:'🙋', audioUrl:null, persona:'yo' },
  { id:'p002', palabra:'vos', categoria:'personas', imagen:'pictogramas/vos.png', emoji:'👉', audioUrl:null, persona:'vos' },
  { id:'p003', palabra:'mamá', categoria:'personas', imagen:'pictogramas/mama.png', emoji:'👩', audioUrl:null, persona:'el' },
  { id:'p004', palabra:'papá', categoria:'personas', imagen:'pictogramas/papa.png', emoji:'👨', audioUrl:null, persona:'el' },

  { id:'p010', palabra:'querer', categoria:'acciones', imagen:'pictogramas/querer.png', emoji:'🤲', audioUrl:null,
  conjugaciones: { yo:'quiero', vos:'querés', el:'quiere', nosotros:'queremos', ellos:'quieren' } },
  { id:'p011', palabra:'ir', categoria:'acciones', imagen:'pictogramas/ir.png', emoji:'🚶', audioUrl:null,
  conjugaciones: { yo:'voy', vos:'vas', el:'va', nosotros:'vamos', ellos:'van' } },
  { id:'p012', palabra:'comer', categoria:'acciones', imagen:'pictogramas/comer.png', emoji:'🍽️', audioUrl:null,
  conjugaciones: { yo:'como', vos:'comés', el:'come', nosotros:'comemos', ellos:'comen' } },
  { id:'p013', palabra:'jugar', categoria:'acciones', imagen:'pictogramas/jugar.png', emoji:'🎲', audioUrl:null,
  conjugaciones: { yo:'juego', vos:'jugás', el:'juega', nosotros:'jugamos', ellos:'juegan' } },
  { id:'p014', palabra:'ayudar', categoria:'acciones', imagen:'pictogramas/ayudar.png', emoji:'🤝', audioUrl:null,
  conjugaciones: { yo:'ayudo', vos:'ayudás', el:'ayuda', nosotros:'ayudamos', ellos:'ayudan' } },

  { id:'p020', palabra:'feliz',     categoria:'descripcion', imagen:'pictogramas/feliz.png',     emoji:'😊', audioUrl:null },
  { id:'p021', palabra:'triste',    categoria:'descripcion', imagen:'pictogramas/triste.png',     emoji:'😢', audioUrl:null },
  { id:'p022', palabra:'cansado',   categoria:'descripcion', imagen:'pictogramas/cansado.png',     emoji:'😴', audioUrl:null },
  { id:'p023', palabra:'grande',    categoria:'descripcion', imagen:'pictogramas/grande.png',     emoji:'📏', audioUrl:null },

  { id:'p030', palabra:'agua',      categoria:'objetos',   imagen:'pictogramas/agua.png',     emoji:'💧', audioUrl:null },
  { id:'p031', palabra:'comida',    categoria:'objetos',   imagen:'pictogramas/comida.png',     emoji:'🍞', audioUrl:null },
  { id:'p032', palabra:'baño',      categoria:'objetos',   imagen:'pictogramas/bano.png',     emoji:'🚻', audioUrl:null },
  { id:'p033', palabra:'pelota',    categoria:'objetos',   imagen:'pictogramas/pelota.png',     emoji:'⚽', audioUrl:null },

  { id:'p040', palabra:'qué',       categoria:'preguntas',   imagen:'pictogramas/que.png',     emoji:'❓', audioUrl:null },
  { id:'p041', palabra:'dónde',     categoria:'preguntas',   imagen:'pictogramas/donde.png',     emoji:'📍', audioUrl:null },
  { id:'p042', palabra:'cuándo',    categoria:'preguntas',   imagen:'pictogramas/cuando.png',     emoji:'⏰', audioUrl:null },

  { id:'p050', palabra:'hola',      categoria:'social',      imagen:'pictogramas/hola.png',     emoji:'👋', audioUrl:null },
  { id:'p051', palabra:'gracias',   categoria:'social',      imagen:'pictogramas/gracias.png',     emoji:'🙏', audioUrl:null },
  { id:'p052', palabra:'sí',        categoria:'social',      imagen:'pictogramas/si.png',     emoji:'✅', audioUrl:null },
  { id:'p053', palabra:'no',        categoria:'social',      imagen:'pictogramas/no.png',     emoji:'🚫', audioUrl:null },
];

const NOMBRE_BD_PICTOGRAMAS = 'comunica-pictogramas';
const VERSION_BD_PICTOGRAMAS = 1;
const MAX_BYTES_IMAGEN = 10 * 1024 * 1024;
const MAX_LADO_IMAGEN = 512;

let baseDatosPictogramasPromise;
let pictogramasPersonalizados = [];

const urlsImagenesPersonalizadas = new Map();

function abrirBaseDatosPictogramas(){
  if (!('indexedDB' in window)) return Promise.reject(new Error('Este navegador no permite guardar pictogramas en el dispositivo.'));

  if (!baseDatosPictogramasPromise){
    baseDatosPictogramasPromise = new Promise((resolve, reject) => {
      const solicitud = indexedDB.open(NOMBRE_BD_PICTOGRAMAS, VERSION_BD_PICTOGRAMAS);

      solicitud.onupgradeneeded = () => {
        if (!solicitud.result.objectStoreNames.contains('pictogramas')){
          solicitud.result.createObjectStore('pictogramas', { keyPath: 'id' });
        }
      };

      solicitud.onsuccess = () => resolve(solicitud.result);
      solicitud.onerror = () => reject(solicitud.error || new Error('No se pudo abrir el almacenamiento local.'));
    });
  }
  return baseDatosPictogramasPromise;
}

async function obtenerPictogramasPersonalizados(){
  const db = await abrirBaseDatosPictogramas();

  return new Promise((resolve, reject) => {
    const solicitud = db.transaction('pictogramas', 'readonly').objectStore('pictogramas').getAll();
    solicitud.onsuccess = () => resolve(solicitud.result);
    solicitud.onerror = () => reject(solicitud.error || new Error('No se pudieron cargar los pictogramas.'));
  });
}

async function guardarPictogramaPersonalizado(pictograma){
  const db = await abrirBaseDatosPictogramas();

  return new Promise((resolve, reject) => {
    const transaccion = db.transaction('pictogramas', 'readwrite');
    transaccion.objectStore('pictogramas').put(pictograma);
    transaccion.oncomplete = () => resolve();
    transaccion.onerror = () => reject(transaccion.error || new Error('No se pudo guardar el pictograma.'));
    transaccion.onabort = () => reject(transaccion.error || new Error('No se pudo guardar el pictograma.'));
  });
}

async function borrarPictogramaPersonalizado(id){
  const db = await abrirBaseDatosPictogramas();

  return new Promise((resolve, reject) => {
    const transaccion = db.transaction('pictogramas', 'readwrite');
    transaccion.objectStore('pictogramas').delete(id);
    transaccion.oncomplete = () => resolve();
    transaccion.onerror = () => reject(transaccion.error || new Error('No se pudo eliminar el pictograma.'));
    transaccion.onabort = () => reject(transaccion.error || new Error('No se pudo eliminar el pictograma.'));
  });
}

async function comprimirImagen(file) {
  const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];

  if (!tiposPermitidos.includes(file.type)) throw new Error('Seleccioná una imagen JPG, PNG o WebP.');
  if (file.size > MAX_BYTES_IMAGEN) throw new Error('La imagen debe pesar 10 MB o menos.');

  let bitmap;

  try {
    bitmap = await createImageBitmap(file);

  }

  catch {
    throw new Error('No se pudo leer la imagen seleccionada.');
  }

  const escala = Math.min(1, MAX_LADO_IMAGEN / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * escala));
  canvas.height = Math.max(1, Math.round(bitmap.height * escala));
  const contexto = canvas.getContext('2d');

  if (!contexto){
    bitmap.close();
    throw new Error('No se pudo preparar la imagen.');
  }

  contexto.fillStyle = '#fff';
  contexto.fillRect(0, 0, canvas.width, canvas.height);
  contexto.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  bitmap.close();

  const convertir = tipo => new Promise(resolve => canvas.toBlob(resolve, tipo, 0.82));
  const webp = await convertir('image/webp');

  if (webp && webp.type === 'image/webp') return webp;

  const jpeg = await convertir('image/jpeg');

  if (!jpeg) throw new Error('No se pudo comprimir la imagen.');

  return jpeg;
}

function obtenerUrlImagen(pictograma) {
  if (pictograma.imagen) return pictograma.imagen;

  if (!urlsImagenesPersonalizadas.has(pictograma.id)) {
    urlsImagenesPersonalizadas.set(pictograma.id, URL.createObjectURL(pictograma.imagenBlob));
  }

  return urlsImagenesPersonalizadas.get(pictograma.id);
}

/* =========================================================
   FRASES GUARDADAS: cuenta cuántas veces se dice cada frase
   completa y guarda las más repetidas como accesos rápidos
   ========================================================= */
const CLAVE_FRASES_GUARDADAS = 'comunica_frases_guardadas';
const UMBRAL_MINIMO_FRASE = 3; // veces mínimas dicha para aparecer como rápida
const MAX_FRASES_RAPIDAS = 6;

function cargarFrasesGuardadas() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_FRASES_GUARDADAS)) || [];
  } 

  catch { return []; }
}

// Guarda la frase dicha (texto natural + IDs originales) y suma su contador:
function registrarFraseUsada(listaPictogramas, textoNatural) {
  if (listaPictogramas.length === 0) return;

  const clave = listaPictogramas.map(p => p.id).join(',');
  const frases = cargarFrasesGuardadas();
  const existente = frases.find(f => f.clave === clave);

  if (existente){
    existente.veces += 1;
  } 

  else {
    frases.push({ clave, texto: textoNatural, veces: 1 });
  }

  localStorage.setItem(CLAVE_FRASES_GUARDADAS, JSON.stringify(frases));
}

// Igual que registrarFraseUsada, pero para texto libre escrito en el modo Escribir
// (usa el propio texto normalizado como clave, ya que no hay pictogramas)
function registrarTextoUsado(texto){
  const limpio = texto.trim();

  if (!limpio) return;

  const clave = 'texto:' + limpio.toLowerCase();
  const frases = cargarFrasesGuardadas();
  const existente = frases.find(f => f.clave === clave);

  if (existente){
    existente.veces += 1;
  } 

  else {
    frases.push({ clave, texto: limpio, veces: 1 });
  }

  localStorage.setItem(CLAVE_FRASES_GUARDADAS, JSON.stringify(frases));
}

// Guarda una frase directo como favorita manual, sin importar cuántas veces se dijo
function marcarComoFavoritaManual(clave, texto){
  const frases = cargarFrasesGuardadas();
  const existente = frases.find(f => f.clave === clave);
  if (existente){
    existente.manual = true;
  } else {
    frases.push({ clave, texto, veces: 1, manual: true });
  }
  localStorage.setItem(CLAVE_FRASES_GUARDADAS, JSON.stringify(frases));
  renderFrasesRapidas();
  anunciar('Frase agregada a favoritos');
}

// Se activa con el botón ⭐ en modo pictogramas
function favoritearFraseActual(){
  if (frase.length === 0){
    anunciar('No hay ninguna frase para guardar');
    return;
  }
  const clave = frase.map(p => p.id).join(',');
  const texto = construirFraseNatural(frase);
  marcarComoFavoritaManual(clave, texto);
}

// Se activa con el botón ⭐ en modo escribir
function favoritearTextoActual(){
  const entradaTexto = document.getElementById('entrada-texto');
  const texto = entradaTexto.value.trim();
  if (!texto){
    anunciar('Escribí algo primero para guardarlo como favorito');
    return;
  }
  const clave = 'texto:' + texto.toLowerCase();
  marcarComoFavoritaManual(clave, texto);
}

// Devuelve las frases que ya alcanzaron el mínimo de repeticiones, O que fueron
// marcadas manualmente como favoritas, de más a menos usadas
function obtenerFrasesFavoritas(){
  return cargarFrasesGuardadas()
    .filter(f => f.veces >= UMBRAL_MINIMO_FRASE || f.manual)
    .sort((a, b) => b.veces - a.veces)
    .slice(0, MAX_FRASES_RAPIDAS);
}

// Dibuja los chips de frases rápidas; oculta la fila entera si todavía no hay ninguna
function renderFrasesRapidas(){
  const cont = document.getElementById('frases-rapidas');
  const favoritas = obtenerFrasesFavoritas();
  cont.innerHTML = '';
  cont.hidden = favoritas.length === 0;
  favoritas.forEach(f => {
    const chip = document.createElement('span');
    chip.className = 'frase-rapida-chip';

    const btnDecir = document.createElement('button');
    btnDecir.className = 'frase-rapida-texto';
    btnDecir.textContent = `🔁 ${f.texto}`;
    btnDecir.setAttribute('aria-label', `Decir de nuevo: ${f.texto}`);
    btnDecir.onclick = () => reproducirTexto(f.texto, null);

    const btnBorrar = document.createElement('button');
    btnBorrar.className = 'frase-rapida-borrar';
    btnBorrar.textContent = '✕';
    btnBorrar.setAttribute('aria-label', `Quitar frase guardada: ${f.texto}`);
    btnBorrar.onclick = () => eliminarFraseGuardada(f.clave);

    chip.appendChild(btnDecir);
    chip.appendChild(btnBorrar);
    cont.appendChild(chip);
  });
}

// Quita una frase guardada por su clave y vuelve a dibujar los chips
function eliminarFraseGuardada(clave){
  const frases = cargarFrasesGuardadas().filter(f => f.clave !== clave);
  localStorage.setItem(CLAVE_FRASES_GUARDADAS, JSON.stringify(frases));
  renderFrasesRapidas();
  anunciar('Frase guardada eliminada');
}

/* =========================================================
   VOZ: dice un texto en voz alta. Usa el audio del paquete de
   voz si lo tiene; si no, usa la voz del navegador (speechSynthesis).
   Un paquete de voz es una carpeta con un voz.json y los audios,
   que se descarga al dispositivo (ver instalarPaqueteDeVoz).
   ========================================================= */
const CACHE_PAQUETE = 'voz-paquete';              // "cajón" del navegador donde se guardan los audios
const CLAVE_VOZ_ACTIVA = 'comunica_voz_activa';   // en localStorage: qué paquete está instalado

let audioActual = null;   // el audio que está sonando ahora
let urlActual = null;     // dirección temporal de ese audio (se libera al frenarlo)
let turnoDeVoz = 0;       // si tocan rápido varias veces, solo suena la última orden

// Convierte un texto en la "clave" con la que se busca su audio:
// minúsculas, sin ¿ ? ¡ ! . , ; y con espacios simples.
// Tiene que dar lo mismo que la columna "clave" de textos_a_sintetizar.csv.
function claveDeFrase(texto){
  return texto.normalize('NFC').toLowerCase()
    .replace(/[¿?¡!.,;]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Lee de localStorage qué paquete de voz está instalado (o null si ninguno)
function cargarVozActiva(){
  try{
    return JSON.parse(localStorage.getItem(CLAVE_VOZ_ACTIVA));
  } catch { return null; }
}

// Si el paquete instalado tiene un audio para ese texto, devuelve su dirección; si no, null
function direccionDelClip(texto){
  const voz = cargarVozActiva();
  if (!voz || !voz.clips) return null;
  const clave = claveDeFrase(texto);
  if (!Object.prototype.hasOwnProperty.call(voz.clips, clave)) return null;
  return new URL(voz.clips[clave], voz.urlBase).href;
}

// Descarga un paquete de voz y guarda todos sus audios en el dispositivo,
// para que después suenen sin internet.
// Ejemplo (desde la consola del navegador):  instalarPaqueteDeVoz('voz-prueba/')
async function instalarPaqueteDeVoz(carpeta){
  const urlBase = new URL(carpeta.endsWith('/') ? carpeta : carpeta + '/', location.href).href;

  const respuesta = await fetch(urlBase + 'voz.json', { cache: 'no-store' });
  if (!respuesta.ok) throw new Error('No se encontró voz.json en ' + urlBase);
  const paquete = await respuesta.json();

  const cache = await caches.open(CACHE_PAQUETE);
  for (const archivo of Object.values(paquete.clips)){
    await cache.add(new URL(archivo, urlBase).href);
  }

  // Recién cuando se bajó todo, se marca el paquete como instalado
  localStorage.setItem(CLAVE_VOZ_ACTIVA, JSON.stringify({
    nombre: paquete.nombre || 'Voz',
    urlBase: urlBase,
    clips: paquete.clips
  }));
  anunciar('Voz instalada: ' + (paquete.nombre || 'Voz'));
  return Object.keys(paquete.clips).length;
}

// Lee un audio guardado en el dispositivo (o lo baja si por alguna razón no está)
async function obtenerAudioGuardado(direccion){
  if ('caches' in window){
    const cache = await caches.open(CACHE_PAQUETE);
    const guardado = await cache.match(direccion);
    if (guardado) return guardado.blob();
  }
  const respuesta = await fetch(direccion);
  if (!respuesta.ok) throw new Error('No se pudo obtener ' + direccion);
  return respuesta.blob();
}

// Frena cualquier audio o voz que esté sonando
function detenerAudio(){
  if (audioActual){
    audioActual.pause();
    audioActual = null;
  }
  if (urlActual){
    URL.revokeObjectURL(urlActual);
    urlActual = null;
  }
  if ('speechSynthesis' in window){
    window.speechSynthesis.cancel();
  }
}

// Reproduce un audio ya leído
async function reproducirBlob(blob){
  urlActual = URL.createObjectURL(blob);
  audioActual = new Audio(urlActual);
  await audioActual.play();
}

// La voz del navegador: el respaldo cuando no hay un audio grabado para ese texto
function hablarConNavegador(texto){
  if (!('speechSynthesis' in window)){
    anunciar('El navegador no soporta voz por síntesis.');
    return;
  }
  const utterance = new SpeechSynthesisUtterance(texto);
  utterance.lang = 'es-ES';
  window.speechSynthesis.speak(utterance);
}

// Dice un texto en voz alta. Orden de prioridad:
//   1) audioUrl, si se indica uno (como antes)
//   2) el audio del paquete de voz instalado, si tiene ese texto
//   3) la voz del navegador
async function reproducirTexto(texto, audioUrl){
  const miTurno = ++turnoDeVoz;   // si llega una orden más nueva, esta se descarta
  detenerAudio();

  const direccion = audioUrl || direccionDelClip(texto);
  if (!direccion){
    hablarConNavegador(texto);    // igual que antes de existir el paquete de voz
    return;
  }

  try {
    const blob = await obtenerAudioGuardado(direccion);
    if (miTurno !== turnoDeVoz) return;
    await reproducirBlob(blob);
  } catch (error) {
    if (miTurno === turnoDeVoz){
      console.warn('No se pudo usar el audio grabado; se usa la voz del navegador.', error);
      hablarConNavegador(texto);
    }
  }
}

// Escribe un mensaje en la región "viva" para que lectores de pantalla lo anuncien
function anunciar(mensaje) {
  document.getElementById('anuncios').textContent = mensaje;
}

/* =========================================================
   MODO: alternar entre pictogramas y texto
   ========================================================= */
// Muestra la vista pictogramas o la vista texto, y actualiza los botones del interruptor
function cambiarModo(modo) {
  const esPictogramas = modo === 'pictogramas';

  document.getElementById('vista-pictogramas').hidden = !esPictogramas;
  document.getElementById('vista-texto').hidden = esPictogramas;
  document.getElementById('barra-frase').hidden = !esPictogramas;
  document.getElementById('btn-modo-pictogramas').setAttribute('aria-pressed', String(esPictogramas));
  document.getElementById('btn-modo-texto').setAttribute('aria-pressed', String(!esPictogramas));

  if (!esPictogramas) {
    document.getElementById('entrada-texto').focus();
  }
}

/* =========================================================
   MODO PICTOGRAMAS
   ========================================================= */
let categoriaActiva = 'personas';  // Categoría seleccionada actualmente en los chips.
let frase = [];                    // Lista de pictogramas que el usuario va tocando, en orden.

// Dibuja los chips de categorías; resalta el que coincide con categoriaActiva:
function renderCategorias() {
  const cont = document.getElementById('lista-categorias');
  cont.innerHTML = '';
  CATEGORIAS.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'cat-chip';
    btn.setAttribute('aria-pressed', String(cat.id === categoriaActiva));
    btn.style.background = cat.color;
    btn.style.color = cat.colorInk;
    btn.textContent = cat.nombre;

    // Al hacer clic, cambia la categoría activa y vuelve a dibujar chips + grilla:
    btn.onclick = () => { categoriaActiva = cat.id; renderCategorias(); renderGrid(); };
    cont.appendChild(btn);
  });
}

// Dibuja la grilla de pictogramas filtrando solo los de la categoría activa
function renderGrid() {
  const grid = document.getElementById('grid-pictogramas');
  grid.innerHTML = '';
  const cat = CATEGORIAS.find(c => c.id === categoriaActiva);
  PICTOGRAMAS.concat(pictogramasPersonalizados).filter(p => p.categoria === categoriaActiva).forEach(p => {
    const elemento = document.createElement('div');
    elemento.className = 'pictograma-contenedor';
    elemento.setAttribute('role', 'listitem');

    const btn = document.createElement('button');
    btn.className = 'pictograma';
    btn.style.background = cat.color;
    btn.style.color = cat.colorInk;
    btn.setAttribute('aria-label', p.palabra);
    if (p.imagen || p.imagenBlob){
      const imagen = document.createElement('img');
      imagen.className = 'pictograma-img';
      imagen.src = obtenerUrlImagen(p);
      imagen.alt = '';
      btn.appendChild(imagen);
    } else {
      const emoji = document.createElement('span');
      emoji.className = 'emoji';
      emoji.setAttribute('aria-hidden', 'true');
      emoji.textContent = p.emoji;
      btn.appendChild(emoji);
    }
    const palabra = document.createElement('span');
    palabra.className = 'palabra';
    palabra.textContent = p.palabra;
    btn.appendChild(palabra);
    btn.onclick = () => tocarPictograma(p);
    elemento.appendChild(btn);

    if (p.personalizado){
      const borrar = document.createElement('button');
      borrar.className = 'btn-eliminar-pictograma';
      borrar.type = 'button';
      borrar.textContent = '🗑️';
      borrar.setAttribute('aria-label', `Eliminar pictograma ${p.palabra}`);
      borrar.onclick = () => eliminarPictograma(p);
      elemento.appendChild(borrar);
    }
    grid.appendChild(elemento);
  });
}

async function eliminarPictograma(pictograma){
  if (!window.confirm(`¿Querés eliminar el pictograma "${pictograma.palabra}"?`)) return;
  try{
    await borrarPictogramaPersonalizado(pictograma.id);
    pictogramasPersonalizados = pictogramasPersonalizados.filter(p => p.id !== pictograma.id);
    const url = urlsImagenesPersonalizadas.get(pictograma.id);
    if (url) URL.revokeObjectURL(url);
    urlsImagenesPersonalizadas.delete(pictograma.id);
    frase = frase.filter(p => p.id !== pictograma.id);
    renderGrid();
    renderFrase();
    anunciar('Pictograma eliminado');
  } catch (error){
    anunciar(error.message);
  }
}

function iniciarPictogramasPersonalizados(){
  const dialogo = document.getElementById('dialogo-pictograma');
  const formulario = document.getElementById('form-pictograma');
  const selectorCategoria = document.getElementById('categoria-pictograma');
  const entradaPalabra = document.getElementById('palabra-pictograma');
  const entradaImagen = document.getElementById('imagen-pictograma');
  const mensajeError = document.getElementById('error-pictograma');
  const botonGuardar = formulario.querySelector('[type="submit"]');

  CATEGORIAS.forEach(cat => {
    const opcion = document.createElement('option');
    opcion.value = cat.id;
    opcion.textContent = cat.nombre;
    selectorCategoria.appendChild(opcion);
  });

  document.getElementById('btn-crear-pictograma').addEventListener('click', () => {
    formulario.reset();
    selectorCategoria.value = categoriaActiva;
    mensajeError.hidden = true;
    dialogo.showModal();
    entradaPalabra.focus();
  });
  document.getElementById('btn-cancelar-pictograma').addEventListener('click', () => dialogo.close());

  formulario.addEventListener('submit', async evento => {
    evento.preventDefault();
    mensajeError.hidden = true;
    const archivo = entradaImagen.files[0];
    if (!archivo) return;
    botonGuardar.disabled = true;
    try{
      const imagenBlob = await comprimirImagen(archivo);
      const pictograma = {
        id: `custom-${crypto.randomUUID()}`,
        palabra: entradaPalabra.value.trim(),
        categoria: selectorCategoria.value,
        imagenBlob,
        personalizado: true,
        audioUrl: null
      };
      if (!pictograma.palabra) throw new Error('Escribí el texto del pictograma.');
      await guardarPictogramaPersonalizado(pictograma);
      pictogramasPersonalizados.push(pictograma);
      categoriaActiva = pictograma.categoria;
      renderCategorias();
      renderGrid();
      dialogo.close();
      anunciar('Pictograma creado');
    } catch (error){
      mensajeError.textContent = error.message || 'No se pudo guardar el pictograma.';
      mensajeError.hidden = false;
    } finally {
      botonGuardar.disabled = false;
    }
  });

  obtenerPictogramasPersonalizados()
    .then(pictogramas => {
      pictogramasPersonalizados = pictogramas;
      renderGrid();
    })
    .catch(error => anunciar(error.message));
}

// Al tocar un pictograma: se agrega a la frase, se refresca la barra inferior y se dice en voz alta
function tocarPictograma(p) {
  frase.push(p);
  renderFrase();
  reproducirTexto(p.palabra, p.audioUrl);
}

// Vuelve a dibujar los chips de palabras de la frase actual en la barra inferior
function renderFrase() {
  const cont = document.getElementById('frase-actual');
  cont.innerHTML = '';
  frase.forEach(p => {
    const chip = document.createElement('span');
    chip.className = 'frase-chip';
    chip.textContent = p.palabra;
    cont.appendChild(chip);
  });
}

// Vacía la frase construida y avisa el cambio a los lectores de pantalla
function limpiarFrase() {
  frase = [];
  renderFrase();
  anunciar('Frase borrada');
}

// Determina la persona gramatical (yo/vos/el/nosotros/ellos) a partir
// del primer pictograma de la frase, si es una persona conocida
function obtenerSujeto(frase) {
  const primero = frase[0];
  if (primero && primero.categoria === 'personas' && primero.persona){
    return primero.persona;
  }

  return 'el'; // sin sujeto explícito, se usa tercera persona por defecto
}

// Arma la frase para hablar: conjuga solo el primer verbo según el sujeto,
// el resto de las palabras (incluidos otros verbos) quedan tal cual
function construirFraseNatural(frase) {
  const sujeto = obtenerSujeto(frase);
  let verboYaConjugado = false;

  return frase.map(p => {
    if (p.categoria === 'acciones' && !verboYaConjugado){
      verboYaConjugado = true;
      return (p.conjugaciones && p.conjugaciones[sujeto]) || p.palabra;
    }

    return p.palabra;
  }).join(' ');
}

// Une todas las palabras de la frase y las reproduce como una sola oración
function hablarFrase(){
  if (frase.length === 0){
    anunciar('No hay ninguna frase para reproducir');
    return;
  }
  const texto = construirFraseNatural(frase);
  reproducirTexto(texto, null);
  registrarFraseUsada(frase, texto);
  renderFrasesRapidas();
}

/* =========================================================
   MODO TEXTO
   ========================================================= */
function iniciarModoTexto() {
  const entradaTexto = document.getElementById('entrada-texto');
  const btnHablar = document.querySelector('.btn-hablar');

 // Helper function to read the textarea and speak:s
  function hablar() {
    const texto = entradaTexto.value.trim();
    if (texto) {
      reproducirTexto(texto, null);
      registrarTextoUsado(texto);
      renderFrasesRapidas();
    }
  }

  // Speak when pressing Enter (without Shift)
  entradaTexto.addEventListener('keydown', (evento) => {
    if (evento.key === 'Enter' && !evento.shiftKey) {
      evento.preventDefault();
      hablar();
    }
  });

  // Speak when clicking the "Hablar" button:
  if (btnHablar) {
    btnHablar.addEventListener('click', hablar);
  }
}

/* =========================================================
   TEMA CLARO/OSCURO: alternar y persistir el tema
   ========================================================= */
function iniciarTema() {
  const btnThemeToggle = document.getElementById('btn-theme-toggle');
  if (!btnThemeToggle) return;

  function actualizarBotonTema(tema) {
    if (tema === 'dark') {
      btnThemeToggle.textContent = '🌙';
      btnThemeToggle.setAttribute('aria-label', 'Cambiar a modo claro');
    }

    else {
      btnThemeToggle.textContent = '☀️';
      btnThemeToggle.setAttribute('aria-label', 'Cambiar a modo oscuro');
    }
  }

  const temaActual = document.documentElement.getAttribute('data-theme') || 'light';
  actualizarBotonTema(temaActual);

  btnThemeToggle.addEventListener('click', () => {
    const esOscuro = document.documentElement.getAttribute('data-theme') === 'dark';
    const nuevoTema = esOscuro ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', nuevoTema);
    localStorage.setItem('theme', nuevoTema);
    actualizarBotonTema(nuevoTema);
    anunciar(`Modo ${nuevoTema === 'dark' ? 'oscuro' : 'claro'} activado`);
  });
}

/* =========================================================
   INICIO: cuando el HTML ya cargó, se dibuja todo por primera vez
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  renderCategorias();
  renderGrid();
  iniciarPictogramasPersonalizados();
  iniciarModoTexto();
  iniciarTema();
  renderFrasesRapidas();
});


/* =========================================================
   REGISTRO DEL SERVICE WORKER: habilita el funcionamiento
   sin conexión (PWA) cacheando los recursos de la app
   ========================================================= */
if ('serviceWorker' in navigator) { // solo si el navegador soporta Service Workers
  window.addEventListener('load', () => { // se registra tras la carga completa para no competir por recursos
    navigator.serviceWorker.register('service-worker.js') // registra el archivo que gestiona la caché offline
      .then(() => console.log('Service worker registrado con éxito')) // confirma el registro exitoso
      .catch((error) => console.error('Error al registrar el service worker:', error)); // reporta fallos de registro
  });
}
