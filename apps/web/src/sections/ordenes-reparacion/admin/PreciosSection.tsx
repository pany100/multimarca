import { Card, CardContent, Typography } from "@mui/material";

interface PreciosSectionProps {
  ordenReparacion: any;
}

const PreciosSection = ({ ordenReparacion }: PreciosSectionProps) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Información de Precios
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Placeholder: Descuentos, Incrementos, Total
        </Typography>
      </CardContent>
    </Card>
  );
};

export default PreciosSection;
