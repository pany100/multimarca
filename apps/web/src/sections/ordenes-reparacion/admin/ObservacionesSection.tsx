import { Card, CardContent, Typography } from "@mui/material";

interface ObservacionesSectionProps {
  ordenReparacion: any;
}

const ObservacionesSection = ({
  ordenReparacion,
}: ObservacionesSectionProps) => {
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
