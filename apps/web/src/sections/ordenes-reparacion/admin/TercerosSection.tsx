import { Card, CardContent, Typography } from "@mui/material";
import { useOrden } from "./contexts/OrdenContext";

const TercerosSection = () => {
  const { orden } = useOrden();
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Reparaciones de Terceros
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Placeholder: Lista y formulario de reparaciones externas
        </Typography>
      </CardContent>
    </Card>
  );
};

export default TercerosSection;
