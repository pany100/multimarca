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
    { value: "Presupuestado", label: "Presupuestado" },
    { value: "EnProgreso", label: "En Proceso" },
    { value: "Aceptado", label: "Aceptado" },
    { value: "Terminado", label: "Terminado" },
  ];

  const siNo = [
    { value: "Si", label: "Si" },
    { value: "No", label: "No" },
  ];
  return { tipoOperacion, currency, orepEstadoOptions, siNo };
}

export default useFixedSelectData;
