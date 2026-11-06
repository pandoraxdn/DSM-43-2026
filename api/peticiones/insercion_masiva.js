#!/usr/bin/env node
/**
 * Inserción masiva de datos ALEATORIOS hacia una API NestJS, con menú de tablas y verificación previa.
 *
 * Archivo autónomo: define los campos de cada tabla (constante TABLAS) y genera los valores
 * al azar en cada ejecución. No necesita Python ni archivos JSON.
 *
 * Flujo:
 *   1. Muestra un MENÚ con las tablas definidas en TABLAS.
 *   2. Eliges una tabla (por número o por nombre).
 *   3. Te pide la CANTIDAD de registros, la URL de la API y cuántos registros mandar por petición.
 *      Si la tabla tiene llaves foráneas (alumno_id, materia_id, cliente_id) te pide el id máximo
 *      que existe en la tabla relacionada, para generar ids válidos entre 1 y ese número.
 *        ejemplo:  POST http://localhost:3000/cliente/masivo
 *   4. Genera los registros al azar, los verifica, manda UN registro de prueba y, si todo va bien,
 *      manda el resto en lotes. Cada petición lleva un ARREGLO de registros en el body, que es
 *      lo que recibe tu servicio:
 *
 *        async insertMasivo(lecturas: Partial<Cliente>[], tamanoLote = 1000) { ... }
 *
 *      Ejemplo de controlador:
 *        @Post('masivo')
 *        insertMasivo(@Body() lecturas: CreateClienteDto[]) { return this.service.insertMasivo(lecturas); }
 *
 *   5. Muestra cuántos registros se insertaron y vuelve al menú (0 para salir).
 *
 * Requiere Node 18+ (fetch nativo). Sin dependencias externas.
 *
 * Uso:
 *   node insercion_masiva.js
 */

const readline = require('readline/promises');

const MAX_ERRORES_MOSTRADOS = 10;
// Nest limita el body a 100 kb por defecto: 500 registros por petición caben holgados.
const LOTE_DEFECTO = 500;
const REGEX_FECHA = /^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}:\d{2})?$/;
const REGEX_HORA = /^\d{2}:\d{2}:\d{2}$/;
const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CAMPOS_UNICOS = /correo|email|matricula|curp|codigo|rfc/i;

// ---------------------------------------------------------------------------
// Utilidades de azar
// ---------------------------------------------------------------------------

/** Entero aleatorio entre min y max (ambos incluidos). */
const entero = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/** Decimal aleatorio entre min y max con `decimales` cifras. */
const decimal = (min, max, decimales = 2) => {
  const f = 10 ** decimales;
  return Math.round((Math.random() * (max - min) + min) * f) / f;
};

/** Elemento aleatorio de una lista. */
const elegir = (lista) => lista[entero(0, lista.length - 1)];

/** true con la probabilidad indicada (0 a 1). */
const probabilidad = (p) => Math.random() < p;

/** Elige según pesos: [['a', 70], ['b', 30]]. */
const ponderado = (opciones) => {
  const total = opciones.reduce((s, [, peso]) => s + peso, 0);
  let r = Math.random() * total;
  for (const [valor, peso] of opciones) {
    r -= peso;
    if (r < 0) return valor;
  }
  return opciones[opciones.length - 1][0];
};

const dos = (n) => String(n).padStart(2, '0');

/** Hora HH:MM:SS aleatoria con hora fija y minutos entre min y max. */
const hora = (h, minMin, maxMin) => `${dos(h)}:${dos(entero(minMin, maxMin))}:${dos(entero(0, 59))}`;

/** Fecha 'YYYY-MM-DD' aleatoria entre dos fechas; con soloHabiles evita sábado y domingo. */
function fechaAleatoria(desde, hasta, soloHabiles = false) {
  const t0 = leerFecha(desde).getTime();
  const t1 = leerFecha(hasta).getTime();
  while (true) {
    const d = new Date(t0 + Math.floor(Math.random() * (t1 - t0 + 1)));
    const dia = d.getUTCDay();
    if (soloHabiles && (dia === 0 || dia === 6)) continue;
    return d.toISOString().slice(0, 10);
  }
}

