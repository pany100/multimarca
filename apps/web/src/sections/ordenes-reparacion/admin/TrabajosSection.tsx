import ResumenCostosFooter from "@/components/orden-reparacion/formV2/sections/resumen-costos/ResumenCostosFooter";
import { getFormattedPrice } from "@/utils/fieldHelper";
import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Button,
  Card,
  CardContent,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useEffect, useState } from "react";
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
  descuentoParaManoDeObra?: number;
  onDescuentoParaManoDeObraChange?: (value: number) => Promise<void>;
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
  descuentoParaManoDeObra,
  onDescuentoParaManoDeObraChange,
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
  const [descuentoLocal, setDescuentoLocal] = useState<string>(
    String(descuentoParaManoDeObra ?? 0),
  );

  useEffect(() => {
    setDescuentoLocal(String(descuentoParaManoDeObra ?? 0));
  }, [descuentoParaManoDeObra]);

  const handleSubmit = async (data: {
    precioUnitario: number;
    descripcion: string;
    diasParaRecordatorio?: number[] | null;
    pdfName?: string | null;
    iva?: number | null;
  }) => {
    let success = false;

    if (editTrabajo) {
      // Update existing trabajo
      success = await onUpdateTrabajo(editTrabajo.id, data);
    } else {
      // Add new trabajo
      success = await onAddTrabajo(data);
    }

    // Only close modal if operation was successful
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

        {onDescuentoParaManoDeObraChange && (
          <Box sx={{ my: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <TextField
              label="Descuento para pago de mano de obra al mecánico"
              type="number"
              size="small"
              value={descuentoLocal}
              onChange={(e) => setDescuentoLocal(e.target.value)}
              onBlur={() => {
                const val = parseFloat(descuentoLocal) || 0;
                setDescuentoLocal(String(val));
                onDescuentoParaManoDeObraChange(val);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
              helperText="Solo afecta el cálculo de mano de obra a pagar al mecánico en la sección de gastos. No modifica el precio que paga el cliente ni aparece en ningún PDF o recibo."
              sx={{ maxWidth: 500 }}
            />
            <Tooltip title="Este descuento se resta de la mano de obra a pagar al mecánico. Es solo para uso interno y estadístico. No influye en el precio final de la orden/venta.">
              <InfoOutlinedIcon color="action" sx={{ mt: -2 }} />
            </Tooltip>
          </Box>
        )}

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
