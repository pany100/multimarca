function getFormattedControlName(controlName: string) {
  return controlName.replace(/control de /i, "").replace(/^control /i, "");
}

function getFormattedPrice(price: number | string) {
  return `$${parseFloat(price.toString()).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getFormattedDate(date: string) {
  const dateParts = date.split("T")[0].split("-");
  const year = dateParts[0];
  const month = dateParts[1];
  const day = dateParts[2];
  return `${day}/${month}/${year}`;
}

function getFormattedChequeType(type: string) {
  switch (type) {
    case "VENTA":
      return "Venta";
    case "GASTO":
      return "Gasto";
    case "EXTRACCION":
      return "Extracción";
    case "INGRESO_MANUAL":
      return "Ingreso manual";
    case "INGRESO_REPARACION":
      return "Ingreso reparación";
    default:
      return type;
  }
}

function getOperacionChequeLabel({
  fecha,
  tipo,
  descripcion,
}: {
  fecha: Date;
  tipo: string;
  descripcion: string;
}) {
  return `${getFormattedChequeType(tipo)} ${new Date(fecha).toLocaleDateString(
    "es-AR"
  )}: ${descripcion}`;
}

export {
  getFormattedChequeType,
  getFormattedControlName,
  getFormattedDate,
  getFormattedPrice,
  getOperacionChequeLabel,
};
