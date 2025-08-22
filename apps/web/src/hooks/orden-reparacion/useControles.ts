import {
  getSortedCheckControls,
  getSortedGroupControls,
  getSortedTextControls,
} from "@/utils/fieldHelper";

export type ControlMecanico = {
  id: number;
  name: string;
  type: "checkbox" | "texto";
  valor: string;
  ordenEnPdf?: number;
  pdfName?: string;
  parent: {
    id: number;
    name: string;
  } | null;
};

const useControles = ({
  controlesList,
}: {
  controlesList: ControlMecanico[];
}) => {
  const checkControls = getSortedCheckControls(controlesList);
  const textControls = getSortedTextControls(controlesList);
  const groupControls = getSortedGroupControls(controlesList);
  return {
    checkControls,
    textControls,
    groupControls,
  };
};

export default useControles;
