"use client";

import CommonModalForm from "@/components/commons/CommonModalForm";
import EditIcon from "@mui/icons-material/Edit";
import { Card, CardContent, IconButton, Typography } from "@mui/material";
import { ReactNode, useState } from "react";
import { UseFormReturn } from "react-hook-form";

interface CommonOrderCardProps {
  title: string;
  children: ReactNode;
  modalTitle?: string;
  formMethods: UseFormReturn<any>;
  formContent: ReactNode;
  onSubmit: (data: any) => void | Promise<void>;
  onOpen?: () => void;
  loading?: boolean;
  submitButtonText?: string;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
}

export const CommonOrderCard = ({
  title,
  children,
  modalTitle,
  formMethods,
  formContent,
  onSubmit,
  onOpen,
  loading = false,
  submitButtonText = "Guardar",
  maxWidth = "xs",
}: CommonOrderCardProps) => {
  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = () => {
    if (onOpen) {
      onOpen();
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    formMethods.reset();
  };

  const handleSubmit = async (data: any) => {
    await onSubmit(data);
    handleCloseModal();
  };

  return (
    <>
      <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <CardContent sx={{ flex: 1 }}>
          {/* Header con título y botón editar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Typography variant="h6">{title}</Typography>
            <IconButton
              size="small"
              onClick={handleOpenModal}
              aria-label="Editar"
              sx={{
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </div>

          {/* Contenido de la card */}
          {children}
        </CardContent>
      </Card>

      {/* Modal de edición */}
      <CommonModalForm
        open={openModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        title={modalTitle || `Editar ${title}`}
        methods={formMethods}
        loading={loading}
        submitButtonText={submitButtonText}
        maxWidth={maxWidth}
      >
        {formContent}
      </CommonModalForm>
    </>
  );
};
