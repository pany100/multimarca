"use client";

import useControlesFetch from "@/hooks/orden-reparacion/useControlesFetch";
import { CircularProgress, Grid } from "@mui/material";
import CheckboxControlesEdit from "../components/controles/CheckboxControlesEdit";
import { ControlesProvider } from "../contexts/ControlesContext";

type Props = {
  isEditing: boolean;
};

function EditControlesForm({ isEditing }: Props) {
  const { checkControls, textControls, groupControls, loading } =
    useControlesFetch();
  if (loading) {
    return (
      <Grid container justifyContent="center" sx={{ py: 4 }}>
        <CircularProgress />
      </Grid>
    );
  }
  return (
    <Grid container spacing={3}>
      <ControlesProvider>
        {checkControls.length > 0 && (
          <Grid container item xs={12} spacing={2}>
            <CheckboxControlesEdit
              checkControls={checkControls}
              isEditing={isEditing}
            />
          </Grid>
        )}
      </ControlesProvider>
    </Grid>
  );
}

export default EditControlesForm;
