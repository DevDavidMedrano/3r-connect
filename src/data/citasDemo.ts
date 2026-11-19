import { inicioDeSemana } from '../types/cita'
import type { Cita } from '../types/cita'

function haceHoras(horas: number): string {
  return new Date(Date.now() - horas * 3_600_000).toISOString()
}

function enHoras(horas: number): string {
  return new Date(Date.now() + horas * 3_600_000).toISOString()
}

// Lunes de la semana actual + N días, a una hora fija — así la rejilla
// siempre muestra una semana poblada sin importar cuándo se abra la demo.
function horaSemana(diasDesdeLunes: number, hora: number, minuto = 0): string {
  const base = inicioDeSemana(new Date())
  base.setDate(base.getDate() + diasDesdeLunes)
  base.setHours(hora, minuto, 0, 0)
  return base.toISOString()
}

// DEMO — 15 citas, 5 por asesor, los 5 tipos representados. Dos casos
// deliberados para que las alertas "pro" se vean funcionando sin tener que
// crear nada a mano:
//   - Miércoles 5:00pm / 5:15pm, ambas de mariana-solis → EMPALME.
//   - Martes 10:00am (Lomas) / 11:00am (Polanco), ambas de renata-cobos,
//     15 min de por medio → TRASLADO JUSTO.
// Además dos ya pasadas y sin cierre (para el panel de cierre) y dos dentro
// de las próximas 24h sin confirmar (para el panel de confirmación).
export const citasDemoIniciales: Cita[] = [
  {
    id: 'cita-01',
    tipo: 'visita',
    clienteNombre: 'Andrea Vázquez',
    prospectoVentaId: 'prospecto-venta-01',
    folio: '3R-105',
    colonia: 'Polanco',
    asesorId: 'mariana-solis',
    inicio: horaSemana(0, 9, 0),
    duracionMinutos: 45,
    estado: 'confirmada',
    confirmacionEnviada: true,
    notas: '',
    resultado: null,
  },
  {
    id: 'cita-02',
    tipo: 'valuacion',
    clienteNombre: 'Rodrigo Espinoza',
    prospectoVentaId: 'prospecto-venta-06',
    folio: '3R-108',
    colonia: 'Anzures',
    asesorId: 'diego-herrera',
    inicio: horaSemana(0, 11, 0),
    duracionMinutos: 45,
    estado: 'agendada',
    confirmacionEnviada: false,
    notas: '',
    resultado: null,
  },
  {
    id: 'cita-03',
    tipo: 'llamada',
    clienteNombre: 'Paulina Sánchez',
    prospectoVentaId: 'prospecto-venta-05',
    folio: null,
    colonia: null,
    asesorId: 'renata-cobos',
    // Ya pasó y nadie registró el resultado — candidata a "Cierre de cita".
    inicio: haceHoras(5),
    duracionMinutos: 30,
    estado: 'confirmada',
    confirmacionEnviada: true,
    notas: '',
    resultado: null,
  },
  {
    id: 'cita-04',
    tipo: 'visita',
    clienteNombre: 'Camila Reyes',
    prospectoVentaId: 'prospecto-venta-03',
    folio: '3R-104',
    colonia: 'Lomas de Chapultepec',
    asesorId: 'renata-cobos',
    inicio: horaSemana(1, 10, 0),
    duracionMinutos: 45,
    estado: 'confirmada',
    confirmacionEnviada: true,
    notas: '',
    resultado: null,
  },
  {
    id: 'cita-05',
    tipo: 'valuacion',
    clienteNombre: 'Luis Bermúdez',
    prospectoVentaId: null,
    folio: '3R-106',
    colonia: 'Polanco',
    asesorId: 'renata-cobos',
    // Termina cita-04 a las 10:45, esta empieza a las 11:00 → 15 min y
    // colonia distinta: TRASLADO JUSTO.
    inicio: horaSemana(1, 11, 0),
    duracionMinutos: 45,
    estado: 'agendada',
    confirmacionEnviada: false,
    notas: '',
    resultado: null,
  },
  {
    id: 'cita-06',
    tipo: 'firma',
    clienteNombre: 'Regina Ortega',
    prospectoVentaId: 'prospecto-venta-09',
    folio: '3R-114',
    colonia: 'Lomas de Chapultepec',
    asesorId: 'mariana-solis',
    inicio: horaSemana(1, 16, 0),
    duracionMinutos: 60,
    estado: 'confirmada',
    confirmacionEnviada: true,
    notas: '',
    resultado: null,
  },
  {
    id: 'cita-07',
    tipo: 'visita',
    clienteNombre: 'Mario Delgado',
    prospectoVentaId: null,
    folio: '3R-109',
    colonia: 'Polanco',
    asesorId: 'diego-herrera',
    // Ya pasó, nunca se confirmó ni se cerró — segundo caso para el panel
    // de cierre.
    inicio: haceHoras(28),
    duracionMinutos: 45,
    estado: 'agendada',
    confirmacionEnviada: false,
    notas: '',
    resultado: null,
  },
  {
    id: 'cita-08',
    tipo: 'visita',
    clienteNombre: 'Ana Domínguez',
    prospectoVentaId: null,
    folio: '3R-111',
    colonia: 'Polanco',
    asesorId: 'mariana-solis',
    inicio: horaSemana(2, 17, 0),
    duracionMinutos: 45,
    estado: 'confirmada',
    confirmacionEnviada: true,
    notas: '',
    resultado: null,
  },
  {
    id: 'cita-09',
    tipo: 'valuacion',
    clienteNombre: 'Iván Torres',
    prospectoVentaId: null,
    folio: '3R-117',
    colonia: 'Polanco',
    asesorId: 'mariana-solis',
    // 5:00pm–5:45pm (cita-08) vs 5:15pm–6:00pm, mismo asesor → EMPALME.
    inicio: horaSemana(2, 17, 15),
    duracionMinutos: 45,
    estado: 'agendada',
    confirmacionEnviada: false,
    notas: '',
    resultado: null,
  },
  {
    id: 'cita-10',
    tipo: 'reunion',
    clienteNombre: 'Equipo interno',
    prospectoVentaId: null,
    folio: null,
    colonia: null,
    asesorId: 'diego-herrera',
    inicio: horaSemana(3, 10, 0),
    duracionMinutos: 60,
    estado: 'confirmada',
    confirmacionEnviada: true,
    notas: '',
    resultado: null,
  },
  {
    id: 'cita-11',
    tipo: 'visita',
    clienteNombre: 'Sergio Paredes',
    prospectoVentaId: null,
    folio: '3R-113',
    colonia: 'Polanco',
    asesorId: 'renata-cobos',
    inicio: horaSemana(3, 14, 0),
    duracionMinutos: 45,
    estado: 'agendada',
    confirmacionEnviada: false,
    notas: '',
    resultado: null,
  },
  {
    id: 'cita-12',
    tipo: 'valuacion',
    clienteNombre: 'Lucía Fernández',
    prospectoVentaId: null,
    folio: '3R-116',
    colonia: 'Polanco',
    asesorId: 'diego-herrera',
    // Dentro de las próximas 24h y sin confirmar → panel "Requieren
    // confirmación".
    inicio: enHoras(18),
    duracionMinutos: 45,
    estado: 'agendada',
    confirmacionEnviada: false,
    notas: '',
    resultado: null,
  },
  {
    id: 'cita-13',
    tipo: 'visita',
    clienteNombre: 'Demo',
    prospectoVentaId: 'prospecto-venta-10',
    folio: '3R-110',
    colonia: 'Polanco',
    asesorId: 'mariana-solis',
    inicio: horaSemana(4, 9, 0),
    duracionMinutos: 60,
    estado: 'confirmada',
    confirmacionEnviada: true,
    notas: '',
    resultado: null,
  },
  {
    id: 'cita-14',
    tipo: 'firma',
    clienteNombre: 'Valentina Cruz',
    prospectoVentaId: 'prospecto-venta-07',
    folio: '3R-118',
    colonia: 'Tecamachalco',
    asesorId: 'renata-cobos',
    inicio: horaSemana(4, 12, 0),
    duracionMinutos: 60,
    estado: 'agendada',
    confirmacionEnviada: false,
    notas: '',
    resultado: null,
  },
  {
    id: 'cita-15',
    tipo: 'llamada',
    clienteNombre: 'Héctor Villareal',
    prospectoVentaId: 'prospecto-venta-08',
    folio: null,
    colonia: null,
    asesorId: 'diego-herrera',
    // Segundo caso dentro de las próximas 24h sin confirmar.
    inicio: enHoras(10),
    duracionMinutos: 30,
    estado: 'agendada',
    confirmacionEnviada: false,
    notas: '',
    resultado: null,
  },
]
