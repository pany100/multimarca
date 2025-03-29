import { useFormDataWithModalContext } from "@/contexts/FormDataWithModalContext";
import { useModalContext } from "@/contexts/ModalContext";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useFormContext } from "react-hook-form";

type Props = {
  fieldName: string;
  children: React.ReactNode;
};

function FormDataModal({ children, fieldName }: Props) {
  const { modalOpen, setModalOpen } = useModalContext();
  const { setValue, watch } = useFormContext();
  const currentFormItems = watch(fieldName);
  const { currentItem, setCurrentItem, newItem, setNewItem } =
    useFormDataWithModalContext();

  const handleClose = () => {
    setModalOpen(false);
    setCurrentItem(null);
    setNewItem(null);
  };

  const handleAddString = () => {
    const trimedValue = newItem.trim();
    if (trimedValue) {
      if (currentItem) {
        const updatedItems = currentFormItems.map((item: string) => {
          if (item === currentItem.trim()) {
            return trimedValue;
          }
          return item;
        });
        setValue(fieldName, JSON.stringify(updatedItems));
      } else {
        setValue(fieldName, JSON.stringify([...currentFormItems, trimedValue]));
      }
    }
  };

  const handleAddObject = () => {
    if (currentItem) {
      const updatedItems = currentFormItems.map((item: any) => {
        if (item.id === currentItem.id) {
          return currentItem;
        }
        return item;
      });
      setValue(fieldName, JSON.stringify(updatedItems));
    } else {
      setValue(fieldName, JSON.stringify([...currentFormItems, newItem]));
    }
  };

  const handleAdd = () => {
    if (typeof currentFormItems === "string") {
      handleAddString();
    } else {
      // handleAddObject();
    }
    handleClose();
  };

  return (
    <Dialog open={modalOpen} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {currentItem ? "Actualizar elemento" : "Agregar elemento"}
      </DialogTitle>
      <DialogContent>{children}</DialogContent>
      <DialogActions sx={{ pr: 4, pb: 4 }}>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button
          onClick={handleAdd}
          color="primary"
          variant="contained"
          disabled={!newItem}
        >
          Agregar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default FormDataModal;
