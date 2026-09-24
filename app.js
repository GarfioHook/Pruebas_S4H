/* ==========================================================================
   Portal de Reporte de Pruebas SAP S/4HANA — Grupo Portland
   Logica de aplicacion, interfaz SPA y modulo simulador.
   Tres archivos: index.html, app.js, estilos.css
   ========================================================================== */

// Constantes de configuracion de entorno
const SIMULADO = false;
const ENDPOINT = 'https://script.google.com/macros/s/AKfycby3uT6zHS57_LRTeEM6JJYFkC9ZMuzBBaCO4ljzo-dk8oamvH8jQkX3r5ageRTrPiNl1g/exec';

// Catalogo de tipos de documento oficiales (espejo de hoja TIPOS_DOC)
const LISTA_TIPOS_DOC = [
  { "codigo": "SOLPED", "nombre": "Solicitud de pedido", "modulo": "MM", "tx": "ME51N", "patron": "^1\\d{7}$", "orden": 1 },
  { "codigo": "PEDIDO_COMPRA", "nombre": "Pedido de compra", "modulo": "MM", "tx": "ME21N / ME22N", "patron": "^45\\d{8}$", "orden": 2 },
  { "codigo": "ENTRADA_MERC", "nombre": "Entrada de mercancías", "modulo": "MM", "tx": "MIGO", "patron": "^50\\d{8}$", "orden": 3 },
  { "codigo": "DOC_MATERIAL", "nombre": "Documento de material", "modulo": "MM", "tx": "MIGO / MB51", "patron": "^49\\d{8}$", "orden": 4 },
  { "codigo": "FACTURA_PROV", "nombre": "Factura de proveedor", "modulo": "MM", "tx": "MIRO", "patron": "^51\\d{8}$", "orden": 5 },
  { "codigo": "TRASLADO", "nombre": "Traslado entre almacenes", "modulo": "MM", "tx": "MIGO", "patron": null, "orden": 6 },
  { "codigo": "RESERVA", "nombre": "Reserva de material", "modulo": "MM", "tx": "MB21", "patron": null, "orden": 7 },
  { "codigo": "PEDIDO_VENTA", "nombre": "Pedido de venta", "modulo": "SD", "tx": "VA01 / VA02", "patron": "^\\d{10}$", "orden": 8 },
  { "codigo": "CONTRATO", "nombre": "Contrato marco de venta", "modulo": "SD", "tx": "VA41 / VA42", "patron": null, "orden": 9 },
  { "codigo": "ENTREGA", "nombre": "Entrega de salida", "modulo": "SD", "tx": "VL01N / VL02N", "patron": "^8\\d{9}$", "orden": 10 },
  { "codigo": "FACTURA", "nombre": "Factura de venta", "modulo": "SD", "tx": "VF01 / VF04", "patron": "^9\\d{9}$", "orden": 11 },
  { "codigo": "NOTA_CREDITO", "nombre": "Nota de crédito", "modulo": "SD", "tx": "VF01", "patron": null, "orden": 12 },
  { "codigo": "NOTA_DEBITO", "nombre": "Nota de débito", "modulo": "SD", "tx": "VF01", "patron": null, "orden": 13 },
  { "codigo": "GUIA", "nombre": "Guía de despacho", "modulo": "SD", "tx": "VL01N / DRC", "patron": null, "orden": 14 },
  { "codigo": "FOLIO_DTE", "nombre": "Folio de documento electrónico", "modulo": "SD", "tx": "DRC", "patron": null, "orden": 15 },
  { "codigo": "DOC_CONTABLE", "nombre": "Documento contable", "modulo": "FICO", "tx": "FB03", "patron": "^\\d{10}$", "orden": 16 },
  { "codigo": "PAGO", "nombre": "Documento de pago", "modulo": "FICO", "tx": "F110 / F-53", "patron": null, "orden": 17 },
  { "codigo": "CORRIDA_PAGO", "nombre": "Corrida de pagos", "modulo": "FICO", "tx": "F110", "patron": null, "orden": 18 },
  { "codigo": "COBRO", "nombre": "Documento de cobro", "modulo": "FICO", "tx": "F-28", "patron": null, "orden": 19 },
  { "codigo": "CASO_CREDITO", "nombre": "Caso de crédito", "modulo": "FICO", "tx": "UKM_CASE", "patron": null, "orden": 20 },
  { "codigo": "ACTIVO_FIJO", "nombre": "Activo fijo", "modulo": "FICO", "tx": "AS01 / AFAB", "patron": null, "orden": 21 },
  { "codigo": "ORDEN_PROD", "nombre": "Orden de producción", "modulo": "MM", "tx": "CO01 / KO88", "patron": "^\\d{12}$", "orden": 22 },
  { "codigo": "ORDEN_TRANS", "nombre": "Orden de transporte (WMS)", "modulo": "EWM", "tx": "LT03 / WMS", "patron": null, "orden": 23 },
  { "codigo": "TAREA_ALMACEN", "nombre": "Tarea de almacén (WMS)", "modulo": "EWM", "tx": "WMS", "patron": null, "orden": 24 },
  { "codigo": "INVENTARIO", "nombre": "Documento de inventario físico", "modulo": "EWM", "tx": "MI01 / MI07", "patron": null, "orden": 25 },
  { "codigo": "BP", "nombre": "Interlocutor comercial (BP)", "modulo": "MD", "tx": "BP", "patron": null, "orden": 26 },
];

// Catálogo oficial de Sociedades (FI) Grupo Portland
const LISTA_SOCIEDADES = [
  { codigo: 'CL11', pais: 'Chile', nombre: 'Distribuidora Portland S.A.' },
  { codigo: 'CL12', pais: 'Chile', nombre: 'EPOXA S.A.' },
  { codigo: 'CL13', pais: 'Chile', nombre: 'Portland Terminales Marítimos SpA' },
  { codigo: 'CL14', pais: 'Chile', nombre: 'Perez & Jacard S.A' },
  { codigo: 'CL15', pais: 'Chile', nombre: 'DP Noviciado S.A' },
  { codigo: 'CL16', pais: 'Chile', nombre: 'PJ Portland SpA' },
  { codigo: 'PE11', pais: 'Perú', nombre: 'Portland Perú SAC' },
  { codigo: 'CO11', pais: 'Colombia', nombre: 'Portland Colombia SAS' }
];

// Usuarios cargados para modo simulado (espejo de hoja USUARIOS)
const LISTA_USUARIOS_SIMULADOS = [
  {
    "email": "gsalinas@pjportland.cl",
    "nombre": "GABRIEL SALINAS",
    "rol": "LIDER",
    "areas": "",
    "modulos": "",
    "sociedad": "CL11",
    "estado": "ACTIVO",
    "cargo": "LIDER DE IMPLEMENTACION",
    "departamento origen": "TI",
    "departamento": "TI / GESTION"
  },
  {
    "email": "gsalinas@pjportland.com",
    "nombre": "GABRIEL SALINAS",
    "rol": "LIDER",
    "areas": "",
    "modulos": "",
    "sociedad": "CL11",
    "estado": "ACTIVO",
    "cargo": "LIDER DE IMPLEMENTACION",
    "departamento origen": "TI",
    "departamento": "TI / GESTION"
  },
  {
    "email": "garfiohook@gmail.com",
    "nombre": "GABRIEL SALINAS (ADMIN)",
    "rol": "LIDER",
    "areas": "",
    "modulos": "",
    "sociedad": "CL11",
    "estado": "ACTIVO",
    "cargo": "ADMINISTRADOR",
    "departamento origen": "TI",
    "departamento": "TI / GESTION"
  },
  {
    "email": "arestrepo@pjportland.com",
    "nombre": "ANGELA RESTREPO",
    "rol": "KEY_USER",
    "areas": "APROBADOR, COMERCIAL",
    "modulos": "",
    "sociedad": "CO11",
    "estado": "ACTIVO",
    "cargo": "KAM ALIMENTOS",
    "departamento origen": "COMERCIAL",
    "departamento": "COMERCIAL"
  },
  {
    "email": "dtrujillo@pjportland.com",
    "nombre": "DIANA TRUJILLO",
    "rol": "KEY_USER",
    "areas": "APROBADOR, COMERCIAL",
    "modulos": "",
    "sociedad": "CO11",
    "estado": "ACTIVO",
    "cargo": "GERENTE COMERCIAL COATINGS Y ACEITES",
    "departamento origen": "COMERCIAL",
    "departamento": "COMERCIAL"
  },
  {
    "email": "lcaro@pjportland.com",
    "nombre": "LINA CARO",
    "rol": "KEY_USER",
    "areas": "APROBADOR, COMERCIAL",
    "modulos": "",
    "sociedad": "CO11",
    "estado": "ACTIVO",
    "cargo": "KAM QUIMICOS INDUSTRIALES",
    "departamento origen": "COMERCIAL",
    "departamento": "COMERCIAL"
  },
  {
    "email": "mstambuk@pjportland.com",
    "nombre": "MIRA STAMBUK",
    "rol": "KEY_USER",
    "areas": "APROBADOR, COMERCIAL",
    "modulos": "",
    "sociedad": "CO11",
    "estado": "ACTIVO",
    "cargo": "JEFE VENTAS ALIMENTOS Y QUIMICOS IND",
    "departamento origen": "COMERCIAL",
    "departamento": "COMERCIAL"
  },
  {
    "email": "rposada@pjportland.com",
    "nombre": "RAFAEL POSADA",
    "rol": "KEY_USER",
    "areas": "APROBADOR, COMERCIAL",
    "modulos": "",
    "sociedad": "CO11",
    "estado": "ACTIVO",
    "cargo": "KAM PLASTICOS",
    "departamento origen": "COMERCIAL",
    "departamento": "COMERCIAL"
  },
  {
    "email": "ssaavedra@pjportland.com",
    "nombre": "SANTIAGO SAAVEDRA",
    "rol": "KEY_USER",
    "areas": "APROBADOR, COMERCIAL",
    "modulos": "",
    "sociedad": "CO11",
    "estado": "ACTIVO",
    "cargo": "KAM COATINGS Y ACEITES",
    "departamento origen": "COMERCIAL",
    "departamento": "COMERCIAL"
  },
  {
    "email": "ccastiblanco@pjportland.com",
    "nombre": "CAMILA CASTIBLANCO",
    "rol": "KEY_USER",
    "areas": "CONTABILIDAD",
    "modulos": "",
    "sociedad": "CO11",
    "estado": "ACTIVO",
    "cargo": "CONTADORA",
    "departamento origen": "CONTABILIDAD",
    "departamento": "CONTABILIDAD"
  },
  {
    "email": "mladino@pjportland.com",
    "nombre": "MIGUEL ANGEL LADINO",
    "rol": "KEY_USER",
    "areas": "CONTABILIDAD",
    "modulos": "",
    "sociedad": "CO11",
    "estado": "ACTIVO",
    "cargo": "ANALISTA CONTABLE",
    "departamento origen": "CONTABILIDAD",
    "departamento": "CONTABILIDAD"
  },
  {
    "email": "mperez@pjportland.com",
    "nombre": "MARGARETH PEREZ",
    "rol": "KEY_USER",
    "areas": "CONTABILIDAD",
    "modulos": "",
    "sociedad": "CO11",
    "estado": "ACTIVO",
    "cargo": "JEFE ADMINISTRACION",
    "departamento origen": "CONTABILIDAD",
    "departamento": "CONTABILIDAD"
  },
  {
    "email": "ffernandez@pjportland.com",
    "nombre": "FELIPE FERNANDEZ",
    "rol": "KEY_USER",
    "areas": "FINANZAS",
    "modulos": "",
    "sociedad": "CO11",
    "estado": "ACTIVO",
    "cargo": "JEFE FINANZAS Y ADMINISTRACION",
    "departamento origen": "FINANZAS",
    "departamento": "FINANZAS"
  },
  {
    "email": "agarcia@pjportland.com",
    "nombre": "ANDRES GARCIA",
    "rol": "KEY_USER",
    "areas": "APROBADOR, COMEX, OPERACIONES",
    "modulos": "",
    "sociedad": "CO11",
    "estado": "ACTIVO",
    "cargo": "JEFE LOGISTICA Y COMEX",
    "departamento origen": "OPERACIONES Y COMEX",
    "departamento": "OPERACIONES Y COMEX"
  },
  {
    "email": "sperez@pjportland.com",
    "nombre": "SERGIO PEREZ",
    "rol": "KEY_USER",
    "areas": "APROBADOR, COMEX, OPERACIONES",
    "modulos": "",
    "sociedad": "CO11",
    "estado": "ACTIVO",
    "cargo": "ANALISTA LOGISTICA Y COMEX",
    "departamento origen": "OPERACIONES Y COMEX",
    "departamento": "OPERACIONES Y COMEX"
  },
  {
    "email": "asanz@pjportland.cl",
    "nombre": "ALEJANDRA SANZ",
    "rol": "KEY_USER",
    "areas": "CREDITO Y COBRANZAS",
    "modulos": "",
    "sociedad": "CL13",
    "estado": "ACTIVO",
    "cargo": "SUBGERENTE DE RIESGO",
    "departamento origen": "CREDITO Y COBRANZAS",
    "departamento": "CREDITO Y COBRANZAS"
  },
  {
    "email": "lvalenzuela@pjportland.cl",
    "nombre": "LINDA VALENZUELA",
    "rol": "KEY_USER",
    "areas": "APROBADOR, COMEX",
    "modulos": "",
    "sociedad": "CL13",
    "estado": "ACTIVO",
    "cargo": "COMEX",
    "departamento origen": "COMEX",
    "departamento": "COMEX"
  },
  {
    "email": "kbello@pjportland.cl",
    "nombre": "KARINA BELLO",
    "rol": "KEY_USER",
    "areas": "APROBADOR, COMEX",
    "modulos": "",
    "sociedad": "CL11, CL13",
    "estado": "ACTIVO",
    "cargo": "JEFE COMEX / ENCARGADA FACTURACION TRADING",
    "departamento origen": "COMEX",
    "departamento": "COMEX"
  },
  {
    "email": "rmaldonado@pjportland.cl",
    "nombre": "ROMY DELGADO",
    "rol": "KEY_USER",
    "areas": "OPERACIONES",
    "modulos": "",
    "sociedad": "CL13",
    "estado": "ACTIVO",
    "cargo": "JEFE DE OPERACIONES",
    "departamento origen": "OPERACIONES",
    "departamento": "OPERACIONES"
  },
  {
    "email": "ldelgado@pjportland.cl",
    "nombre": "LUIS DELGADO",
    "rol": "KEY_USER",
    "areas": "CONTABILIDAD",
    "modulos": "",
    "sociedad": "CL13",
    "estado": "ACTIVO",
    "cargo": "ANALISTA CONTABLE",
    "departamento origen": "CONTABILIDAD",
    "departamento": "CONTABILIDAD"
  },
  {
    "email": "hriveros@pjportland.cl",
    "nombre": "HUGO RIVEROS",
    "rol": "KEY_USER",
    "areas": "CONTABILIDAD",
    "modulos": "",
    "sociedad": "CL13",
    "estado": "ACTIVO",
    "cargo": "JEFE CONTABILIDAD",
    "departamento origen": "CONTABILIDAD",
    "departamento": "CONTABILIDAD"
  },
  {
    "email": "mthomas@pjportland.cl",
    "nombre": "MARIANNE THOMAS",
    "rol": "KEY_USER",
    "areas": "APROBADOR, COMERCIAL",
    "modulos": "",
    "sociedad": "CL11",
    "estado": "ACTIVO",
    "cargo": "PLANNER ALIMENTOS",
    "departamento origen": "COMERCIAL",
    "departamento": "COMERCIAL"
  },
  {
    "email": "mvega@pjportland.cl",
    "nombre": "MACARENA VEGA",
    "rol": "KEY_USER",
    "areas": "APROBADOR, COMERCIAL",
    "modulos": "",
    "sociedad": "CL11",
    "estado": "ACTIVO",
    "cargo": "KAM ALIMENTOS",
    "departamento origen": "COMERCIAL",
    "departamento": "COMERCIAL"
  },
  {
    "email": "lpina@pjportland.cl",
    "nombre": "LORETO PIÑA",
    "rol": "KEY_USER",
    "areas": "APROBADOR, COMERCIAL",
    "modulos": "",
    "sociedad": "CL11",
    "estado": "ACTIVO",
    "cargo": "PLANNER PLASTICOS",
    "departamento origen": "COMERCIAL",
    "departamento": "COMERCIAL"
  },
  {
    "email": "fvargas@pjportland.cl",
    "nombre": "FRANCISCO VARGAS",
    "rol": "KEY_USER",
    "areas": "APROBADOR, COMERCIAL",
    "modulos": "",
    "sociedad": "CL11",
    "estado": "ACTIVO",
    "cargo": "PLANNER COATINGS",
    "departamento origen": "COMERCIAL",
    "departamento": "COMERCIAL"
  },
  {
    "email": "itoro@pjportland.cl",
    "nombre": "ISABELA TORO",
    "rol": "KEY_USER",
    "areas": "APROBADOR, COMERCIAL",
    "modulos": "",
    "sociedad": "CL11",
    "estado": "ACTIVO",
    "cargo": "PM POLIURETANOS",
    "departamento origen": "COMERCIAL",
    "departamento": "COMERCIAL"
  },
  {
    "email": "akahn@pjportland.cl",
    "nombre": "ALEJANDRO KAHN",
    "rol": "KEY_USER",
    "areas": "APROBADOR, COMERCIAL",
    "modulos": "",
    "sociedad": "CL11",
    "estado": "ACTIVO",
    "cargo": "GERENTE QUIMICOS INDUSTRIALES",
    "departamento origen": "COMERCIAL",
    "departamento": "COMERCIAL"
  },
  {
    "email": "amacan@pjportland.cl",
    "nombre": "ALEJANDRA MACAN",
    "rol": "KEY_USER",
    "areas": "APROBADOR, COMERCIAL",
    "modulos": "",
    "sociedad": "CL11",
    "estado": "ACTIVO",
    "cargo": "KAM QUIMICOS INDUSTRIALES",
    "departamento origen": "COMERCIAL",
    "departamento": "COMERCIAL"
  },
  {
    "email": "rpupkin@pjportland.cl",
    "nombre": "ROBERTO PUPKIN",
    "rol": "KEY_USER",
    "areas": "APROBADOR, COMERCIAL",
    "modulos": "",
    "sociedad": "CL11",
    "estado": "ACTIVO",
    "cargo": "PM QUIMICOS INDUSTRIALES",
    "departamento origen": "COMERCIAL",
    "departamento": "COMERCIAL"
  },
  {
    "email": "lgamboa@pjportland.cl",
    "nombre": "LORETO GAMBOA",
    "rol": "KEY_USER",
    "areas": "APROBADOR, COMERCIAL",
    "modulos": "",
    "sociedad": "CL11",
    "estado": "ACTIVO",
    "cargo": "KAM QUIMICOS INDUSTRIALES",
    "departamento origen": "COMERCIAL",
    "departamento": "COMERCIAL"
  },
  {
    "email": "pleon@pjportland.cl",
    "nombre": "PABLO LEÓN",
    "rol": "KEY_USER",
    "areas": "APROBADOR, COMERCIAL",
    "modulos": "",
    "sociedad": "CL11",
    "estado": "ACTIVO",
    "cargo": "GERENTE MINERÍA",
    "departamento origen": "COMERCIAL",
    "departamento": "COMERCIAL"
  },
  {
    "email": "mcortes@pjportland.cl",
    "nombre": "MIGUEL CORTES",
    "rol": "KEY_USER",
    "areas": "APROBADOR, COMERCIAL",
    "modulos": "",
    "sociedad": "CL11",
    "estado": "ACTIVO",
    "cargo": "KAM FARMA Y COSMETICOS",
    "departamento origen": "COMERCIAL",
    "departamento": "COMERCIAL"
  },
  {
    "email": "ksepulveda@pjportland.cl",
    "nombre": "KATHERINE SEPULVEDA",
    "rol": "KEY_USER",
    "areas": "OPERACIONES",
    "modulos": "",
    "sociedad": "CL11",
    "estado": "ACTIVO",
    "cargo": "ENCARGADA RECEPCION Y ALMACENAJE",
    "departamento origen": "OPERACIONES",
    "departamento": "OPERACIONES"
  },
  {
    "email": "preyes@pjportland.cl",
    "nombre": "PRISCILA REYES",
    "rol": "KEY_USER",
    "areas": "OPERACIONES",
    "modulos": "",
    "sociedad": "CL11",
    "estado": "ACTIVO",
    "cargo": "ENCARGADA RECEPCION Y ALMACENAJE",
    "departamento origen": "OPERACIONES",
    "departamento": "OPERACIONES"
  },
  {
    "email": "mgonzalez@pjportland.cl",
    "nombre": "MANUEL GONZALEZ",
    "rol": "KEY_USER",
    "areas": "OPERACIONES",
    "modulos": "",
    "sociedad": "CL11",
    "estado": "ACTIVO",
    "cargo": "ENCARGADO PICKING Y DESPACHO",
    "departamento origen": "OPERACIONES",
    "departamento": "OPERACIONES"
  },
  {
    "email": "carce@pjportland.cl",
    "nombre": "CAMILA ARCE",
    "rol": "KEY_USER",
    "areas": "OPERACIONES",
    "modulos": "",
    "sociedad": "CL11",
    "estado": "ACTIVO",
    "cargo": "ENCARGADA FACTURACION DISTRIBUCION LOCAL",
    "departamento origen": "OPERACIONES",
    "departamento": "OPERACIONES"
  },
  {
    "email": "amunoz@pjportland.cl",
    "nombre": "ALEJANDRA MUÑOZ",
    "rol": "KEY_USER",
    "areas": "OPERACIONES",
    "modulos": "",
    "sociedad": "CL11",
    "estado": "ACTIVO",
    "cargo": "ENCARGADA FACTURACION DISTRIBUCION LOCAL",
    "departamento origen": "OPERACIONES",
    "departamento": "OPERACIONES"
  },
  {
    "email": "ltorres@pjportland.cl",
    "nombre": "LUCAS TORRES",
    "rol": "KEY_USER",
    "areas": "OPERACIONES",
    "modulos": "",
    "sociedad": "CL11",
    "estado": "ACTIVO",
    "cargo": "ENCARGADO GRANELES",
    "departamento origen": "OPERACIONES",
    "departamento": "OPERACIONES"
  },
  {
    "email": "sugarte@pjportland.cl",
    "nombre": "SANDRA UGARTE",
    "rol": "KEY_USER",
    "areas": "OPERACIONES",
    "modulos": "",
    "sociedad": "CL11",
    "estado": "ACTIVO",
    "cargo": "ENCARGADA PLANTA PSA (PROCESO COMPLETO)",
    "departamento origen": "OPERACIONES",
    "departamento": "OPERACIONES"
  },
  {
    "email": "jmunoz@pjportland.cl",
    "nombre": "JONATHAN MUÑOZ",
    "rol": "KEY_USER",
    "areas": "FACTURACION",
    "modulos": "",
    "sociedad": "CL11",
    "estado": "ACTIVO",
    "cargo": "ADMINISTRACION VENTAS",
    "departamento origen": "ADMINISTRACION VENTAS",
    "departamento": "ADMINISTRACION VENTAS"
  },
  {
    "email": "eleyton@pjportland.cl",
    "nombre": "EVELYN LEYTON",
    "rol": "KEY_USER",
    "areas": "APROBADOR, COMEX",
    "modulos": "",
    "sociedad": "CL11",
    "estado": "ACTIVO",
    "cargo": "ENCARGADA FACTURACION TRADING",
    "departamento origen": "COMEX",
    "departamento": "COMEX"
  },
  {
    "email": "amagini@pjportland.cl",
    "nombre": "ANDRES MAGINI",
    "rol": "KEY_USER",
    "areas": "OPERACIONES",
    "modulos": "",
    "sociedad": "CL11",
    "estado": "ACTIVO",
    "cargo": "GERENTE INFRAESTRUCTURA Y PROYECTOS",
    "departamento origen": "PROYECTOS",
    "departamento": "PROYECTOS"
  },
  {
    "email": "aaracena@pjportland.cl",
    "nombre": "ANA MARIA ARACENA",
    "rol": "KEY_USER",
    "areas": "FINANZAS",
    "modulos": "",
    "sociedad": "CL11",
    "estado": "ACTIVO",
    "cargo": "TESORERA",
    "departamento origen": "TESORERIA",
    "departamento": "TESORERIA"
  },
  {
    "email": "fsanmartin@pjportland.cl",
    "nombre": "FERNANDA SAN MARTIN",
    "rol": "KEY_USER",
    "areas": "FINANZAS",
    "modulos": "",
    "sociedad": "CL14",
    "estado": "ACTIVO",
    "cargo": "FACTURACION INDENT",
    "departamento origen": "FINANZAS",
    "departamento": "FINANZAS"
  },
  {
    "email": "cbaeza@pjportland.cl",
    "nombre": "CAROLINA BAEZA",
    "rol": "KEY_USER",
    "areas": "CREDITO Y COBRANZAS",
    "modulos": "",
    "sociedad": "CL14",
    "estado": "ACTIVO",
    "cargo": "FACTURACION ARRIENDOS Y SERVICIOS",
    "departamento origen": "CREDITO Y COBRANZAS",
    "departamento": "CREDITO Y COBRANZAS"
  },
  {
    "email": "aarancibia@pjportland.cl",
    "nombre": "ALEJANDRO ARANCIBIA",
    "rol": "KEY_USER",
    "areas": "APROBADOR, COMERCIAL",
    "modulos": "",
    "sociedad": "CL12",
    "estado": "ACTIVO",
    "cargo": "GERENTE DIVISION EPOXA",
    "departamento origen": "COMERCIAL",
    "departamento": "COMERCIAL"
  },
  {
    "email": "plopez@pjportland.cl",
    "nombre": "PAMELA LOPEZ",
    "rol": "KEY_USER",
    "areas": "APROBADOR, COMERCIAL",
    "modulos": "",
    "sociedad": "CL12",
    "estado": "ACTIVO",
    "cargo": "ASISTENTE VENTAS EPOXA",
    "departamento origen": "COMERCIAL",
    "departamento": "COMERCIAL"
  },
  {
    "email": "parista@pjportland.com",
    "nombre": "PATRICIA ARISTA",
    "rol": "KEY_USER",
    "areas": "FINANZAS",
    "modulos": "",
    "sociedad": "PE11",
    "estado": "ACTIVO",
    "cargo": "JEFE FINANZAS",
    "departamento origen": "FINANZAS",
    "departamento": "FINANZAS"
  },
  {
    "email": "jangeles@pjportland.com",
    "nombre": "JUAN JOSE ANGELES",
    "rol": "KEY_USER",
    "areas": "OPERACIONES",
    "modulos": "",
    "sociedad": "PE11",
    "estado": "ACTIVO",
    "cargo": "ASISTENTE DE OPERACIONES",
    "departamento origen": "OPERACIONES",
    "departamento": "OPERACIONES"
  },
  {
    "email": "lquiquen@pjportland.com",
    "nombre": "LILIANA QUIQUEN",
    "rol": "KEY_USER",
    "areas": "CONTABILIDAD",
    "modulos": "",
    "sociedad": "PE11",
    "estado": "ACTIVO",
    "cargo": "JEFE CONTABILIDAD",
    "departamento origen": "CONTABILIDAD",
    "departamento": "CONTABILIDAD"
  },
  {
    "email": "vvasquez@pjportland.com",
    "nombre": "VIRGINIA VASQUEZ",
    "rol": "KEY_USER",
    "areas": "FACTURACION",
    "modulos": "",
    "sociedad": "PE11",
    "estado": "ACTIVO",
    "cargo": "ASISTENTE CREDITO Y COBRANZA",
    "departamento origen": "FACTURACION",
    "departamento": "FACTURACION"
  },
  {
    "email": "kroman@pjportland.com",
    "nombre": "KASSANDRA ROMAN",
    "rol": "KEY_USER",
    "areas": "APROBADOR, COMEX",
    "modulos": "",
    "sociedad": "PE11",
    "estado": "ACTIVO",
    "cargo": "ASISTENTE COMEX",
    "departamento origen": "COMEX",
    "departamento": "COMEX"
  },
  {
    "email": "ljara@pjportland.cl",
    "nombre": "LEANDRO JARA",
    "rol": "EQUIPO_PROYECTO",
    "areas": "",
    "modulos": "MM, SD, FICO, EWM, CFG",
    "sociedad": "",
    "estado": "ACTIVO",
    "cargo": "MODULO MM",
    "departamento origen": "TI",
    "departamento": "TI"
  },
  {
    "email": "hcorrea@pjportland.cl",
    "nombre": "HECTOR CORREA",
    "rol": "EQUIPO_PROYECTO",
    "areas": "",
    "modulos": "MM, SD, FICO, EWM, CFG",
    "sociedad": "",
    "estado": "ACTIVO",
    "cargo": "MODULO SD",
    "departamento origen": "TI",
    "departamento": "TI"
  },
  {
    "email": "osella@pjportland.cl",
    "nombre": "OSCAR SELLA",
    "rol": "EQUIPO_PROYECTO",
    "areas": "",
    "modulos": "MM, SD, FICO, EWM, CFG",
    "sociedad": "",
    "estado": "ACTIVO",
    "cargo": "MODULO FICO",
    "departamento origen": "TI",
    "departamento": "TI"
  },
  {
    "email": "dcorrea@pjportland.cl",
    "nombre": "DANIELA CORREA",
    "rol": "EQUIPO_PROYECTO",
    "areas": "",
    "modulos": "MM, SD, FICO, EWM, CFG",
    "sociedad": "",
    "estado": "ACTIVO",
    "cargo": "MODULO FICO",
    "departamento origen": "CONTABILIDAD",
    "departamento": "CONTABILIDAD"
  }
];

