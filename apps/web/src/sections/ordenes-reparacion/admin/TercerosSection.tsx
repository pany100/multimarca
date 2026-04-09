import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import { useState } from "react";
import DeleteConfirmDialog from "./components/DeleteConfirmDialog";
import TercerosModal from "./components/TercerosModal";
import TercerosTable from "./components/TercerosTable";

export interface ReparacionTercero {
  id: number;
  nombre: string;
  precioCompra: number;
  precioVenta: number;
  iva?: number | null;
  buyIva?: number | null;
  markup?: number | null;
  proveedor: {
    id: number;
    name: string;
  };
  recibo?: string | null;
}

interface TercerosSectionProps {
  terceros: ReparacionTercero[];
  porcentajeRecargo?: number;
  loading: boolean;
  onAddTercero: (data: {
    nombre: string;
    proveedorId: number;
    precioCompra: number;
    precioVenta: number;
    iva?: number | null;
    buyIva?: number | null;
    markup?: number | null;
    recibo?: string | null;
  }) => Promise<boolean>;
  onUpdateTercero: (
    id: number,
    data: {
      nombre?: string;
      proveedorId?: number;
      precioCompra?: number;
      precioVenta?: number;
      iva?: number | null;
      buyIva?: number | null;
      markup?: number | null;
      recibo?: string | null;
    }
  ) => Promise<boolean>;
  onDeleteTercero: (tercero: ReparacionTercero) => void;
  deleteConfirmOpen: boolean;
  onDeleteConfirm: () => Promise<void>;
  onDeleteCancel: () => void;
}

const TercerosSection = ({
  terceros,
  porcentajeRecargo,
  loading,
  onAddTercero,
  onUpdateTercero,
  onDeleteTercero,
  deleteConfirmOpen,
  onDeleteConfirm,
  onDeleteCancel,
}: TercerosSectionProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editTercero, setEditTercero] = useState<
    ReparacionTercero | undefined
  >();

  const handleSubmit = async (data: {
    nombre: string;
    proveedorId: number;
    precioCompra: number;
    precioVenta: number;
    iva?: number | null;
    buyIva?: number | null;
    markup?: number | null;
    recibo?: string | null;
  }) => {
    let success = false;

    if (editTercero) {
      success = await onUpdateTercero(editTercero.id, data);
    } else {
      success = await onAddTercero(data);
    }

    if (success) {
      setModalOpen(false);
      setEditTercero(undefined);
    }

    return success;
  };

  const handleEdit = (tercero: ReparacionTercero) => {
    setEditTercero(tercero);
    setModalOpen(true);
  };

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ flex: 1 }}>
        <Typography variant="h6" gutterBottom>
          Reparaciones de Terceros
        </Typography>

        <TercerosTable
          terceros={terceros}
          porcentajeRecargo={porcentajeRecargo}
          onEdit={handleEdit}
          onDelete={onDeleteTercero}
          loading={loading}
        />

        <Box display="flex" justifyContent="flex-end" sx={{ mt: 1 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditTercero(undefined);
              setModalOpen(true);
            }}
            sx={{ mt: 1 }}
          >
            Agregar Reparación
          </Button>
        </Box>
      </CardContent>

      <TercerosModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditTercero(undefined);
        }}
        onSubmit={handleSubmit}
        loading={loading}
        editTercero={editTercero}
      />

      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        onClose={onDeleteCancel}
        onConfirm={onDeleteConfirm}
        title="Eliminar reparación de tercero"
        message="¿Está seguro que desea eliminar esta reparación de tercero? Esta acción no se puede deshacer."
        loading={loading}
      />
    </Card>
  );
};

export default TercerosSection;
