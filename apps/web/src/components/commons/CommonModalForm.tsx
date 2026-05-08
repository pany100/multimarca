"use client";

import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { ReactNode } from "react";
import { FormProvider, UseFormReturn } from "react-hook-form";

interface CommonModalFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void | Promise<void>;
  title: string;
  methods: UseFormReturn<any>;
  children: ReactNode;
  loading?: boolean;
  submitButtonText?: string;
  cancelButtonText?: string;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
}

const CommonModalForm = ({
  open,
  onClose,
  onSubmit,
  title,
  methods,
  children,
  loading = false,
  submitButtonText = "Guardar",
  cancelButtonText = "Cancelar",
  maxWidth = "xs",
  fullWidth = true,
}: CommonModalFormProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
    >
      <DialogTitle sx={{ paddingBottom: 0 }}>{title}</DialogTitle>
      <FormProvider {...methods}>
        <form
          onSubmit={(e) => {
            e.stopPropagation();
            methods.handleSubmit(onSubmit)(e);
          }}
        >
          <DialogContent sx={{ padding: 2 }}>{children}</DialogContent>
          <DialogActions sx={{ padding: 2 }}>
            <Button onClick={onClose} disabled={loading}>
              {cancelButtonText}
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {loading ? "Procesando..." : submitButtonText}
            </Button>
          </DialogActions>
        </form>
      </FormProvider>
    </Dialog>
  );
};

export default CommonModalForm;
