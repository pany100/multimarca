import { useModalContext } from "@/contexts/ModalContext";
import AddIcon from "@mui/icons-material/Add";
import { Button, Typography } from "@mui/material";

function EmptyObservations() {
  const { setModalOpen } = useModalContext();
  return (
    <>
      <Typography color="text.secondary" sx={{ fontStyle: "italic", py: 2 }}>
        No hay observaciones de entrada registradas
      </Typography>
      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={() => setModalOpen(true)}
        sx={{ mt: 1 }}
      >
        Agregar Observación
      </Button>
    </>
  );
}

export default EmptyObservations;
