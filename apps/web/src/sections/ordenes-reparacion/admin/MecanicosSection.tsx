import { Card, CardContent, Typography } from "@mui/material";

interface MecanicosSectionProps {
  ordenReparacion: any;
}

const MecanicosSection = ({ ordenReparacion }: MecanicosSectionProps) => {
  return (
    <Card>
      <CardContent>
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