const sinAcentos = (t) =>
  t
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

// ---------------------------------------------------------------------------
// Fechas
// ---------------------------------------------------------------------------

/** Convierte 'YYYY-MM-DD' o 'YYYY-MM-DD HH:MM:SS' a Date (UTC, sin zonas horarias). */
function leerFecha(fecha) {
  const iso = fecha.length === 10 ? `${fecha}T00:00:00Z` : `${fecha.replace(' ', 'T')}Z`;
  return new Date(iso);
}

/** ¿La fecha existe de verdad? (rechaza 2026-02-31, 2026-13-01, etc.) */
function fechaValida(fecha) {
  if (!REGEX_FECHA.test(fecha)) return false;
  const d = leerFecha(fecha);
  if (Number.isNaN(d.getTime())) return false;
  return d.toISOString().slice(0, 10) === fecha.slice(0, 10);
}

// ---------------------------------------------------------------------------
// Catálogos para generar valores
// ---------------------------------------------------------------------------

const NOMBRES = [
  'Valeria', 'Diego', 'Camila', 'Mateo', 'Regina', 'Santiago', 'Ximena', 'Emiliano', 'Sofía', 'Leonardo',
  'Andrea', 'Carlos', 'Lucía', 'Marcos', 'Paola', 'Iván', 'Daniela', 'Tomás', 'Fernanda', 'Sebastián',
  'Isabella', 'Alejandro', 'Renata', 'Gael', 'Mariana', 'Julián', 'Natalia', 'Bruno', 'Karla', 'Raúl',
];
const APELLIDOS = [
  'Hernández', 'Martínez', 'López', 'García', 'Sánchez', 'Ramírez', 'Torres', 'Flores', 'Cruz', 'Morales',
  'Solís', 'Peña', 'Ibarra', 'Delgado', 'Estrada', 'Rojas', 'Cortés', 'Herrera', 'Vázquez', 'Mendoza',
  'Ortega', 'Reyes', 'Castillo', 'Aguilar', 'Salazar', 'Navarro', 'Domínguez', 'Fuentes', 'Cárdenas', 'Lara',
];
const nombreCompleto = () => `${elegir(NOMBRES)} ${elegir(APELLIDOS)}`;

const MATERIAS = [
  // [nombre, área, departamento del profesor]
  ['Matemáticas', 'Ciencias exactas', 'Ciencias exactas'],
  ['Español', 'Humanidades', 'Humanidades'],
  ['Ciencias', 'Ciencias exactas', 'Ciencias exactas'],
  ['Historia', 'Humanidades', 'Humanidades'],
  ['Geografía', 'Humanidades', 'Humanidades'],
  ['Inglés', 'Idiomas', 'Idiomas'],
  ['Educación Física', 'Deportes', 'Deportes'],
  ['Artes', 'Artes', 'Artes'],
  ['Física', 'Ciencias exactas', 'Ciencias exactas'],
  ['Química', 'Ciencias exactas', 'Ciencias exactas'],
  ['Formación Cívica', 'Humanidades', 'Humanidades'],
  ['Música', 'Artes', 'Artes'],
  ['Francés', 'Idiomas', 'Idiomas'],
  ['Tecnología', 'Ciencias exactas', 'Ciencias exactas'],
];

const CIUDADES = [
  ['Toluca', 'Estado de México'], ['Metepec', 'Estado de México'], ['Ciudad de México', 'Ciudad de México'],
  ['Guadalajara', 'Jalisco'], ['Monterrey', 'Nuevo León'], ['Puebla', 'Puebla'], ['Querétaro', 'Querétaro'],
  ['León', 'Guanajuato'], ['Mérida', 'Yucatán'], ['Oaxaca', 'Oaxaca'], ['Morelia', 'Michoacán'],
];

