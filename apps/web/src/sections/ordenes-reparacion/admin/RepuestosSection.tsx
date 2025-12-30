import { Card, CardContent, Typography } from "@mui/material";
import { useOrden } from "./contexts/OrdenContext";

const RepuestosSection = () => {
  const { orden } = useOrden();
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Repuestos Utilizados
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Placeholder: Lista y formulario de repuestos
        </Typography>
      </CardContent>
    </Card>
  );
};

export default RepuestosSection;
