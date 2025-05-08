export type ControlMecanico = {
  id: number;
  nombre: string;
  tipo: "checkbox" | "texto";
  valor: string;
  ordenEnPdf?: number;
  pdfName?: string;
  parent: {
    id: number;
    name: string;
  } | null;
};

export const sortControlsByOrdenEnPdf = (
  a: { ordenEnPdf?: number | null },
  b: { ordenEnPdf?: number | null }
) => {
  // Handle undefined or null ordenEnPdf values
  const aOrder = a.ordenEnPdf ?? Number.MAX_SAFE_INTEGER;
  const bOrder = b.ordenEnPdf ?? Number.MAX_SAFE_INTEGER;
  return aOrder - bOrder;
};

const useControles = ({
  controlesList,
}: {
  controlesList: ControlMecanico[];
}) => {
  const checkControls = controlesList
    .filter(
      (control: ControlMecanico) =>
        control.tipo === "checkbox" && control.parent === null
    )
    .sort(sortControlsByOrdenEnPdf);
  const textControls = controlesList
    .filter(
      (control: ControlMecanico) =>
        control.tipo === "texto" && control.parent === null
    )
    .sort(sortControlsByOrdenEnPdf);
  const groupChecks = controlesList.filter(
    (control: ControlMecanico) => control.parent !== null
  );
  const uniqueParentIds = Array.from(
    new Set(groupChecks.map((control) => control.parent?.id).filter(Boolean))
  );
  const groupControls = uniqueParentIds.map((parentId) => {
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
  return {
    checkControls,
    textControls,
    groupControls,
  };
};

export default useControles;