const PRODUCTOS = [
  // [nombre, categoría, precio mínimo, precio máximo]
  ['Refresco cola 600 ml', 'bebidas', 15, 22], ['Agua natural 1 L', 'bebidas', 9, 15],
  ['Jugo de naranja 1 L', 'bebidas', 25, 38], ['Papas fritas 45 g', 'botanas', 16, 24],
  ['Cacahuates 100 g', 'botanas', 14, 22], ['Galletas Marías 170 g', 'galletas', 13, 20],
  ['Galletas de chocolate 200 g', 'galletas', 18, 30], ['Leche entera 1 L', 'lácteos', 24, 31],
  ['Yogurt natural 1 kg', 'lácteos', 32, 48], ['Queso panela 400 g', 'lácteos', 55, 85],
  ['Huevo blanco 12 piezas', 'básicos', 38, 55], ['Tortillas de maíz 1 kg', 'básicos', 20, 28],
  ['Pan de caja', 'básicos', 35, 52], ['Frijol negro 900 g', 'abarrotes', 30, 46],
  ['Arroz 1 kg', 'abarrotes', 26, 38], ['Aceite vegetal 1 L', 'abarrotes', 42, 65],
  ['Azúcar 1 kg', 'abarrotes', 24, 36], ['Sal de mesa 1 kg', 'abarrotes', 12, 20],
];

const PUESTOS = [
  // [puesto, departamento, salario mínimo, salario máximo]
  ['Gerente general', 'Dirección', 38000, 48000], ['Contador', 'Finanzas', 24000, 32000],
  ['Desarrollador', 'Tecnología', 26000, 36000], ['Analista de datos', 'Tecnología', 24000, 34000],
  ['Vendedor', 'Ventas', 12000, 17000], ['Ejecutivo de cuenta', 'Ventas', 15000, 22000],
  ['Almacenista', 'Logística', 10500, 14000], ['Repartidor', 'Logística', 10000, 13500],
  ['Reclutador', 'Recursos humanos', 16000, 24000],
];

const LIBROS = [
  // [título, autor, año, género, país del autor]
  ['Cien años de soledad', 'Gabriel García Márquez', 1967, 'novela', 'Colombia'],
  ['El amor en los tiempos del cólera', 'Gabriel García Márquez', 1985, 'novela', 'Colombia'],
  ['Pedro Páramo', 'Juan Rulfo', 1955, 'novela', 'México'],
  ['El llano en llamas', 'Juan Rulfo', 1953, 'cuentos', 'México'],
  ['El laberinto de la soledad', 'Octavio Paz', 1950, 'ensayo', 'México'],
  ['Rayuela', 'Julio Cortázar', 1963, 'novela', 'Argentina'],
  ['Bestiario', 'Julio Cortázar', 1951, 'cuentos', 'Argentina'],
  ['Ficciones', 'Jorge Luis Borges', 1944, 'cuentos', 'Argentina'],
  ['El Aleph', 'Jorge Luis Borges', 1949, 'cuentos', 'Argentina'],
  ['La ciudad y los perros', 'Mario Vargas Llosa', 1963, 'novela', 'Perú'],
  ['Conversación en La Catedral', 'Mario Vargas Llosa', 1969, 'novela', 'Perú'],
  ['Como agua para chocolate', 'Laura Esquivel', 1989, 'novela', 'México'],
  ['La casa de los espíritus', 'Isabel Allende', 1982, 'novela', 'Chile'],
  ['Aura', 'Carlos Fuentes', 1962, 'novela corta', 'México'],
  ['La muerte de Artemio Cruz', 'Carlos Fuentes', 1962, 'novela', 'México'],
  ['Los detectives salvajes', 'Roberto Bolaño', 1998, 'novela', 'Chile'],
  ['El túnel', 'Ernesto Sabato', 1948, 'novela', 'Argentina'],
  ['Sobre héroes y tumbas', 'Ernesto Sabato', 1961, 'novela', 'Argentina'],
];

// ---------------------------------------------------------------------------
// Tablas: campos y generador de un registro al azar
// ---------------------------------------------------------------------------
// - columnas: campos de la tabla (sin id: lo asigna la base de datos, autoincremento desde 1).
// - fks:      campo -> tabla relacionada (se pregunta el id máximo de esa tabla).
// - fila(i, ctx): devuelve UN registro aleatorio. `i` es el número de registro (0, 1, 2...) y
//   `ctx.max[tabla]` es el id máximo de la tabla relacionada.
// Para agregar una tabla basta con añadir otra entrada aquí.

