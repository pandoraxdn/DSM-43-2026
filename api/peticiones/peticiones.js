#!/usr/bin/env node
/**
 * Carga masiva de lecturas del sensor para pruebas de rendimiento.
 * Genera N lecturas repartidas de forma uniforme a lo largo de UN AÑO COMPLETO
 * y las envía por lotes a:  POST /sensors/consultas/insertar-masivo
 *
 * Requisitos: Node 18+ (usa fetch global). No necesita instalar paquetes.
 * Funciona igual si tu proyecto es CommonJS o ESM (no usa import/require).
 *
 * USO
 *   node insertar-datos.js                      → 500,000 lecturas del 2025
 *   node insertar-datos.js 100000               → 100,000 lecturas
 *   node insertar-datos.js 1000000 --anio=2025  → 1,000,000 lecturas
 *
 * OPCIONES (todas con "=", ej. --lote=500)
 *   --total=N         Lecturas a generar (1 a 1,000,000 recomendado)   [500000]
 *   --anio=AAAA       Año que se cubre, del 1 ene al 31 dic            [2025]
 *   --lote=N          Filas por petición                               [500]
 *   --concurrencia=N  Peticiones simultáneas                           [4]
 *   --reintentos=N    Reintentos por lote ante errores de red/5xx      [5]
 *   --inicio=N        Reanudar desde la fila N (ver mensaje final)     [0]
 *   --url=URL         Endpoint de inserción masiva
 *                     [http://localhost:3000/sensors/consultas/insertar-masivo]
 *
 * LÍMITE DE TAMAÑO DEL BODY
 *   Nest/Express acepta por defecto 100 KB por petición. Con --lote=500 cada
 *   petición pesa ~65 KB y entra. Si quieres lotes mayores (1000+), sube el
 *   límite en main.ts:
 *
 *     const app = await NestFactory.create<NestExpressApplication>(AppModule);
 *     app.useBodyParser('json', { limit: '10mb' });
 *
 * DATOS GENERADOS (coherentes entre sí)
 *   - temperatura_celcius: ciclo anual + ciclo diario + ruido
 *   - temperatura_f     = C * 9/5 + 32
 *   - distancia_cm      : oscila entre 2 y 400 cm con ruido
 *   - distancia_inch    = cm / 2.54
 *   Así `registrosInconsistentes` devuelve 0 filas sobre estos datos.
 */

// ─────────────────────────────────────────────────────────────
// Configuración
// ─────────────────────────────────────────────────────────────
function leerArgs(lista) {
  const out = { _: [] };
  for (const a of lista) {
    const m = /^--([^=]+)=(.*)$/.exec(a);
    if (m) out[m[1]] = m[2];
    else if (!a.startsWith('--')) out._.push(a);
  }
  return out;
}

const args = leerArgs(process.argv.slice(2));
const entero = (v, def) => {
  if (v === undefined) return def;
  const n = Number(String(v).replace(/[_,]/g, ''));
  if (!Number.isInteger(n) || n < 0) {
    console.error(`Valor inválido: "${v}" (se esperaba un entero positivo)`);
    process.exit(1);
  }
  return n;
};

const TOTAL = entero(args.total ?? args._[0], 500_000);
const ANIO = entero(args.anio, 2025);
const LOTE = entero(args.lote, 500);
const CONCURRENCIA = entero(args.concurrencia, 4);
const REINTENTOS = entero(args.reintentos, 5);
const INICIO_IDX = entero(args.inicio, 0);
const URL_INSERT =
  args.url ?? 'http://localhost:3000/sensors/consultas/insertar-masivo';
const URL_TOTAL = URL_INSERT.replace(/insertar-masivo\/?$/, 'total');
const MAX_FALLOS = 20; // si fallan tantos lotes, se aborta

if (TOTAL < 1 || LOTE < 1 || CONCURRENCIA < 1) {
  console.error('--total, --lote y --concurrencia deben ser mayores que 0');
  process.exit(1);
}
if (INICIO_IDX >= TOTAL) {
  console.error('--inicio debe ser menor que --total');
  process.exit(1);
}

// Un año completo repartido en TOTAL lecturas equidistantes
const T0 = Date.UTC(ANIO, 0, 1);
const T1 = Date.UTC(ANIO + 1, 0, 1);
const PASO_MS = (T1 - T0) / TOTAL;
const NUM_LOTES = Math.ceil((TOTAL - INICIO_IDX) / LOTE);

// ─────────────────────────────────────────────────────────────
// Generación de datos
// ─────────────────────────────────────────────────────────────
const r2 = (x) => Math.round(x * 100) / 100;
const limitar = (x, min, max) => Math.min(max, Math.max(min, x));

