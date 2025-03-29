import { useFormDataWithModalContext } from "@/contexts/FormDataWithModalContext";
import { useModalContext } from "@/contexts/ModalContext";
import AddIcon from "@mui/icons-material/Add";
import { Box, Button } from "@mui/material";

function FormDataAddButton() {
  const { setModalOpen } = useModalContext();
  const { setNewItem } = useFormDataWithModalContext();
  return (
    <Box display="flex" justifyContent="flex-end">
      <Button
        variant="contained"
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

export default FormDataAddButton;