const idDe = (ctx, tabla) => entero(1, ctx.max[tabla]);

const TABLAS = {
  asistencia: {
    columnas: ['alumno_id', 'fecha', 'hora_entrada', 'estado', 'observacion'],
    fks: { alumno_id: 'alumno' },
    fila: (i, ctx) => {
      const estado = ponderado([['asistio', 75], ['retardo', 10], ['falta', 10], ['justificada', 5]]);
      return {
        alumno_id: idDe(ctx, 'alumno'),
        fecha: fechaAleatoria('2026-09-01', '2026-11-30', true),
        hora_entrada: estado === 'asistio' ? hora(7, 45, 59) : estado === 'retardo' ? hora(8, 5, 20) : null,
        estado,
        observacion:
          estado === 'retardo'
            ? 'Llegó tarde'
            : estado === 'falta'
              ? 'Sin aviso'
              : estado === 'justificada'
                ? elegir(['Cita médica', 'Permiso familiar'])
                : null,
      };
    },
  },

  dispositivo: {
    columnas: ['nombre', 'modelo', 'ubicacion', 'tipo', 'activo', 'fecha_instalacion'],
    fks: {},
    fila: (i) => {
      const [tipo, prefijo, modelos, ubicaciones] = elegir([
        ['nivel', 'Tanque', ['HC-SR04 + DS18B20', 'JSN-SR04T'], ['Azotea edificio A', 'Azotea edificio B', 'Patio central']],
        ['ambiente', 'Invernadero', ['DHT22'], ['Zona de cultivo', 'Área de germinación']],
        ['temperatura', 'Bodega', ['DS18B20'], ['Bodega general', 'Cámara fría']],
      ]);
      return {
        nombre: `${prefijo} ${i + 1}`,
        modelo: elegir(modelos),
        ubicacion: elegir(ubicaciones),
        tipo,
        activo: probabilidad(0.85),
        fecha_instalacion: fechaAleatoria('2025-06-01', '2026-10-31'),
      };
    },
  },

  alumno: {
    columnas: ['nombre', 'apellido', 'grado', 'grupo', 'fecha_nacimiento', 'promedio', 'activo'],
    fks: {},
    fila: () => {
      const grado = entero(1, 3);
      const nacimiento = 2014 - grado; // 1.º ≈ 2013, 2.º ≈ 2012, 3.º ≈ 2011
      return {
        nombre: elegir(NOMBRES),
        apellido: elegir(APELLIDOS),
        grado,
        grupo: elegir(['A', 'B']),
        fecha_nacimiento: fechaAleatoria(`${nacimiento}-01-01`, `${nacimiento}-12-31`),
        promedio: decimal(5.5, 10, 1),
        activo: probabilidad(0.9),
      };
    },
  },

  profesor: {
    columnas: ['nombre', 'apellido', 'materia', 'departamento', 'salario_mensual', 'fecha_ingreso'],
    fks: {},
    fila: () => {
      const [materia, , departamento] = elegir(MATERIAS);
      return {
        nombre: elegir(NOMBRES),
        apellido: elegir(APELLIDOS),
        materia,
        departamento,
        salario_mensual: entero(155, 195) * 100,
        fecha_ingreso: fechaAleatoria('2010-08-01', '2026-08-31'),
      };
    },
  },

  materia: {
    columnas: ['nombre', 'area', 'horas_semana', 'obligatoria'],
    fks: {},
    fila: () => {
      const [nombre, area] = elegir(MATERIAS);
      return { nombre, area, horas_semana: entero(2, 6), obligatoria: probabilidad(0.85) };
    },
  },

  calificacion: {
    columnas: ['alumno_id', 'materia_id', 'bimestre', 'calificacion'],
    fks: { alumno_id: 'alumno', materia_id: 'materia' },
    fila: (i, ctx) => ({
      alumno_id: idDe(ctx, 'alumno'),
      materia_id: idDe(ctx, 'materia'),
      bimestre: entero(1, 5),
      calificacion: decimal(5, 10, 1),
    }),
  },

  producto: {
    columnas: ['nombre', 'categoria', 'precio', 'stock'],
    fks: {},
    fila: () => {
      const [nombre, categoria, min, max] = elegir(PRODUCTOS);
      return { nombre, categoria, precio: decimal(min, max, 2), stock: entero(0, 200) };
    },
  },

  cliente: {
    columnas: ['nombre', 'correo', 'ciudad', 'estado', 'fecha_registro'],
    fks: {},
    fila: (i) => {
      const nombre = elegir(NOMBRES);
      const apellido = elegir(APELLIDOS);
      const [ciudad, estado] = elegir(CIUDADES);
      // El número de registro y un sufijo al azar evitan correos repetidos (suelen ser únicos).
      const correo = `${sinAcentos(nombre)}.${sinAcentos(apellido)}${i + 1}${entero(100, 999)}@example.com`;
      return {
        nombre: `${nombre} ${apellido}`,
        correo,
        ciudad,
        estado,
        fecha_registro: fechaAleatoria('2024-01-01', '2026-10-31'),
      };
    },
  },

  venta: {
    columnas: ['cliente_id', 'fecha', 'total', 'metodo_pago'],
    fks: { cliente_id: 'cliente' },
    fila: (i, ctx) => ({
      cliente_id: idDe(ctx, 'cliente'),
      fecha: fechaAleatoria('2026-01-01', '2026-11-05'),
      total: decimal(25, 2000, 2),
      metodo_pago: ponderado([['tarjeta', 45], ['efectivo', 35], ['transferencia', 20]]),
    }),
  },

  empleado: {
    columnas: ['nombre', 'puesto', 'departamento', 'salario_mensual', 'fecha_contratacion'],
    fks: {},
    fila: () => {
      const [puesto, departamento, min, max] = elegir(PUESTOS);
      return {
        nombre: nombreCompleto(),
        puesto,
        departamento,
        salario_mensual: entero(min / 100, max / 100) * 100,
        fecha_contratacion: fechaAleatoria('2015-01-01', '2026-10-31'),
      };
    },
  },

  libro: {
    columnas: ['titulo', 'autor', 'anio_publicacion', 'genero', 'pais_autor'],
    fks: {},
    fila: () => {
      const [titulo, autor, anio_publicacion, genero, pais_autor] = elegir(LIBROS);
      return { titulo, autor, anio_publicacion, genero, pais_autor };
    },
  },
};

