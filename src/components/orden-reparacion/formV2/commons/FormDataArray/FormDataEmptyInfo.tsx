import { useFormDataWithModalContext } from "@/contexts/FormDataWithModalContext";
import { useModalContext } from "@/contexts/ModalContext";
import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Typography } from "@mui/material";

function FormDataEmptyInfo() {
  const { setModalOpen } = useModalContext();
  const { setNewItem } = useFormDataWithModalContext();
  return (
    <Box
      sx={{
        p: 3,
        textAlign: "center",
        border: "1px dashed #ccc",
        borderRadius: 1,
        mb: 2,
        backgroundColor: "action.hover",
      }}
    >
      <Typography color="text.secondary" sx={{ fontStyle: "italic", py: 2 }}>
        No hay entradas registradas
      </Typography>
      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={() => {
          setModalOpen(true);
          setNewItem(null);
        }}
        sx={{ mt: 1 }}
      >
        Agregar Elemento
      </Button>
    </Box>
  );
}

export default FormDataEmptyInfo;
