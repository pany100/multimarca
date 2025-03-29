import { useFormDataWithModalContext } from "@/contexts/FormDataWithModalContext";
import { useModalContext } from "@/contexts/ModalContext";
import AddIcon from "@mui/icons-material/Add";
import { Box, Button } from "@mui/material";

function FormDataEmptyInfo({ children }: { children: React.ReactNode }) {
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
      {children}
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