/* ==========================================================================
   MODULO SIMULADOR (MockApi)
   Reemplaza el backend de Apps Script cuando SIMULADO === true.
   No tocar: permite desarrollar y probar sin conexion con la planilla real.
   ========================================================================== */
const MockApi = (function() {
  const STORAGE_KEYS = {
    RESULTADOS: 'portland_sap_resultados',
    DOCUMENTOS: 'portland_sap_documentos',
    INCIDENCIAS: 'portland_sap_incidencias',
    BITACORA: 'portland_sap_bitacora',
    CONFIG: 'portland_sap_config'
  };

  function obtenerConfig() {
    const guardada = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (guardada) {
      try { return JSON.parse(guardada); } catch(e) {}
    }
    return {
      ciclo_activo: 1,
      golive_activo: 'GL1',
      ambiente: 'QAS-200',
      abierto: 'SI',
      version_catalogo: '8.0'
    };
  }

  function obtenerColeccion(key) {
    const s = localStorage.getItem(key);
    if (s) {
      try { return JSON.parse(s); } catch(e) {}
    }
    return [];
  }

  function guardarColeccion(key, items) {
    localStorage.setItem(key, JSON.stringify(items));
  }

  function inicializarSiEsNecesario() {
    const resultados = obtenerColeccion(STORAGE_KEYS.RESULTADOS);
    if (resultados.length === 0) {
      const rInicial = {
        id: 'R-EJEMPLO-0001',
        ts: '2026-09-23 09:30:00',
        tipo: 'E2E',
        objeto: 'E2E-01',
        resultado: 'OK',
        paso: null,
        comentario: 'Prueba de humo inicial en ambiente QAS-200.',
        documentos: 'Pedido de venta 4500001234 · Entrega 8000004321',
        email: 'arestrepo@pjportland.com',
        alcance: 'ASIGNADA',
        ciclo: 1,
        golive: 'GL1',
        ambiente: 'QAS-200',
        incidencia: null
      };
      const d1 = {
        id: 'D-000001',
        resultado_id: 'R-EJEMPLO-0001',
        tipo: 'PEDIDO_VENTA',
        numero: '4500001234',
        sociedad: 'CL11',
        ejercicio: 2026,
        tipo_objeto: 'E2E',
        objeto: 'E2E-01',
        paso: 1,
        email: 'arestrepo@pjportland.com',
        ts: '2026-09-23 09:30:00',
        ciclo: 1,
        golive: 'GL1'
      };
      const d2 = {
        id: 'D-000002',
        resultado_id: 'R-EJEMPLO-0001',
        tipo: 'ENTREGA',
        numero: '8000004321',
        sociedad: 'CL11',
        ejercicio: 2026,
        tipo_objeto: 'E2E',
        objeto: 'E2E-01',
        paso: 2,
        email: 'arestrepo@pjportland.com',
        ts: '2026-09-23 09:30:00',
        ciclo: 1,
        golive: 'GL1'
      };
      guardarColeccion(STORAGE_KEYS.RESULTADOS, [rInicial]);
      guardarColeccion(STORAGE_KEYS.DOCUMENTOS, [d1, d2]);
    }
  }

  inicializarSiEsNecesario();

  return {
    async despachar(accion, datos, usuarioActual) {
      const config = obtenerConfig();

      if (accion === 'login') {
        const email = String(datos.email || '').trim().toLowerCase();
        const usuario = LISTA_USUARIOS_SIMULADOS.find(u => u.email.toLowerCase() === email);
        if (!usuario) {
          throw new Error('El correo ingresado no figura en la lista de usuarios habilitados. Solicite su alta al lider de implementacion (Gabriel Salinas).');
        }
        if (usuario.estado !== 'ACTIVO') {
          throw new Error('El usuario se encuentra INACTIVO en la planilla. Contacte al lider de implementacion.');
        }
        return {
          token: 'token-simulado-' + btoa(email) + '-' + Date.now(),
          perfil: usuario,
          config: config
        };
      }

      if (accion === 'estado') {
        const todosResultados = obtenerColeccion(STORAGE_KEYS.RESULTADOS);
        const delCiclo = todosResultados.filter(r => Number(r.ciclo) === Number(config.ciclo_activo));
        return {
          resultados: delCiclo,
          config: config
        };
      }

      if (accion === 'reportar') {
        if (config.abierto !== 'SI') {
          throw new Error('El portal se encuentra cerrado temporalmente para registro. Modo solo lectura.');
        }

        const resultados = obtenerColeccion(STORAGE_KEYS.RESULTADOS);
        const documentos = obtenerColeccion(STORAGE_KEYS.DOCUMENTOS);
        const incidencias = obtenerColeccion(STORAGE_KEYS.INCIDENCIAS);
        const bitacora = obtenerColeccion(STORAGE_KEYS.BITACORA);

        // Regla 5: Idempotencia por id generado en cliente
        const existe = resultados.find(r => r.id === datos.id);
        if (existe) {
          return { id: existe.id, incidencia: existe.incidencia, documentos: datos.documentos ? datos.documentos.length : 0 };
        }

        // Determinar alcance: ASIGNADA o APOYO segun usuario reportante (§5.2 y §5.5)
        const perfil = usuarioActual || { email: datos.email || 'usuario@portland.com', areas: '', modulos: '', rol: 'KEY_USER' };
        let esAsignada = false;

        if (perfil.rol === 'LIDER') {
          esAsignada = true;
        } else if (datos.tipo === 'CU') {
          const modulosUser = (perfil.modulos || '').split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
          esAsignada = modulosUser.length === 0 || modulosUser.includes(String(datos.moduloPrueba || '').toUpperCase());
        } else if (datos.tipo === 'E2E') {
          const areasUser = (perfil.areas || '').split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
          const areasPrueba = (datos.areasPrueba || []).map(s => String(s).trim().toUpperCase());
          esAsignada = areasUser.length === 0 || areasPrueba.some(a => areasUser.includes(a));
        }

        const alcanceFinal = esAsignada ? 'ASIGNADA' : 'APOYO';

        // Resumen legible de documentos
        const docsLista = Array.isArray(datos.documentos) ? datos.documentos : [];
        const resumenDocs = docsLista.map(d => {
          const t = LISTA_TIPOS_DOC.find(x => x.codigo === d.tipo);
          const label = t ? t.nombre : d.tipo;
          return `${label} ${d.numero}`;
        }).join(' · ');

        let idIncidenciaCreada = null;
        if (datos.resultado === 'NOK' && datos.incidencia) {
          const correlativoInc = incidencias.length + 1;
          idIncidenciaCreada = 'INC-' + String(correlativoInc).padStart(4, '0');
          const transaccion = String(datos.incidencia.transaccion || '').trim().toUpperCase();
          const sociedad = String(datos.incidencia.sociedad || perfil.sociedad || 'CL11').trim().toUpperCase();
          let detalleFinal = datos.incidencia.detalle || '';
          if (transaccion || sociedad) {
            const prefijo = '[Tx: ' + (transaccion || 'N/A') + ' | Sociedad: ' + (sociedad || 'N/A') + ']';
            if (!detalleFinal.includes('[Tx:')) {
              detalleFinal = prefijo + ' ' + detalleFinal;
            }
          }

          const nuevaInc = {
            id: idIncidenciaCreada,
            ts_alta: new Date().toISOString().replace('T', ' ').substring(0, 19),
            tipo: datos.tipo,
            objeto: datos.objeto,
            paso: datos.paso || null,
            titulo: datos.incidencia.titulo,
            detalle: detalleFinal,
            severidad: datos.incidencia.severidad || 'MEDIA',
            modulo: datos.incidencia.modulo || 'MM',
            transaccion: transaccion,
            sociedad: sociedad,
            reporta: perfil.email,
            asignada_a: 'Pendiente asignacion',
            estado: 'ABIERTA',
            ts_cierre: null,
            resolucion: null,
            ciclo: config.ciclo_activo,
            golive: config.golive_activo
          };
          incidencias.push(nuevaInc);
          guardarColeccion(STORAGE_KEYS.INCIDENCIAS, incidencias);
        }

        // Crear registro en RESULTADOS (append-only)
        const nuevoResultado = {
          id: datos.id,
          ts: new Date().toISOString().replace('T', ' ').substring(0, 19),
          tipo: datos.tipo,
          objeto: datos.objeto,
          resultado: datos.resultado,
          paso: datos.paso || null,
          comentario: datos.comentario || '',
          documentos: resumenDocs,
          email: perfil.email,
          alcance: alcanceFinal,
          ciclo: config.ciclo_activo,
          golive: config.golive_activo,
          ambiente: config.ambiente,
          incidencia: idIncidenciaCreada
        };

        resultados.push(nuevoResultado);
        guardarColeccion(STORAGE_KEYS.RESULTADOS, resultados);

        // Guardar cada documento en DOCUMENTOS
        docsLista.forEach(d => {
          const correlativoDoc = documentos.length + 1;
          const nuevoDoc = {
            id: 'D-' + String(correlativoDoc).padStart(6, '0'),
            resultado_id: datos.id,
            tipo: d.tipo,
            numero: String(d.numero || '').trim(), // Texto estricto
            sociedad: d.sociedad || perfil.sociedad || 'CL11',
            ejercicio: d.ejercicio || new Date().getFullYear(),
            tipo_objeto: datos.tipo,
            objeto: datos.objeto,
            paso: d.paso || null,
            email: perfil.email,
            ts: nuevoResultado.ts,
            ciclo: config.ciclo_activo,
            golive: config.golive_activo
          };
          documentos.push(nuevoDoc);
        });
        guardarColeccion(STORAGE_KEYS.DOCUMENTOS, documentos);

        // Bitacora de auditoria
        bitacora.push({
          ts: nuevoResultado.ts,
          email: perfil.email,
          accion: 'reportar',
          objeto: datos.objeto,
          detalle: `Resultado ${datos.resultado} (${alcanceFinal}). Docs: ${docsLista.length}`,
          ip_hash: 'sim-local'
        });
        guardarColeccion(STORAGE_KEYS.BITACORA, bitacora);

        return {
          id: datos.id,
          incidencia: idIncidenciaCreada,
          documentos: docsLista.length
        };
      }

      if (accion === 'buscarDocumento') {
        const numero = String(datos.numero || '').trim().toLowerCase();
        const documentos = obtenerColeccion(STORAGE_KEYS.DOCUMENTOS);
        const resultados = obtenerColeccion(STORAGE_KEYS.RESULTADOS);

        const coincidenciasDocs = documentos.filter(d => {
          const num = String(d.numero).toLowerCase();
          return num === numero || num.endsWith(numero);
        });

        const respuesta = coincidenciasDocs.map(doc => {
          const res = resultados.find(r => r.id === doc.resultado_id) || {};
          return {
            documento: doc,
            resultado: res
          };
        });

        return { coincidencias: respuesta };
      }

      if (accion === 'documentos') {
        const documentos = obtenerColeccion(STORAGE_KEYS.DOCUMENTOS);
        const porTipo = {};
        documentos.forEach(d => {
          porTipo[d.tipo] = (porTipo[d.tipo] || 0) + 1;
        });
        return { documentos, por_tipo: porTipo };
      }

      if (accion === 'incidencias') {
        const incidencias = obtenerColeccion(STORAGE_KEYS.INCIDENCIAS);
        return { incidencias };
      }

      if (accion === 'actualizarIncidencia') {
        if (!esLiderOAdmin()) {
          throw new Error('Solo los usuarios con rol LIDER pueden cambiar estado o asignar incidencias.');
        }
        const incidencias = obtenerColeccion(STORAGE_KEYS.INCIDENCIAS);
        const inc = incidencias.find(i => i.id === datos.id);
        if (!inc) throw new Error('Incidencia no encontrada.');

        if (datos.estado) inc.estado = datos.estado;
        if (datos.asignada_a) inc.asignada_a = datos.asignada_a;
        if (datos.resolucion) inc.resolucion = datos.resolucion;
        if (datos.estado === 'CERRADA' || datos.estado === 'DESCARTADA') {
          inc.ts_cierre = new Date().toISOString().replace('T', ' ').substring(0, 19);
        }
        guardarColeccion(STORAGE_KEYS.INCIDENCIAS, incidencias);
        return { ok: true, id: datos.id, estado: datos.estado, asignada_a: datos.asignada_a, resolucion: datos.resolucion };
      }

      if (accion === 'avance') {
        const resultados = obtenerColeccion(STORAGE_KEYS.RESULTADOS);
        const documentos = obtenerColeccion(STORAGE_KEYS.DOCUMENTOS);
        const incidencias = obtenerColeccion(STORAGE_KEYS.INCIDENCIAS);
        return {
          ciclo: config.ciclo_activo,
          total_resultados: resultados.length,
          total_documentos: documentos.length,
          total_incidencias: incidencias.length
        };
      }

      if (accion === 'registrarCertificado') {
        registrarEnBitacora(usuario ? usuario.email : 'sistema', 'certificado', datos.codigo || 'CERT-SAP', 'Descarga certificado: ' + (datos.nombreArchivo || ''));
        return { ok: true };
      }

      throw new Error(`Accion desconocida: ${accion}`);
    }
  };
})();

/* ==========================================================================
   ESTADO GLOBAL DE LA APLICACION
   ========================================================================== */
const AppState = {
  catalogo: null,
  sesion: null,
  vista: 'acceso', // 'acceso' | 'pruebas' | 'ficha' | 'incidencias' | 'avance' | 'buscar'
  subvistaPruebas: 'mis', // 'mis' | 'todas'
  filtros: {
    tipo: 'todos',
    estado: 'todos',
    modulo: 'todos',
    area: 'todos',
    macro: 'todos',
    golive: 'todos',
    sin_dotacion: false,
    texto: '',
    busquedaGlobal: ''
  },
  resultadosVigentes: new Map(), // objetoId -> fila de resultado vigente
  historialPorObjeto: new Map(), // objetoId -> [filas de resultado]
  documentosPorObjeto: new Map(), // objetoId -> [documentos]
  incidencias: [],
  pruebaSeleccionada: null,
  modalReporteAbierto: false,
  modalAgregarDocAbierto: false,
  modalIncidenciaAbierto: false,
  incidenciaEnGestion: null,
  cargando: false,
  busquedaDocResultados: null,
  filtroGestionArea: 'todas',
  filtroGestionActividad: 'todos', // 'todos' | 'sin_reportes' | 'con_reportes'
  filtroCertificado: {
    fechaDesde: '',
    fechaHasta: '',
    usuarioEmail: '',
    filtroResultado: 'todos',
    incluirPruebas: true,
    incluirIncidencias: true,
    incluirDocumentos: true,
    descargandoPdf: false
  },
  filtrosIncidencias: {
    estado: 'todos',
    severidad: 'todos',
    reporta: 'todos',
    asignada: 'todos'
  }
};

function esLiderOAdmin() {
  if (!AppState.sesion || !AppState.sesion.perfil) return false;
  const p = AppState.sesion.perfil;
  const email = (p.email || '').toLowerCase();
  return p.rol === 'LIDER' || email === 'gsalinas@pjportland.cl' || email === 'gsalinas@pjportland.com' || email === 'garfiohook@gmail.com';
}

// Cliente unificado de comunicacion con el backend
async function api(accion, datos) {
  if (SIMULADO) {
    const usuario = AppState.sesion ? AppState.sesion.perfil : null;
    return await MockApi.despachar(accion, datos, usuario);
  }

  const token = AppState.sesion ? AppState.sesion.token : null;
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ accion, token, datos })
  });
  const texto = await res.text();
  let json;
  try {
    json = JSON.parse(texto);
  } catch (err) {
    console.error('Error parseando respuesta JSON (' + res.status + '):', texto.substring(0, 300));
    throw new Error('El servidor Apps Script devolvió un error (código ' + res.status + ').');
  }
  if (!json.ok) {
    if (json.codigo === 'TOKEN_VENCIDO' || json.codigo === 'SIN_TOKEN' || json.codigo === 'TOKEN_INVALIDO') {
      cerrarSesion();
      mostrarToast('Sesión no válida o vencida. Por favor ingrese nuevamente.');
    }
    throw new Error(json.error || json.codigo || 'Error de comunicacion');
  }
  return json.datos;
}

/* ==========================================================================
   INICIALIZACION Y CARGA DE DATOS
   ========================================================================== */
async function inicializarApp() {
  try {
    const resp = await fetch('data/catalogo.json');
    AppState.catalogo = await resp.json();

    const sesionGuardada = localStorage.getItem('portland_sap_sesion');
    if (sesionGuardada) {
      try {
        const s = JSON.parse(sesionGuardada);
        const ahora = Date.now();
        // Si no estamos en modo simulado pero el token es simulado, invalidar sesion
        if (!SIMULADO && s.token && s.token.startsWith('token-simulado-')) {
          localStorage.removeItem('portland_sap_sesion');
          AppState.sesion = null;
        } else if (s.expira && s.expira > ahora) {
          AppState.sesion = s;
        } else {
          localStorage.removeItem('portland_sap_sesion');
        }
      } catch(e) {}
    }

    window.addEventListener('hashchange', procesarHashRuta);

    if (AppState.sesion) {
      await sincronizarEstadoServidor();
      if (!window.location.hash || window.location.hash === '#acceso') {
        window.location.hash = '#pruebas';
      } else {
        procesarHashRuta();
      }
    } else {
      AppState.vista = 'acceso';
      renderizarApp();
    }
  } catch (err) {
    console.error('Error al inicializar la aplicacion:', err);
    document.getElementById('app').innerHTML = `
      <div style="padding: 30px; text-align: center; color: #b71c1c;">
        <h2>Error al cargar el catalogo</h2>
        <p>${err.message}</p>
        <p style="margin-top: 10px; color: #64748b;">Verifique que data/catalogo.json existe y es accesible.</p>
      </div>
    `;
  }
}

function normalizarIncidencia(inc) {
  if (!inc || typeof inc !== 'object') return null;
  
  // Buscar ID
  let id = String(inc.id || '').trim();
  if (id.toLowerCase() === 'id') return null; // fila de encabezados

  if (!id) {
    for (const [k, v] of Object.entries(inc)) {
      if (typeof v === 'string' && /^INC-\d+/i.test(v.trim())) {
        id = v.trim();
        break;
      }
    }
  }

  // Si no tiene ID o es vacía
  if (!id || id === 'undefined') return null;
  inc.id = id;

  // Normalizar campos básicos
  inc.severidad = String(inc.severidad || 'MEDIA').toUpperCase();
  inc.estado = String(inc.estado || 'ABIERTA').toUpperCase();
  inc.titulo = inc.titulo || inc.titulo_y_detalle || ('Incidencia ' + id);
  inc.detalle = inc.detalle || '';
  inc.reporta = inc.reporta || '';
  inc.asignada_a = inc.asignada_a || '';
  inc.modulo = inc.modulo || 'MM';

  let tx = String(inc.transaccion || '').trim().toUpperCase();
  let soc = String(inc.sociedad || '').trim().toUpperCase();

  // Si no viene en propiedad directa, intentar extraer de inc.detalle "[Tx: XXXX | Sociedad: YYYY]"
  if (!tx && inc.detalle) {
    const matchTx = inc.detalle.match(/\[Tx:\s*([^|\s\]]+)/i);
    if (matchTx) tx = matchTx[1].trim().toUpperCase();
  }
  if (!soc && inc.detalle) {
    const matchSoc = inc.detalle.match(/Sociedad:\s*([^\]\s]+)/i);
    if (matchSoc) soc = matchSoc[1].trim().toUpperCase();
  }

  // Si aún no tiene transacción, inferir de la prueba del catálogo
  if (!tx && inc.objeto && typeof obtenerDetallePrueba === 'function') {
    const p = obtenerDetallePrueba(inc.objeto);
    if (p) {
      if (p._tipo === 'CU' && p.tx) tx = p.tx.toUpperCase();
      else if (p._tipo === 'E2E' && inc.paso && Array.isArray(p.pasos)) {
        const pasoObj = p.pasos.find(x => String(x.n) === String(inc.paso));
        if (pasoObj && pasoObj.tx) tx = pasoObj.tx.toUpperCase();
      }
    }
  }

  // Sociedad por defecto si no está especificada
  if (!soc) {
    soc = 'CL11';
  }

  inc.transaccion = tx;
  inc.sociedad = soc;
  return inc;
}

async function sincronizarEstadoServidor() {
  try {
    const data = await api('estado', {});
    const resultados = data.resultados || [];
    
    AppState.resultadosVigentes.clear();
    AppState.historialPorObjeto.clear();

    resultados.forEach(r => {
      if (!AppState.historialPorObjeto.has(r.objeto)) {
        AppState.historialPorObjeto.set(r.objeto, []);
      }
      AppState.historialPorObjeto.get(r.objeto).push(r);
      AppState.resultadosVigentes.set(r.objeto, r);
    });

    if (data.incidencias && data.documentos) {
      // Estado consolidado recibido en una sola llamada de alta velocidad
      AppState.incidencias = data.incidencias.map(normalizarIncidencia).filter(Boolean);
      AppState.documentosPorObjeto.clear();
      data.documentos.forEach(d => {
        if (!AppState.documentosPorObjeto.has(d.objeto)) {
          AppState.documentosPorObjeto.set(d.objeto, []);
        }
        AppState.documentosPorObjeto.get(d.objeto).push(d);
      });
    } else {
      // Compatibilidad con versión anterior: ejecutar de forma secuencial e independiente
      // para evitar colisiones 404 por concurrencia en Google Apps Script
      try {
        const dataInc = await api('incidencias', {});
        if (dataInc && Array.isArray(dataInc.incidencias)) {
          AppState.incidencias = dataInc.incidencias.map(normalizarIncidencia).filter(Boolean);
        }
      } catch (errInc) {
        console.warn('Advertencia al sincronizar incidencias:', errInc);
      }

      try {
        const dataDocs = await api('documentos', {});
        if (dataDocs && Array.isArray(dataDocs.documentos)) {
          AppState.documentosPorObjeto.clear();
          dataDocs.documentos.forEach(d => {
            if (!AppState.documentosPorObjeto.has(d.objeto)) {
              AppState.documentosPorObjeto.set(d.objeto, []);
            }
            AppState.documentosPorObjeto.get(d.objeto).push(d);
          });
        }
      } catch (errDocs) {
        console.warn('Advertencia al sincronizar documentos:', errDocs);
      }
    }
  } catch (e) {
    console.error('Error al sincronizar estado:', e);
    mostrarToast('Aviso: no se pudo sincronizar con el servidor.');
  }
}

function procesarHashRuta() {
  const hash = window.location.hash;
  if (!AppState.sesion) {
    AppState.vista = 'acceso';
    renderizarApp();
    return;
  }

  if (hash.startsWith('#prueba/')) {
    const codigo = hash.substring(8);
    AppState.pruebaSeleccionada = codigo;
    AppState.vista = 'ficha';
  } else if (hash === '#incidencias') {
    AppState.vista = 'incidencias';
    if (!AppState.incidencias || AppState.incidencias.length === 0) {
      api('incidencias', {}).then(data => {
        if (data && Array.isArray(data.incidencias)) {
          AppState.incidencias = data.incidencias.map(normalizarIncidencia).filter(Boolean);
          if (AppState.vista === 'incidencias') {
            renderizarApp();
          }
        }
      }).catch(err => console.warn('Carga asíncrona de incidencias:', err));
    }
  } else if (hash === '#avance') {
    AppState.vista = 'avance';
  } else if (hash === '#gestion') {
    if (esLiderOAdmin()) {
      AppState.vista = 'gestion';
    } else {
      AppState.vista = 'pruebas';
    }
  } else if (hash === '#certificado' || hash === '#resumen' || hash.startsWith('#certificado/')) {
    AppState.vista = 'certificado';
    if (!AppState.filtroCertificado || !AppState.filtroCertificado.fechaDesde) {
      inicializarFiltroCertificado();
    }
    if (hash.startsWith('#certificado/')) {
      const emailParam = decodeURIComponent(hash.substring(13)).trim();
      if (emailParam) {
        AppState.filtroCertificado.usuarioEmail = emailParam;
      }
    }
  } else if (hash.startsWith('#buscar')) {
    AppState.vista = 'buscar';
  } else {
    AppState.vista = 'pruebas';
  }

  renderizarApp();
}

/* ==========================================================================
   GESTION DE SESION
   ========================================================================== */
async function iniciarSesion(email) {
  try {
    AppState.cargando = true;
    renderizarApp();
    const datos = await api('login', { email });
    
    const expira = Date.now() + (12 * 60 * 60 * 1000); // 12 horas
    AppState.sesion = {
      token: datos.token,
      perfil: datos.perfil,
      config: datos.config,
      expira: expira
    };
    localStorage.setItem('portland_sap_sesion', JSON.stringify(AppState.sesion));

    await sincronizarEstadoServidor();
    window.location.hash = '#pruebas';
  } catch (err) {
    alert(err.message);
  } finally {
    AppState.cargando = false;
    renderizarApp();
  }
}

