import { Card, CardContent, Typography } from "@mui/material";

interface EstadoYFechasSectionProps {
  ordenReparacion: any;
}

const EstadoYFechasSection = ({
  ordenReparacion,
}: EstadoYFechasSectionProps) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Estado y Fechas
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Placeholder: Formulario para cambiar estado y actualizar fechas
        </Typography>
      </CardContent>
    </Card>
  );
};

export default EstadoYFechasSection;
