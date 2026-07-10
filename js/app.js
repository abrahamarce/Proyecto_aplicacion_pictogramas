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
  { id:'p001', palabra:'yo',        categoria:'personas',    emoji:'🙋', audioUrl:null },
  { id:'p002', palabra:'vos',       categoria:'personas',    emoji:'👉', audioUrl:null },
  { id:'p003', palabra:'mamá',      categoria:'personas',    emoji:'👩', audioUrl:null },
  { id:'p004', palabra:'papá',      categoria:'personas',    emoji:'👨', audioUrl:null },

  { id:'p010', palabra:'querer',    categoria:'acciones',    emoji:'🤲', audioUrl:null },
  { id:'p011', palabra:'ir',        categoria:'acciones',    emoji:'🚶', audioUrl:null },
  { id:'p012', palabra:'comer',     categoria:'acciones',    emoji:'🍽️', audioUrl:null },
  { id:'p013', palabra:'jugar',     categoria:'acciones',    emoji:'🎲', audioUrl:null },
  { id:'p014', palabra:'ayudar',    categoria:'acciones',    emoji:'🤝', audioUrl:null },

  { id:'p020', palabra:'feliz',     categoria:'descripcion', emoji:'😊', audioUrl:null },
  { id:'p021', palabra:'triste',    categoria:'descripcion', emoji:'😢', audioUrl:null },
  { id:'p022', palabra:'cansado',   categoria:'descripcion', emoji:'😴', audioUrl:null },
  { id:'p023', palabra:'grande',    categoria:'descripcion', emoji:'📏', audioUrl:null },

  { id:'p030', palabra:'agua',      categoria:'objetos',     emoji:'💧', audioUrl:null },
  { id:'p031', palabra:'comida',    categoria:'objetos',     emoji:'🍞', audioUrl:null },
  { id:'p032', palabra:'baño',      categoria:'objetos',     emoji:'🚻', audioUrl:null },
  { id:'p033', palabra:'pelota',    categoria:'objetos',     emoji:'⚽', audioUrl:null },

  { id:'p040', palabra:'qué',       categoria:'preguntas',   emoji:'❓', audioUrl:null },
  { id:'p041', palabra:'dónde',     categoria:'preguntas',   emoji:'📍', audioUrl:null },
  { id:'p042', palabra:'cuándo',    categoria:'preguntas',   emoji:'⏰', audioUrl:null },

  { id:'p050', palabra:'hola',      categoria:'social',      emoji:'👋', audioUrl:null },
  { id:'p051', palabra:'gracias',   categoria:'social',      emoji:'🙏', audioUrl:null },
  { id:'p052', palabra:'sí',        categoria:'social',      emoji:'✅', audioUrl:null },
  { id:'p053', palabra:'no',        categoria:'social',      emoji:'🚫', audioUrl:null },
];

/* =========================================================
   AUDIO: función única que abstrae la fuente del sonido.
   Cuando lleguen los audios grabados, solo hay que llenar
   audioUrl en cada objeto — esta función no cambia.
   ========================================================= */
// Reproduce un audio grabado si existe; si no, recurre a la voz sintetizada del navegador
function reproducirTexto(texto, audioUrl){
  if (audioUrl){
    const audio = new Audio(audioUrl);
    audio.play();
    return;
  }
  if (!('speechSynthesis' in window)){
    anunciar('El navegador no soporta voz por síntesis.');
    return;
  }
  // Cancela cualquier lectura en curso para que no se superpongan dos voces
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(texto);
  utterance.lang = 'es-ES';
  window.speechSynthesis.speak(utterance);
}

// Escribe un mensaje en la región "viva" para que lectores de pantalla lo anuncien
function anunciar(mensaje){
  document.getElementById('anuncios').textContent = mensaje;
}

/* =========================================================
   MODO: alternar entre pictogramas y texto
   ========================================================= */
