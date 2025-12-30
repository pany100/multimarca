import { Card, CardContent, Typography } from "@mui/material";
import { useOrden } from "./contexts/OrdenContext";

interface ObservacionesSectionProps {}

const ObservacionesSection = () => {
  const { orden } = useOrden();
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Observaciones
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Placeholder: Observaciones Internas y de Salida
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ObservacionesSection;