/** Ruido gaussiano (Box-Muller). */
function gauss() {
  const u = 1 - Math.random();
  const v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function generarLectura(i) {
  const t = T0 + i * PASO_MS;
  const d = new Date(t);
  const diaDelAnio = (t - T0) / 86_400_000;
  const hora = d.getUTCHours() + d.getUTCMinutes() / 60;

  const c = r2(
    limitar(
      22 +
        6 * Math.sin((2 * Math.PI * (diaDelAnio - 80)) / 365) + // estaciones
        5 * Math.sin((2 * Math.PI * (hora - 9)) / 24) + //          día/noche
        gauss() * 0.8, //                                            ruido
      -10,
      50,
    ),
  );
  const cm = r2(
    limitar(
      150 + 90 * Math.sin((2 * Math.PI * t) / (6 * 3_600_000)) + gauss() * 8,
      2,
      400,
    ),
  );

  return {
    fecha: d.toISOString(),
    distancia_cm: cm,
    distancia_inch: r2(cm / 2.54),
    temperatura_celcius: c,
    temperatura_f: r2((c * 9) / 5 + 32),
  };
}

// ─────────────────────────────────────────────────────────────
// Envío
// ─────────────────────────────────────────────────────────────
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

function describirError(e) {
  const causa = e && e.cause ? ` (${e.cause.code || e.cause.message})` : '';
  return `${e && e.message ? e.message : e}${causa}`;
}

async function enviarLote(k) {
  const desde = INICIO_IDX + k * LOTE;
  const hasta = Math.min(TOTAL, desde + LOTE);
  const filas = [];
  for (let i = desde; i < hasta; i++) filas.push(generarLectura(i));
  const cuerpo = JSON.stringify(filas);

  let ultimoError = 'desconocido';
  for (let intento = 0; intento <= REINTENTOS; intento++) {
    if (intento > 0) await dormir(500 * 2 ** (intento - 1));
    try {
      const res = await fetch(URL_INSERT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: cuerpo,
      });
      if (res.ok) {
        await res.arrayBuffer();
        return { ok: true, n: hasta - desde };
      }
      const texto = (await res.text()).slice(0, 200).replace(/\s+/g, ' ');
      ultimoError = `HTTP ${res.status} ${texto}`;
      if (res.status === 413) {
        ultimoError +=
          ' → el lote supera el límite del body. Baja --lote o sube el límite en main.ts (ver encabezado).';
        return { ok: false, fatal: true, desde, hasta, error: ultimoError };
      }
      // Otros 4xx (ruta incorrecta, validación…) fallarían igual siempre: no se reintenta.
      if (res.status >= 400 && res.status < 500) {
        return { ok: false, fatal: true, desde, hasta, error: ultimoError };
      }
    } catch (e) {
      ultimoError = describirError(e);
    }
  }
  return { ok: false, fatal: false, desde, hasta, error: ultimoError };
}

// ─────────────────────────────────────────────────────────────
// Presentación
// ─────────────────────────────────────────────────────────────
const nf = new Intl.NumberFormat('es-MX');
function fmtTiempo(seg) {
  if (!isFinite(seg) || seg < 0) return '--';
  const h = Math.floor(seg / 3600);
  const m = Math.floor((seg % 3600) / 60);
  const s = Math.floor(seg % 60);
  return h ? `${h}h ${m}m` : m ? `${m}m ${s}s` : `${s}s`;
}