function cerrarSesion() {
  AppState.sesion = null;
  localStorage.removeItem('portland_sap_sesion');
  window.location.hash = '#acceso';
  AppState.vista = 'acceso';
  renderizarApp();
}

/* ==========================================================================
   RENDERIZADOR PRINCIPAL
   ========================================================================== */
function renderizarApp() {
  const root = document.getElementById('app');
  if (!root) return;

  if (AppState.vista === 'acceso' || !AppState.sesion) {
    root.innerHTML = renderizarPantallaAcceso();
    enlazarEventosAcceso();
    return;
  }

  let contenidoVista = '';
  switch (AppState.vista) {
    case 'pruebas':
      contenidoVista = renderizarPantallaPruebas();
      break;
    case 'ficha':
      contenidoVista = renderizarPantallaFicha();
      break;
    case 'incidencias':
      contenidoVista = renderizarPantallaIncidencias();
      break;
    case 'avance':
      contenidoVista = renderizarPantallaAvance();
      break;
    case 'gestion':
      contenidoVista = renderizarPantallaGestion();
      break;
    case 'certificado':
      contenidoVista = renderizarPantallaCertificado();
      break;
    case 'buscar':
      contenidoVista = renderizarPantallaBuscar();
      break;
    default:
      contenidoVista = renderizarPantallaPruebas();
  }

  root.innerHTML = `
    ${renderizarBarraSuperior()}
    ${SIMULADO ? renderizarBannerSimulado() : ''}
    <main class="contenido-principal">
      ${contenidoVista}
    </main>
    ${AppState.modalReporteAbierto ? renderizarModalReportar() : ''}
    ${AppState.modalAgregarDocAbierto ? renderizarModalAgregarDoc() : ''}
    ${AppState.modalIncidenciaAbierto ? renderizarModalGestionIncidencia() : ''}
  `;

  enlazarEventosGlobales();
  enlazarEventosVista();
}

/* ==========================================================================
   COMPONENTES COMUNES: CABECERA Y SIMULADOR
   ========================================================================== */
function renderizarBarraSuperior() {
  const p = AppState.sesion.perfil;
  const esLider = esLiderOAdmin();
  return `
    <header class="barra-superior">
      <div class="marca-proyecto">
        <div>
          <div class="marca-titulo">PORTAL DE PRUEBAS SAP S/4HANA</div>
          <div class="marca-subtitulo">GRUPO PORTLAND · CERTIFICACION</div>
        </div>
      </div>

      <div class="busqueda-cabecera">
        <input type="text" id="input-busqueda-global" placeholder="Buscar doc SAP o prueba (ej: 4500001234, E2E-01)..." value="${AppState.filtros.busquedaGlobal || ''}">
        <button id="btn-buscar-global" title="Buscar">IR</button>
      </div>

      <nav class="nav-cabecera">
        <button class="nav-btn ${AppState.vista === 'pruebas' || AppState.vista === 'ficha' ? 'activo' : ''}" onclick="window.location.hash='#pruebas'">Pruebas</button>
        <button class="nav-btn ${AppState.vista === 'incidencias' ? 'activo' : ''}" onclick="window.location.hash='#incidencias'">Incidencias</button>
        <button class="nav-btn ${AppState.vista === 'avance' ? 'activo' : ''}" onclick="window.location.hash='#avance'">Avance</button>
        <button class="nav-btn ${AppState.vista === 'certificado' ? 'activo' : ''}" onclick="window.location.hash='#certificado'">Certificado PDF</button>
        ${esLider ? `<button class="nav-btn ${AppState.vista === 'gestion' ? 'activo' : ''}" onclick="window.location.hash='#gestion'">Gestión</button>` : ''}
      </nav>

      <div class="usuario-cabecera">
        <div class="usuario-info">
          <div class="usuario-nombre">${p.nombre}</div>
          <div class="usuario-rol">${p.rol} · ${p.sociedad || 'Portland'}</div>
        </div>
        <button class="btn-salir" onclick="cerrarSesion()">Salir</button>
      </div>
    </header>
  `;
}

function renderizarBannerSimulado() {
  const cfg = AppState.sesion && AppState.sesion.config ? AppState.sesion.config : {};
  return `
    <div class="banner-simulado">
      <span>MODO SIMULADO (Fase 1) · Ciclo: ${cfg.ciclo_activo || 1} · Mandante: ${cfg.ambiente || 'QAS-200'} · Persistencia local activa.</span>
      <span style="font-size: 11px;">SIMULADO = true</span>
    </div>
  `;
}

function mostrarToast(mensaje) {
  const t = document.createElement('div');
  t.className = 'notificacion-toast';
  t.textContent = mensaje;
  document.body.appendChild(t);
  setTimeout(() => {
    if (t.parentNode) t.parentNode.removeChild(t);
  }, 3500);
}

/* ==========================================================================
   PANTALLA 1: ACCESO (§8.1)
   ========================================================================== */
function renderizarPantallaAcceso() {
  return `
    <div class="contenedor-acceso">
      <div class="tarjeta-acceso">
        <div class="acceso-encabezado">
          <div class="acceso-titulo">Portal de Pruebas SAP S/4HANA</div>
          <div class="acceso-desc">Certificacion Grupo Portland · Plan de pruebas v8.0</div>
        </div>

        <form id="form-acceso" onsubmit="event.preventDefault();">
          <div class="form-grupo">
            <label for="email-acceso">Correo corporativo</label>
            <input type="email" id="email-acceso" class="form-input" placeholder="ejemplo@pjportland.com" required autofocus>
          </div>
          <button type="submit" id="btn-ingresar" class="btn-primario">
            ${AppState.cargando ? '<span class="spinner"></span> Ingresando...' : 'Entrar al portal'}
          </button>
        </form>

        <div style="margin-top: 14px; font-size: 12px; color: var(--texto-secundario);">
          La sesion permanece activa durante 12 horas en este navegador. Si su correo no esta en la lista, solicite el alta al lider de implementacion.
        </div>

        ${SIMULADO ? `
          <div class="simulador-acceso-rapido">
            <div class="simulador-titulo">Selector rapido de perfiles (Modo simulado)</div>
            <select id="select-usuario-rapido" class="form-select" style="font-size: 12px;">
              <option value="">-- Seleccione un usuario real --</option>
              <option value="arestrepo@pjportland.com">ANGELA RESTREPO (Key-User Comercial / Aprobador · CO11)</option>
              <option value="fpacheco@pjportland.com">FELIPE PACHECO (Key-User Facturacion · CL11)</option>
              <option value="csalas@pjportland.com">CRISTIAN SALAS (Key-User Operaciones · CL11)</option>
              <option value="gsalinas@pjportland.cl">GABRIEL SALINAS (LIDER · gsalinas@pjportland.cl)</option>
              <option value="ljara@pjportland.cl">LEANDRO JARA (TI · Modulo MM)</option>
              <option value="hcorrea@pjportland.cl">HECTOR CORREA (TI · Modulo SD)</option>
              <option value="osella@pjportland.cl">OSCAR SELLA (TI · Modulo FICO)</option>
              <option value="dcorrea@pjportland.cl">DANIELA CORREA (TI / Contabilidad · Modulo FICO)</option>
            </select>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

function enlazarEventosAcceso() {
  const form = document.getElementById('form-acceso');
  const inputEmail = document.getElementById('email-acceso');
  const selectRapido = document.getElementById('select-usuario-rapido');

  if (form) {
    form.addEventListener('submit', () => {
      const email = inputEmail.value.trim();
      if (email) iniciarSesion(email);
    });
  }

  if (selectRapido) {
    selectRapido.addEventListener('change', (e) => {
      if (e.target.value) {
        inputEmail.value = e.target.value;
        iniciarSesion(e.target.value);
      }
    });
  }
}

/**
 * Determina si un usuario (por email) pertenece a un área ejecutora (clave del catálogo),
 * considerando su campo 'areas', su 'departamento' o su 'departamento origen'.
 * Garantiza que cuando un usuario reporta un escenario E2E, solo se aumente el área que ejecutó.
 */
function usuarioPerteneceAArea(email, areaKey) {
  if (!email || !areaKey) return false;
  const emailNorm = String(email).trim().toLowerCase();
  const areaNorm = String(areaKey).trim().toUpperCase();

  const u = LISTA_USUARIOS_SIMULADOS.find(x => (x.email || '').toLowerCase() === emailNorm)
    || (AppState.sesion && AppState.sesion.perfil && (AppState.sesion.perfil.email || '').toLowerCase() === emailNorm ? AppState.sesion.perfil : null);

  if (!u) return false;

  // 1. Áreas explícitas asignadas en el perfil (ej: "APROBADOR, COMERCIAL")
  if (u.areas) {
    const arrAreas = u.areas.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
    if (arrAreas.includes(areaNorm)) return true;
  }

  // 2. Departamento o departamento origen
  const depto = String(u.departamento || '').trim().toUpperCase();
  const deptoOrig = String(u['departamento origen'] || '').trim().toUpperCase();

  if (depto === areaNorm || deptoOrig === areaNorm) return true;

  if (areaNorm === 'COMERCIAL' && (depto.includes('COMERCIAL') || depto.includes('VENTAS') || deptoOrig.includes('COMERCIAL') || deptoOrig.includes('VENTAS'))) return true;
  if (areaNorm === 'OPERACIONES' && (depto.includes('OPERACIONES') || deptoOrig.includes('OPERACIONES'))) return true;
  if (areaNorm === 'COMEX' && (depto.includes('COMEX') || deptoOrig.includes('COMEX'))) return true;
  if (areaNorm === 'FACTURACION' && (depto.includes('FACTURACION') || deptoOrig.includes('FACTURACION'))) return true;
  if (areaNorm === 'CONTABILIDAD' && (depto.includes('CONTABILIDAD') || deptoOrig.includes('CONTABILIDAD'))) return true;
  if (areaNorm === 'FINANZAS' && (depto.includes('FINANZAS') || depto.includes('TESORERIA') || deptoOrig.includes('FINANZAS') || deptoOrig.includes('TESORERIA'))) return true;
  if (areaNorm === 'CREDITO Y COBRANZAS' && (depto.includes('CREDITO') || depto.includes('COBRANZAS') || deptoOrig.includes('CREDITO') || deptoOrig.includes('COBRANZAS'))) return true;
  if (areaNorm === 'APROBADOR' && (depto.includes('APROBADOR') || deptoOrig.includes('APROBADOR') || (u.cargo && u.cargo.toUpperCase().includes('GERENTE')))) return true;
  if (areaNorm === 'TI' && (u.rol === 'LIDER' || u.rol === 'EQUIPO_PROYECTO' || depto.includes('TI') || deptoOrig.includes('TI'))) return true;

  return false;
}

/* ==========================================================================
   PANTALLA 2: MIS PRUEBAS / TODAS LAS PRUEBAS (§8.2)
   ========================================================================== */
function obtenerPruebasFiltradas() {
  if (!AppState.catalogo) return [];

  const cu = (AppState.catalogo.cu || []).map(c => ({ ...c, _tipo: 'CU', _codigo: c.id, _nombre: `${c.proceso} — ${c.func || ''}` }));
  const e2e = (AppState.catalogo.e2e || []).map(e => ({ ...e, _tipo: 'E2E', _codigo: e.codigo, _nombre: e.nombre }));
  const todas = [...cu, ...e2e];

  const perfil = AppState.sesion.perfil;
  const areasUser = (perfil.areas || '').split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
  const modulosUser = (perfil.modulos || '').split(',').map(s => s.trim().toUpperCase()).filter(Boolean);

  const CODIGOS_SIN_DOTACION = ['E2E-06', 'E2E-07', 'E2E-09', 'E2E-10'];
  const SOCIEDADES_SIN_DOTACION = ['CL15', 'CL16'];

  return todas.filter(item => {
    // 1. Selector de dos posiciones: Mis pruebas vs Todas
    if (AppState.subvistaPruebas === 'mis' && perfil.rol !== 'LIDER') {
      if (item._tipo === 'CU') {
        if (perfil.rol === 'KEY_USER' && areasUser.length > 0) {
          return false;
        }
        if (modulosUser.length > 0 && !modulosUser.includes(String(item.modulo).toUpperCase())) {
          return false;
        }
      } else if (item._tipo === 'E2E') {
        if (areasUser.length > 0) {
          const itemAreas = (item.areas || []).map(a => String(a).toUpperCase());
          const coincide = itemAreas.some(a => areasUser.includes(a));
          if (!coincide) return false;
        }
      }
    }

    // 2. Filtro de tipo
    if (AppState.filtros.tipo !== 'todos') {
      if (AppState.filtros.tipo.toUpperCase() !== item._tipo) return false;
    }

    // 3. Filtro de estado
    const estadoVigente = AppState.resultadosVigentes.get(item._codigo);
    const estadoActual = estadoVigente ? estadoVigente.resultado : 'PENDIENTE';
    if (AppState.filtros.estado !== 'todos') {
      if (AppState.filtros.estado !== estadoActual) return false;
    }

    // 4. Filtro de modulo
    if (AppState.filtros.modulo !== 'todos') {
      if (item._tipo === 'CU' && item.modulo !== AppState.filtros.modulo) return false;
      if (item._tipo === 'E2E') {
        const tieneModulo = (item.pasos || []).some(p => p.modulo === AppState.filtros.modulo);
        if (!tieneModulo) return false;
      }
    }

    // 5. Filtro de area
    if (AppState.filtros.area !== 'todos') {
      if (item._tipo === 'E2E') {
        const itemAreas = (item.areas || []).map(a => String(a).toUpperCase());
        if (!itemAreas.includes(AppState.filtros.area.toUpperCase())) return false;
      } else {
        return false;
      }
    }

    // 6. Filtro de macroproceso
    if (AppState.filtros.macro !== 'todos') {
      if (item._tipo === 'E2E' && item.macro !== AppState.filtros.macro) return false;
      if (item._tipo === 'CU') return false;
    }

    // 7. Filtro de Go-Live
    if (AppState.filtros.golive !== 'todos') {
      if (item.golive !== AppState.filtros.golive) return false;
    }

    // 8. Filtro especial: Pruebas sin dotacion
    if (AppState.filtros.sin_dotacion) {
      const esSinDot = CODIGOS_SIN_DOTACION.includes(item._codigo) ||
        (item.soc && item.soc.some(s => SOCIEDADES_SIN_DOTACION.includes(s)));
      if (!esSinDot) return false;
    }

    // 9. Buscador de texto
    if (AppState.filtros.texto) {
      const t = AppState.filtros.texto.toLowerCase();
      const matchCodigo = item._codigo.toLowerCase().includes(t);
      const matchNombre = (item._nombre || '').toLowerCase().includes(t);
      const matchTx = (item.tx || '').toLowerCase().includes(t);
      const matchObj = (item.objetivo || '').toLowerCase().includes(t);
      if (!matchCodigo && !matchNombre && !matchTx && !matchObj) return false;
    }

    return true;
  }).sort((a, b) => {
    const estA = AppState.resultadosVigentes.get(a._codigo)?.resultado || 'PENDIENTE';
    const estB = AppState.resultadosVigentes.get(b._codigo)?.resultado || 'PENDIENTE';
    const peso = { 'PENDIENTE': 1, 'NOK': 2, 'BLOQUEADO': 3, 'OK': 4, 'NO_APLICA': 5 };
    const diff = (peso[estA] || 9) - (peso[estB] || 9);
    if (diff !== 0) return diff;
    return a._codigo.localeCompare(b._codigo);
  });
}

function renderizarPantallaPruebas() {
  const pruebas = obtenerPruebasFiltradas();
  const perfil = AppState.sesion.perfil;

  let cntOK = 0, cntNOK = 0, cntBloq = 0, cntNA = 0, cntPend = 0;
  pruebas.forEach(p => {
    const est = AppState.resultadosVigentes.get(p._codigo)?.resultado || 'PENDIENTE';
    if (est === 'OK') cntOK++;
    else if (est === 'NOK') cntNOK++;
    else if (est === 'BLOQUEADO') cntBloq++;
    else if (est === 'NO_APLICA') cntNA++;
    else cntPend++;
  });
  const total = pruebas.length;
  const pOK = total ? ((cntOK / total) * 100).toFixed(1) : 0;
  const pNOK = total ? ((cntNOK / total) * 100).toFixed(1) : 0;
  const pBloq = total ? ((cntBloq / total) * 100).toFixed(1) : 0;
  const pNA = total ? ((cntNA / total) * 100).toFixed(1) : 0;
  const pPend = total ? ((cntPend / total) * 100).toFixed(1) : 0;

  return `
    <div class="panel-control-pruebas">
      <div class="fila-selector-alcance">
        <div class="selector-alcance">
          <button class="btn-alcance ${AppState.subvistaPruebas === 'mis' ? 'activo' : ''}" id="btn-switch-mis">
            Mis pruebas
          </button>
          <button class="btn-alcance ${AppState.subvistaPruebas === 'todas' ? 'activo' : ''}" id="btn-switch-todas">
            Todas las pruebas (320)
          </button>
        </div>

        <div class="resumen-alcance-info">
          ${AppState.subvistaPruebas === 'mis' 
            ? `Mostrando su asignacion predeterminada (${perfil.areas || perfil.modulos || 'Todo'})`
            : 'Mostrando las 320 pruebas del plan. Puede reportar cualquiera; fuera de su area se marcara como APOYO.'}
        </div>

        <div>
          <button class="btn-certificar-rapido" onclick="window.location.hash='#certificado'" title="Generar y descargar documento resumen de pruebas en PDF">
            📄 Certificado PDF
          </button>
        </div>
      </div>

      <!-- Barra de avance segmentada -->
      <div class="barra-avance-contenedor">
        <div class="barra-avance-etiquetas">
          <span><strong>${total - cntPend}</strong> de ${total} pruebas ejecutadas (${total ? (((total - cntPend)/total)*100).toFixed(0) : 0}%)</span>
          <span>Visibles: ${total}</span>
        </div>
        <div class="barra-avance-pista">
          <div class="segmento-ok" style="width: ${pOK}%;" title="OK: ${cntOK}"></div>
          <div class="segmento-nok" style="width: ${pNOK}%;" title="NOK: ${cntNOK}"></div>
          <div class="segmento-bloqueado" style="width: ${pBloq}%;" title="Bloqueado: ${cntBloq}"></div>
          <div class="segmento-no-aplica" style="width: ${pNA}%;" title="No Aplica: ${cntNA}"></div>
          <div class="segmento-pendiente" style="width: ${pPend}%;" title="Pendiente: ${cntPend}"></div>
        </div>
        <div class="leyenda-avance">
          <div class="item-leyenda"><span class="punto-estado" style="background: var(--estado-ok);"></span> OK: ${cntOK}</div>
          <div class="item-leyenda"><span class="punto-estado" style="background: var(--estado-nok);"></span> NOK: ${cntNOK}</div>
          <div class="item-leyenda"><span class="punto-estado" style="background: var(--estado-bloqueado);"></span> Bloqueado: ${cntBloq}</div>
          <div class="item-leyenda"><span class="punto-estado" style="background: var(--estado-no-aplica);"></span> No aplica: ${cntNA}</div>
          <div class="item-leyenda"><span class="punto-estado" style="background: #cbd5e1;"></span> Pendiente: ${cntPend}</div>
        </div>
      </div>

      <!-- Barra de filtros -->
      <div class="barra-filtros">
        <div class="filtro-item">
          <label>Tipo</label>
          <select id="filtro-tipo" class="form-select">
            <option value="todos" ${AppState.filtros.tipo === 'todos' ? 'selected' : ''}>Todos</option>
            <option value="cu" ${AppState.filtros.tipo === 'cu' ? 'selected' : ''}>Casos Unitarios (CU)</option>
            <option value="e2e" ${AppState.filtros.tipo === 'e2e' ? 'selected' : ''}>Escenarios E2E</option>
          </select>
        </div>

        <div class="filtro-item">
          <label>Estado</label>
          <select id="filtro-estado" class="form-select">
            <option value="todos" ${AppState.filtros.estado === 'todos' ? 'selected' : ''}>Todos</option>
            <option value="PENDIENTE" ${AppState.filtros.estado === 'PENDIENTE' ? 'selected' : ''}>Pendiente</option>
            <option value="OK" ${AppState.filtros.estado === 'OK' ? 'selected' : ''}>OK</option>
            <option value="NOK" ${AppState.filtros.estado === 'NOK' ? 'selected' : ''}>NOK</option>
            <option value="BLOQUEADO" ${AppState.filtros.estado === 'BLOQUEADO' ? 'selected' : ''}>Bloqueado</option>
            <option value="NO_APLICA" ${AppState.filtros.estado === 'NO_APLICA' ? 'selected' : ''}>No aplica</option>
          </select>
        </div>

        <div class="filtro-item">
          <label>Modulo</label>
          <select id="filtro-modulo" class="form-select">
            <option value="todos">Todos</option>
            ${(AppState.catalogo.modulos || []).map(m => `
              <option value="${m.key}" ${AppState.filtros.modulo === m.key ? 'selected' : ''}>${m.key}</option>
            `).join('')}
          </select>
        </div>

        <div class="filtro-item">
          <label>Area</label>
          <select id="filtro-area" class="form-select">
            <option value="todos">Todas</option>
            ${(AppState.catalogo.areas || []).map(a => `
              <option value="${a.key}" ${AppState.filtros.area === a.key ? 'selected' : ''}>${a.key}</option>
            `).join('')}
          </select>
        </div>

        <div class="filtro-item">
          <label>Go-Live</label>
          <select id="filtro-golive" class="form-select">
            <option value="todos">Todos</option>
            ${(AppState.catalogo.golives || ['GL1', 'GL2', 'GL3', 'GL4']).map(g => `
              <option value="${g}" ${AppState.filtros.golive === g ? 'selected' : ''}>${g}</option>
            `).join('')}
          </select>
        </div>

        <div class="filtro-item" style="flex: 2; min-width: 180px;">
          <label>Buscar texto</label>
          <input type="text" id="filtro-texto" class="form-input" placeholder="Codigo, transaccion, nombre..." value="${AppState.filtros.texto}">
        </div>

        ${AppState.subvistaPruebas === 'todas' ? `
          <label class="filtro-check" title="Muestra pruebas de areas o sociedades que carecen de Key-User nominal">
            <input type="checkbox" id="check-sin-dotacion" ${AppState.filtros.sin_dotacion ? 'checked' : ''}>
            Sin dotacion
          </label>
        ` : ''}
      </div>
    </div>

    <!-- Tabla densa de pruebas -->
    <div class="panel-lista-pruebas">
      <table class="tabla-pruebas">
        <thead>
          <tr>
            <th style="width: 110px;">Codigo</th>
            <th>Nombre / Descripcion</th>
            <th style="width: 110px;">Estado</th>
            <th style="width: 80px;">Modulo</th>
            <th style="width: 140px;">Area / Macro</th>
            <th style="width: 140px;">Ultimo Reporte</th>
            <th style="width: 70px;">Docs</th>
          </tr>
        </thead>
        <tbody>
          ${pruebas.length === 0 ? `
            <tr>
              <td colspan="7" style="text-align: center; padding: 24px; color: var(--texto-atenuado);">
                No se encontraron pruebas con los filtros seleccionados.
              </td>
            </tr>
          ` : pruebas.map(item => {
            const vig = AppState.resultadosVigentes.get(item._codigo);
            const estado = vig ? vig.resultado : 'PENDIENTE';
            const docsCount = (AppState.documentosPorObjeto.get(item._codigo) || []).length;
            
            let esDelUsuario = true;
            if (item._tipo === 'E2E') {
              const itemAreas = (item.areas || []).map(a => String(a).toUpperCase());
              const userAreas = (perfil.areas || '').split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
              if (userAreas.length > 0 && !itemAreas.some(a => userAreas.includes(a))) {
                esDelUsuario = false;
              }
            }

            const esSinDueno = ['E2E-06', 'E2E-07', 'E2E-09', 'E2E-10'].includes(item._codigo);

            return `
              <tr onclick="window.location.hash='#prueba/${item._codigo}'">
                <td>
                  <span class="badge-codigo ${item._tipo === 'CU' ? 'badge-cu' : 'badge-e2e'}">
                    ${item._codigo}
                  </span>
                </td>
                <td>
                  <strong>${item._nombre}</strong>
                  ${item.tx ? `<span style="color: #64748b; font-size: 11px; margin-left: 6px;">[Tx: ${item.tx}]</span>` : ''}
                  ${!esDelUsuario && AppState.subvistaPruebas === 'todas' ? `
                    <span class="badge-alcance-apoyo" title="Asignada a otra area. Si reporta, queda como APOYO.">
                      ${item.areas ? item.areas.join(', ') : item.modulo}
                    </span>
                  ` : ''}
                  ${esSinDueno ? `<span class="badge-sin-dueno">Sin ejecutor nominal</span>` : ''}
                </td>
                <td>
                  <span class="badge-estado estado-${estado}">${estado}</span>
                </td>
                <td>
                  ${item._tipo === 'CU' ? `<span class="badge-modulo">${item.modulo}</span>` : `<span style="color: #64748b; font-size: 11px;">E2E</span>`}
                </td>
                <td>
                  ${item._tipo === 'E2E' ? `
                    <div style="font-size: 11px; font-weight: 600; color: #475569;">${item.macro || ''}</div>
                    <div style="font-size: 10px; color: #64748b;">${(item.areas || []).join(', ')}</div>
                  ` : `
                    <span style="font-size: 11px; color: #64748b;">${item.proceso || ''}</span>
                  `}
                </td>
                <td>
                  ${vig ? `
                    <div style="font-size: 11px; font-weight: 600;">${vig.ts.substring(0, 10)}</div>
                    <div style="font-size: 10px; color: #64748b;">${vig.email.split('@')[0]} (${vig.alcance})</div>
                  ` : '<span class="texto-vacio">Sin reportar</span>'}
                </td>
                <td>
                  ${docsCount > 0 ? `<span class="badge-doc-count">${docsCount}</span>` : '-'}
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function enlazarEventosVistaPruebas() {
  const btnMis = document.getElementById('btn-switch-mis');
  const btnTodas = document.getElementById('btn-switch-todas');
  if (btnMis) {
    btnMis.addEventListener('click', () => {
      AppState.subvistaPruebas = 'mis';
      renderizarApp();
    });
  }
  if (btnTodas) {
    btnTodas.addEventListener('click', () => {
      AppState.subvistaPruebas = 'todas';
      renderizarApp();
    });
  }

  ['filtro-tipo', 'filtro-estado', 'filtro-modulo', 'filtro-area', 'filtro-golive'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', (e) => {
        const prop = id.replace('filtro-', '');
        AppState.filtros[prop] = e.target.value;
        renderizarApp();
      });
    }
  });

  const txt = document.getElementById('filtro-texto');
  if (txt) {
    txt.addEventListener('input', (e) => {
      AppState.filtros.texto = e.target.value;
      renderizarApp();
    });
  }

  const chkSinDot = document.getElementById('check-sin-dotacion');
  if (chkSinDot) {
    chkSinDot.addEventListener('change', (e) => {
      AppState.filtros.sin_dotacion = e.target.checked;
      renderizarApp();
    });
  }
}

