"use client";

import useControlesFetch from "@/hooks/orden-reparacion/useControlesFetch";
import { CircularProgress, Grid, Paper, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import CheckboxControlesEdit from "../components/controles/CheckboxControlesEdit";
import GroupControlesEdit from "../components/controles/GroupControlesEdit";
import TextControlesEdit from "../components/controles/TextControlesEdit";
import { useOrden } from "../contexts/OrdenContext";

function EditControlesForm() {
  const { orden } = useOrden();
  const { checkControls, textControls, groupControls, loading } =
    useControlesFetch();

  // Estado local para los controles editables
  const [editableControles, setEditableControles] = useState<any[]>([]);

  // Inicializar controles editables con los valores de la orden
  useEffect(() => {
    if (!loading && checkControls.length > 0) {
      // Combinar todos los controles
      const allControls = [
        ...checkControls,
        ...textControls,
        ...groupControls.flatMap((g: any) => g.controls),
      ];

      // Mapear con los valores de la orden
      const controlesConValores = allControls.map((control) => {
        const controlEnOrden = orden.controlesEnReparacion?.find(
          (c: any) => c.controlMecanicoId === control.id
        );
        return {
          ...control,
          valor:
            controlEnOrden?.valor ||
            (control.type === "checkbox" ? "false" : ""),
        };
      });

      setEditableControles(controlesConValores);
    }
  }, [loading, checkControls, textControls, groupControls, orden]);

  const handleControlChange = (controlId: number, valor: string) => {
    setEditableControles((prev) =>
      prev.map((control) =>
        control.id === controlId ? { ...control, valor } : control
      )
    );
  };

  // Exponer los controles editables para que el formulario pueda accederlos
  useEffect(() => {
    if (editableControles.length > 0) {
      // Guardar en un campo oculto o similar
      const event = new CustomEvent("controlesChanged", {
        detail: editableControles,
      });
      window.dispatchEvent(event);
    }
  }, [editableControles]);

  if (loading) {
    return (
      <Grid container justifyContent="center" sx={{ py: 4 }}>
        <CircularProgress />
      </Grid>
    );
  }

  // Filtrar controles editables por tipo
  const editableCheckControls = editableControles.filter(
    (c) => c.type === "checkbox" && !c.parent
  );
  const editableTextControls = editableControles.filter(
    (c) => c.type === "texto" && !c.parent
  );

  // Agrupar controles con parent
  const editableGroupControls = groupControls.map((group: any) => ({
    ...group,
    controls: group.controls.map((control: any) => {
      const editableControl = editableControles.find(
        (c) => c.id === control.id
      );
      return editableControl || control;
    }),
  }));

  return (
    <Grid container spacing={3}>
      {editableCheckControls.length > 0 && (
        <Grid container item xs={12} spacing={2}>
          <CheckboxControlesEdit
            checkControls={editableCheckControls}
            // onChange={handleControlChange}
          />
        </Grid>
      )}
      {editableGroupControls.length > 0 && (
        <Grid container item xs={12} spacing={2}>
          <GroupControlesEdit
            groupControls={editableGroupControls}
            onChange={handleControlChange}
          />
        </Grid>
      )}
      {editableTextControls.length > 0 && (
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              Información Adicional
            </Typography>
            <TextControlesEdit
              textControls={editableTextControls}
              onChange={handleControlChange}
            />
          </Paper>
        </Grid>
      )}
    </Grid>
  );
}

export default EditControlesForm;
