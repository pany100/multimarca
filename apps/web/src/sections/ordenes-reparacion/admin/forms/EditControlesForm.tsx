"use client";

import useControlesFetch from "@/hooks/orden-reparacion/useControlesFetch";
import { CircularProgress, Grid, Paper, Typography } from "@mui/material";
import CheckboxControlesEdit from "../components/controles/CheckboxControlesEdit";
import GroupControlesEdit from "../components/controles/GroupControlesEdit";
import TextControlesEdit from "../components/controles/TextControlesEdit";

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
      {checkControls.length > 0 && (
        <Grid container item xs={12} spacing={2}>
          <CheckboxControlesEdit
            checkControls={checkControls}
            isEditing={isEditing}
          />
        </Grid>
      )}
      {groupControls.length > 0 && (
        <Grid container item xs={12} spacing={2}>
          <GroupControlesEdit
            groupControls={groupControls}
            isEditing={isEditing}
          />
        </Grid>
      )}
      {textControls.length > 0 && (
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
              textControls={textControls}
              isEditing={isEditing}
            />
          </Paper>
        </Grid>
      )}
    </Grid>
  );
}

export default EditControlesForm;