/* ==========================================================================
   PANTALLA 3: FICHA DE LA PRUEBA (§8.3)
   ========================================================================== */
function obtenerDetallePrueba(codigo) {
  if (!AppState.catalogo) return null;
  if (codigo.startsWith('CU-')) {
    const item = (AppState.catalogo.cu || []).find(c => c.id === codigo);
    if (item) return { ...item, _tipo: 'CU', _codigo: item.id, _nombre: `${item.proceso} — ${item.func || ''}` };
  }
  const e2e = (AppState.catalogo.e2e || []).find(e => e.codigo === codigo);
  if (e2e) return { ...e2e, _tipo: 'E2E', _codigo: e2e.codigo, _nombre: e2e.nombre };
  return null;
}

function renderizarPantallaFicha() {
  const codigo = AppState.pruebaSeleccionada;
  const prueba = obtenerDetallePrueba(codigo);

  if (!prueba) {
    return `
      <div class="contenedor-ficha">
        <p style="color: #b71c1c;">Prueba no encontrada: ${codigo}</p>
        <button class="btn-secundario" onclick="window.location.hash='#pruebas'" style="margin-top: 12px;">Volver a la lista</button>
      </div>
    `;
  }

  const vig = AppState.resultadosVigentes.get(codigo);
  const estadoActual = vig ? vig.resultado : 'PENDIENTE';
  const historial = AppState.historialPorObjeto.get(codigo) || [];
  const docs = AppState.documentosPorObjeto.get(codigo) || [];
  const esLider = esLiderOAdmin();
  const incsPrueba = (AppState.incidencias || []).filter(i => String(i.objeto).toUpperCase() === String(codigo).toUpperCase());
  const incAbierta = incsPrueba.find(i => i.estado !== 'CERRADA' && i.estado !== 'DESCARTADA');

  return `
    <div class="contenedor-ficha">
      <div class="cabecera-ficha">
        <div class="ficha-titulos">
          <div class="ficha-meta">
            <button class="btn-secundario" style="padding: 3px 8px; font-size: 11px;" onclick="window.location.hash='#pruebas'">← Volver</button>
            <span class="badge-codigo ${prueba._tipo === 'CU' ? 'badge-cu' : 'badge-e2e'}">${prueba._codigo}</span>
            <span class="badge-estado estado-${estadoActual}">${estadoActual}</span>
            ${prueba.golive ? `<span class="badge-codigo" style="background: #f1f5f9;">${prueba.golive}</span>` : ''}
          </div>
          <h1 class="ficha-nombre">${prueba._nombre}</h1>
        </div>

        <div class="ficha-acciones">
          <button class="btn-primario" style="padding: 8px 16px; font-size: 13px;" id="btn-abrir-reportar">
            Reportar resultado
          </button>
          <button class="btn-secundario" style="padding: 8px 12px; font-size: 13px;" id="btn-abrir-agregar-doc">
            + Agregar doc SAP
          </button>
        </div>
      </div>

      ${incAbierta ? `
        <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 4px; padding: 12px 16px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div>
            <div style="font-weight: 700; color: #991b1b; font-size: 13px;">
              ⚠️ Incidencia Activa: <code>${incAbierta.id}</code> [${incAbierta.severidad}] — ${incAbierta.titulo}
            </div>
            <div style="font-size: 12px; color: #7f1d1d; margin-top: 3px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span>Estado: <strong>${incAbierta.estado}</strong> · Responsable: ${incAbierta.asignada_a || 'Sin asignar'}</span>
              ${incAbierta.transaccion ? `<span class="badge-modulo" style="background: #0f766e; font-size: 10px; padding: 1px 5px;">Tx: ${incAbierta.transaccion}</span>` : ''}
              ${incAbierta.sociedad ? `<span class="badge-codigo" style="background: #e0f2fe; color: #0369a1; font-size: 10px; padding: 1px 5px; border: 1px solid #bae6fd; font-weight: 700;">Soc: ${incAbierta.sociedad}</span>` : ''}
            </div>
          </div>
          ${esLider ? `
            <button type="button" class="btn-primario btn-abrir-gestion-inc" data-id="${incAbierta.id}" style="padding: 6px 14px; font-size: 12px; background-color: #15803d; border-color: #15803d;">
              Cerrar / Gestionar Incidencia
            </button>
          ` : ''}
        </div>
      ` : ''}

      <!-- Detalle estructurado segun catalogo -->
      <div class="seccion-ficha">
        <div class="seccion-titulo">Datos del catalogo</div>
        <div class="cuadricula-datos">
          ${prueba._tipo === 'CU' ? `
            <div class="dato-item">
              <div class="dato-etiqueta">Modulo SAP</div>
              <div class="dato-valor">${prueba.modulo}</div>
            </div>
            <div class="dato-item">
              <div class="dato-etiqueta">Transaccion SAP</div>
              <div class="dato-valor"><code>${prueba.tx || 'N/A'}</code></div>
            </div>
            <div class="dato-item">
              <div class="dato-etiqueta">Prioridad</div>
              <div class="dato-valor">${prueba.prioridad || 'Media'}</div>
            </div>
            <div class="dato-item">
              <div class="dato-etiqueta">Funcionalidad</div>
              <div class="dato-valor">${prueba.func || 'General'}</div>
            </div>
          ` : `
            <div class="dato-item">
              <div class="dato-etiqueta">Macroproceso</div>
              <div class="dato-valor">${prueba.macro}</div>
            </div>
            <div class="dato-item">
              <div class="dato-etiqueta">Areas ejecutoras</div>
              <div class="dato-valor">${(prueba.areas || []).join(' · ')}</div>
            </div>
            <div class="dato-item">
              <div class="dato-etiqueta">Sociedades</div>
              <div class="dato-valor">${(prueba.soc || []).join(', ')}</div>
            </div>
            <div class="dato-item">
              <div class="dato-etiqueta">Total de pasos</div>
              <div class="dato-valor">${(prueba.pasos || []).length} pasos</div>
            </div>
          `}
        </div>

        ${prueba.objetivo ? `
          <div style="margin-top: 10px;">
            <div class="dato-etiqueta" style="margin-bottom: 4px;">Objetivo / Resultado Esperado</div>
            <div class="caja-texto-detalle">${prueba.objetivo}</div>
          </div>
        ` : ''}
      </div>

      <!-- Pasos detallados si es escenario E2E -->
      ${prueba._tipo === 'E2E' && prueba.pasos && prueba.pasos.length > 0 ? `
        <div class="seccion-ficha">
          <div class="seccion-titulo">Pasos del flujo (${prueba.pasos.length})</div>
          <table class="tabla-pasos">
            <thead>
              <tr>
                <th style="width: 40px;">#</th>
                <th style="width: 140px;">Etapa</th>
                <th style="width: 120px;">Rol / Area</th>
                <th style="width: 90px;">Tx SAP</th>
                <th>Resultado Esperado</th>
              </tr>
            </thead>
            <tbody>
              ${prueba.pasos.map(p => `
                <tr>
                  <td><strong>${p.n}</strong></td>
                  <td>${p.etapa}</td>
                  <td>
                    <div><strong>${p.rol}</strong></div>
                    <div style="font-size: 10px; color: #64748b;">${(p.areas || []).join(', ')}</div>
                  </td>
                  <td><code>${p.tx || '-'}</code></td>
                  <td>${p.esperado}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}

      <!-- Documentos SAP registrados en esta prueba -->
      <div class="seccion-ficha">
        <div class="seccion-titulo">Documentos SAP generados (${docs.length})</div>
        ${docs.length === 0 ? `
          <p class="texto-vacio">No se han registrado numeros de documento SAP para esta prueba.</p>
        ` : `
          <table class="tabla-historial">
            <thead>
              <tr>
                <th>ID Doc</th>
                <th>Tipo</th>
                <th>Numero</th>
                <th>Sociedad</th>
                <th>Ejercicio</th>
                <th>Paso</th>
                <th>Registrado por</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              ${docs.map(d => `
                <tr>
                  <td><code>${d.id}</code></td>
                  <td><strong>${d.tipo}</strong></td>
                  <td><code style="font-size: 13px; font-weight: 700;">${d.numero}</code></td>
                  <td>${d.sociedad}</td>
                  <td>${d.ejercicio}</td>
                  <td>${d.paso ? `Paso ${d.paso}` : '-'}</td>
                  <td>${d.email}</td>
                  <td>${d.ts}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `}
      </div>

      <!-- Historial de Reportes (Append-Only) -->
      <div class="seccion-ficha">
        <div class="seccion-titulo">Historial de reportes de ejecucion (${historial.length})</div>
        ${historial.length === 0 ? `
          <p class="texto-vacio">Esta prueba aun no cuenta con reportes en el ciclo activo.</p>
        ` : `
          <table class="tabla-historial">
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Resultado</th>
                <th>Ejecutor</th>
                <th>Alcance</th>
                <th>Paso falla</th>
                <th>Comentarios / Incidencia</th>
                <th>Documentos</th>
              </tr>
            </thead>
            <tbody>
              ${historial.slice().reverse().map(h => `
                <tr>
                  <td style="white-space: nowrap;">${h.ts}</td>
                  <td><span class="badge-estado estado-${h.resultado}">${h.resultado}</span></td>
                  <td>${h.email}</td>
                  <td><strong>${h.alcance}</strong></td>
                  <td>${h.paso ? `Paso ${h.paso}` : '-'}</td>
                  <td>
                    <div>${h.comentario || '<span class="texto-vacio">Sin comentario</span>'}</div>
                    ${h.incidencia ? `
                      <div style="margin-top: 4px; display: flex; align-items: center; gap: 8px;">
                        <a href="#incidencias" style="color: #b71c1c; font-weight: 700;">Incidencia: ${h.incidencia}</a>
                        ${esLider ? `<button type="button" class="btn-secundario btn-abrir-gestion-inc" data-id="${h.incidencia}" style="padding: 2px 6px; font-size: 10px;">Gestionar</button>` : ''}
                      </div>
                    ` : ''}
                  </td>
                  <td><span style="font-size: 11px;">${h.documentos || '-'}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `}
      </div>
    </div>
  `;
}

function enlazarEventosVistaFicha() {
  const btnRep = document.getElementById('btn-abrir-reportar');
  if (btnRep) {
    btnRep.addEventListener('click', () => {
      const prueba = obtenerDetallePrueba(AppState.pruebaSeleccionada);
      const perfil = AppState.sesion ? AppState.sesion.perfil : {};
      
      let txDef = '';
      if (prueba) {
        if (prueba._tipo === 'CU' && prueba.tx) txDef = prueba.tx;
        else if (prueba._tipo === 'E2E' && Array.isArray(prueba.pasos) && prueba.pasos.length > 0) txDef = prueba.pasos[0].tx || '';
      }

      let modDef = 'MM';
      if (prueba && prueba.modulo) modDef = prueba.modulo;

      FormReporte.resultado = 'OK';
      FormReporte.pasoFalla = '';
      FormReporte.comentario = '';
      FormReporte.incidencia = {
        titulo: '',
        detalle: '',
        severidad: 'CRITICA',
        modulo: modDef,
        transaccion: txDef,
        sociedad: (perfil && perfil.sociedad) ? perfil.sociedad : 'CL11'
      };
      FormReporte.documentos = [];

      AppState.modalReporteAbierto = true;
      renderizarApp();
    });
  }

  const btnDoc = document.getElementById('btn-abrir-agregar-doc');
  if (btnDoc) {
    btnDoc.addEventListener('click', () => {
      AppState.modalAgregarDocAbierto = true;
      renderizarApp();
    });
  }

  document.querySelectorAll('.btn-abrir-gestion-inc').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      const inc = (AppState.incidencias || []).find(i => i.id === id);
      if (!inc) return;
      AppState.incidenciaEnGestion = inc;
      AppState.modalIncidenciaAbierto = true;
      renderizarApp();
    });
  });
}

/* ==========================================================================
   PANTALLA 4: MODAL DE REPORTE (§8.4)
   ========================================================================== */
const FormReporte = {
  resultado: 'OK',
  pasoFalla: '',
  comentario: '',
  incidencia: {
    titulo: '',
    detalle: '',
    severidad: 'CRITICA',
    modulo: 'MM',
    transaccion: '',
    sociedad: 'CL11'
  },
  documentos: []
};

function proponerTiposDocParaPrueba(prueba) {
  if (!prueba) return LISTA_TIPOS_DOC;
  if (prueba._tipo === 'CU') {
    return LISTA_TIPOS_DOC;
  }

  const txPasos = (prueba.pasos || []).map(p => (p.tx || '').toUpperCase());
  const sugeridos = [];
  const otros = [];

  LISTA_TIPOS_DOC.forEach(t => {
    const txTipo = (t.tx || '').toUpperCase();
    const coincide = txPasos.some(tx => tx && txTipo.includes(tx));
    if (coincide) sugeridos.push(t);
    else otros.push(t);
  });

  return [...sugeridos, ...otros];
}

function renderizarModalReportar() {
  const prueba = obtenerDetallePrueba(AppState.pruebaSeleccionada);
  const perfil = AppState.sesion.perfil;

  let esApoyo = false;
  let areaAsignadaTexto = '';
  if (prueba._tipo === 'E2E') {
    const areasPrueba = (prueba.areas || []).map(a => String(a).toUpperCase());
    const areasUser = (perfil.areas || '').split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
    if (areasUser.length > 0 && !areasPrueba.some(a => areasUser.includes(a))) {
      esApoyo = true;
      areaAsignadaTexto = (prueba.areas || []).join(', ');
    }
  } else if (prueba._tipo === 'CU') {
    const modulosUser = (perfil.modulos || '').split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
    if (modulosUser.length > 0 && !modulosUser.includes(String(prueba.modulo).toUpperCase())) {
      esApoyo = true;
      areaAsignadaTexto = `Modulo ${prueba.modulo}`;
    }
  }

  const tiposOrdenados = proponerTiposDocParaPrueba(prueba);

  return `
    <div class="modal-fondo">
      <div class="modal-cuerpo">
        <div class="modal-cabecera">
          <div class="modal-titulo">Reportar Resultado: ${prueba._codigo}</div>
          <button class="btn-cerrar-modal" id="btn-cerrar-modal-rep">&times;</button>
        </div>

        ${esApoyo ? `
          <div class="alerta-apoyo">
            <strong>Aviso de cobertura:</strong> Esta prueba esta asignada a <strong>${areaAsignadaTexto}</strong>. Quedara registrada como <strong>APOYO</strong>.
          </div>
        ` : ''}

        <form id="form-reporte-ejecucion" onsubmit="event.preventDefault();">
          <!-- 4 Botones grandes de resultado -->
          <div class="form-grupo">
            <label>Resultado de la prueba</label>
            <div class="cuadricula-botones-resultado">
              <button type="button" class="btn-resultado ${FormReporte.resultado === 'OK' ? 'seleccionado-OK' : ''}" data-res="OK">
                OK
              </button>
              <button type="button" class="btn-resultado ${FormReporte.resultado === 'NOK' ? 'seleccionado-NOK' : ''}" data-res="NOK">
                NOK
              </button>
              <button type="button" class="btn-resultado ${FormReporte.resultado === 'BLOQUEADO' ? 'seleccionado-BLOQUEADO' : ''}" data-res="BLOQUEADO">
                Bloqueado
              </button>
              <button type="button" class="btn-resultado ${FormReporte.resultado === 'NO_APLICA' ? 'seleccionado-NO_APLICA' : ''}" data-res="NO_APLICA">
                No aplica
              </button>
            </div>
          </div>

          <!-- Si es E2E y NOK, paso obligatorio donde fallo -->
          ${prueba._tipo === 'E2E' && FormReporte.resultado === 'NOK' ? `
            <div class="form-grupo">
              <label for="rep-paso-falla">Paso donde fallo (Obligatorio en E2E) *</label>
              <select id="rep-paso-falla" class="form-select" required>
                <option value="">-- Seleccione el paso exacto de la falla --</option>
                ${(prueba.pasos || []).map(p => `
                  <option value="${p.n}" ${String(FormReporte.pasoFalla) === String(p.n) ? 'selected' : ''}>
                    Paso ${p.n}: ${p.etapa} (${p.tx || 'Sin Tx'})
                  </option>
                `).join('')}
              </select>
            </div>
          ` : ''}

          <!-- Comentario libre -->
          <div class="form-grupo">
            <label for="rep-comentario">
              Comentario ${FormReporte.resultado !== 'OK' ? '(Obligatorio para ' + FormReporte.resultado + ') *' : '(Opcional)'}
            </label>
            <textarea id="rep-comentario" class="form-textarea" rows="3" placeholder="Describa lo observado, precondiciones o detalles de la ejecucion..." ${FormReporte.resultado !== 'OK' ? 'required' : ''}>${FormReporte.comentario}</textarea>
          </div>

          <!-- Bloque Incidencia obligatoria en caso de NOK -->
          ${FormReporte.resultado === 'NOK' ? `
            <div class="caja-incidencia-obligatoria">
              <div class="incidencia-cabecera-alerta">Apertura Obligatoria de Incidencia (§6.3)</div>

              <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 12px;">
                <div class="form-grupo" style="flex: 1; min-width: 140px;">
                  <label for="inc-transaccion" style="font-weight: 700;">Transacción SAP Utilizada *</label>
                  <input type="text" id="inc-transaccion" class="form-input" placeholder="Ej: ME21N, MM01, BP, VA01..." value="${FormReporte.incidencia.transaccion}" required style="font-weight: 700; text-transform: uppercase;">
                  <div style="font-size: 11px; color: var(--texto-secundario); margin-top: 2px;">
                    Tx donde se produjo la falla.
                  </div>
                </div>

                <div class="form-grupo" style="flex: 1; min-width: 140px;">
                  <label for="inc-sociedad" style="font-weight: 700;">Sociedad Probada *</label>
                  <select id="inc-sociedad" class="form-select" required style="font-weight: 700;">
                    ${LISTA_SOCIEDADES.map(s => `
                      <option value="${s.codigo}" ${FormReporte.incidencia.sociedad === s.codigo ? 'selected' : ''}>
                        ${s.codigo} — ${s.nombre} (${s.pais})
                      </option>
                    `).join('')}
                  </select>
                  <div style="font-size: 11px; color: var(--texto-secundario); margin-top: 2px;">
                    Sociedad fiscal de la prueba.
                  </div>
                </div>
              </div>

              <div class="form-grupo">
                <label for="inc-titulo">Titulo de la incidencia *</label>
                <input type="text" id="inc-titulo" class="form-input" placeholder="Resumen de una linea del problema..." value="${FormReporte.incidencia.titulo}" required>
              </div>

              <div class="form-grupo">
                <label for="inc-detalle">Detalle (Que se esperaba, que ocurrio, como reproducir) *</label>
                <textarea id="inc-detalle" class="form-textarea" rows="3" placeholder="Detalle el error, mensaje de SAP o bloqueo encontrado..." required>${FormReporte.incidencia.detalle}</textarea>
              </div>

              <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                <div class="form-grupo" style="flex: 1;">
                  <label for="inc-severidad">Severidad (§6.4)</label>
                  <select id="inc-severidad" class="form-select">
                    <option value="CRITICA" ${FormReporte.incidencia.severidad === 'CRITICA' ? 'selected' : ''}>CRITICA (Bloquea Go-Live)</option>
                    <option value="ALTA" ${FormReporte.incidencia.severidad === 'ALTA' ? 'selected' : ''}>ALTA (Alternativa manual)</option>
                    <option value="MEDIA" ${FormReporte.incidencia.severidad === 'MEDIA' ? 'selected' : ''}>MEDIA (No bloquea)</option>
                    <option value="BAJA" ${FormReporte.incidencia.severidad === 'BAJA' ? 'selected' : ''}>BAJA (Cosmetico)</option>
                  </select>
                </div>

                <div class="form-grupo" style="flex: 1;">
                  <label for="inc-modulo">Modulo responsable</label>
                  <select id="inc-modulo" class="form-select">
                    <option value="MM" ${FormReporte.incidencia.modulo === 'MM' ? 'selected' : ''}>MM</option>
                    <option value="SD" ${FormReporte.incidencia.modulo === 'SD' ? 'selected' : ''}>SD</option>
                    <option value="FICO" ${FormReporte.incidencia.modulo === 'FICO' ? 'selected' : ''}>FICO</option>
                    <option value="EWM" ${FormReporte.incidencia.modulo === 'EWM' ? 'selected' : ''}>EWM</option>
                    <option value="CFG" ${FormReporte.incidencia.modulo === 'CFG' ? 'selected' : ''}>CFG</option>
                  </select>
                </div>
              </div>
            </div>
          ` : ''}

          <!-- Documentos SAP generados (Opcional en todos los casos) -->
          <div class="seccion-docs-form">
            <div class="docs-form-encabezado">
              <label style="font-weight: 700; font-size: 12px; text-transform: uppercase;">Documentos SAP generados (Opcional)</label>
              <button type="button" class="btn-secundario" style="padding: 4px 8px; font-size: 11px;" id="btn-form-agregar-doc">
                + Agregar documento
              </button>
            </div>

            <div id="contenedor-docs-inputs">
              ${FormReporte.documentos.map((doc, idx) => {
                const defTipo = LISTA_TIPOS_DOC.find(x => x.codigo === doc.tipo);
                let avisoPatron = '';
                if (defTipo && defTipo.patron && doc.numero) {
                  const reg = new RegExp(defTipo.patron);
                  if (!reg.test(doc.numero)) {
                    avisoPatron = `⚠️ Formato sugerido para ${defTipo.nombre}: ${defTipo.patron}. Puede guardar de todas formas.`;
                  }
                }

                return `
                  <div class="fila-doc-input" data-idx="${idx}">
                    <div class="doc-campos-principales">
                      <select class="form-select sel-doc-tipo" data-idx="${idx}">
                        ${tiposOrdenados.map(t => `
                          <option value="${t.codigo}" ${doc.tipo === t.codigo ? 'selected' : ''}>
                            ${t.nombre} (${t.codigo})
                          </option>
                        `).join('')}
                      </select>
                      <input type="text" class="form-input inp-doc-numero" placeholder="Numero SAP (ej: 4500001234)" value="${doc.numero}" data-idx="${idx}">
                      <button type="button" class="btn-secundario btn-eliminar-doc" data-idx="${idx}" style="padding: 4px 8px; color: #b71c1c;">Quitar</button>
                    </div>

                    ${avisoPatron ? `<div class="doc-aviso-patron">${avisoPatron}</div>` : ''}

                    <div class="doc-detalle-desplegable">
                      <div>
                        <span>Sociedad:</span>
                        <select class="inp-doc-sociedad" style="width: 85px; font-size: 11px; padding: 2px 4px;" data-idx="${idx}">
                          ${LISTA_SOCIEDADES.map(s => `
                            <option value="${s.codigo}" ${(doc.sociedad || perfil.sociedad || 'CL11') === s.codigo ? 'selected' : ''}>
                              ${s.codigo}
                            </option>
                          `).join('')}
                        </select>
                      </div>
                      <div>
                        <span>Ejercicio:</span>
                        <input type="number" class="inp-doc-ejercicio" style="width: 70px;" value="${doc.ejercicio || 2026}" data-idx="${idx}">
                      </div>
                      ${prueba._tipo === 'E2E' ? `
                        <div>
                          <span>Paso:</span>
                          <select class="sel-doc-paso" style="width: 90px;" data-idx="${idx}">
                            <option value="">General</option>
                            ${(prueba.pasos || []).map(p => `
                              <option value="${p.n}" ${String(doc.paso) === String(p.n) ? 'selected' : ''}>Paso ${p.n}</option>
                            `).join('')}
                          </select>
                        </div>
                      ` : ''}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px;">
            <button type="button" class="btn-secundario" id="btn-cancelar-rep">Cancelar</button>
            <button type="button" class="btn-primario" id="btn-guardar-rep" style="width: auto; min-width: 140px;">
              Guardar resultado
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function enlazarEventosModalReportar() {
  const btnCerrar = document.getElementById('btn-cerrar-modal-rep');
  const btnCancelar = document.getElementById('btn-cancelar-rep');
  const cerrar = () => {
    AppState.modalReporteAbierto = false;
    renderizarApp();
  };
  if (btnCerrar) btnCerrar.addEventListener('click', cerrar);
  if (btnCancelar) btnCancelar.addEventListener('click', cerrar);

  document.querySelectorAll('.btn-resultado').forEach(btn => {
    btn.addEventListener('click', () => {
      // Guardar campos actuales antes de re-renderizar para no perder el texto ingresado
      const comActual = document.getElementById('rep-comentario')?.value;
      if (comActual !== undefined) FormReporte.comentario = comActual;

      const incTit = document.getElementById('inc-titulo')?.value;
      if (incTit !== undefined) FormReporte.incidencia.titulo = incTit;
      const incDet = document.getElementById('inc-detalle')?.value;
      if (incDet !== undefined) FormReporte.incidencia.detalle = incDet;
      const incTx = document.getElementById('inc-transaccion')?.value;
      if (incTx !== undefined) FormReporte.incidencia.transaccion = incTx;
      const incSoc = document.getElementById('inc-sociedad')?.value;
      if (incSoc !== undefined) FormReporte.incidencia.sociedad = incSoc;
      const incSev = document.getElementById('inc-severidad')?.value;
      if (incSev !== undefined) FormReporte.incidencia.severidad = incSev;
      const incMod = document.getElementById('inc-modulo')?.value;
      if (incMod !== undefined) FormReporte.incidencia.modulo = incMod;

      FormReporte.resultado = btn.dataset.res;
      renderizarApp();
    });
  });

  const selPasoFalla = document.getElementById('rep-paso-falla');
  if (selPasoFalla) {
    selPasoFalla.addEventListener('change', (e) => {
      FormReporte.pasoFalla = e.target.value;
      const prueba = obtenerDetallePrueba(AppState.pruebaSeleccionada);
      if (prueba && prueba._tipo === 'E2E' && Array.isArray(prueba.pasos)) {
        const pasoObj = prueba.pasos.find(p => String(p.n) === String(e.target.value));
        if (pasoObj) {
          if (pasoObj.tx) FormReporte.incidencia.transaccion = pasoObj.tx;
          if (pasoObj.mod) {
            const m = pasoObj.mod.split('/')[0].trim();
            if (['MM', 'SD', 'FICO', 'EWM', 'CFG'].includes(m)) FormReporte.incidencia.modulo = m;
          }
        }
      }
      renderizarApp();
    });
  }

  const btnAgregarDoc = document.getElementById('btn-form-agregar-doc');
  if (btnAgregarDoc) {
    btnAgregarDoc.addEventListener('click', () => {
      const prueba = obtenerDetallePrueba(AppState.pruebaSeleccionada);
      const tipos = proponerTiposDocParaPrueba(prueba);
      const perfil = AppState.sesion.perfil;
      FormReporte.documentos.push({
        tipo: tipos[0] ? tipos[0].codigo : 'PEDIDO_VENTA',
        numero: '',
        sociedad: perfil.sociedad || 'CL11',
        ejercicio: 2026,
        paso: ''
      });
      renderizarApp();
    });
  }

  document.querySelectorAll('.sel-doc-tipo').forEach(sel => {
    sel.addEventListener('change', (e) => {
      const idx = e.target.dataset.idx;
      FormReporte.documentos[idx].tipo = e.target.value;
      renderizarApp();
    });
  });

  document.querySelectorAll('.inp-doc-numero').forEach(inp => {
    inp.addEventListener('input', (e) => {
      const idx = e.target.dataset.idx;
      FormReporte.documentos[idx].numero = e.target.value;
    });
    inp.addEventListener('blur', () => {
      renderizarApp();
    });
  });

  document.querySelectorAll('.inp-doc-sociedad').forEach(inp => {
    inp.addEventListener('input', (e) => {
      const idx = e.target.dataset.idx;
      FormReporte.documentos[idx].sociedad = e.target.value;
    });
  });

  document.querySelectorAll('.inp-doc-ejercicio').forEach(inp => {
    inp.addEventListener('input', (e) => {
      const idx = e.target.dataset.idx;
      FormReporte.documentos[idx].ejercicio = e.target.value;
    });
  });

  document.querySelectorAll('.sel-doc-paso').forEach(sel => {
    sel.addEventListener('change', (e) => {
      const idx = e.target.dataset.idx;
      FormReporte.documentos[idx].paso = e.target.value;
    });
  });

  document.querySelectorAll('.btn-eliminar-doc').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = e.target.dataset.idx;
      FormReporte.documentos.splice(idx, 1);
      renderizarApp();
    });
  });

  const ejecutarGuardarReporte = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    const comentario = (document.getElementById('rep-comentario')?.value || '').trim();
    const pasoFalla = document.getElementById('rep-paso-falla')?.value || null;
    const prueba = obtenerDetallePrueba(AppState.pruebaSeleccionada);

    if (FormReporte.resultado === 'NOK') {
      if (prueba._tipo === 'E2E' && !pasoFalla) {
        alert('En escenarios E2E con resultado NOK debe seleccionar obligatoriamente el paso donde falló.');
        return;
      }
      const incTitulo = (document.getElementById('inc-titulo')?.value || '').trim();
      const incDetalle = (document.getElementById('inc-detalle')?.value || '').trim();
      const incTx = (document.getElementById('inc-transaccion')?.value || '').trim().toUpperCase();
      const incSoc = (document.getElementById('inc-sociedad')?.value || '').trim().toUpperCase();

      if (!incTitulo || !incDetalle) {
        alert('Para guardar un resultado NOK debe completar obligatoriamente el título y detalle de la incidencia.');
        return;
      }
      if (!incTx) {
        alert('Debe indicar la transacción SAP utilizada donde ocurrió la falla (ej: ME21N, MM01, BP).');
        document.getElementById('inc-transaccion')?.focus();
        return;
      }
      if (!incSoc) {
        alert('Debe indicar la sociedad en la que se probó.');
        return;
      }

      FormReporte.incidencia.titulo = incTitulo;
      FormReporte.incidencia.detalle = incDetalle;
      FormReporte.incidencia.transaccion = incTx;
      FormReporte.incidencia.sociedad = incSoc;
      FormReporte.incidencia.severidad = document.getElementById('inc-severidad')?.value || 'MEDIA';
      FormReporte.incidencia.modulo = document.getElementById('inc-modulo')?.value || 'MM';
    }

    if ((FormReporte.resultado === 'BLOQUEADO' || FormReporte.resultado === 'NO_APLICA') && !comentario) {
      alert(`Para reportar ${FormReporte.resultado} es obligatorio ingresar un comentario explicativo.`);
      return;
    }

    const btnSubmit = document.getElementById('btn-guardar-rep');
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = '<span class="spinner"></span> Guardando...';
    }

    try {
      const idCliente = 'R-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
      const docsValidos = FormReporte.documentos.filter(d => String(d.numero || '').trim().length > 0);

      const payload = {
        id: idCliente,
        tipo: prueba._tipo,
        objeto: prueba._codigo,
        resultado: FormReporte.resultado,
        paso: pasoFalla ? Number(pasoFalla) : null,
        comentario: comentario,
        documentos: docsValidos,
        incidencia: FormReporte.resultado === 'NOK' ? FormReporte.incidencia : null,
        moduloPrueba: prueba.modulo || null,
        areasPrueba: prueba.areas || []
      };

      const resp = await api('reportar', payload);
      mostrarToast('Resultado guardado correctamente.');

      FormReporte.documentos = [];
      FormReporte.comentario = '';
      FormReporte.resultado = 'OK';
      AppState.modalReporteAbierto = false;

      // Actualización inmediata en cliente para respuesta instantánea al usuario
      // Determinar si para el usuario reportante este resultado es asignada o apoyo
      let esApoyoReporte = false;
      if (prueba._tipo === 'E2E') {
        const areasPrueba = (prueba.areas || []).map(a => String(a).toUpperCase());
        esApoyoReporte = !areasPrueba.some(a => usuarioPerteneceAArea(AppState.sesion.perfil.email, a)) && AppState.sesion.perfil.rol !== 'LIDER';
      } else if (prueba._tipo === 'CU') {
        const modulosUser = (AppState.sesion.perfil.modulos || '').split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
        esApoyoReporte = modulosUser.length > 0 && !modulosUser.includes(String(prueba.modulo).toUpperCase()) && AppState.sesion.perfil.rol !== 'LIDER';
      }
      const alcanceFinal = (resp && resp.resultado && resp.resultado.alcance) ? resp.resultado.alcance : (esApoyoReporte ? 'APOYO' : 'ASIGNADA');

      const nuevoResultado = (resp && resp.resultado) ? resp.resultado : {
        id: payload.id,
        ts: tsLocal,
        tipo: payload.tipo,
        objeto: payload.objeto,
        resultado: payload.resultado,
        paso: payload.paso || '',
        comentario: payload.comentario || '',
        documentos: payload.documentos ? payload.documentos.map(d => (d.tipo || 'DOC') + ' ' + (d.numero || '')).join(' · ') : '',
        email: AppState.sesion ? AppState.sesion.perfil.email : '',
        alcance: alcanceFinal,
        ciclo: (AppState.sesion && AppState.sesion.config) ? AppState.sesion.config.ciclo_activo : 1,
        golive: (AppState.sesion && AppState.sesion.config) ? AppState.sesion.config.golive_activo : 'GL1',
        ambiente: (AppState.sesion && AppState.sesion.config) ? AppState.sesion.config.ambiente : 'QAS-200',
        incidencia: (resp && resp.incidencia) ? (typeof resp.incidencia === 'object' ? resp.incidencia.id : resp.incidencia) : ''
      };

      AppState.resultadosVigentes.set(payload.objeto, nuevoResultado);
      if (!AppState.historialPorObjeto.has(payload.objeto)) {
        AppState.historialPorObjeto.set(payload.objeto, []);
      }
      AppState.historialPorObjeto.get(payload.objeto).unshift(nuevoResultado);

      if (resp && resp.incidencia && typeof resp.incidencia === 'object') {
        AppState.incidencias.unshift(resp.incidencia);
      }
      if (resp && resp.documentos && Array.isArray(resp.documentos)) {
        resp.documentos.forEach(d => AppState.documentos.unshift(d));
      }

      // Renderizado inmediato
      renderizarApp();

      // Sincronización en segundo plano sin congelar la pantalla
      sincronizarEstadoServidor().then(() => renderizarApp()).catch(() => {});
    } catch (err) {
      alert('Error al guardar reporte: ' + err.message);
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = 'Guardar resultado';
      }
    }
  };

  const btnSubmit = document.getElementById('btn-guardar-rep');
  if (btnSubmit) {
    btnSubmit.addEventListener('click', ejecutarGuardarReporte);
  }

  const form = document.getElementById('form-reporte-ejecucion');
  if (form) {
    form.addEventListener('submit', ejecutarGuardarReporte);
  }
}

