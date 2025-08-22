import { Box, Typography } from "@mui/material";

type Props = {
  descripcion: string;
  total: string;
};
function ResumenCostosFooter({ descripcion, total }: Props) {
  return (
    <Box display="flex" justifyContent="right" alignItems="center">
      <Typography fontWeight="bold" color="primary.dark" sx={{ mr: 2 }}>
        {descripcion}:
      </Typography>
      <Typography
        fontWeight="bold"
        color="primary.dark"
        sx={{
          display: "flex",
          alignItems: "center",
        }}
      >
        {total}
      </Typography>
    </Box>
  );
}

export default ResumenCostosFooter;