// ---------------------------------------------------------------------------
// Menú de tablas
// ---------------------------------------------------------------------------

function resumenTablas() {
  return Object.entries(TABLAS).map(([nombre, def]) => ({
    nombre,
    columnas: def.columnas,
    fks: def.fks,
    fila: def.fila,
  }));
}

function mostrarMenu(tablas) {
  console.log('\n===== TABLAS DISPONIBLES PARA INSERCIÓN MASIVA (datos aleatorios) =====');
  const ancho = Math.max(...tablas.map((t) => t.nombre.length));
  tablas.forEach((t, i) => {
    const columnas = `${t.columnas.slice(0, 4).join(', ')}${t.columnas.length > 4 ? ', ...' : ''}`;
    console.log(`${String(i + 1).padStart(2)}) ${t.nombre.padEnd(ancho)}  [${columnas}]`);
  });
  console.log(' 0) Salir');
}

/** Pide la tabla hasta que la opción sea válida. Devuelve la tabla o null si se sale. */
async function elegirTabla(rl, tablas) {
  while (true) {
    mostrarMenu(tablas);
    const resp = (await rl.question('\nElige una tabla (número o nombre): ')).trim().toLowerCase();
    if (resp === '0' || resp === 'salir') return null;
    const numero = Number(resp);
    const tabla =
      resp !== '' && Number.isInteger(numero)
        ? tablas[numero - 1]
        : tablas.find((t) => t.nombre.toLowerCase() === resp);
    if (tabla) return tabla;
    console.log(`✖ Opción no válida: '${resp}'.`);
  }
}

// ---------------------------------------------------------------------------
// Generación de registros
// ---------------------------------------------------------------------------

