function useFixedSelectData() {
  const tipoOperacion = [
    { value: "EFECTIVO", label: "Efectivo" },
    { value: "TRANSFERENCIA", label: "Transferencia" },
    { value: "CHEQUE", label: "Cheque" },
    {
      value: "DEBITO_AUTOMATICO_TARJETA_CREDITO",
      label: "Débito Automático tarjeta crédito",
    },
  ];
  const currency = [
    { value: "Peso", label: "Peso" },
    { value: "Dolar", label: "Dolar" },
  ];

  const orepEstadoOptions = [
    { value: "EnProgreso", label: "En Proceso" },
    { value: "Aceptado", label: "Aceptado" },
    { value: "Terminado", label: "Terminado" },
    { value: "SeRetira", label: "Se Retira" },
  ];

  const ventaEstadoOptions = [
    { value: "Presupuestado", label: "Presupuestado" },
    { value: "Preparado", label: "Preparado" },
    { value: "Entregado", label: "Entregado" },
    { value: "Cerrado", label: "Cerrado" },
  ];

  const presupuestoEstadoOptions = [
    { value: "EnPreparacion", label: "En Preparación" },
    { value: "Terminado", label: "Terminado" },
    { value: "Enviado", label: "Enviado" },
    { value: "ADefinir", label: "A Definir" },
    { value: "Aceptado", label: "Aceptado" },
    { value: "Rechazado", label: "Rechazado" },
    { value: "Descartado", label: "Descartado" },
  ];

  const vacacionEstadoOptions = [
    { value: "Pendiente", label: "Pendiente" },
    { value: "Aprobada", label: "Aprobada" },
    { value: "Rechazada", label: "Rechazada" },
    { value: "Cancelada", label: "Cancelada" },
  ];

  const siNo = [
    { value: "Si", label: "Si" },
    { value: "No", label: "No" },
  ];

  const agendaEventRecurrence = [
    { value: "No", label: "No se repite" },
    { value: "Diario", label: "Diaria" },
    { value: "Semanal", label: "Semanal" },
    { value: "Mensual", label: "Mensual" },
    { value: "Anual", label: "Anual" },
  ];

  const typeOfOperation = [
    { value: "this", label: "Este" },
    { value: "all", label: "Todos" },
    { value: "this_and_following", label: "Este y los siguientes" },
  ];

  return {
    tipoOperacion,
    currency,
    orepEstadoOptions,
    ventaEstadoOptions,
    siNo,
    presupuestoEstadoOptions,
    vacacionEstadoOptions,
    agendaEventRecurrence,
    typeOfOperation,
  };
}

export default useFixedSelectData;