// Muestra la vista pictogramas o la vista texto, y actualiza los botones del interruptor
function cambiarModo(modo){
  const esPictogramas = modo === 'pictogramas';
  document.getElementById('vista-pictogramas').hidden = !esPictogramas;
  document.getElementById('vista-texto').hidden = esPictogramas;
  document.getElementById('barra-frase').hidden = !esPictogramas;
  document.getElementById('btn-modo-pictogramas').setAttribute('aria-pressed', String(esPictogramas));
  document.getElementById('btn-modo-texto').setAttribute('aria-pressed', String(!esPictogramas));
  if (!esPictogramas){
    document.getElementById('entrada-texto').focus();
  }
}

/* =========================================================
   MODO PICTOGRAMAS
   ========================================================= */
let categoriaActiva = 'personas'; // categoría seleccionada actualmente en los chips
let frase = [];                   // lista de pictogramas que el usuario va tocando, en orden

// Dibuja los chips de categorías; resalta el que coincide con categoriaActiva
function renderCategorias(){
  const cont = document.getElementById('lista-categorias');
  cont.innerHTML = '';
  CATEGORIAS.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'cat-chip';
    btn.setAttribute('aria-pressed', String(cat.id === categoriaActiva));
    btn.style.background = cat.color;
    btn.style.color = cat.colorInk;
    btn.textContent = cat.nombre;
    // Al hacer clic, cambia la categoría activa y vuelve a dibujar chips + grilla
    btn.onclick = () => { categoriaActiva = cat.id; renderCategorias(); renderGrid(); };
    cont.appendChild(btn);
  });
}

// Dibuja la grilla de pictogramas filtrando solo los de la categoría activa
function renderGrid(){
  const grid = document.getElementById('grid-pictogramas');
  grid.innerHTML = '';
  const cat = CATEGORIAS.find(c => c.id === categoriaActiva);
  PICTOGRAMAS.filter(p => p.categoria === categoriaActiva).forEach(p => {
    const btn = document.createElement('button');
    btn.className = 'pictograma';
    btn.style.background = cat.color;
    btn.style.color = cat.colorInk;
    btn.setAttribute('role', 'listitem');
    btn.setAttribute('aria-label', p.palabra);
    btn.innerHTML = `<span class="emoji" aria-hidden="true">${p.emoji}</span><span class="palabra">${p.palabra}</span>`;
    btn.onclick = () => tocarPictograma(p);
    grid.appendChild(btn);
  });
}

// Al tocar un pictograma: se agrega a la frase, se refresca la barra inferior y se dice en voz alta
function tocarPictograma(p){
  frase.push(p);
  renderFrase();
  reproducirTexto(p.palabra, p.audioUrl);
}

// Vuelve a dibujar los chips de palabras de la frase actual en la barra inferior
function renderFrase(){
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
function limpiarFrase(){
  frase = [];
  renderFrase();
  anunciar('Frase borrada');
}

// Une todas las palabras de la frase y las reproduce como una sola oración
function hablarFrase(){
  if (frase.length === 0){
    anunciar('No hay ninguna frase para reproducir');
    return;
  }
  const texto = frase.map(p => p.palabra).join(' ');
  reproducirTexto(texto, null); // frase completa siempre por síntesis (combinación libre)
}

/* =========================================================
   MODO TEXTO
   ========================================================= */
// Engancha el textarea del modo texto: Enter (sin Shift) reproduce en voz alta lo escrito,
// sin insertar un salto de línea
function iniciarModoTexto(){
  const entradaTexto = document.getElementById('entrada-texto');
  entradaTexto.addEventListener('keydown', (evento) => {
    if (evento.key === 'Enter' && !evento.shiftKey){
      evento.preventDefault();
      const texto = entradaTexto.value.trim();
      if (texto){
        reproducirTexto(texto, null);
      }
    }
  });
}

/* =========================================================
   INICIO: cuando el HTML ya cargó, se dibuja todo por primera vez
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  renderCategorias();
  renderGrid();
  iniciarModoTexto();
});
