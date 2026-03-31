export function resolveWhatsAppErrorMessage(rawError: string | undefined): string {
  if (!rawError) return "Ocurrió un error al enviar el mensaje. Intentá de nuevo."

  const e = rawError.toLowerCase()

  // Errores de configuración del cliente
  if (e.includes("no acepta notificaciones") || e.includes("can_receive_notifications"))
    return "Este cliente tiene las notificaciones desactivadas. Activá las notificaciones en su ficha para poder enviarle mensajes."

  if (e.includes("no tiene teléfono") || e.includes("teléfono registrado"))
    return "El cliente no tiene un número de teléfono registrado. Ingresá el teléfono en su ficha antes de enviar."

  if (e.includes("no está habilitado"))
    return "El número del cliente no está habilitado para recibir mensajes de WhatsApp."

  // Errores de ventana de 24h
  if (e.includes("ventana de 24h") || e.includes("24h vencida"))
    return "La ventana de conversación de 24 horas está vencida. El mensaje se enviará como template."

  // Errores de Meta API
  if (e.includes("131047") || e.includes("re-engagement"))
    return "El cliente no puede recibir mensajes en este momento (restricción de WhatsApp). Intentá más tarde."

  if (e.includes("131026") || e.includes("recipient"))
    return "El número del cliente no es una cuenta de WhatsApp válida. Verificá el teléfono en su ficha."

  if (e.includes("131000") || e.includes("message failed"))
    return "WhatsApp rechazó el mensaje. Verificá que el número sea correcto."

  if (e.includes("130429") || e.includes("rate limit"))
    return "Se alcanzó el límite de mensajes de WhatsApp. Esperá unos minutos y volvé a intentar."

  if (e.includes("meta api error") || e.includes("graph.facebook"))
    return "Error en la API de WhatsApp. Puede ser un problema temporal, intentá de nuevo en unos minutos."

  if (e.includes("no se pudo generar el pdf") || e.includes("pdf"))
    return "No se pudo generar el PDF. Verificá que la orden/presupuesto/venta esté completa."

  if (e.includes("no encontrada") || e.includes("not found"))
    return "No se encontró el recurso. Puede que haya sido eliminado."

  if (e.includes("conversación no encontrada"))
    return "No se encontró la conversación activa del cliente."

  // Errores de modo test
  if (e.includes("test") || e.includes("prueba"))
    return "Estás en modo de prueba. Solo podés enviar mensajes al número de test configurado."

  // Fallback con el mensaje original para no perder información
  return `Error al enviar: ${rawError}`
}