/* ==========================================================================
   MODAL PARA AGREGAR DOCUMENTO A UNA PRUEBA DIRECTAMENTE (§8.3)
   ========================================================================== */
function renderizarModalAgregarDoc() {
  const prueba = obtenerDetallePrueba(AppState.pruebaSeleccionada);
  const perfil = AppState.sesion.perfil;
  const tipos = proponerTiposDocParaPrueba(prueba);

  return `
    <div class="modal-fondo">
      <div class="modal-cuerpo" style="max-width: 480px;">
        <div class="modal-cabecera">
          <div class="modal-titulo">Agregar Documento SAP: ${prueba._codigo}</div>
          <button class="btn-cerrar-modal" id="btn-cerrar-modal-doc">&times;</button>
        </div>

        <form id="form-agregar-doc-directo" onsubmit="event.preventDefault();">
          <div class="form-grupo">
            <label for="doc-directo-tipo">Tipo de Documento</label>
            <select id="doc-directo-tipo" class="form-select">
              ${tipos.map(t => `<option value="${t.codigo}">${t.nombre} (${t.codigo})</option>`).join('')}
            </select>
          </div>

          <div class="form-grupo">
            <label for="doc-directo-numero">Numero de Documento SAP *</label>
            <input type="text" id="doc-directo-numero" class="form-input" placeholder="ej: 4500001234 (con ceros a la izquierda)" required>
            <div id="aviso-patron-directo" class="doc-aviso-patron" style="display: none;"></div>
          </div>

          <div style="display: flex; gap: 10px;">
            <div class="form-grupo" style="flex: 1;">
              <label for="doc-directo-sociedad">Sociedad</label>
              <select id="doc-directo-sociedad" class="form-select">
                ${LISTA_SOCIEDADES.map(s => `
                  <option value="${s.codigo}" ${(perfil.sociedad || 'CL11') === s.codigo ? 'selected' : ''}>
                    ${s.codigo} — ${s.nombre} (${s.pais})
                  </option>
                `).join('')}
              </select>
            </div>
            <div class="form-grupo" style="flex: 1;">
              <label for="doc-directo-ejercicio">Ejercicio</label>
              <input type="number" id="doc-directo-ejercicio" class="form-input" value="2026">
            </div>
          </div>

          ${prueba._tipo === 'E2E' ? `
            <div class="form-grupo">
              <label for="doc-directo-paso">Paso del escenario (opcional)</label>
              <select id="doc-directo-paso" class="form-select">
                <option value="">General</option>
                ${(prueba.pasos || []).map(p => `<option value="${p.n}">Paso ${p.n}: ${p.etapa}</option>`).join('')}
              </select>
            </div>
          ` : ''}

          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px;">
            <button type="button" class="btn-secundario" id="btn-cancelar-doc-directo">Cancelar</button>
            <button type="submit" class="btn-primario" id="btn-guardar-doc-directo" style="width: auto;">
              Guardar documento
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function enlazarEventosModalDoc() {
  const cerrar = () => {
    AppState.modalAgregarDocAbierto = false;
    renderizarApp();
  };
  document.getElementById('btn-cerrar-modal-doc')?.addEventListener('click', cerrar);
  document.getElementById('btn-cancelar-doc-directo')?.addEventListener('click', cerrar);

  const inpNum = document.getElementById('doc-directo-numero');
  const selTipo = document.getElementById('doc-directo-tipo');
  const divAviso = document.getElementById('aviso-patron-directo');

  function verificarPatron() {
    if (!inpNum || !selTipo || !divAviso) return;
    const def = LISTA_TIPOS_DOC.find(x => x.codigo === selTipo.value);
    if (def && def.patron && inpNum.value.trim()) {
      const reg = new RegExp(def.patron);
      if (!reg.test(inpNum.value.trim())) {
        divAviso.style.display = 'block';
        divAviso.textContent = `⚠️ Formato sugerido para ${def.nombre}: ${def.patron}. Puede guardar de todas formas.`;
        return;
      }
    }
    divAviso.style.display = 'none';
  }

  inpNum?.addEventListener('input', verificarPatron);
  selTipo?.addEventListener('change', verificarPatron);

  const form = document.getElementById('form-agregar-doc-directo');
  if (form) {
    form.addEventListener('submit', async () => {
      const prueba = obtenerDetallePrueba(AppState.pruebaSeleccionada);
      const numero = inpNum.value.trim();
      const tipo = selTipo.value;
      const sociedad = document.getElementById('doc-directo-sociedad')?.value || 'CL11';
      const ejercicio = document.getElementById('doc-directo-ejercicio')?.value || 2026;
      const paso = document.getElementById('doc-directo-paso')?.value || null;

      const vig = AppState.resultadosVigentes.get(prueba._codigo);
      const idReporte = vig ? vig.id : ('R-' + Date.now() + '-doc');

      const payload = {
        id: idReporte,
        tipo: prueba._tipo,
        objeto: prueba._codigo,
        resultado: vig ? vig.resultado : 'PENDIENTE',
        paso: vig ? vig.paso : null,
        comentario: vig ? vig.comentario : 'Documento agregado posteriormente',
        documentos: [{
          tipo,
          numero,
          sociedad,
          ejercicio: Number(ejercicio),
          paso: paso ? Number(paso) : null
        }],
        moduloPrueba: prueba.modulo || null,
        areasPrueba: prueba.areas || []
      };

      try {
        const resp = await api('reportar', payload);
        mostrarToast('Documento SAP agregado correctamente.');
        AppState.modalAgregarDocAbierto = false;
        if (resp && resp.documentos && Array.isArray(resp.documentos)) {
          resp.documentos.forEach(d => AppState.documentos.unshift(d));
        }
        renderizarApp();
        sincronizarEstadoServidor().then(() => renderizarApp()).catch(() => {});
      } catch(err) {
        alert('Error al registrar documento: ' + err.message);
      }
    });
  }
}

/* ==========================================================================
   PANTALLA 5: BUSQUEDA POR DOCUMENTO O PRUEBA (§8.5)
   ========================================================================== */
async function ejecutarBusquedaGlobal(termino) {
  if (!termino) return;
  const t = termino.trim();
  AppState.filtros.busquedaGlobal = t;

  if (t.toUpperCase().startsWith('CU-') || t.toUpperCase().startsWith('E2E-')) {
    const prueba = obtenerDetallePrueba(t.toUpperCase());
    if (prueba) {
      window.location.hash = `#prueba/${prueba._codigo}`;
      return;
    }
  }

  try {
    AppState.cargando = true;
    renderizarApp();
    const data = await api('buscarDocumento', { numero: t });
    AppState.busquedaDocResultados = data.coincidencias || [];
    window.location.hash = `#buscar?q=${encodeURIComponent(t)}`;
  } catch(e) {
    alert('Error en busqueda: ' + e.message);
  } finally {
    AppState.cargando = false;
    renderizarApp();
  }
}

function renderizarPantallaBuscar() {
  const query = AppState.filtros.busquedaGlobal || '';
  const resultados = AppState.busquedaDocResultados || [];

  return `
    <div class="panel-busqueda-doc">
      <div style="margin-bottom: 16px;">
        <h2 style="font-size: 16px; font-weight: 700;">Resultados de Busqueda: "${query}"</h2>
        <div style="font-size: 12px; color: var(--texto-secundario);">
          Trazabilidad de documentos SAP y pruebas relacionadas (§8.5)
        </div>
      </div>

      ${resultados.length === 0 ? `
        <div style="padding: 24px; text-align: center; color: var(--texto-atenuado);">
          No se encontraron documentos SAP con el numero ingresado ("${query}").
        </div>
      ` : `
        <table class="tabla-historial">
          <thead>
            <tr>
              <th>Tipo Documento</th>
              <th>Numero SAP</th>
              <th>Prueba Origen</th>
              <th>Paso</th>
              <th>Ejecutor</th>
              <th>Fecha</th>
              <th>Comentario del reporte</th>
              <th>Accion</th>
            </tr>
          </thead>
          <tbody>
            ${resultados.map(item => {
              const doc = item.documento;
              const res = item.resultado;
              return `
                <tr>
                  <td><strong>${doc.tipo}</strong></td>
                  <td><code style="font-size: 14px; font-weight: 700;">${doc.numero}</code></td>
                  <td>
                    <span class="badge-codigo ${doc.tipo_objeto === 'CU' ? 'badge-cu' : 'badge-e2e'}">
                      ${doc.objeto}
                    </span>
                  </td>
                  <td>${doc.paso ? `Paso ${doc.paso}` : '-'}</td>
                  <td>${doc.email}</td>
                  <td>${doc.ts}</td>
                  <td>${res.comentario || '<span class="texto-vacio">Sin comentario</span>'}</td>
                  <td>
                    <a href="#prueba/${doc.objeto}" class="btn-secundario" style="padding: 3px 8px; font-size: 11px;">Ver ficha</a>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `}
    </div>
  `;
}

/* ==========================================================================
   PANTALLA 6: INCIDENCIAS (§8.6)
   ========================================================================== */
function renderizarPantallaIncidencias() {
  const incidencias = AppState.incidencias || [];
  const esLider = esLiderOAdmin();

  if (!AppState.filtrosIncidencias) {
    AppState.filtrosIncidencias = {
      estado: 'todos',
      severidad: 'todos',
      reporta: 'todos',
      asignada: 'todos'
    };
  }
  const f = AppState.filtrosIncidencias;

  // Extraer valores únicos para los desplegables de filtrado
  const reportantesUnicos = Array.from(new Set(incidencias.map(i => String(i.reporta || '').trim()).filter(Boolean))).sort();
  const asignacionesUnicas = Array.from(new Set(incidencias.map(i => String(i.asignada_a || '').trim()).filter(a => a && a.toLowerCase() !== 'sin asignar' && a.toLowerCase() !== 'pendiente asignacion'))).sort();

  // Filtrado de incidencias
  const incidenciasFiltradas = incidencias.filter(inc => {
    if (f.estado !== 'todos' && inc.estado !== f.estado) return false;
    if (f.severidad !== 'todos' && inc.severidad !== f.severidad) return false;
    if (f.reporta !== 'todos' && String(inc.reporta || '').trim().toLowerCase() !== f.reporta.toLowerCase()) return false;
    if (f.asignada !== 'todos') {
      const asig = String(inc.asignada_a || '').trim().toLowerCase();
      if (f.asignada === '__sin_asignar__') {
        if (asig && asig !== 'sin asignar' && asig !== 'pendiente asignacion') return false;
      } else {
        if (asig !== f.asignada.toLowerCase()) return false;
      }
    }
    return true;
  });

  const hayFiltrosActivos = f.estado !== 'todos' || f.severidad !== 'todos' || f.reporta !== 'todos' || f.asignada !== 'todos';

  return `
    <div>
      <div class="panel-control-pruebas">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 12px;">
          <div>
            <h2 style="font-size: 16px; font-weight: 700;">Matriz de Incidencias</h2>
            <div style="font-size: 12px; color: var(--texto-secundario);">
              Defectos detectados durante las pruebas (${hayFiltrosActivos ? `${incidenciasFiltradas.length} de ${incidencias.length}` : incidencias.length} registradas)
            </div>
          </div>
          <div style="display: flex; gap: 8px; align-items: center;">
            ${hayFiltrosActivos ? `
              <button type="button" id="btn-limpiar-filtros-inc" class="btn-secundario" style="font-size: 12px; padding: 6px 12px; color: #b71c1c; border-color: #fecaca; background: #fff5f5; cursor: pointer;">
                ✕ Limpiar filtros
              </button>
            ` : ''}
            <button type="button" id="btn-recargar-incidencias" class="btn-secundario" style="font-size: 12px; padding: 6px 14px; display: inline-flex; align-items: center; gap: 6px; cursor: pointer;">
              <span>🔄</span> Recargar desde planilla
            </button>
          </div>
        </div>

        <!-- Barra de filtros: Estado, Severidad, Reportado por, Asignada a -->
        <div class="barra-filtros">
          <div class="filtro-item" style="flex: 1; min-width: 140px;">
            <label for="filtro-inc-estado">Estado</label>
            <select id="filtro-inc-estado" class="form-select">
              <option value="todos" ${f.estado === 'todos' ? 'selected' : ''}>Todos los estados</option>
              <option value="ABIERTA" ${f.estado === 'ABIERTA' ? 'selected' : ''}>Abierta</option>
              <option value="EN_ANALISIS" ${f.estado === 'EN_ANALISIS' ? 'selected' : ''}>En análisis</option>
              <option value="EN_CORRECCION" ${f.estado === 'EN_CORRECCION' ? 'selected' : ''}>En corrección</option>
              <option value="EN_RETEST" ${f.estado === 'EN_RETEST' ? 'selected' : ''}>En re-test</option>
              <option value="CERRADA" ${f.estado === 'CERRADA' ? 'selected' : ''}>Cerrada</option>
              <option value="DESCARTADA" ${f.estado === 'DESCARTADA' ? 'selected' : ''}>Descartada</option>
            </select>
          </div>

          <div class="filtro-item" style="flex: 1; min-width: 140px;">
            <label for="filtro-inc-severidad">Severidad</label>
            <select id="filtro-inc-severidad" class="form-select">
              <option value="todos" ${f.severidad === 'todos' ? 'selected' : ''}>Todas las severidades</option>
              <option value="CRITICA" ${f.severidad === 'CRITICA' ? 'selected' : ''}>Crítica</option>
              <option value="ALTA" ${f.severidad === 'ALTA' ? 'selected' : ''}>Alta</option>
              <option value="MEDIA" ${f.severidad === 'MEDIA' ? 'selected' : ''}>Media</option>
              <option value="BAJA" ${f.severidad === 'BAJA' ? 'selected' : ''}>Baja</option>
            </select>
          </div>

          <div class="filtro-item" style="flex: 1.2; min-width: 180px;">
            <label for="filtro-inc-reporta">Reportado por</label>
            <select id="filtro-inc-reporta" class="form-select">
              <option value="todos" ${f.reporta === 'todos' ? 'selected' : ''}>Todos los reportantes</option>
              ${reportantesUnicos.map(email => {
                const u = LISTA_USUARIOS_SIMULADOS.find(x => (x.email || '').toLowerCase() === email.toLowerCase());
                const etiqueta = u ? `${u.nombre} (${email})` : email;
                return `<option value="${email}" ${f.reporta.toLowerCase() === email.toLowerCase() ? 'selected' : ''}>${etiqueta}</option>`;
              }).join('')}
            </select>
          </div>

          <div class="filtro-item" style="flex: 1.2; min-width: 180px;">
            <label for="filtro-inc-asignada">Asignada a</label>
            <select id="filtro-inc-asignada" class="form-select">
              <option value="todos" ${f.asignada === 'todos' ? 'selected' : ''}>Todas las asignaciones</option>
              <option value="__sin_asignar__" ${f.asignada === '__sin_asignar__' ? 'selected' : ''}>Sin asignar / Pendiente</option>
              ${asignacionesUnicas.map(asig => {
                const u = LISTA_USUARIOS_SIMULADOS.find(x => (x.email || '').toLowerCase() === asig.toLowerCase());
                const etiqueta = u ? `${u.nombre} (${asig})` : asig;
                return `<option value="${asig}" ${f.asignada.toLowerCase() === asig.toLowerCase() ? 'selected' : ''}>${etiqueta}</option>`;
              }).join('')}
            </select>
          </div>
        </div>
      </div>

      <div class="panel-lista-pruebas">
        <table class="tabla-pruebas">
          <thead>
            <tr>
              <th style="width: 85px;">ID</th>
              <th style="width: 95px;">Severidad</th>
              <th style="width: 100px;">Estado</th>
              <th style="width: 110px;">Prueba / Tx</th>
              <th style="width: 85px;">Mod / Soc</th>
              <th>Titulo y Detalle</th>
              <th style="width: 130px;">Reportado por</th>
              <th style="width: 120px;">Asignada a</th>
              ${esLider ? '<th style="width: 130px;">Accion Lider</th>' : ''}
            </tr>
          </thead>
          <tbody>
            ${incidenciasFiltradas.length === 0 ? `
              <tr>
                <td colspan="${esLider ? 9 : 8}" style="text-align: center; padding: 24px; color: var(--texto-atenuado);">
                  ${hayFiltrosActivos ? 'No hay incidencias que coincidan con los filtros seleccionados.' : 'No se han registrado incidencias en el sistema.'}
                </td>
              </tr>
            ` : incidenciasFiltradas.map(inc => {
              const estaCerrada = inc.estado === 'CERRADA' || inc.estado === 'DESCARTADA';
              return `
              <tr style="${estaCerrada ? 'opacity: 0.85; background-color: #f8fafc;' : ''}">
                <td><code>${inc.id}</code></td>
                <td><span class="badge-severidad sev-${inc.severidad}">${inc.severidad}</span></td>
                <td>
                  <strong style="color: ${inc.estado === 'CERRADA' ? '#15803d' : (inc.estado === 'ABIERTA' ? '#b91c1c' : '#b45309')}; font-size: 12px;">
                    ${inc.estado}
                  </strong>
                </td>
                <td>
                  <a href="#prueba/${inc.objeto}"><code>${inc.objeto}</code></a>
                  ${inc.transaccion ? `<div style="margin-top: 3px;"><span class="badge-modulo" style="background: #0f766e; font-size: 10px; padding: 1px 5px;" title="Transacción SAP">Tx: ${inc.transaccion}</span></div>` : ''}
                  ${inc.paso ? `<div style="font-size: 10px; color: #64748b; margin-top: 2px;">Paso ${inc.paso}</div>` : ''}
                </td>
                <td>
                  <span class="badge-modulo">${inc.modulo}</span>
                  ${inc.sociedad ? `<div style="margin-top: 3px;"><span class="badge-codigo" style="font-size: 10px; padding: 1px 5px; background: #e0f2fe; color: #0369a1; font-weight: 700; border: 1px solid #bae6fd;" title="Sociedad">${inc.sociedad}</span></div>` : ''}
                </td>
                <td>
                  <div style="font-weight: 700;">${inc.titulo}</div>
                  <div style="font-size: 11px; color: #475569; margin-top: 2px;">${inc.detalle}</div>
                  ${inc.resolucion ? `<div style="font-size: 11px; color: #15803d; margin-top: 4px; background: #f0fdf4; padding: 3px 6px; border-radius: 3px; border: 1px solid #bbf7d0;"><strong>Resolución:</strong> ${inc.resolucion}</div>` : ''}
                </td>
                <td>
                  <div style="font-size: 11px;">${inc.reporta}</div>
                  <div style="font-size: 10px; color: #64748b;">${inc.ts_alta ? inc.ts_alta.substring(0, 10) : ''}</div>
                </td>
                <td>
                  <span style="font-size: 12px;">${inc.asignada_a || 'Sin asignar'}</span>
                </td>
                ${esLider ? `
                  <td>
                    <button type="button" class="btn-abrir-gestion-inc ${estaCerrada ? 'btn-secundario' : 'btn-primario'}" data-id="${inc.id}" style="padding: 4px 8px; font-size: 11px; ${!estaCerrada ? 'background-color: #15803d; border-color: #15803d;' : ''}">
                      ${estaCerrada ? 'Ver / Reabrir' : 'Cerrar / Gestionar'}
                    </button>
                  </td>
                ` : ''}
              </tr>
            `;}).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function enlazarEventosVistaIncidencias() {
  const selEstado = document.getElementById('filtro-inc-estado');
  if (selEstado) {
    selEstado.addEventListener('change', (e) => {
      AppState.filtrosIncidencias.estado = e.target.value;
      renderizarApp();
    });
  }

  const selSev = document.getElementById('filtro-inc-severidad');
  if (selSev) {
    selSev.addEventListener('change', (e) => {
      AppState.filtrosIncidencias.severidad = e.target.value;
      renderizarApp();
    });
  }

  const selRep = document.getElementById('filtro-inc-reporta');
  if (selRep) {
    selRep.addEventListener('change', (e) => {
      AppState.filtrosIncidencias.reporta = e.target.value;
      renderizarApp();
    });
  }

  const selAsig = document.getElementById('filtro-inc-asignada');
  if (selAsig) {
    selAsig.addEventListener('change', (e) => {
      AppState.filtrosIncidencias.asignada = e.target.value;
      renderizarApp();
    });
  }

  const btnLimpiar = document.getElementById('btn-limpiar-filtros-inc');
  if (btnLimpiar) {
    btnLimpiar.addEventListener('click', () => {
      AppState.filtrosIncidencias = {
        estado: 'todos',
        severidad: 'todos',
        reporta: 'todos',
        asignada: 'todos'
      };
      renderizarApp();
    });
  }

  const btnRecargar = document.getElementById('btn-recargar-incidencias');
  if (btnRecargar) {
    btnRecargar.addEventListener('click', async () => {
      btnRecargar.disabled = true;
      btnRecargar.innerHTML = '<span>⏳</span> Cargando incidencias...';
      try {
        const dataInc = await api('incidencias', {});
        if (dataInc && Array.isArray(dataInc.incidencias)) {
          AppState.incidencias = dataInc.incidencias.map(normalizarIncidencia).filter(Boolean);
          mostrarToast(`Se actualizaron ${AppState.incidencias.length} incidencias desde la planilla.`);
        }
      } catch (err) {
        console.error('Error al recargar incidencias:', err);
        mostrarToast('Error al recargar incidencias: ' + err.message);
      } finally {
        renderizarApp();
      }
    });
  }

  document.querySelectorAll('.btn-abrir-gestion-inc').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      const inc = (AppState.incidencias || []).find(i => i.id === id);
      if (!inc) return;
      AppState.incidenciaEnGestion = inc;
      AppState.modalIncidenciaAbierto = true;
      renderizarApp();
    });
  });
}

