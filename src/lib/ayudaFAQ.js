// Preguntas frecuentes del panel del dueño.
// Editá libremente este array — la UI (SeccionAyuda) lo lee y arma el
// acordeón solo. Para sumar una pregunta, agregá una entrada más.
//
// Formato de `respuesta`:
//   - texto plano,
//   - dos saltos de línea (`\n\n`) separan párrafos.
// La UI no parsea markdown ni HTML — mantenelo así para que el contenido sea
// fácil de editar y predecible al renderizar.

export const FAQ = [
  {
    pregunta: '¿Cómo agrego o edito un profesional?',
    respuesta:
      'Andá a la pestaña Profesionales. Tocá "+ Agregar" para sumar uno nuevo o "Editar" en la card de uno existente. Si dejó de atender, podés marcarlo como inactivo en lugar de borrarlo: sus turnos viejos se mantienen y deja de aparecer en el flujo de reserva del cliente.' +
      '\n\n' +
      'Cada plan tiene un límite: Inicial permite hasta 2 profesionales, Profesional hasta 5, Negocio sin límite. Cuando llegás al tope, el botón se reemplaza por un aviso para pasar al plan siguiente.',
  },
  {
    pregunta: '¿Cómo configuro mis horarios de atención?',
    respuesta:
      'Andá a la pestaña Horarios. Por cada día de la semana decidís si abrís o cerrás. En los días abiertos podés definir una o varias franjas — el sistema soporta horario partido (por ejemplo 9:00 a 13:00 y 16:00 a 20:00 con el descanso del mediodía).' +
      '\n\n' +
      'El flujo de reserva del cliente respeta esto automáticamente: los días cerrados aparecen grises y no se pueden elegir, y en los huecos entre franjas no se ofrecen turnos.',
  },
  {
    pregunta: '¿Cómo activo el cobro con seña?',
    respuesta:
      'Andá a Configuración y activá el toggle "Cobrar al reservar". Después configurás tres cosas: qué cobrás (una seña fija o el total del servicio), si el pago es obligatorio o el cliente puede elegir pagar en el local, y tu alias de pago para que el cliente sepa dónde transferir.' +
      '\n\n' +
      'Cuando alguien reserva con cobro activado, le aparece tu alias para transferir y un link de WhatsApp para mandarte el comprobante. Vos lo verificás y confirmás desde la pestaña Agenda.',
  },
  {
    pregunta: '¿Cómo cancelo o reagendo un turno?',
    respuesta:
      'En la pestaña Agenda, ubicá el turno (en la lista del día o en la vista "Por profesional"). En la card tenés tres acciones: Cancelar libera el horario y deja el turno como cancelado en la lista. Reagendar abre un selector para elegir nueva fecha y hora respetando tu disponibilidad — el propio turno se excluye del cálculo para no autobloquearse. Marcar atendido lo cierra cuando el cliente ya pasó.',
  },
  {
    pregunta: '¿Cómo sé si un cliente ya pagó?',
    respuesta:
      'Si activaste el cobro, los turnos donde el cliente dijo haber transferido llegan con badge cobre "Pendiente de pago". Tu trabajo es verificar el pago: si el cliente subió el comprobante en la app, lo abrís con el botón "Ver comprobante" de la card; si no, te lo manda por WhatsApp.' +
      '\n\n' +
      'Una vez verificado, tocá "Confirmar pago" y el turno pasa a "Confirmado". Si no pagó o pagó mal, tocá "Rechazar" para liberar el horario.' +
      '\n\n' +
      'En la pestaña Resumen vas a ver dos métricas separadas: "Cobrado este mes" (plata que ya entró) y "Por confirmar" (pendiente de tu verificación).',
  },
]
