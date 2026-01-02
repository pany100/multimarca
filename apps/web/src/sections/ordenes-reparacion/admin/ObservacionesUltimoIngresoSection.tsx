import { Card, CardContent, Typography } from "@mui/material";
import JsonStringTable from "./components/JsonStringTable";
import { useOrden } from "./contexts/OrdenContext";

interface ObservacionesSectionProps {}

const ObservacionesUltimoIngresoSection = () => {
  const { orden } = useOrden();
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Observaciones último ingreso
        </Typography>
        <JsonStringTable
          jsonString={orden?.observacionesEntrada}
          columnName="Observaciones"
          onEdit={(item) => console.log(item)}
          onDelete={(item) => console.log(item)}
          emptyMessage="No hay observaciones"
        />
      </CardContent>
    </Card>
  );
};

export default ObservacionesUltimoIngresoSection;
