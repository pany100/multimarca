import { Card, CardContent, Typography } from "@mui/material";
import { useOrden } from "./contexts/OrdenContext";

const InformacionGeneralSection = () => {
  const { orden } = useOrden();
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Información General
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Placeholder: Vehículo, Kilómetros, Observaciones del Cliente
        </Typography>
      </CardContent>
    </Card>
  );
};

export default InformacionGeneralSection;