/** Genera exactamente `cantidad` registros aleatorios de la tabla. */
function generarRegistros(tabla, cantidad, ctx) {
  const lista = [];
  for (let i = 0; i < cantidad; i++) lista.push(tabla.fila(i, ctx));
  return lista;
}

// ---------------------------------------------------------------------------
// Verificación del contenido
// ---------------------------------------------------------------------------

function tipoDe(valor) {
  if (valor === null) return 'null';
  if (Array.isArray(valor)) return 'array';
  return typeof valor;
}

/** Verifica cada registro. Devuelve { errores: [...mensajes], total: n }. */
function validarRegistros(registros, columnas) {
  const errores = [];
  let total = 0;
  const agregar = (i, mensaje) => {
    total++;
    if (errores.length < 200) errores.push(`registro ${i + 1}: ${mensaje}`);
  };

  const tipos = {};

  registros.forEach((r, i) => {
    if (r === null || typeof r !== 'object' || Array.isArray(r)) {
      agregar(i, 'no es un objeto');
      return;
    }

    const llaves = Object.keys(r);
    const faltan = columnas.filter((c) => !llaves.includes(c));
    const sobran = llaves.filter((c) => !columnas.includes(c));
    if (faltan.length) agregar(i, `le faltan columnas: ${faltan.join(', ')}`);
    if (sobran.length) agregar(i, `tiene columnas de más: ${sobran.join(', ')}`);
    if ('id' in r) agregar(i, "no debe incluir 'id' (lo asigna la base de datos)");

    for (const [campo, valor] of Object.entries(r)) {
      const tipo = tipoDe(valor);

      if (['undefined', 'object', 'array', 'function', 'symbol', 'bigint'].includes(tipo)) {
        agregar(i, `'${campo}' tiene un tipo no válido para JSON plano (${tipo})`);
        continue;
      }

      if (tipo === 'number') {
        if (!Number.isFinite(valor)) agregar(i, `'${campo}' no es un número finito (${valor})`);
        else if (valor < 0 && !/temperatura/i.test(campo)) agregar(i, `'${campo}' es negativo (${valor})`);
      }

      if (tipo === 'string') {
        if (valor.trim() === '') agregar(i, `'${campo}' es un texto vacío`);
        else if (valor !== valor.trim()) agregar(i, `'${campo}' tiene espacios al inicio o al final`);
      }

      if (tipo !== 'null') {
        if (tipos[campo] === undefined) tipos[campo] = tipo;
        else if (tipos[campo] !== tipo) {
          agregar(i, `'${campo}' cambia de tipo (${tipos[campo]} y ${tipo})`);
        }
      }

      if (tipo === 'string') {
        if (/(^|_)fecha(_|$)/i.test(campo) && !fechaValida(valor)) {
          agregar(i, `'${campo}' no es una fecha válida (${valor}); usa YYYY-MM-DD o YYYY-MM-DD HH:MM:SS`);
        }
        if (/^hora(_|$)/i.test(campo)) {
          const [h, m, s] = valor.split(':').map(Number);
          if (!REGEX_HORA.test(valor) || h > 23 || m > 59 || s > 59) {
            agregar(i, `'${campo}' no es una hora válida (${valor}); usa HH:MM:SS`);
          }
        }
        if (/correo|email/i.test(campo) && !REGEX_CORREO.test(valor)) {
          agregar(i, `'${campo}' no es un correo válido (${valor})`);
        }
      }

      if (/_id$/i.test(campo) && tipo !== 'null') {
        if (!Number.isInteger(valor) || valor < 1) {
          agregar(i, `'${campo}' debe ser un entero >= 1 (${JSON.stringify(valor)})`);
        }
      }
    }
  });

  return { errores, total };
}

/** Detecta valores repetidos en columnas que suelen ser únicas. */
function detectarRepetidos(registros) {
  const avisos = [];
  const columnas = Object.keys(registros[0] || {}).filter((c) => CAMPOS_UNICOS.test(c));
  for (const columna of columnas) {
    const vistos = new Set();
    let repetidos = 0;
    for (const r of registros) {
      const valor = r[columna];
      if (valor === null || valor === undefined) continue;
      if (vistos.has(valor)) repetidos++;
      else vistos.add(valor);
    }
    if (repetidos > 0) {
      avisos.push(
        `'${columna}' tiene ${repetidos} valores repetidos; si es única en tu entidad, la API rechazará los repetidos`,
      );
    }
  }
  return avisos;
}

