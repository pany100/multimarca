import ResumenCostosFooter from "@/components/orden-reparacion/formV2/sections/resumen-costos/ResumenCostosFooter";
import { getFormattedPrice } from "@/utils/fieldHelper";
import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import { useState } from "react";
import DeleteConfirmDialog from "./components/DeleteConfirmDialog";
import TrabajosModal from "./components/TrabajosModal";
import TrabajosTable from "./components/TrabajosTable";

export interface TrabajoRealizado {
  id: number;
  precioUnitario: number;
  descripcion: string;
  diasParaRecordatorio?: number[] | null;
  pdfName?: string | null;
  iva?: number | null;
}

interface TrabajosSectionProps {
  trabajos: TrabajoRealizado[];
  totalManoDeObra: number;
  loading: boolean;
  onAddTrabajo: (data: {
    precioUnitario: number;
    descripcion: string;
    diasParaRecordatorio?: number[] | null;
    pdfName?: string | null;
    manoDeObra?: { name: string };
    iva?: number | null;
  }) => Promise<boolean>;
  onUpdateTrabajo: (
    id: number,
    data: {
      precioUnitario: number;
      descripcion: string;
      diasParaRecordatorio?: number[] | null;
      pdfName?: string | null;
      manoDeObra?: { name: string };
      iva?: number | null;
    },
  ) => Promise<boolean>;
  onDeleteTrabajo: (trabajo: TrabajoRealizado) => void;
  deleteConfirmOpen: boolean;
  onDeleteConfirm: () => Promise<void>;
  onDeleteCancel: () => void;
}

const TrabajosSection = ({
  trabajos,
  totalManoDeObra,
  loading,
  onAddTrabajo,
  onUpdateTrabajo,
  onDeleteTrabajo,
  deleteConfirmOpen,
  onDeleteConfirm,
  onDeleteCancel,
}: TrabajosSectionProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editTrabajo, setEditTrabajo] = useState<
    TrabajoRealizado | undefined
  >();

  const handleSubmit = async (data: {
    precioUnitario: number;
    descripcion: string;
    diasParaRecordatorio?: number[] | null;
    pdfName?: string | null;
    iva?: number | null;
  }) => {
    let success = false;

    if (editTrabajo) {
      success = await onUpdateTrabajo(editTrabajo.id, data);
    } else {
      success = await onAddTrabajo(data);
    }

    if (success) {
      setModalOpen(false);
      setEditTrabajo(undefined);
    }

    return success;
  };

  const handleEdit = (trabajo: TrabajoRealizado) => {
    setEditTrabajo(trabajo);
    setModalOpen(true);
  };

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ flex: 1 }}>
        <Typography variant="h6" gutterBottom>
          Mano de Obra
        </Typography>

        <TrabajosTable
          trabajos={trabajos}
          onEdit={handleEdit}
          onDelete={onDeleteTrabajo}
          loading={loading}
        />
        <Box sx={{ my: 2 }}>
          <ResumenCostosFooter
            descripcion="Total Mano de obra"
            total={getFormattedPrice(totalManoDeObra)}
          />
        </Box>

        <Box display="flex" justifyContent="flex-end" sx={{ mt: 1 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditTrabajo(undefined);
              setModalOpen(true);
            }}
            sx={{ mt: 1 }}
          >
            Agregar Trabajo
          </Button>
        </Box>
      </CardContent>

      <TrabajosModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditTrabajo(undefined);
        }}
        onSubmit={handleSubmit}
        loading={loading}
        editTrabajo={editTrabajo}
      />

      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        onClose={onDeleteCancel}
        onConfirm={onDeleteConfirm}
        title="Eliminar trabajo realizado"
        message="¿Está seguro que desea eliminar este trabajo realizado? Esta acción no se puede deshacer."
        loading={loading}
      />
    </Card>
  );
};

export default TrabajosSection;
