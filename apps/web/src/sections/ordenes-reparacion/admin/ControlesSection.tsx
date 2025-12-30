import { Card, CardContent, Typography } from "@mui/material";
import { useOrden } from "./contexts/OrdenContext";

const ControlesSection = () => {
  const { orden } = useOrden();
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Controles
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Placeholder: Scanner, Revisado por, etc.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ControlesSection;
