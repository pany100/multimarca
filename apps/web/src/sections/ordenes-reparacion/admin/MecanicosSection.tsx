import { Card, CardContent, Typography } from "@mui/material";
import { useOrden } from "./contexts/OrdenContext";

const MecanicosSection = () => {
  const { orden } = useOrden();
  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ flex: 1 }}>
        <Typography variant="h6" gutterBottom>
          Mecánicos Asignados
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Placeholder: Lista de mecánicos asignados
        </Typography>
      </CardContent>
    </Card>
  );
};

export default MecanicosSection;