function renderizarModalGestionIncidencia() {
  const inc = AppState.incidenciaEnGestion;
  if (!inc) return '';

  const esCerrada = inc.estado === 'CERRADA';

  return `
    <div class="modal-fondo" id="modal-gestion-incidencia">
      <div class="modal-cuerpo" style="max-width: 600px;">
        <div class="modal-cabecera">
          <div>
            <div class="modal-titulo">Gestión de Incidencia: <code>${inc.id}</code></div>
            <div style="font-size: 12px; color: var(--texto-secundario); margin-top: 2px;">
              Prueba: <strong>${inc.objeto}</strong> · Módulo: <strong>${inc.modulo}</strong> · Severidad: <span class="badge-severidad sev-${inc.severidad}">${inc.severidad}</span>
            </div>
          </div>
          <button class="btn-cerrar-modal" id="btn-cerrar-modal-inc-x" type="button">&times;</button>
        </div>

        <div style="background: #f8fafc; border: 1px solid var(--borde-suave); border-radius: 4px; padding: 12px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; flex-wrap: wrap; gap: 6px;">
            <div style="font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase;">Defecto reportado</div>
            <div style="display: flex; gap: 6px; align-items: center;">
              ${inc.transaccion ? `<span class="badge-modulo" style="background: #0f766e; font-size: 11px; padding: 2px 7px;">Tx SAP: <strong>${inc.transaccion}</strong></span>` : ''}
              ${inc.sociedad ? `<span class="badge-codigo" style="background: #e0f2fe; color: #0369a1; font-size: 11px; padding: 2px 7px; border: 1px solid #bae6fd; font-weight: 700;">Sociedad: ${inc.sociedad}</span>` : ''}
            </div>
          </div>
          <div style="font-weight: 700; font-size: 13px;">${inc.titulo}</div>
          <div style="font-size: 12px; color: #334155; margin-top: 4px; white-space: pre-wrap;">${inc.detalle || '(Sin detalle adicional)'}</div>
          <div style="font-size: 11px; color: var(--texto-secundario); margin-top: 6px;">
            Reportado por: <strong>${inc.reporta}</strong> ${inc.ts_alta ? `el ${inc.ts_alta}` : ''}
          </div>
        </div>

        <form id="form-gestion-incidencia">
          <div class="campo-formulario" style="margin-bottom: 12px;">
            <label class="etiqueta-formulario" for="inc-nuevo-estado" style="font-weight: 700;">Estado de la Incidencia *</label>
            <select class="control-formulario" id="inc-nuevo-estado" required style="font-weight: 700; padding: 6px 10px;">
              <option value="CERRADA" ${esCerrada || inc.estado === 'ABIERTA' ? 'selected' : ''}>CERRADA — Defecto resuelto satisfactoriamente</option>
              <option value="POR_RETESTEAR" ${inc.estado === 'POR_RETESTEAR' ? 'selected' : ''}>POR_RETESTEAR — Corrección aplicada, lista para volver a probar</option>
              <option value="EN_CORRECCION" ${inc.estado === 'EN_CORRECCION' ? 'selected' : ''}>EN_CORRECCION — Equipo técnico trabajando en solución</option>
              <option value="EN_ANALISIS" ${inc.estado === 'EN_ANALISIS' ? 'selected' : ''}>EN_ANALISIS — En investigación técnica</option>
              <option value="DESCARTADA" ${inc.estado === 'DESCARTADA' ? 'selected' : ''}>DESCARTADA — No procede / error de procedimiento</option>
              <option value="ABIERTA" ${inc.estado === 'ABIERTA' && !esCerrada ? 'selected' : ''}>ABIERTA — Pendiente de atención</option>
            </select>
          </div>

          <div class="campo-formulario" style="margin-bottom: 12px;">
            <label class="etiqueta-formulario" for="inc-asignada-a">Asignada a / Consultor Responsable</label>
            <input type="text" class="control-formulario" id="inc-asignada-a" value="${inc.asignada_a && inc.asignada_a !== 'Pendiente asignacion' ? inc.asignada_a : ''}" placeholder="Ej: Consultor MM / Carlos Gómez" style="padding: 6px 10px;">
          </div>

          <div class="campo-formulario" style="margin-bottom: 16px;">
            <label class="etiqueta-formulario" for="inc-resolucion" style="font-weight: 700;">
              Resolución / Explicación de la solución <span id="span-req-resolucion" style="color: #b91c1c;">*</span>
            </label>
            <textarea class="control-formulario" id="inc-resolucion" rows="3" placeholder="Explique cómo se resolvió satisfactoriamente (ej: Ajuste de parametrización en mandante QAS-200, orden de transporte aplicada, prueba re-ejecutada con éxito)..." style="padding: 8px 10px;">${inc.resolucion || ''}</textarea>
            <div style="font-size: 11px; color: var(--texto-secundario); margin-top: 4px;">
              Requerido para cerrar la incidencia y respaldar la certificación de auditoría.
            </div>
          </div>

          <div class="modal-acciones" style="display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid var(--borde-suave); padding-top: 14px;">
            <button type="button" class="btn-secundario" id="btn-cancelar-modal-inc">Cancelar</button>
            <button type="submit" class="btn-primario" id="btn-guardar-incidencia" style="background-color: #15803d; border-color: #15803d; font-weight: 700;">
              Guardar y Cerrar Incidencia
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function enlazarEventosModalGestionIncidencia() {
  const inc = AppState.incidenciaEnGestion;
  if (!inc) return;

  const cerrarModal = () => {
    AppState.modalIncidenciaAbierto = false;
    AppState.incidenciaEnGestion = null;
    renderizarApp();
  };

  const btnX = document.getElementById('btn-cerrar-modal-inc-x');
  const btnCanc = document.getElementById('btn-cancelar-modal-inc');
  if (btnX) btnX.addEventListener('click', cerrarModal);
  if (btnCanc) btnCanc.addEventListener('click', cerrarModal);

  const selEstado = document.getElementById('inc-nuevo-estado');
  const txtResolucion = document.getElementById('inc-resolucion');
  const spanReq = document.getElementById('span-req-resolucion');
  const btnSubmit = document.getElementById('btn-guardar-incidencia');

  if (selEstado) {
    const actualizarEtiquetaBoton = () => {
      const val = selEstado.value;
      const esCierre = val === 'CERRADA' || val === 'DESCARTADA';
      if (spanReq) spanReq.style.display = esCierre ? 'inline' : 'none';
      if (btnSubmit) {
        if (val === 'CERRADA') {
          btnSubmit.innerHTML = 'Guardar y Cerrar Incidencia';
          btnSubmit.style.backgroundColor = '#15803d';
          btnSubmit.style.borderColor = '#15803d';
        } else if (val === 'DESCARTADA') {
          btnSubmit.innerHTML = 'Descartar Incidencia';
          btnSubmit.style.backgroundColor = '#64748b';
          btnSubmit.style.borderColor = '#64748b';
        } else {
          btnSubmit.innerHTML = 'Guardar Cambios';
          btnSubmit.style.backgroundColor = '#16337a';
          btnSubmit.style.borderColor = '#16337a';
        }
      }
    };
    selEstado.addEventListener('change', actualizarEtiquetaBoton);
    actualizarEtiquetaBoton();
  }

  const form = document.getElementById('form-gestion-incidencia');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const estado = selEstado ? selEstado.value : 'CERRADA';
      const asignada = document.getElementById('inc-asignada-a')?.value.trim() || '';
      const resolucion = txtResolucion?.value.trim() || '';

      if ((estado === 'CERRADA' || estado === 'DESCARTADA') && !resolucion) {
        alert('Para cerrar o descartar la incidencia debe ingresar la resolución o explicación de la solución.');
        txtResolucion?.focus();
        return;
      }

      if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = 'Guardando...';
      }

      try {
        await api('actualizarIncidencia', {
          id: inc.id,
          estado: estado,
          asignada_a: asignada || inc.asignada_a,
          resolucion: resolucion || inc.resolucion
        });

        // Actualización inmediata en estado local
        inc.estado = estado;
        if (asignada) inc.asignada_a = asignada;
        if (resolucion) inc.resolucion = resolucion;
        if (estado === 'CERRADA' || estado === 'DESCARTADA') {
          inc.ts_cierre = new Date().toISOString().replace('T', ' ').substring(0, 19);
        }

        AppState.modalIncidenciaAbierto = false;
        AppState.incidenciaEnGestion = null;

        mostrarToast(estado === 'CERRADA' ? `Incidencia ${inc.id} resuelta y CERRADA.` : `Incidencia ${inc.id} actualizada.`);
        renderizarApp();

        // Sincronizar en segundo plano
        sincronizarEstadoServidor().then(() => renderizarApp()).catch(() => {});
      } catch (err) {
        alert('Error al actualizar incidencia: ' + err.message);
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.innerHTML = 'Guardar y Cerrar Incidencia';
        }
      }
    });
  }
}

/* ==========================================================================
   PANTALLA 7: AVANCE Y TABLERO EJECUTIVO (§8.7)
   ========================================================================== */
function renderizarPantallaAvance() {
  const catalogo = AppState.catalogo || { cu: [], e2e: [] };
  const cuList = catalogo.cu || [];
  const e2eList = catalogo.e2e || [];
  const todas320 = [...cuList.map(c => c.id), ...e2eList.map(e => e.codigo)];

  const total320 = todas320.length;
  let cntOK = 0, cntNOK = 0, cntBloq = 0, cntNA = 0, cntPend = 0;
  let cntAsignada = 0, cntApoyo = 0;

  const apoyoPorArea = {};

  todas320.forEach(cod => {
    const vig = AppState.resultadosVigentes.get(cod);
    if (!vig) {
      cntPend++;
    } else {
      if (vig.resultado === 'OK') cntOK++;
      else if (vig.resultado === 'NOK') cntNOK++;
      else if (vig.resultado === 'BLOQUEADO') cntBloq++;
      else if (vig.resultado === 'NO_APLICA') cntNA++;
      else cntPend++;

      if (vig.alcance === 'APOYO') {
        cntApoyo++;
        const prueba = obtenerDetallePrueba(cod);
        if (prueba && prueba._tipo === 'E2E') {
          (prueba.areas || []).forEach(a => {
            apoyoPorArea[a] = (apoyoPorArea[a] || 0) + 1;
          });
        } else if (prueba && prueba._tipo === 'CU') {
          apoyoPorArea[prueba.modulo] = (apoyoPorArea[prueba.modulo] || 0) + 1;
        }
      } else {
        cntAsignada++;
      }
    }
  });

  const docsPorTipo = {};
  (AppState.documentosPorObjeto || new Map()).forEach(docs => {
    docs.forEach(d => {
      docsPorTipo[d.tipo] = (docsPorTipo[d.tipo] || 0) + 1;
    });
  });

  const tiposSinRegistro = LISTA_TIPOS_DOC.filter(t => !docsPorTipo[t.codigo]);

  return `
    <div>
      <!-- KPIs Generales -->
      <div class="cuadricula-kpis">
        <div class="tarjeta-kpi">
          <div class="tarjeta-kpi-titulo">Total Pruebas</div>
          <div class="tarjeta-kpi-valor">${total320}</div>
          <div class="tarjeta-kpi-detalle">296 CU + 24 Escenarios E2E</div>
        </div>

        <div class="tarjeta-kpi">
          <div class="tarjeta-kpi-titulo">Ejecutadas</div>
          <div class="tarjeta-kpi-valor" style="color: var(--color-bloque-cu);">
            ${total320 - cntPend}
          </div>
          <div class="tarjeta-kpi-detalle">${(((total320 - cntPend) / total320) * 100).toFixed(1)}% del total</div>
        </div>

        <div class="tarjeta-kpi">
          <div class="tarjeta-kpi-titulo">Pruebas OK</div>
          <div class="tarjeta-kpi-valor" style="color: var(--estado-ok);">${cntOK}</div>
          <div class="tarjeta-kpi-detalle">${((cntOK / total320) * 100).toFixed(1)}% de aprobacion</div>
        </div>

        <div class="tarjeta-kpi">
          <div class="tarjeta-kpi-titulo">Pruebas NOK / Bloqueadas</div>
          <div class="tarjeta-kpi-valor" style="color: var(--estado-nok);">${cntNOK + cntBloq}</div>
          <div class="tarjeta-kpi-detalle">${cntNOK} con defecto · ${cntBloq} bloqueadas</div>
        </div>

        <div class="tarjeta-kpi">
          <div class="tarjeta-kpi-titulo">Documentos SAP Emitidos</div>
          <div class="tarjeta-kpi-valor" style="color: var(--color-bloque-e2e);">
            ${Object.values(docsPorTipo).reduce((a, b) => a + b, 0)}
          </div>
          <div class="tarjeta-kpi-detalle">Evidencia cuantitativa</div>
        </div>
      </div>

      <!-- Cobertura con Apoyo vs Asignada (§8.7) -->
      <div class="grafico-barras-contenedor">
        <h3 style="font-size: 14px; font-weight: 700; margin-bottom: 8px;">Cobertura con Apoyo (§8.7)</h3>
        <p style="font-size: 12px; color: var(--texto-secundario); margin-bottom: 12px;">
          Indica si las pruebas se estan completando por los Key-Users asignados o si requieren apoyo de otras areas.
        </p>
        <div style="display: flex; gap: 16px; margin-bottom: 12px;">
          <div>Reportes Asignados: <strong>${cntAsignada}</strong> (${cntAsignada + cntApoyo ? ((cntAsignada / (cntAsignada + cntApoyo)) * 100).toFixed(0) : 0}%)</div>
          <div>Reportes de Apoyo: <strong style="color: #b45309;">${cntApoyo}</strong> (${cntAsignada + cntApoyo ? ((cntApoyo / (cntAsignada + cntApoyo)) * 100).toFixed(0) : 0}%)</div>
        </div>

        ${Object.keys(apoyoPorArea).length > 0 ? `
          <div style="font-size: 12px; font-weight: 600; margin-bottom: 6px;">Areas con mayor recepcion de apoyo externo:</div>
          <ul style="font-size: 12px; padding-left: 20px;">
            ${Object.entries(apoyoPorArea).map(([ar, cant]) => `
              <li><strong>${ar}</strong>: ${cant} pruebas cubiertas por apoyo externo.</li>
            `).join('')}
          </ul>
        ` : '<div style="font-size: 12px; color: #64748b;">Aun no se registran reportes de apoyo externo.</div>'}
      </div>

      <!-- Avance por Modulo (Bloque 1) -->
      <div class="grafico-barras-contenedor">
        <h3 style="font-size: 14px; font-weight: 700; margin-bottom: 12px;">Avance por Modulo SAP (296 Casos Unitarios)</h3>
        ${(catalogo.modulos || []).map(m => {
          const casosM = cuList.filter(c => c.modulo === m.key);
          const okM = casosM.filter(c => AppState.resultadosVigentes.get(c.id)?.resultado === 'OK').length;
          const totalM = casosM.length;
          const p = totalM ? ((okM / totalM) * 100).toFixed(0) : 0;
          return `
            <div class="fila-barra-avance">
              <div class="fila-barra-info">
                <span>${m.nombre} (${m.key})</span>
                <span>${okM} / ${totalM} (${p}%)</span>
              </div>
              <div class="barra-pista">
                <div style="width: ${p}%; background-color: var(--color-bloque-cu);"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Avance por Area Ejecutora (Bloque 2) -->
      <div class="grafico-barras-contenedor">
        <h3 style="font-size: 14px; font-weight: 700; margin-bottom: 12px;">Avance por Area Ejecutora (24 Escenarios E2E)</h3>
        ${(catalogo.areas || []).map(a => {
          const e2eArea = e2eList.filter(e => (e.areas || []).map(x => String(x).toUpperCase()).includes(a.key));
          const totalA = e2eArea.length;
          const okA = e2eArea.filter(e => {
            const hist = AppState.historialPorObjeto.get(e.codigo) || [];
            const cubiertoPorEstaArea = hist.some(r => r && r.resultado === 'OK' && usuarioPerteneceAArea(r.email, a.key));
            if (cubiertoPorEstaArea) return true;
            const rVig = AppState.resultadosVigentes.get(e.codigo);
            return rVig && rVig.resultado === 'OK' && usuarioPerteneceAArea(rVig.email, a.key);
          }).length;
          const p = totalA ? ((okA / totalA) * 100).toFixed(0) : 0;
          return `
            <div class="fila-barra-avance">
              <div class="fila-barra-info">
                <span>${a.key}</span>
                <span>${okA} / ${totalA} escenarios (${p}%)</span>
              </div>
              <div class="barra-pista">
                <div style="width: ${p}%; background-color: #${a.color || 'B26B00'};"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Volumen de Documentos Emitidos y Tipos sin Registro -->
      <div class="grafico-barras-contenedor">
        <h3 style="font-size: 14px; font-weight: 700; margin-bottom: 8px;">Volumen de Documentos SAP Emitidos</h3>
        <p style="font-size: 12px; color: var(--texto-secundario); margin-bottom: 12px;">
          Respaldo cuantitativo para Go-No Go. Exige generar correctamente todos los tipos de documento de cada proceso.
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; margin-bottom: 16px;">
          ${Object.entries(docsPorTipo).map(([tipo, cnt]) => {
            const tDef = LISTA_TIPOS_DOC.find(x => x.codigo === tipo);
            return `
              <div class="dato-item">
                <div class="dato-etiqueta">${tDef ? tDef.nombre : tipo}</div>
                <div class="dato-valor" style="font-size: 18px; font-weight: 800; color: var(--color-bloque-e2e);">${cnt}</div>
              </div>
            `;
          }).join('')}
        </div>

        ${tiposSinRegistro.length > 0 ? `
          <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed var(--borde-suave);">
            <div style="font-size: 12px; font-weight: 700; color: #b45309; margin-bottom: 4px;">
              Tipos de documento esperados sin ningun registro (${tiposSinRegistro.length}):
            </div>
            <div style="font-size: 12px; color: var(--texto-secundario);">
              ${tiposSinRegistro.map(t => t.nombre).join(' · ')}
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

/* ==========================================================================
   PANTALLA 8: PANEL DE GESTION Y SEGUIMIENTO (Exclusivo Lider)
   Estatus por modulo, reporte por area, volumen y seguimiento de inactividad de usuarios.
   ========================================================================== */
function renderizarPantallaGestion() {
  if (!esLiderOAdmin()) {
    return `
      <div class="contenedor-ficha">
        <p style="color: #b71c1c; font-weight: 700;">Acceso restringido al Lider de Implementacion.</p>
        <button class="btn-secundario" onclick="window.location.hash='#pruebas'" style="margin-top: 12px;">Volver a mis pruebas</button>
      </div>
    `;
  }

  const catalogo = AppState.catalogo || { cu: [], e2e: [], modulos: [], areas: [] };
  const cuList = catalogo.cu || [];
  const e2eList = catalogo.e2e || [];
  const modulos = catalogo.modulos || [];
  const areas = catalogo.areas || [];
  const resultadosCiclo = Array.from(AppState.resultadosVigentes.values());

  // 1. Estatus general de las pruebas por modulo SAP
  const estatusModulos = modulos.map(m => {
    const casosM = cuList.filter(c => c.modulo === m.key);
    const total = casosM.length;
    let ok = 0, nok = 0, bloq = 0, na = 0, pend = 0;
    casosM.forEach(c => {
      const r = AppState.resultadosVigentes.get(c.id);
      const est = r ? r.resultado : 'PENDIENTE';
      if (est === 'OK') ok++;
      else if (est === 'NOK') nok++;
      else if (est === 'BLOQUEADO') bloq++;
      else if (est === 'NO_APLICA') na++;
      else pend++;
    });
    const ejecutadas = total - pend;
    const pctAvance = total ? ((ejecutadas / total) * 100).toFixed(1) : '0.0';
    const pctAprobacion = total ? ((ok / total) * 100).toFixed(1) : '0.0';
    const incsAbiertas = (AppState.incidencias || []).filter(i => i.modulo === m.key && i.estado !== 'CERRADA' && i.estado !== 'DESCARTADA').length;

    return {
      key: m.key,
      nombre: m.nombre,
      total,
      ok,
      nok,
      bloq,
      na,
      pend,
      ejecutadas,
      pctAvance,
      pctAprobacion,
      incsAbiertas
    };
  });

  // 2. Reporte por area ejecutora y equipo TI
  const usuariosTI = LISTA_USUARIOS_SIMULADOS.filter(u => u.rol === 'EQUIPO_PROYECTO');
  const emailsTI = usuariosTI.map(u => u.email.toLowerCase());
  const reportesGenTI = resultadosCiclo.filter(r => emailsTI.includes(String(r.email).toLowerCase()));
  let usersTIActivos = 0;
  let usersTISinReportes = 0;
  usuariosTI.forEach(u => {
    const tiene = resultadosCiclo.some(r => String(r.email).toLowerCase() === u.email.toLowerCase());
    if (tiene) usersTIActivos++;
    else usersTISinReportes++;
  });
  const cuCubiertosTI = cuList.filter(c => {
    const r = AppState.resultadosVigentes.get(c.id);
    return r && r.resultado !== 'PENDIENTE';
  }).length;

  const filaTI = {
    key: 'TI',
    nombreEtiqueta: 'TI / Equipo de Proyecto',
    color: '16337A',
    esTI: true,
    etiquetaAmbito: '296 Casos Unitarios (5 Módulos)',
    totalEsc: cuList.length,
    escCubiertos: cuCubiertosTI,
    pctCobertura: cuList.length ? ((cuCubiertosTI / cuList.length) * 100).toFixed(1) : '0.0',
    volGenerado: reportesGenTI.length,
    volAsignada: reportesGenTI.filter(r => r.alcance === 'ASIGNADA').length,
    volApoyo: reportesGenTI.filter(r => r.alcance === 'APOYO').length,
    totalUsuarios: usuariosTI.length,
    usersActivos: usersTIActivos,
    usersSinReportes: usersTISinReportes
  };

  const reporteAreas = areas.map(a => {
    const escenariosA = e2eList.filter(e => (e.areas || []).map(x => String(x).toUpperCase()).includes(a.key));
    const totalEsc = escenariosA.length;
    let escCubiertos = 0;
    escenariosA.forEach(e => {
      // Un escenario E2E solo se considera cubierto para el área 'a' si fue ejecutado por un usuario de dicha área
      const hist = AppState.historialPorObjeto.get(e.codigo) || [];
      const cubiertoPorEstaArea = hist.some(r => r && r.resultado && r.resultado !== 'PENDIENTE' && usuarioPerteneceAArea(r.email, a.key));
      if (cubiertoPorEstaArea) {
        escCubiertos++;
      } else {
        const rVig = AppState.resultadosVigentes.get(e.codigo);
        if (rVig && rVig.resultado && rVig.resultado !== 'PENDIENTE' && usuarioPerteneceAArea(rVig.email, a.key)) {
          escCubiertos++;
        }
      }
    });
    const pctCobertura = totalEsc ? ((escCubiertos / totalEsc) * 100).toFixed(1) : '0.0';

    // Key-Users asignados nominalmente a esta area funcional (por área declarada o departamento)
    const usuariosA = LISTA_USUARIOS_SIMULADOS.filter(u => {
      if (u.rol !== 'KEY_USER') return false;
      return usuarioPerteneceAArea(u.email, a.key);
    });

    const reportesGen = resultadosCiclo.filter(r => usuarioPerteneceAArea(r.email, a.key));
    const volGenerado = reportesGen.length;
    const volAsignada = reportesGen.filter(r => r.alcance === 'ASIGNADA').length;
    const volApoyo = reportesGen.filter(r => r.alcance === 'APOYO').length;

    let usersActivos = 0;
    let usersSinReportes = 0;
    usuariosA.forEach(u => {
      const tiene = resultadosCiclo.some(r => String(r.email).toLowerCase() === u.email.toLowerCase());
      if (tiene) usersActivos++;
      else usersSinReportes++;
    });

    return {
      key: a.key,
      nombreEtiqueta: a.key,
      color: a.color || 'B26B00',
      esTI: false,
      etiquetaAmbito: `${totalEsc} Escenarios E2E`,
      totalEsc,
      escCubiertos,
      pctCobertura,
      volGenerado,
      volAsignada,
      volApoyo,
      totalUsuarios: usuariosA.length,
      usersActivos,
      usersSinReportes
    };
  });

  const tablaReporteAreas = [filaTI, ...reporteAreas];

  // 3. Seguimiento individual de usuarios (para detectar quien no esta reportando)
  const conteoPorEmail = new Map();
  const ultimoPorEmail = new Map();

  resultadosCiclo.forEach(r => {
    const em = String(r.email).toLowerCase();
    conteoPorEmail.set(em, (conteoPorEmail.get(em) || 0) + 1);
    if (!ultimoPorEmail.has(em) || r.ts > ultimoPorEmail.get(em)) {
      ultimoPorEmail.set(em, r.ts);
    }
  });

  const emailsVistos = new Set();
  const todosUsuarios = [];
  LISTA_USUARIOS_SIMULADOS.forEach(u => {
    const em = String(u.email || '').toLowerCase().trim();
    if (!em) return;
    // Excluir aliases secundarios para no duplicar a Gabriel Salinas
    if (em === 'gsalinas@pjportland.com' || em === 'garfiohook@gmail.com') return;
    if (emailsVistos.has(em)) return; // Protección estricta contra correos duplicados
    emailsVistos.add(em);
    todosUsuarios.push(u);
  });
  const usuariosDetalle = todosUsuarios.map(u => {
    const emailLower = u.email.toLowerCase();
    const cantReportes = conteoPorEmail.get(emailLower) || 0;
    const ultimoTs = ultimoPorEmail.get(emailLower) || null;
    return {
      ...u,
      cantReportes,
      ultimoTs,
      tieneReportes: cantReportes > 0
    };
  });

  const totalKeyUsers = usuariosDetalle.length;
  const totalActivos = usuariosDetalle.filter(u => u.tieneReportes).length;
  const totalSinReportes = totalKeyUsers - totalActivos;
  const tasaParticipacion = totalKeyUsers ? ((totalActivos / totalKeyUsers) * 100).toFixed(0) : 0;

  // Filtrado de la tabla de usuarios
  const usuariosFiltrados = usuariosDetalle.filter(u => {
    if (AppState.filtroGestionArea === 'TI') {
      const dep = (u.departamento || '').toUpperCase();
      const esDeTI = u.rol === 'EQUIPO_PROYECTO' || u.rol === 'LIDER' || dep.includes('TI');
      if (!esDeTI) return false;
    } else if (AppState.filtroGestionArea !== 'todas') {
      if (u.rol === 'EQUIPO_PROYECTO' || u.rol === 'LIDER') return false;
      const userAreas = (u.areas || '').split(',').map(s => s.trim().toUpperCase());
      if (!userAreas.includes(AppState.filtroGestionArea)) return false;
    }

    if (AppState.filtroGestionActividad === 'sin_reportes') {
      if (u.tieneReportes) return false;
    } else if (AppState.filtroGestionActividad === 'con_reportes') {
      if (!u.tieneReportes) return false;
    }
    return true;
  }).sort((a, b) => {
    if (a.cantReportes === 0 && b.cantReportes > 0) return -1;
    if (a.cantReportes > 0 && b.cantReportes === 0) return 1;
    return a.nombre.localeCompare(b.nombre);
  });

  return `
    <div>
      <!-- Encabezado de la vista -->
      <div class="panel-control-pruebas" style="margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
          <div>
            <h1 style="font-size: 18px; font-weight: 700; color: var(--color-bloque-cu);">Panel de Gestion y Productividad</h1>
            <div style="font-size: 12px; color: var(--texto-secundario); margin-top: 2px;">
              Seguimiento ejecutivo por modulo, area y avance individual de ejecutores · Exclusivo Gabriel Salinas
            </div>
          </div>
          <div style="font-size: 12px; background: #e0e7ff; color: #1e3a8a; padding: 4px 10px; border-radius: 4px; font-weight: 700;">
            LIDER DE IMPLEMENTACION
          </div>
        </div>
      </div>

      <!-- KPIs de participacion y volumen -->
      <div class="cuadricula-kpis">
        <div class="tarjeta-kpi">
          <div class="tarjeta-kpi-titulo">Total Ejecutores</div>
          <div class="tarjeta-kpi-valor">${totalKeyUsers}</div>
          <div class="tarjeta-kpi-detalle">49 Key-Users + 4 TI / Proyecto</div>
        </div>

        <div class="tarjeta-kpi">
          <div class="tarjeta-kpi-titulo">Ejecutores Activos</div>
          <div class="tarjeta-kpi-valor" style="color: var(--estado-ok);">${totalActivos}</div>
          <div class="tarjeta-kpi-detalle">${tasaParticipacion}% han reportado pruebas</div>
        </div>

        <div class="tarjeta-kpi" style="${totalSinReportes > 0 ? 'border-color: #fca5a5; background: #fff5f5;' : ''}">
          <div class="tarjeta-kpi-titulo" style="${totalSinReportes > 0 ? 'color: #991b1b;' : ''}">Sin Reportar Aun</div>
          <div class="tarjeta-kpi-valor" style="color: #991b1b;">${totalSinReportes}</div>
          <div class="tarjeta-kpi-detalle">Requieren seguimiento directo</div>
        </div>

        <div class="tarjeta-kpi">
          <div class="tarjeta-kpi-titulo">Volumen de Reportes</div>
          <div class="tarjeta-kpi-valor" style="color: var(--color-bloque-cu);">${resultadosCiclo.length}</div>
          <div class="tarjeta-kpi-detalle">Total reportes en ciclo vigente</div>
        </div>
      </div>

      <!-- Alerta si hay usuarios sin reportes -->
      ${totalSinReportes > 0 ? `
        <div class="tarjeta-alerta-gestion">
          <strong style="color: #991b1b; font-size: 13px;">Alerta de Participacion:</strong>
          <span style="font-size: 12px; color: #7f1d1d; margin-left: 6px;">
            Hay <strong>${totalSinReportes} usuarios</strong> que no han registrado ninguna prueba en este ciclo. Puede consultar el listado detallado abajo con el filtro <em>"Solo usuarios sin reportes"</em>.
          </span>
        </div>
      ` : ''}

      <!-- SECCION 1: Estatus General de Pruebas por Modulo SAP -->
      <div class="grafico-barras-contenedor">
        <h2 style="font-size: 15px; font-weight: 700; color: var(--color-bloque-cu); margin-bottom: 6px;">
          1. Estatus General de Pruebas por Modulo SAP (296 Casos Unitarios)
        </h2>
        <p style="font-size: 12px; color: var(--texto-secundario); margin-bottom: 12px;">
          Distribucion del resultado vigente y avance de ejecucion para cada modulo SAP del Bloque 1.
        </p>

        <div style="overflow-x: auto;">
          <table class="tabla-pruebas">
            <thead>
              <tr>
                <th style="width: 80px;">Modulo</th>
                <th>Nombre del Modulo</th>
                <th style="width: 70px; text-align: center;">Total</th>
                <th style="width: 60px; text-align: center;">OK</th>
                <th style="width: 60px; text-align: center;">NOK</th>
                <th style="width: 70px; text-align: center;">Bloq</th>
                <th style="width: 70px; text-align: center;">N/A</th>
                <th style="width: 80px; text-align: center;">Pend</th>
                <th style="width: 90px; text-align: center;">Avance %</th>
                <th style="width: 130px;">Barra de Avance</th>
                <th style="width: 80px; text-align: center;">Incs</th>
              </tr>
            </thead>
            <tbody>
              ${estatusModulos.map(m => {
                const pOK = m.total ? ((m.ok / m.total) * 100).toFixed(0) : 0;
                const pNOK = m.total ? ((m.nok / m.total) * 100).toFixed(0) : 0;
                const pBloq = m.total ? ((m.bloq / m.total) * 100).toFixed(0) : 0;
                const pPend = m.total ? ((m.pend / m.total) * 100).toFixed(0) : 0;
                return `
                  <tr>
                    <td><span class="badge-modulo" style="font-size: 11px;">${m.key}</span></td>
                    <td><strong>${m.nombre}</strong></td>
                    <td style="text-align: center;"><strong>${m.total}</strong></td>
                    <td style="text-align: center;"><span style="color: var(--estado-ok); font-weight: 700;">${m.ok}</span></td>
                    <td style="text-align: center;"><span style="color: var(--estado-nok); font-weight: 700;">${m.nok}</span></td>
                    <td style="text-align: center;"><span style="color: var(--estado-bloqueado); font-weight: 700;">${m.bloq}</span></td>
                    <td style="text-align: center;"><span style="color: var(--estado-no-aplica); font-weight: 700;">${m.na}</span></td>
                    <td style="text-align: center; color: #64748b;">${m.pend}</td>
                    <td style="text-align: center;"><strong>${m.pctAvance}%</strong></td>
                    <td>
                      <div class="barra-pista" style="height: 10px;">
                        <div style="width: ${pOK}%; background-color: var(--estado-ok);" title="OK: ${m.ok}"></div>
                        <div style="width: ${pNOK}%; background-color: var(--estado-nok);" title="NOK: ${m.nok}"></div>
                        <div style="width: ${pBloq}%; background-color: var(--estado-bloqueado);" title="Bloqueado: ${m.bloq}"></div>
                        <div style="width: ${pPend}%; background-color: #cbd5e1;" title="Pendiente: ${m.pend}"></div>
                      </div>
                    </td>
                    <td style="text-align: center;">
                      ${m.incsAbiertas > 0 ? `<span class="badge-severidad sev-CRITICA">${m.incsAbiertas}</span>` : '<span style="color: #94a3b8;">0</span>'}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- SECCION 2: Reporte por Area Ejecutora y Cobertura de Escenarios -->
      <div class="grafico-barras-contenedor">
        <h2 style="font-size: 15px; font-weight: 700; color: var(--color-bloque-e2e); margin-bottom: 6px;">
          2. Reporte por Area Ejecutora y Cobertura de Escenarios
        </h2>
        <p style="font-size: 12px; color: var(--texto-secundario); margin-bottom: 12px;">
          Volumen generado por cada area y equipo TI, cobertura de pruebas asignadas y dotacion de usuarios.
        </p>

        <div style="overflow-x: auto;">
          <table class="tabla-pruebas">
            <thead>
              <tr>
                <th style="width: 150px;">Area / Equipo</th>
                <th style="width: 140px;">Ambito Asignado</th>
                <th style="width: 90px; text-align: center;">Cubiertas</th>
                <th style="width: 100px; text-align: center;">Cobertura %</th>
                <th style="width: 120px; text-align: center;">Reportes Hechos</th>
                <th style="width: 100px; text-align: center;">(Asig / Apoyo)</th>
                <th style="width: 90px; text-align: center;">Dotacion</th>
                <th style="width: 110px; text-align: center;">Activos / Inactivos</th>
                <th style="width: 110px;">Accion</th>
              </tr>
            </thead>
            <tbody>
              ${tablaReporteAreas.map(a => `
                <tr style="${a.esTI ? 'background-color: #f8faff; font-weight: 600;' : ''}">
                  <td>
                    <span class="badge-area" style="background-color: #${a.color}; font-size: 11px;">
                      ${a.nombreEtiqueta}
                    </span>
                  </td>
                  <td style="font-size: 12px; color: #334155;">
                    ${a.etiquetaAmbito}
                  </td>
                  <td style="text-align: center;"><span style="color: var(--estado-ok); font-weight: 700;">${a.escCubiertos}</span></td>
                  <td style="text-align: center;">
                    <strong>${a.pctCobertura}%</strong>
                    <div class="barra-pista" style="height: 6px; margin-top: 3px;">
                      <div style="width: ${a.pctCobertura}%; background-color: #${a.color};"></div>
                    </div>
                  </td>
                  <td style="text-align: center;">
                    <strong style="color: var(--color-bloque-cu); font-size: 13px;">${a.volGenerado}</strong> reportes
                  </td>
                  <td style="text-align: center; font-size: 11px; color: #64748b;">
                    ${a.volAsignada} / <span style="color: #b45309; font-weight: 600;">${a.volApoyo}</span>
                  </td>
                  <td style="text-align: center;"><strong>${a.totalUsuarios}</strong> pers.</td>
                  <td style="text-align: center;">
                    <span style="color: var(--estado-ok); font-weight: 700;">${a.usersActivos}</span> /
                    <span style="color: ${a.usersSinReportes > 0 ? '#991b1b; font-weight: 700;' : '#64748b;'}">${a.usersSinReportes}</span>
                  </td>
                  <td>
                    <button class="btn-secundario btn-filtrar-area-gestion" data-area="${a.key}" style="padding: 3px 8px; font-size: 11px;">
                      Ver usuarios
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- SECCION 3: Detalle de Usuarios y Seguimiento de Inactividad -->
      <div class="grafico-barras-contenedor" id="seccion-usuarios-gestion">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 12px;">
          <div>
            <h2 style="font-size: 15px; font-weight: 700; color: #1e293b;">
              3. Detalle de Usuarios y Control de Reportes (${usuariosFiltrados.length} usuarios)
            </h2>
            <div style="font-size: 12px; color: var(--texto-secundario); margin-top: 2px;">
              Visualice que usuarios especificos no han registrado actividad de pruebas en el ciclo actual.
            </div>
          </div>

          <!-- Controles de filtrado de la tabla de usuarios -->
          <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
            <div>
              <select id="sel-gestion-area" class="form-select" style="font-size: 12px; height: 32px;">
                <option value="todas" ${AppState.filtroGestionArea === 'todas' ? 'selected' : ''}>Todas las áreas y TI (${totalKeyUsers} ejecutores)</option>
                <option value="TI" ${AppState.filtroGestionArea === 'TI' ? 'selected' : ''}>TI / Equipo de Proyecto (${usuariosTI.length + 1} personas)</option>
                ${areas.map(a => `
                  <option value="${a.key}" ${AppState.filtroGestionArea === a.key ? 'selected' : ''}>${a.key}</option>
                `).join('')}
              </select>
            </div>

            <div class="selector-alcance">
              <button class="btn-alcance ${AppState.filtroGestionActividad === 'todos' ? 'activo' : ''}" id="btn-gest-todos" style="padding: 4px 10px; font-size: 12px; min-height: 32px;">
                Todos (${totalKeyUsers})
              </button>
              <button class="btn-alcance ${AppState.filtroGestionActividad === 'sin_reportes' ? 'activo' : ''}" id="btn-gest-sin-reportes" style="padding: 4px 10px; font-size: 12px; min-height: 32px; color: #991b1b;">
                ⚠️ Sin reportes (${totalSinReportes})
              </button>
              <button class="btn-alcance ${AppState.filtroGestionActividad === 'con_reportes' ? 'activo' : ''}" id="btn-gest-con-reportes" style="padding: 4px 10px; font-size: 12px; min-height: 32px; color: var(--estado-ok);">
                Con reportes (${totalActivos})
              </button>
            </div>
          </div>
        </div>

        <div style="overflow-x: auto;">
          <table class="tabla-pruebas">
            <thead>
              <tr>
                <th>Nombre del Ejecutor</th>
                <th>Correo Corporativo</th>
                <th style="width: 80px;">Sociedad</th>
                <th style="width: 140px;">Rol / Departamento</th>
                <th>Areas / Modulos Asignados</th>
                <th style="width: 110px; text-align: center;">Pruebas Reportadas</th>
                <th style="width: 130px; text-align: center;">Estatus Reporte</th>
                <th style="width: 140px;">Ultimo Reporte</th>
                <th style="width: 110px; text-align: center;">Certificado</th>
              </tr>
            </thead>
            <tbody>
              ${usuariosFiltrados.length === 0 ? `
                <tr>
                  <td colspan="9" style="text-align: center; padding: 24px; color: var(--texto-atenuado);">
                    No hay usuarios que coincidan con los filtros seleccionados.
                  </td>
                </tr>
              ` : usuariosFiltrados.map(u => `
                <tr style="${!u.tieneReportes ? 'background-color: #fffaf0;' : ''}">
                  <td>
                    <strong>${u.nombre}</strong>
                  </td>
                  <td>
                    <code style="font-size: 12px;">${u.email}</code>
                  </td>
                  <td>
                    <span class="badge-codigo" style="background: #f1f5f9;">${u.sociedad || '-'}</span>
                  </td>
                  <td>
                    ${u.rol === 'EQUIPO_PROYECTO' ? `
                      <span class="badge-modulo" style="background: #16337A; font-size: 10px;">TI · Proyecto</span>
                    ` : u.rol === 'LIDER' ? `
                      <span class="badge-modulo" style="background: #0284c7; font-size: 10px;">LÍDER</span>
                    ` : `
                      <span style="font-size: 11px; color: #475569;">Key-User</span>
                    `}
                  </td>
                  <td>
                    ${u.rol === 'EQUIPO_PROYECTO' ? `
                      <div style="font-size: 11px; font-weight: 700; color: #16337A;">
                        ${u.cargo || 'Consultor TI'} ${u.departamento ? `· Depto: ${u.departamento}` : ''}
                      </div>
                      <div style="font-size: 10px; color: #475569; margin-top: 2px;">
                        Módulos: ${u.modulos || 'MM, SD, FICO, EWM, CFG'}
                      </div>
                    ` : u.rol === 'LIDER' ? `
                      <div style="font-size: 11px; font-weight: 700; color: #0284c7;">
                        Líder de Implementación SAP (Gestión General y Soporte)
                      </div>
                    ` : `
                      <div style="font-size: 11px; color: #334155;">
                        ${(u.areas || '').split(',').map(s => s.trim()).filter(Boolean).map(a => `
                          <span class="badge-area" style="background-color: var(--color-bloque-cu); font-size: 10px; margin-right: 2px;">${a}</span>
                        `).join('') || '<span class="texto-vacio">Todas</span>'}
                      </div>
                      ${u.cargo ? `<div style="font-size: 10px; color: #64748b; margin-top: 2px;">${u.cargo}</div>` : ''}
                    `}
                  </td>
                  <td style="text-align: center;">
                    <strong style="font-size: 14px; color: ${u.cantReportes > 0 ? 'var(--color-bloque-cu)' : '#991b1b'};">
                      ${u.cantReportes}
                    </strong>
                  </td>
                  <td style="text-align: center;">
                    ${u.tieneReportes 
                      ? `<span class="badge-activo">✓ Activo (${u.cantReportes})</span>`
                      : `<span class="badge-alerta-inactivo">⚠️ Sin reportes</span>`}
                  </td>
                  <td>
                    ${u.ultimoTs ? `
                      <div style="font-size: 11px; font-weight: 600;">${u.ultimoTs.substring(0, 10)}</div>
                      <div style="font-size: 10px; color: #64748b;">${u.ultimoTs.substring(11, 16)} hrs</div>
                    ` : '<span class="texto-vacio">Sin actividad</span>'}
                  </td>
                  <td style="text-align: center;">
                    <button class="btn-secundario" style="padding: 3px 8px; font-size: 11px; white-space: nowrap;" onclick="window.location.hash='#certificado/' + encodeURIComponent('${u.email}')" title="Generar Certificado PDF de ${u.nombre}">
                      📄 Certificado
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function enlazarEventosVistaGestion() {
  // Selector de area en tabla de usuarios
  const selArea = document.getElementById('sel-gestion-area');
  if (selArea) {
    selArea.addEventListener('change', (e) => {
      AppState.filtroGestionArea = e.target.value;
      renderizarApp();
    });
  }

  // Botones de filtro de actividad
  const btnTodos = document.getElementById('btn-gest-todos');
  const btnSin = document.getElementById('btn-gest-sin-reportes');
  const btnCon = document.getElementById('btn-gest-con-reportes');

  if (btnTodos) {
    btnTodos.addEventListener('click', () => {
      AppState.filtroGestionActividad = 'todos';
      renderizarApp();
    });
  }
  if (btnSin) {
    btnSin.addEventListener('click', () => {
      AppState.filtroGestionActividad = 'sin_reportes';
      renderizarApp();
    });
  }
  if (btnCon) {
    btnCon.addEventListener('click', () => {
      AppState.filtroGestionActividad = 'con_reportes';
      renderizarApp();
    });
  }

  // Botones "Ver usuarios" en la tabla de areas
  document.querySelectorAll('.btn-filtrar-area-gestion').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const area = e.target.dataset.area;
      AppState.filtroGestionArea = area;
      renderizarApp();
      // Scroll suave hacia la seccion de usuarios
      document.getElementById('seccion-usuarios-gestion')?.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

/* ==========================================================================
   PANTALLA 6: CERTIFICADO Y RESUMEN DE PRUEBAS (PDF)
   ========================================================================== */
function inicializarFiltroCertificado() {
  const hoy = new Date().toISOString().substring(0, 10);
  const emailDefecto = AppState.sesion && AppState.sesion.perfil ? AppState.sesion.perfil.email : '';

  let fechaInicio = '';
  if (emailDefecto) {
    const reportesUser = [];
    AppState.historialPorObjeto.forEach(lista => {
      lista.forEach(r => {
        if (r.email && r.email.toLowerCase() === emailDefecto.toLowerCase() && r.ts) {
          reportesUser.push(r.ts.substring(0, 10));
        }
      });
    });
    if (reportesUser.length > 0) {
      reportesUser.sort();
      fechaInicio = reportesUser[0];
    }
  }

  if (!fechaInicio) {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    fechaInicio = d.toISOString().substring(0, 10);
  }

  AppState.filtroCertificado = {
    fechaDesde: fechaInicio,
    fechaHasta: hoy,
    usuarioEmail: emailDefecto,
    filtroResultado: 'todos',
    incluirPruebas: true,
    incluirIncidencias: true,
    incluirDocumentos: true,
    descargandoPdf: false
  };
}

function generarCodigoVerificacion(email, fechaDesde, fechaHasta) {
  const str = `${email || 'user'}_${fechaDesde || ''}_${fechaHasta || ''}_PORTLAND_SAP`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  const anio = new Date().getFullYear();
  return `CERT-SAP-${anio}-${hex.substring(0, 4)}-${hex.substring(4, 8)}`;
}

function obtenerDatosCertificado() {
  if (!AppState.filtroCertificado || !AppState.filtroCertificado.fechaDesde) {
    inicializarFiltroCertificado();
  }
  const f = AppState.filtroCertificado;
  const emailBuscado = (f.usuarioEmail || (AppState.sesion && AppState.sesion.perfil ? AppState.sesion.perfil.email : '')).trim().toLowerCase();
  const esConsolidadoTodos = emailBuscado === '__todos__';

  let usuarioObj = null;
  if (!esConsolidadoTodos) {
    usuarioObj = LISTA_USUARIOS_SIMULADOS.find(u => (u.email || '').toLowerCase() === emailBuscado);
    if (!usuarioObj && AppState.sesion && AppState.sesion.perfil && (AppState.sesion.perfil.email || '').toLowerCase() === emailBuscado) {
      usuarioObj = AppState.sesion.perfil;
    }
    if (!usuarioObj) {
      usuarioObj = {
        email: emailBuscado,
        nombre: emailBuscado.split('@')[0].toUpperCase(),
        rol: 'KEY_USER',
        sociedad: 'CL11',
        cargo: 'Tester / Key User SAP',
        areas: '',
        modulos: ''
      };
    }
  } else {
    usuarioObj = {
      email: 'todos@pjportland.com',
      nombre: 'EQUIPO COMPLETO DE CERTIFICACIÓN SAP S/4HANA',
      rol: 'CONSOLIDADO',
      sociedad: 'TODAS',
      cargo: 'Consolidado General de Pruebas',
      areas: 'Todas las áreas asignadas',
      modulos: 'MM, SD, FICO, EWM, CFG'
    };
  }

  const socObj = LISTA_SOCIEDADES.find(s => s.codigo === usuarioObj.sociedad) || {
    codigo: usuarioObj.sociedad || 'CL11',
    nombre: 'Distribuidora Portland S.A.',
    pais: 'Chile'
  };

  const pruebasEjecutadas = [];
  const objetosUnicos = new Set();
  let cntOK = 0;
  let cntNOK = 0;
  let cntBloq = 0;
  let cntNA = 0;

  AppState.historialPorObjeto.forEach((listaResultados, objCodigo) => {
    listaResultados.forEach(r => {
      if (!esConsolidadoTodos && (!r.email || r.email.toLowerCase() !== emailBuscado)) return;

      const rFecha = (r.ts || '').substring(0, 10);
      if (f.fechaDesde && rFecha < f.fechaDesde) return;
      if (f.fechaHasta && rFecha > f.fechaHasta) return;

      if (f.filtroResultado !== 'todos' && r.resultado !== f.filtroResultado) return;

      const infoPrueba = obtenerDetallePrueba(r.objeto) || {
        _codigo: r.objeto,
        _tipo: r.tipo || 'CU',
        _nombre: r.objeto,
        modulo: 'N/A',
        tx: 'N/A'
      };

      const docsObj = (AppState.documentosPorObjeto.get(r.objeto) || []).filter(d => {
        return d.resultado_id === r.id || !d.resultado_id;
      });

      pruebasEjecutadas.push({
        resultado: r,
        prueba: infoPrueba,
        docs: docsObj,
        fecha: rFecha,
        hora: (r.ts || '').substring(11, 16),
        ts: r.ts || ''
      });

      objetosUnicos.add(r.objeto);
      if (r.resultado === 'OK') cntOK++;
      else if (r.resultado === 'NOK') cntNOK++;
      else if (r.resultado === 'BLOQUEADO') cntBloq++;
      else if (r.resultado === 'NO_APLICA') cntNA++;
    });
  });

  pruebasEjecutadas.sort((a, b) => (b.ts > a.ts ? 1 : -1));

  const incidenciasReportadas = (AppState.incidencias || []).filter(inc => {
    if (!esConsolidadoTodos && (!inc.reporta || inc.reporta.toLowerCase() !== emailBuscado)) return;
    const incFecha = (inc.ts_alta || '').substring(0, 10);
    if (f.fechaDesde && incFecha < f.fechaDesde) return;
    if (f.fechaHasta && incFecha > f.fechaHasta) return;
    return true;
  });

  incidenciasReportadas.sort((a, b) => (b.ts_alta > a.ts_alta ? 1 : -1));

  const totalPruebas = pruebasEjecutadas.length;
  const tasaExito = totalPruebas > 0 ? ((cntOK / totalPruebas) * 100).toFixed(1) : '0.0';

  const codigoVerificacion = generarCodigoVerificacion(usuarioObj.email, f.fechaDesde, f.fechaHasta);

  const ahora = new Date();
  const yyyy = ahora.getFullYear();
  const mm = String(ahora.getMonth() + 1).padStart(2, '0');
  const dd = String(ahora.getDate()).padStart(2, '0');
  const fechaGenerada = `${yyyy}-${mm}-${dd}`;

  return {
    usuario: usuarioObj,
    sociedad: socObj,
    fechaDesde: f.fechaDesde,
    fechaHasta: f.fechaHasta,
    pruebas: pruebasEjecutadas,
    objetosUnicosCount: objetosUnicos.size,
    incidencias: incidenciasReportadas,
    estadisticas: {
      total: totalPruebas,
      ok: cntOK,
      nok: cntNOK,
      bloqueado: cntBloq,
      noAplica: cntNA,
      tasaExito: tasaExito,
      totalIncidencias: incidenciasReportadas.length
    },
    codigoVerificacion: codigoVerificacion,
    fechaGenerada: fechaGenerada,
    fechaEmision: ahora.toLocaleString('es-CL', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }),
    config: AppState.sesion && AppState.sesion.config ? AppState.sesion.config : {
      ciclo_activo: 1,
      ambiente: 'QAS-200',
      version_catalogo: '8.0',
      golive_activo: 'GL1'
    }
  };
}

function construirNombreArchivoCertificado(nombreUsuario, fechaGenerada) {
  const nombreLimpio = String(nombreUsuario || 'Usuario')
    .trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s_-]/g, '')
    .trim()
    .replace(/\s+/g, '_');

  const fechaLimpia = String(fechaGenerada || new Date().toISOString().substring(0, 10)).trim();
  return `Certificado_Pruebas_SAP_${nombreLimpio}_${fechaLimpia}.pdf`;
}

function renderizarPantallaCertificado() {
  const datos = obtenerDatosCertificado();
  const f = AppState.filtroCertificado;
  const esLider = esLiderOAdmin();
  const nombreArchivo = construirNombreArchivoCertificado(datos.usuario.nombre, datos.fechaGenerada);

  return `
    <div class="contenedor-certificado">
      <!-- Banner informativo superior -->
      <div class="banner-intro-cert">
        <div>
          <div class="banner-intro-cert-titulo">
            <span style="font-size: 20px;">📄</span>
            <span>Certificado Oficial de Pruebas SAP S/4HANA</span>
          </div>
          <div class="banner-intro-cert-sub">
            Documento de acreditación oficial para carga en el Sistema de Control de Ciclos de Prueba · Formato PDF de alta resolución.
          </div>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <span class="badge-ilimitado">
            <span>✓</span> Descargas ilimitadas
          </span>
          <button class="btn-secundario" onclick="window.location.hash='#pruebas'" style="font-size: 12px; padding: 6px 12px;">
            ← Volver a Pruebas
          </button>
        </div>
      </div>

      <!-- Panel interactivo de filtros y descarga -->
      <div class="panel-filtros-cert">
        <div class="fila-filtros-cert">
          ${esLider ? `
            <div class="grupo-filtro-cert" style="flex: 1; min-width: 260px;">
              <label for="sel-cert-usuario">Ejecutor / Titular del Certificado</label>
              <select id="sel-cert-usuario" class="form-select">
                <option value="${AppState.sesion.perfil.email}" ${f.usuarioEmail === AppState.sesion.perfil.email ? 'selected' : ''}>
                  Mi Certificado (${AppState.sesion.perfil.nombre})
                </option>
                <option value="__todos__" ${f.usuarioEmail === '__todos__' ? 'selected' : ''}>
                  📋 Consolidado General (Todos los ejecutores)
                </option>
                <optgroup label="Key-Users y Equipo de Certificación">
                  ${LISTA_USUARIOS_SIMULADOS.filter(u => u.email !== AppState.sesion.perfil.email).map(u => `
                    <option value="${u.email}" ${f.usuarioEmail === u.email ? 'selected' : ''}>
                      ${u.nombre} (${u.email}) [${u.sociedad || 'CL11'}]
                    </option>
                  `).join('')}
                </optgroup>
              </select>
            </div>
          ` : `
            <div class="grupo-filtro-cert" style="flex: 1; min-width: 240px;">
              <label>Titular del Certificado</label>
              <div style="padding: 8px 12px; background: #f8fafc; border: 1px solid var(--borde-suave); border-radius: 4px; font-weight: 700; color: #0f1e40;">
                ${datos.usuario.nombre} <span style="font-weight: normal; color: #64748b; font-size: 11px;">(${datos.usuario.email})</span>
              </div>
            </div>
          `}

          <div class="grupo-filtro-cert">
            <label for="inp-cert-desde">Fecha Desde</label>
            <input type="date" id="inp-cert-desde" class="form-input" value="${datos.fechaDesde}" style="width: 140px;">
          </div>

          <div class="grupo-filtro-cert">
            <label for="inp-cert-hasta">Fecha Hasta</label>
            <input type="date" id="inp-cert-hasta" class="form-input" value="${datos.fechaHasta}" style="width: 140px;">
          </div>

          <div class="grupo-filtro-cert">
            <label>Atajos de rango</label>
            <div class="atajos-fecha">
              <button class="btn-atajo-fecha" data-rango="hoy">Hoy</button>
              <button class="btn-atajo-fecha" data-rango="7d">7 días</button>
              <button class="btn-atajo-fecha" data-rango="15d">15 días</button>
              <button class="btn-atajo-fecha" data-rango="30d">30 días</button>
              <button class="btn-atajo-fecha" data-rango="ciclo">Todo el ciclo</button>
            </div>
          </div>
        </div>

        <div class="fila-filtros-cert" style="padding-top: 4px;">
          <div class="grupo-filtro-cert" style="min-width: 160px;">
            <label for="sel-cert-resultado">Filtro de Resultado</label>
            <select id="sel-cert-resultado" class="form-select">
              <option value="todos" ${f.filtroResultado === 'todos' ? 'selected' : ''}>Todos los resultados</option>
              <option value="OK" ${f.filtroResultado === 'OK' ? 'selected' : ''}>Solo Conformes (OK)</option>
              <option value="NOK" ${f.filtroResultado === 'NOK' ? 'selected' : ''}>Solo No Conformes (NOK)</option>
              <option value="BLOQUEADO" ${f.filtroResultado === 'BLOQUEADO' ? 'selected' : ''}>Solo Bloqueados</option>
            </select>
          </div>

          <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap; margin-top: 18px;">
            <label style="font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;">
              <input type="checkbox" id="chk-cert-pruebas" ${f.incluirPruebas ? 'checked' : ''}>
              Incluir Pruebas Realizadas (${datos.estadisticas.total})
            </label>
            <label style="font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;">
              <input type="checkbox" id="chk-cert-incidencias" ${f.incluirIncidencias ? 'checked' : ''}>
              Incluir Incidencias Reportadas (${datos.estadisticas.totalIncidencias})
            </label>
            <label style="font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;">
              <input type="checkbox" id="chk-cert-docs" ${f.incluirDocumentos ? 'checked' : ''}>
              Incluir Documentos SAP asociados
            </label>
          </div>
        </div>

        <!-- Botones de accion -->
        <div class="acciones-cert">
          <button id="btn-descargar-pdf" class="btn-descargar-pdf" title="Descargar como ${nombreArchivo}">
            <span style="font-size: 16px;">📥</span> Descargar PDF (Oficial)
          </button>
          <button id="btn-imprimir-cert" class="btn-imprimir-cert">
            <span>🖨️</span> Imprimir / Guardar como PDF
          </button>
          <button id="btn-copiar-codigo" class="btn-secundario" style="padding: 9px 14px; font-size: 12px;" data-codigo="${datos.codigoVerificacion}">
            <span>📋</span> Copiar Código Verificación: <strong style="font-family: monospace;">${datos.codigoVerificacion}</strong>
          </button>
          <div style="font-size: 11px; color: #475569; width: 100%; display: flex; align-items: center; gap: 6px; margin-top: 6px;">
            <span>Nombre del archivo a grabar:</span>
            <strong style="font-family: monospace; color: #0f1e40; background: #f1f5f9; padding: 2px 8px; border-radius: 4px; border: 1px solid #cbd5e1;">${nombreArchivo}</strong>
          </div>
        </div>
      </div>

      <!-- VISTA PREVIA DEL DOCUMENTO OFICIAL (SE RENDERIZA EN EL PDF) -->
      <div id="documento-certificado" class="documento-certificado">
        
        <!-- Membrete institucional -->
        <div class="cert-header">
          <div class="cert-logo-box">
            <div class="cert-logo-circulo">P</div>
            <div>
              <div class="cert-logo-texto-empresa">GRUPO PORTLAND S.A.</div>
              <div class="cert-logo-texto-portal">CERTIFICACIÓN SAP S/4HANA · CICLO DE PRUEBAS</div>
            </div>
          </div>
          <div class="cert-titulo-bloque">
            <div class="cert-titulo-doc">CERTIFICADO DE EJECUCIÓN DE PRUEBAS</div>
            <div class="cert-subtitulo-doc">Control de Calidad y Ciclos de Certificación v8.0</div>
            <div class="cert-codigo-verif">${datos.codigoVerificacion}</div>
          </div>
        </div>

        <!-- Ficha Tecnica de Acreditacion -->
        <div class="cert-grid-meta">
          <div class="cert-meta-item">
            <span class="cert-meta-label">Ejecutor Certificador:</span>
            <span class="cert-meta-valor">${datos.usuario.nombre}</span>
          </div>
          <div class="cert-meta-item">
            <span class="cert-meta-label">Período Certificado:</span>
            <span class="cert-meta-valor">${datos.fechaDesde} al ${datos.fechaHasta}</span>
          </div>
          <div class="cert-meta-item">
            <span class="cert-meta-label">Correo Corporativo:</span>
            <span class="cert-meta-valor">${datos.usuario.email}</span>
          </div>
          <div class="cert-meta-item">
            <span class="cert-meta-label">Ambiente / Mandante:</span>
            <span class="cert-meta-valor">${datos.config.ambiente || 'QAS-200'} (Ciclo ${datos.config.ciclo_activo})</span>
          </div>
          <div class="cert-meta-item">
            <span class="cert-meta-label">Sociedad Legal:</span>
            <span class="cert-meta-valor">${datos.sociedad.nombre} [${datos.sociedad.codigo}]</span>
          </div>
          <div class="cert-meta-item">
            <span class="cert-meta-label">Go-Live Asociado:</span>
            <span class="cert-meta-valor">${datos.config.golive_activo || 'GL1'} · Catálogo v${datos.config.version_catalogo || '8.0'}</span>
          </div>
          <div class="cert-meta-item">
            <span class="cert-meta-label">Cargo / Rol:</span>
            <span class="cert-meta-valor">${datos.usuario.cargo || 'Key User'} (${datos.usuario.rol})</span>
          </div>
          <div class="cert-meta-item">
            <span class="cert-meta-label">Fecha y Hora de Emisión:</span>
            <span class="cert-meta-valor">${datos.fechaEmision} hrs</span>
          </div>
        </div>

        <!-- Bloque de Resumen Ejecutivo y Métricas KPI -->
        <div class="cert-kpis">
          <div class="cert-kpi-tarjeta kpi-total">
            <div class="cert-kpi-numero">${datos.estadisticas.total}</div>
            <div class="cert-kpi-etiqueta">Pruebas Ejecutadas (${datos.objetosUnicosCount} únicas)</div>
          </div>
          <div class="cert-kpi-tarjeta kpi-ok">
            <div class="cert-kpi-numero" style="color: #16a34a;">${datos.estadisticas.ok}</div>
            <div class="cert-kpi-etiqueta">Conformes OK (${datos.estadisticas.tasaExito}%)</div>
          </div>
          <div class="cert-kpi-tarjeta kpi-nok">
            <div class="cert-kpi-numero" style="color: #dc2626;">${datos.estadisticas.nok}</div>
            <div class="cert-kpi-etiqueta">No Conformes NOK</div>
          </div>
          <div class="cert-kpi-tarjeta kpi-bloq">
            <div class="cert-kpi-numero" style="color: #d97706;">${datos.estadisticas.bloqueado + datos.estadisticas.noAplica}</div>
            <div class="cert-kpi-etiqueta">Bloqueadas / N.A.</div>
          </div>
          <div class="cert-kpi-tarjeta kpi-inc">
            <div class="cert-kpi-numero" style="color: #7c3aed;">${datos.estadisticas.totalIncidencias}</div>
            <div class="cert-kpi-etiqueta">Incidencias Reportadas</div>
          </div>
        </div>

        <!-- SECCION 1: DETALLE DE PRUEBAS REALIZADAS -->
        ${f.incluirPruebas ? `
          <div class="cert-seccion-titulo">
            <span>1. REGISTRO DE PRUEBAS EJECUTADAS EN EL PERÍODO</span>
            <span class="cert-seccion-contador">Total: ${datos.pruebas.length} registros</span>
          </div>

          ${datos.pruebas.length === 0 ? `
            <div style="padding: 18px; text-align: center; color: #64748b; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 4px; margin-bottom: 16px;">
              No se registran pruebas reportadas por este usuario en el rango de fechas seleccionado (${datos.fechaDesde} al ${datos.fechaHasta}).
            </div>
          ` : `
            <table class="cert-tabla">
              <thead>
                <tr>
                  <th style="width: 25px; text-align: center;">#</th>
                  <th style="width: 85px;">Código</th>
                  <th style="width: 60px;">Tx SAP</th>
                  <th>Caso de Prueba / Escenario</th>
                  <th style="width: 100px;">Fecha / Hora</th>
                  <th style="width: 80px; text-align: center;">Resultado</th>
                  ${f.incluirDocumentos ? `<th>Documentos SAP Generados</th>` : ''}
                  <th>Observaciones / Comentario</th>
                </tr>
              </thead>
              <tbody>
                ${datos.pruebas.map((p, idx) => `
                  <tr>
                    <td style="text-align: center; color: #64748b; font-weight: 600;">${idx + 1}</td>
                    <td>
                      <strong style="color: #0f1e40;">${p.prueba._codigo}</strong>
                      <div style="font-size: 9px; color: #64748b;">${p.prueba._tipo} · ${p.resultado.alcance || 'ASIGNADA'}</div>
                    </td>
                    <td>
                      <code style="font-weight: 700; color: #1e293b;">${p.prueba.tx || '-'}</code>
                    </td>
                    <td>
                      <div style="font-weight: 600; color: #0f172a;">${p.prueba._nombre}</div>
                      ${p.resultado.paso ? `<div style="font-size: 10px; color: #b71c1c; font-weight: 600;">Detenido en paso: ${p.resultado.paso}</div>` : ''}
                    </td>
                    <td style="white-space: nowrap;">
                      <div>${p.fecha}</div>
                      <div style="font-size: 10px; color: #64748b;">${p.hora} hrs</div>
                    </td>
                    <td style="text-align: center;">
                      ${p.resultado.resultado === 'OK' ? `<span class="badge-cert-resultado badge-cert-ok">✓ OK</span>` :
                        p.resultado.resultado === 'NOK' ? `<span class="badge-cert-resultado badge-cert-nok">✗ NOK</span>` :
                        p.resultado.resultado === 'BLOQUEADO' ? `<span class="badge-cert-resultado badge-cert-bloqueado">⏸ BLOQ</span>` :
                        `<span class="badge-cert-resultado badge-cert-no-aplica">N/A</span>`}
                      ${p.resultado.incidencia ? `<div style="font-size: 9px; font-weight: 700; color: #b71c1c; margin-top: 2px;">${p.resultado.incidencia}</div>` : ''}
                    </td>
                    ${f.incluirDocumentos ? `
                      <td>
                        ${p.resultado.documentos ? `
                          <div style="font-size: 10px; font-weight: 600; color: #0f1e40;">${p.resultado.documentos}</div>
                        ` : (p.docs && p.docs.length > 0) ? `
                          <div style="font-size: 10px; color: #0f1e40;">
                            ${p.docs.map(d => `${d.tipo}: ${d.numero}`).join(' · ')}
                          </div>
                        ` : '<span style="color: #94a3b8; font-size: 10px;">—</span>'}
                      </td>
                    ` : ''}
                    <td>
                      <div style="font-size: 10px; color: #334155;">
                        ${p.resultado.comentario || '<span style="color: #94a3b8; font-style: italic;">Sin comentarios adicionales</span>'}
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `}
        ` : ''}

        <!-- SECCION 2: DETALLE DE INCIDENCIAS REPORTADAS -->
        ${f.incluirIncidencias ? `
          <div class="cert-seccion-titulo" style="margin-top: 22px;">
            <span>2. REGISTRO DE DEFECTOS E INCIDENCIAS REPORTADAS</span>
            <span class="cert-seccion-contador">Total: ${datos.incidencias.length} incidencias</span>
          </div>

          ${datos.incidencias.length === 0 ? `
            <div style="padding: 14px; text-align: center; color: #64748b; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 4px; margin-bottom: 16px;">
              No se registraron defectos o incidencias reportadas en el período seleccionado.
            </div>
          ` : `
            <table class="cert-tabla">
              <thead>
                <tr>
                  <th style="width: 75px;">ID Inc.</th>
                  <th style="width: 95px;">Fecha / Hora</th>
                  <th style="width: 80px;">Prueba</th>
                  <th>Título y Descripción de la Falla</th>
                  <th style="width: 70px; text-align: center;">Severidad</th>
                  <th style="width: 80px;">Módulo / Tx</th>
                  <th style="width: 85px; text-align: center;">Estado</th>
                </tr>
              </thead>
              <tbody>
                ${datos.incidencias.map(inc => `
                  <tr>
                    <td>
                      <strong style="color: #b71c1c; font-family: monospace;">${inc.id}</strong>
                    </td>
                    <td style="white-space: nowrap;">
                      <div>${(inc.ts_alta || '').substring(0, 10)}</div>
                      <div style="font-size: 10px; color: #64748b;">${(inc.ts_alta || '').substring(11, 16)} hrs</div>
                    </td>
                    <td>
                      <strong>${inc.objeto || 'E2E/CU'}</strong>
                      ${inc.paso ? `<div style="font-size: 9px; color: #64748b;">Paso ${inc.paso}</div>` : ''}
                    </td>
                    <td>
                      <div style="font-weight: 700; color: #0f172a;">${inc.titulo}</div>
                      <div style="font-size: 10px; color: #475569; margin-top: 2px;">
                        ${(inc.detalle || '').replace(/^\[Tx:[^\]]+\]\s*/i, '')}
                      </div>
                      ${inc.resolucion ? `<div style="font-size: 9px; color: #15803d; font-weight: 600; margin-top: 2px;">Resolución: ${inc.resolucion}</div>` : ''}
                    </td>
                    <td style="text-align: center;">
                      ${inc.severidad === 'CRITICA' ? `<span class="badge-cert-sev badge-cert-sev-critica">CRÍTICA</span>` :
                        inc.severidad === 'ALTA' ? `<span class="badge-cert-sev badge-cert-sev-alta">ALTA</span>` :
                        inc.severidad === 'MEDIA' ? `<span class="badge-cert-sev badge-cert-sev-media">MEDIA</span>` :
                        `<span class="badge-cert-sev badge-cert-sev-baja">BAJA</span>`}
                    </td>
                    <td>
                      <div>${inc.modulo || 'MM'}</div>
                      <code style="font-size: 10px; color: #64748b;">${inc.transaccion || '-'}</code>
                    </td>
                    <td style="text-align: center; font-size: 10px; font-weight: 700;">
                      ${inc.estado === 'CERRADA' ? '<span style="color: #15803d;">✓ CERRADA</span>' :
                        inc.estado === 'ABIERTA' ? '<span style="color: #b71c1c;">● ABIERTA</span>' :
                        `<span style="color: #b45309;">${inc.estado}</span>`}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `}
        ` : ''}

        <!-- SECCION 3: CLAUSULA DE CERTIFICACION -->
        <div class="cert-clausula">
          <strong>DECLARACIÓN DE CONFORMIDAD Y VALIDEZ OFICIAL:</strong>
          El presente documento certifica fehacientemente que las pruebas e incidencias registradas en este informe fueron ejecutadas y reportadas conforme a los protocolos del Plan de Pruebas de Certificación SAP S/4HANA v8.0 del Grupo Portland en el ambiente y fechas declaradas. Documento generado electrónicamente para su incorporación formal en el <strong>Sistema de Control de Ciclos de Prueba</strong> como respaldo del proceso de certificación y evaluación de Go-Live.
        </div>

        <!-- SECCION 4: FIRMAS DE RESPONSABILIDAD -->
        <div class="cert-firmas">
          <div class="cert-caja-firma">
            <div class="cert-linea-firma"></div>
            <div class="cert-firma-nombre">${datos.usuario.nombre}</div>
            <div class="cert-firma-cargo">Ejecutor / Key User Certificador — Grupo Portland</div>
            <div class="cert-firma-fecha">Fecha: ________________________</div>
          </div>
          <div class="cert-caja-firma">
            <div class="cert-linea-firma"></div>
            <div class="cert-firma-nombre">LÍDER DE IMPLEMENTACIÓN / QA</div>
            <div class="cert-firma-cargo">Control de Calidad y Certificación SAP S/4HANA</div>
            <div class="cert-firma-fecha">Fecha: ________________________</div>
          </div>
        </div>

        <!-- Footer auditoría -->
        <div class="cert-footer-auditoria">
          <span>Código Verificación: ${datos.codigoVerificacion}</span>
          <span>Portal de Pruebas SAP S/4HANA — Grupo Portland S.A.</span>
          <span>Emisión: ${datos.fechaEmision}</span>
        </div>

      </div>
    </div>
  `;
}

function enlazarEventosVistaCertificado() {
  const selUser = document.getElementById('sel-cert-usuario');
  if (selUser) {
    selUser.addEventListener('change', (e) => {
      AppState.filtroCertificado.usuarioEmail = e.target.value;
      renderizarApp();
    });
  }

  const inpDesde = document.getElementById('inp-cert-desde');
  if (inpDesde) {
    inpDesde.addEventListener('change', (e) => {
      AppState.filtroCertificado.fechaDesde = e.target.value;
      renderizarApp();
    });
  }

  const inpHasta = document.getElementById('inp-cert-hasta');
  if (inpHasta) {
    inpHasta.addEventListener('change', (e) => {
      AppState.filtroCertificado.fechaHasta = e.target.value;
      renderizarApp();
    });
  }

  const selRes = document.getElementById('sel-cert-resultado');
  if (selRes) {
    selRes.addEventListener('change', (e) => {
      AppState.filtroCertificado.filtroResultado = e.target.value;
      renderizarApp();
    });
  }

  const chkPruebas = document.getElementById('chk-cert-pruebas');
  if (chkPruebas) {
    chkPruebas.addEventListener('change', (e) => {
      AppState.filtroCertificado.incluirPruebas = e.target.checked;
      renderizarApp();
    });
  }

  const chkInc = document.getElementById('chk-cert-incidencias');
  if (chkInc) {
    chkInc.addEventListener('change', (e) => {
      AppState.filtroCertificado.incluirIncidencias = e.target.checked;
      renderizarApp();
    });
  }

  const chkDocs = document.getElementById('chk-cert-docs');
  if (chkDocs) {
    chkDocs.addEventListener('change', (e) => {
      AppState.filtroCertificado.incluirDocumentos = e.target.checked;
      renderizarApp();
    });
  }

  document.querySelectorAll('.btn-atajo-fecha').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const rango = e.target.dataset.rango;
      const hoy = new Date();
      const hoyStr = hoy.toISOString().substring(0, 10);
      AppState.filtroCertificado.fechaHasta = hoyStr;

      if (rango === 'hoy') {
        AppState.filtroCertificado.fechaDesde = hoyStr;
      } else if (rango === '7d') {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        AppState.filtroCertificado.fechaDesde = d.toISOString().substring(0, 10);
      } else if (rango === '15d') {
        const d = new Date();
        d.setDate(d.getDate() - 15);
        AppState.filtroCertificado.fechaDesde = d.toISOString().substring(0, 10);
      } else if (rango === '30d') {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        AppState.filtroCertificado.fechaDesde = d.toISOString().substring(0, 10);
      } else if (rango === 'ciclo') {
        AppState.filtroCertificado.fechaDesde = '2026-09-01';
      }
      renderizarApp();
    });
  });

  const btnDescarga = document.getElementById('btn-descargar-pdf');
  if (btnDescarga) {
    btnDescarga.addEventListener('click', descargarCertificadoPDF);
  }

  const btnImprimir = document.getElementById('btn-imprimir-cert');
  if (btnImprimir) {
    btnImprimir.addEventListener('click', imprimirCertificado);
  }

  const btnCopiar = document.getElementById('btn-copiar-codigo');
  if (btnCopiar) {
    btnCopiar.addEventListener('click', () => {
      const cod = btnCopiar.dataset.codigo;
      if (cod) copiarCodigoVerificacion(cod);
    });
  }
}

async function descargarCertificadoPDF() {
  const elemento = document.getElementById('documento-certificado');
  if (!elemento) {
    mostrarToast('Error: no se encontró el documento para exportar.');
    return;
  }

  const btnDescarga = document.getElementById('btn-descargar-pdf');
  const textoOriginal = btnDescarga ? btnDescarga.innerHTML : '';
  if (btnDescarga) {
    btnDescarga.disabled = true;
    btnDescarga.innerHTML = '<span class="spinner"></span> Generando PDF oficial...';
  }

  const datos = obtenerDatosCertificado();
  const nombreArchivo = construirNombreArchivoCertificado(datos.usuario.nombre, datos.fechaGenerada);
  const tituloOriginal = document.title;
  document.title = nombreArchivo.replace(/\.pdf$/i, '');

  try {
    if (typeof html2pdf !== 'undefined') {
      const opt = {
        margin: [6, 6, 8, 6],
        filename: nombreArchivo,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf().set(opt).from(elemento).save();
      mostrarToast(`✓ Certificado grabado como "${nombreArchivo}". Listo para cargar en el sistema de ciclos.`);

      // Registrar auditoría en bitácora
      api('registrarCertificado', {
        codigo: datos.codigoVerificacion,
        nombreArchivo: nombreArchivo,
        usuario: datos.usuario.email,
        fechaGenerada: datos.fechaGenerada
      }).catch(() => {});
    } else {
      window.print();
      mostrarToast(`Aviso: generado mediante ventana de impresión ("${nombreArchivo}").`);
    }
  } catch (err) {
    console.error('Error al generar PDF mediante html2pdf:', err);
    window.print();
    mostrarToast('Aviso: abierto mediante ventana de impresión del sistema.');
  } finally {
    setTimeout(() => {
      document.title = tituloOriginal;
    }, 1500);
    if (btnDescarga) {
      btnDescarga.disabled = false;
      btnDescarga.innerHTML = textoOriginal;
    }
  }
}

function imprimirCertificado() {
  const datos = obtenerDatosCertificado();
  const nombreArchivo = construirNombreArchivoCertificado(datos.usuario.nombre, datos.fechaGenerada);
  const tituloOriginal = document.title;
  document.title = nombreArchivo.replace(/\.pdf$/i, '');
  window.print();
  setTimeout(() => {
    document.title = tituloOriginal;
  }, 1000);
}

function copiarCodigoVerificacion(codigo) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(codigo).then(() => {
      mostrarToast('✓ Código de verificación copiado al portapapeles: ' + codigo);
    }).catch(() => {
      prompt('Copie el código de verificación:', codigo);
    });
  } else {
    prompt('Copie el código de verificación:', codigo);
  }
}

/* ==========================================================================
   EVENTOS GLOBALES
   ========================================================================== */
function enlazarEventosGlobales() {
  const inpGlobal = document.getElementById('input-busqueda-global');
  const btnGlobal = document.getElementById('btn-buscar-global');

  if (btnGlobal && inpGlobal) {
    const buscar = () => {
      const val = inpGlobal.value.trim();
      if (val) ejecutarBusquedaGlobal(val);
    };
    btnGlobal.addEventListener('click', buscar);
    inpGlobal.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') buscar();
    });
  }
}

function enlazarEventosVista() {
  if (AppState.vista === 'pruebas') enlazarEventosVistaPruebas();
  else if (AppState.vista === 'ficha') enlazarEventosVistaFicha();
  else if (AppState.vista === 'incidencias') enlazarEventosVistaIncidencias();
  else if (AppState.vista === 'avance') enlazarEventosVistaAvance();
  else if (AppState.vista === 'gestion') enlazarEventosVistaGestion();
  else if (AppState.vista === 'certificado') enlazarEventosVistaCertificado();

  if (AppState.modalReporteAbierto) enlazarEventosModalReportar();
  if (AppState.modalAgregarDocAbierto) enlazarEventosModalDoc();
  if (AppState.modalIncidenciaAbierto) enlazarEventosModalGestionIncidencia();
}

window.addEventListener('DOMContentLoaded', inicializarApp);

