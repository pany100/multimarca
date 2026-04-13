import AjustesPrecioModal from "@/sections/ordenes-reparacion/admin/components/AjustesPrecioModal";
import AjustesPrecioTable from "@/sections/ordenes-reparacion/admin/components/AjustesPrecioTable";
import DeleteConfirmDialog from "@/sections/ordenes-reparacion/admin/components/DeleteConfirmDialog";
import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import { useState } from "react";
import { useVentaRequired } from "./contexts/VentaContext";
import {
  AjustePrecio,
  useAjustesPrecioVentaManager,
} from "./hooks/useAjustesPrecioVentaManager";

const VentaAjustesPrecioSection = () => {
  const { venta } = useVentaRequired();
  const {
    loading,
    handleAdd,
    handleUpdate,
    handleDeleteClick,
    deleteConfirmOpen,
    handleDeleteConfirm,
    handleDeleteCancel,
  } = useAjustesPrecioVentaManager();

  const [modalOpen, setModalOpen] = useState(false);
  const [editAjuste, setEditAjuste] = useState<AjustePrecio | undefined>();

  const ajustes: AjustePrecio[] = (venta.ajustesPrecio ?? []).map(
    (a: any) => ({
      ...a,
      monto: Number(a.monto),
    }),
  );

  const handleSubmit = async (data: {
    descripcion: string;
    monto: number;
    tipo: "porcentual" | "fijo";
    esDescuento: boolean;
    esInterno: boolean;
    orden: number;
  }) => {
    let success = false;
    if (editAjuste) {
      success = await handleUpdate(editAjuste.id, data);
    } else {
      success = await handleAdd(data);
    }
    if (success) {
      setModalOpen(false);
      setEditAjuste(undefined);
    }
    return success;
  };

  const handleEdit = (ajuste: AjustePrecio) => {
    setEditAjuste(ajuste);
    setModalOpen(true);
  };

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ flex: 1 }}>
        <Typography variant="h6" gutterBottom>
          Ajustes de Precios
        </Typography>

        <AjustesPrecioTable
          ajustes={ajustes}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          loading={loading}
        />

        <Box display="flex" justifyContent="flex-end" sx={{ mt: 1 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditAjuste(undefined);
              setModalOpen(true);
            }}
            sx={{ mt: 1 }}
          >
            Agregar Ajuste
          </Button>
        </Box>
      </CardContent>

      <AjustesPrecioModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditAjuste(undefined);
        }}
        onSubmit={handleSubmit}
        loading={loading}
        editAjuste={editAjuste}
      />

      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Eliminar ajuste de precio"
        message="¿Esta seguro que desea eliminar este ajuste? Esta accion no se puede deshacer."
        loading={loading}
      />
    </Card>
  );
};

export default VentaAjustesPrecioSection;
