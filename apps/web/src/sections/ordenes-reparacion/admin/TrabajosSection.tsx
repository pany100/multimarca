import { Card, CardContent, Typography } from "@mui/material";

interface TrabajosSectionProps {
  ordenReparacion: any;
}

const TrabajosSection = ({ ordenReparacion }: TrabajosSectionProps) => {
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
