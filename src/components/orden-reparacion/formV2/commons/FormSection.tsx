import { Grid, Paper, Typography } from "@mui/material";

type Props = {
  title: string;
  children: React.ReactNode;
};

function FormSection({ title, children }: Props) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 3,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Typography
        variant="h6"
        component="h2"
        gutterBottom
        sx={{ fontWeight: "medium", color: "primary.main" }}
      >
        {title}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          {children}
        </Grid>
      </Grid>
    </Paper>
  );
}

export default FormSection;
