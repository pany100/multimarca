import AjustesPrecioModal from "@/sections/ordenes-reparacion/admin/components/AjustesPrecioModal";
import AjustesPrecioTable from "@/sections/ordenes-reparacion/admin/components/AjustesPrecioTable";
import DeleteConfirmDialog from "@/sections/ordenes-reparacion/admin/components/DeleteConfirmDialog";
import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import { useState } from "react";
import { useOrdenDeCompraContext } from "./contexts/OrdenDeCompraContext";
import {
  AjustePrecio,
  useAjustesPrecioOrdenDeCompraManager,
} from "./hooks/useAjustesPrecioOrdenDeCompraManager";

const OrdenDeCompraAjustesPrecioSection = () => {
  const { orden } = useOrdenDeCompraContext();
  const {
    loading,
    handleAdd,
    handleUpdate,
    handleDeleteClick,
    deleteConfirmOpen,
    handleDeleteConfirm,
    handleDeleteCancel,
  } = useAjustesPrecioOrdenDeCompraManager();

  const [modalOpen, setModalOpen] = useState(false);
  const [editAjuste, setEditAjuste] = useState<AjustePrecio | undefined>();

  const ajustes: AjustePrecio[] = (orden.ajustesPrecio ?? []).map((a: any) => ({
    ...a,
    monto: Number(a.monto),
  }));

  const handleSubmit = async (data: {
    descripcion: string;
    monto: number;
    tipo: "porcentual" | "fijo";
    esDescuento: boolean;
    esInterno: boolean;
    orden: number;
  }) => {
    const payload = { ...data, esInterno: false };
    const success = editAjuste
      ? await handleUpdate(editAjuste.id, payload)
      : await handleAdd(payload);

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
          Ajustes
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
          Cargá costos adicionales como envío, seguro o bonificaciones del proveedor.
        </Typography>

        <AjustesPrecioTable
          ajustes={ajustes}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          loading={loading}
          showEsInterno={false}
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
        showEsInterno={false}
      />

      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Eliminar ajuste de precio"
        message="¿Está seguro que desea eliminar este ajuste? Esta acción no se puede deshacer."
        loading={loading}
      />
    </Card>
  );
};

export default OrdenDeCompraAjustesPrecioSection;
