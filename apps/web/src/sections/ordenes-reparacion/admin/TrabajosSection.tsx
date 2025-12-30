import { Card, CardContent, Typography } from "@mui/material";
import { useOrden } from "./contexts/OrdenContext";

const TrabajosSection = () => {
  const { orden } = useOrden();
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Trabajos Realizados
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Placeholder: Lista y formulario de trabajos
        </Typography>
      </CardContent>
    </Card>
  );
};

export default TrabajosSection;
