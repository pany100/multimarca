import { ControlMecanico } from "@/hooks/orden-reparacion/useControles";

function getFormattedPrice(price: number | string) {
  return `$${parseFloat(price.toString()).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getFormattedPriceDolar(price: number | string) {
  return `US$${parseFloat(price.toString()).toLocaleString("en-AR", {
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

const sortControlsByOrdenEnPdf = (
  a: { ordenEnPdf?: number | null },
  b: { ordenEnPdf?: number | null }
) => {
  // Handle undefined or null ordenEnPdf values
  const aOrder = a.ordenEnPdf ?? Number.MAX_SAFE_INTEGER;
  const bOrder = b.ordenEnPdf ?? Number.MAX_SAFE_INTEGER;
  return aOrder - bOrder;
};

function getSortedCheckControls(controlesList: ControlMecanico[]) {
  return controlesList
    .filter(
      (control: ControlMecanico) =>
        control.type === "checkbox" && control.parent === null
    )
    .sort(sortControlsByOrdenEnPdf);
}

function getSortedTextControls(controlesList: ControlMecanico[]) {
  return controlesList
    .filter(
      (control: ControlMecanico) =>
        control.type === "texto" && control.parent === null
    )
    .sort(sortControlsByOrdenEnPdf);
}

function getSortedGroupControls(controlesList: ControlMecanico[]) {
  const groupChecks = controlesList.filter(
    (control: ControlMecanico) => control.parent !== null
  );
  const uniqueParentIds = Array.from(
    new Set(groupChecks.map((control) => control.parent?.id).filter(Boolean))
  );
  return uniqueParentIds.map((parentId) => {
    const childControls = groupChecks
      .filter((control) => control.parent && control.parent.id === parentId)
      .sort(sortControlsByOrdenEnPdf);

    // Use the parent name from the first child control that has this parent
    const parentName = childControls[0]?.parent?.name;

    return {
      name: parentName,
      controls: childControls,
    };
  });
}

export {
  getFormattedChequeType,
  getFormattedDate,
  getFormattedPrice,
  getFormattedPriceDolar,
  getOperacionChequeLabel,
  getSortedCheckControls,
  getSortedGroupControls,
  getSortedTextControls,
  sortControlsByOrdenEnPdf,
};