// ---------------------------------------------------------------------------
// Comunicación con la API
// ---------------------------------------------------------------------------

/** POST con un ARREGLO de registros en el body (lo que recibe insertMasivo). */
async function enviarLote(url, lote) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lote),
  });
  const texto = await res.text();
  let cuerpo = null;
  try {
    cuerpo = JSON.parse(texto);
  } catch {
    cuerpo = null;
  }
  return { ok: res.ok, status: res.status, texto, cuerpo };
}

/** Motivo legible de un rechazo (Nest devuelve { message: string | string[] }). */
function motivo(r) {
  const mensaje = r.cuerpo && r.cuerpo.message;
  const detalle = Array.isArray(mensaje) ? mensaje.join('; ') : mensaje || r.texto.slice(0, 200);
  return `HTTP ${r.status}: ${detalle}`;
}

// ---------------------------------------------------------------------------
// Inserción de UNA tabla (pide datos, genera, verifica, prueba y envía)
// ---------------------------------------------------------------------------

/**
 * Devuelve el origen (http://host:puerto) si la API respondió, para recordar el servidor, o null.
 * Ante cualquier problema imprime el motivo y regresa al menú (no cierra el programa).
 */
async function insertarTabla(rl, tabla, sesion) {
  const nombre = tabla.nombre;

  // Cantidad
  const cantidad = Number((await rl.question(`\nCantidad de registros de '${nombre}' a insertar: `)).trim());
  if (!Number.isInteger(cantidad) || cantidad <= 0) {
    console.log('✖ La cantidad debe ser un número entero mayor a 0.');
    return null;
  }

  // Ids máximos de las tablas relacionadas (llaves foráneas)
  const ctx = { max: {} };
  for (const [campo, padre] of Object.entries(tabla.fks)) {
    if (ctx.max[padre]) continue; // ya se preguntó para otro campo de la misma tabla
    const sugerido = sesion.maxIds[padre] || 10;
    const resp = (await rl.question(`Id máximo de '${padre}' para ${campo} (ids 1 a N) [${sugerido}]: `)).trim();
    const n = resp === '' ? sugerido : Number(resp);
    if (!Number.isInteger(n) || n < 1) {
      console.log('✖ El id máximo debe ser un entero mayor o igual a 1.');
      return null;
    }
    ctx.max[padre] = n;
    sesion.maxIds[padre] = n;
  }

  // URL del endpoint POST masivo
  const urlSugerida = sesion.origen ? `${sesion.origen}/${nombre}/masivo` : `http://localhost:3000/${nombre}/masivo`;
  const respUrl = (await rl.question(`URL de la API Nest (POST, recibe un arreglo) [${urlSugerida}]: `)).trim();
  const url = (respUrl || urlSugerida).replace(/^POST\s+/i, '');
  if (!/^https?:\/\/\S+$/i.test(url)) {
    console.log(`✖ La URL no es válida: '${url}'. Debe empezar con http:// o https://`);
    return null;
  }

  // Registros por petición (se pregunta solo la primera vez)
  if (sesion.lote === null) {
    const p = Number(await rl.question(`Registros por petición [${LOTE_DEFECTO}]: `));
    sesion.lote = Number.isInteger(p) && p > 0 ? p : LOTE_DEFECTO;
  }
  const tamanoLote = sesion.lote;

  // 1) Generación y verificación ----------------------------------------------
  const registros = generarRegistros(tabla, cantidad, ctx);
  const { errores, total: totalErrores } = validarRegistros(registros, tabla.columnas);
  if (totalErrores > 0) {
    console.log(`\n✖ Verificación fallida: ${totalErrores} problema(s). No se envió nada.`);
    errores.slice(0, MAX_ERRORES_MOSTRADOS).forEach((e) => console.log(`  - ${e}`));
    if (totalErrores > MAX_ERRORES_MOSTRADOS) {
      console.log(`  ... y ${totalErrores - MAX_ERRORES_MOSTRADOS} problemas más`);
    }
    return null;
  }
  console.log(`\n✔ ${registros.length} registros aleatorios de '${nombre}' generados y verificados.`);
  console.log(`  Columnas: ${tabla.columnas.join(', ')}`);
  console.log(`  Ejemplo:  ${JSON.stringify(registros[0])}`);

  // 2) Repetidos ---------------------------------------------------------------
  detectarRepetidos(registros).forEach((a) => console.log(`⚠ ${a}`));

  const peticiones = 1 + Math.ceil((registros.length - 1) / tamanoLote);
  console.log(
    `\nTabla: ${nombre} | A insertar: ${registros.length} | ` +
      `Lote: ${tamanoLote} | Peticiones: ${peticiones} | URL: ${url}`,
  );
  const confirma = (await rl.question('¿Enviar? (s/n) [s]: ')).trim().toLowerCase();
  if (confirma === 'n' || confirma === 'no') {
    console.log('Cancelado. No se envió nada.');
    return null;
  }

  // 3) Prueba con el primer registro (arreglo de 1) ----------------------------
  let insertados = 0;
  let fallidos = 0;
  let errorEnvio = null;
  const inicio = Date.now();

  console.log('\nProbando la API con el primer registro...');
  let prueba;
  try {
    prueba = await enviarLote(url, [registros[0]]);
  } catch (err) {
    console.log(`✖ No se pudo conectar a ${url}: ${err.cause?.code || err.message}`);
    console.log('  Revisa que la API esté corriendo y que la URL (puerto y ruta) sea correcta.');
    return null;
  }
  if (!prueba.ok) {
    console.log(`✖ La API rechazó el registro de prueba. ${motivo(prueba)}`);
    console.log('  No se envió el resto. Revisa que el endpoint reciba un arreglo y que el DTO/entidad coincidan.');
    console.log(`  Body enviado: ${JSON.stringify([registros[0]])}`);
    return new URL(url).origin;
  }
  insertados++;
  console.log('✔ La API aceptó el registro de prueba.\n');

  // 4) Resto de los registros, en lotes ------------------------------------------
  const pendientes = registros.slice(1);
  for (let i = 0; i < pendientes.length; i += tamanoLote) {
    const lote = pendientes.slice(i, i + tamanoLote);
    try {
      const r = await enviarLote(url, lote);
      if (!r.ok) throw new Error(motivo(r));
      insertados += lote.length;
    } catch (err) {
      fallidos += pendientes.length - i; // este lote y todos los siguientes
      errorEnvio = err.cause?.code || err.message;
      break;
    }
    process.stdout.write(`\rProgreso: ${insertados}/${registros.length}`);
  }

  const segundos = ((Date.now() - inicio) / 1000).toFixed(1);
  console.log('\n\n===== RESUMEN =====');
  console.log(`Tabla:                 ${nombre}`);
  console.log(`Registros solicitados: ${cantidad}`);
  console.log(`Registros insertados:  ${insertados}`);
  console.log(`Registros sin enviar:  ${fallidos}`);
  console.log(`Tiempo:                ${segundos} s`);
  if (errorEnvio) {
    console.log(`\n✖ Se detuvo en un lote: ${errorEnvio}`);
    console.log('  (los lotes anteriores ya quedaron insertados)');
  }
  return new URL(url).origin;
}

// ---------------------------------------------------------------------------
// Programa principal: menú en bucle
// ---------------------------------------------------------------------------

async function main() {
  const tablas = resumenTablas();
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const sesion = { origen: null, lote: null, maxIds: {} };

  while (true) {
    const tabla = await elegirTabla(rl, tablas);
    if (!tabla) break;

    const origen = await insertarTabla(rl, tabla, sesion);
    if (origen) sesion.origen = origen; // recuerda el servidor para las siguientes tablas
  }

  rl.close();
  console.log('\nHasta luego.');
}

main().catch((err) => {
  console.error('Error inesperado:', err);
  process.exit(1);
});
