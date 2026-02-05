import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import {
  TrabajosProvider,
  useTrabajosContext,
} from "../contexts/TrabajosContext";
import TrabajosModalContent from "./TrabajosModalContent";

interface ManoDeObra {
  id: number;
  name: string;
  sellPrice: number;
}

export interface TrabajoRealizado {
  id?: number;
  precioUnitario: number;
  descripcion: string;
  diasParaRecordatorio?: number | null;
  pdfName?: string | null;
}

interface TrabajosModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    precioUnitario: number;
    descripcion: string;
    diasParaRecordatorio?: number | null;
    pdfName?: string | null;
    manoDeObra?: { name: string };
  }) => Promise<boolean>;
  loading?: boolean;
  editTrabajo?: TrabajoRealizado;
}

const TrabajosModalInner = ({
  onClose,
  onSubmit,
  loading = false,
  editTrabajo,
}: Omit<TrabajosModalProps, "open">) => {
  const { descripcion, precioUnitario, diasParaRecordatorio, pdfName } =
    useTrabajosContext();

  const handleSubmit = async () => {
    if (precioUnitario === null || !descripcion) return;

    await onSubmit({
      precioUnitario,
      descripcion,
      diasParaRecordatorio,
      pdfName: pdfName?.trim() || null,
    });
  };

  const isValid = precioUnitario !== null && descripcion !== "";

  return (
    <>
      <DialogTitle>
        {editTrabajo ? "Editar Trabajo realizado" : "Agregar Trabajo realizado"}
      </DialogTitle>
      <DialogContent>
        <TrabajosModalContent />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !isValid}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {editTrabajo ? "Actualizar" : "Agregar"}
        </Button>
      </DialogActions>
    </>
  );
};

const TrabajosModal = ({
  open,
  onClose,
  onSubmit,
  loading = false,
  editTrabajo,
}: TrabajosModalProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <TrabajosProvider
        initialDescripcion={editTrabajo?.descripcion}
        initialPrecioUnitario={editTrabajo?.precioUnitario}
        initialDiasParaRecordatorio={editTrabajo?.diasParaRecordatorio}
        initialPdfName={editTrabajo?.pdfName}
      >
        <TrabajosModalInner
          onClose={onClose}
          onSubmit={onSubmit}
          loading={loading}
          editTrabajo={editTrabajo}
        />
      </TrabajosProvider>
    </Dialog>
  );
};

export default TrabajosModal;
