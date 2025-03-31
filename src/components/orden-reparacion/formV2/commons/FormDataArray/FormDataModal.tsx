import { useFormDataWithModalContext } from "@/contexts/FormDataWithModalContext";
import { useModalContext } from "@/contexts/ModalContext";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

type Props = {
  fieldName: string;
  validateForm?: (newItem: any) => Record<string, string> | null;
  children: React.ReactNode;
};

function FormDataModal({ children, fieldName, validateForm }: Props) {
  const { modalOpen, setModalOpen } = useModalContext();
  const { setValue, getValues } = useFormContext();
  const [errors, setErrors] = useState<Record<string, string> | null>(null);

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
      const currentFormItems = JSON.parse(getValues(fieldName) || "[]");
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
    const currentFormItems = getValues(fieldName) || [];
    if (currentItem) {
      const updatedItems = currentFormItems.map((item: any) => {
        if (item.id === currentItem.id) {
          return newItem;
        }
        return item;
      });
      setValue(fieldName, updatedItems);
    } else {
      setValue(fieldName, [...currentFormItems, newItem]);
    }
  };

  const handleAdd = () => {
    if (validateForm) {
      const errors = validateForm(newItem);
      setErrors(errors);
      if (errors) {
        return;
      }
    }
    if (typeof newItem === "string") {
      handleAddString();
    } else {
      handleAddObject();
    }
    handleClose();
  };

  return (
    <Dialog open={modalOpen} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {currentItem ? "Actualizar elemento" : "Agregar elemento"}
      </DialogTitle>
      <DialogContent>
        {children}
        {errors &&
          Object.values(errors).map((error, index) => (
            <Typography
              key={index}
              color="error"
              variant="caption"
              sx={{ mt: 1, display: "block" }}
            >
              {error}
            </Typography>
          ))}
      </DialogContent>
      <DialogActions sx={{ pr: 4, pb: 4 }}>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button
          onClick={handleAdd}
          color="primary"
          variant="contained"
          disabled={!newItem}
        >
          {currentItem ? "Actualizar" : "Agregar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default FormDataModal;