// ─────────────────────────────────────────────────────────────
// Ejecución
// ─────────────────────────────────────────────────────────────
async function main() {
  const aInsertar = TOTAL - INICIO_IDX;
  const cadaSeg = ((T1 - T0) / TOTAL / 1000).toFixed(1);
  const pesoLote = Buffer.byteLength(
    JSON.stringify(Array.from({ length: Math.min(LOTE, TOTAL) }, (_, i) => generarLectura(i))),
  );

  console.log('Carga masiva del sensor');
  console.log(`  Endpoint     : ${URL_INSERT}`);
  console.log(`  Periodo      : 1 ene ${ANIO} → 31 dic ${ANIO} (una lectura cada ~${cadaSeg} s)`);
  console.log(`  Lecturas     : ${nf.format(aInsertar)} de ${nf.format(TOTAL)}${INICIO_IDX ? ` (reanudando desde la fila ${nf.format(INICIO_IDX)})` : ''}`);
  console.log(`  Lotes        : ${nf.format(NUM_LOTES)} de ${LOTE} filas (~${Math.round(pesoLote / 1024)} KB c/u), ${CONCURRENCIA} en paralelo`);
  if (pesoLote > 100 * 1024) {
    console.log('  ⚠ Cada lote pesa más de 100 KB (límite por defecto de Express). Si ves HTTP 413, sube el límite en main.ts.');
  }
  console.log('');

  // Verificar que el servidor responde antes de empezar
  let totalAntes = null;
  try {
    const r = await fetch(URL_TOTAL);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    totalAntes = Number(await r.text());
    console.log(`Servidor OK. Registros actuales en la tabla: ${nf.format(totalAntes)}\n`);
  } catch (e) {
    console.error(`No pude conectar con ${URL_TOTAL}: ${describirError(e)}`);
    console.error('¿Está corriendo la app de Nest y es correcta la URL? (usa --url=...)');
    process.exit(1);
  }

  const hechos = new Uint8Array(NUM_LOTES);
  const fallidos = [];
  let filasOk = 0;
  let detener = false;
  let errorFatal = null;
  let siguiente = 0;
  const t0 = performance.now();

  process.on('SIGINT', () => {
    if (detener) process.exit(130);
    detener = true;
    console.log('\nDeteniendo: se terminan los lotes en curso… (Ctrl+C otra vez para forzar)');
  });

  function pintar(final = false) {
    const seg = (performance.now() - t0) / 1000;
    const pct = (filasOk / aInsertar) * 100;
    const vel = filasOk / Math.max(seg, 0.001);
    const eta = (aInsertar - filasOk) / Math.max(vel, 1);
    const llenos = Math.round(pct / 5);
    const barra = '#'.repeat(llenos) + '-'.repeat(20 - llenos);
    const linea =
      `[${barra}] ${pct.toFixed(1)}% | ${nf.format(filasOk)}/${nf.format(aInsertar)}` +
      ` | ${nf.format(Math.round(vel))} filas/s | ${final ? 'tiempo ' + fmtTiempo(seg) : 'ETA ' + fmtTiempo(eta)}` +
      ` | lotes fallidos ${fallidos.length}`;
    process.stdout.write('\r' + linea.padEnd(110));
    if (final) process.stdout.write('\n');
  }
  const timer = setInterval(() => pintar(), 500);

  async function worker() {
    while (!detener) {
      const k = siguiente++;
      if (k >= NUM_LOTES) return;
      const r = await enviarLote(k);
      if (r.ok) {
        hechos[k] = 1;
        filasOk += r.n;
      } else {
        fallidos.push({ lote: k, desde: r.desde, hasta: r.hasta, error: r.error });
        if (r.fatal && !errorFatal) {
          errorFatal = r.error;
          detener = true;
        } else if (fallidos.length >= MAX_FALLOS) {
          errorFatal = errorFatal || `Se acumularon ${MAX_FALLOS} lotes fallidos. Último error: ${r.error}`;
          detener = true;
        }
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCIA }, worker));
  clearInterval(timer);
  pintar(true);

  // ── Resumen ────────────────────────────────────────────────
  const seg = (performance.now() - t0) / 1000;
  console.log('\nResumen');
  console.log(`  Insertadas   : ${nf.format(filasOk)} filas en ${fmtTiempo(seg)} (${nf.format(Math.round(filasOk / Math.max(seg, 0.001)))} filas/s)`);

  try {
    const r = await fetch(URL_TOTAL);
    const despues = Number(await r.text());
    console.log(`  Tabla        : ${nf.format(totalAntes)} → ${nf.format(despues)} registros (+${nf.format(despues - totalAntes)})`);
  } catch (_) {
    /* el conteo final es solo informativo */
  }

  if (errorFatal) console.log(`  Error        : ${errorFatal}`);

  const pendientes = hechos.indexOf(0);
  if (pendientes !== -1) {
    const filaReanudar = INICIO_IDX + pendientes * LOTE;
    console.log(`  Faltan lotes : ${nf.format(NUM_LOTES - hechos.reduce((a, b) => a + b, 0))}`);
    console.log('\nPara reanudar (puede repetir filas de lotes que sí se alcanzaron a insertar):');
    console.log(`  node insertar-datos.js --total=${TOTAL} --anio=${ANIO} --lote=${LOTE} --inicio=${filaReanudar} --url=${URL_INSERT}`);

    if (fallidos.length) {
      const fs = await import('node:fs');
      const archivo = `lotes-fallidos-${Date.now()}.json`;
      fs.writeFileSync(archivo, JSON.stringify(fallidos, null, 2));
      console.log(`\nDetalle de lotes fallidos guardado en ${archivo}`);
    }
    process.exitCode = 1;
  } else {
    console.log('\nListo: todos los lotes se insertaron.');
  }
}

main().catch((e) => {
  console.error('\nError inesperado:', e);
  process.exit(1);
});
