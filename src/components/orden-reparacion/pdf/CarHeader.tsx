import { Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { EstadoOrdenReparacion } from "@prisma/client";

const Info = styled("div")(() => ({
  display: "grid",
}));

type Props = {
  car: {
    patent: string;
    brand: string;
    model: string;
    year: string;
    transmission_type: string;
    color: string;
  };
  owner: {
    fullName: string;
    address: string;
    city: string;
    zipCode: string;
    phone: string;
  };
  repair: {
    id: number;
    fechaEntradaReparacion: string;
    kilometros: number;
    fechaSalidaReparacion: string;
    estado: string;
  };
};

function CarHeader({ repair, car, owner }: Props) {
  return (
    <div>
      <Typography variant="h5" sx={{ mb: 2, color: "common.black" }}>
        {repair.estado === EstadoOrdenReparacion.Presupuestado
          ? "Presupuesto Nro: "
          : "Orden Reparación Nro: "}
        {repair.id}
      </Typography>
      <Info>
        <Typography variant="body1" sx={{ color: "common.black" }}>
          Titular: {owner.fullName}
        </Typography>
        <Typography variant="body1" sx={{ color: "common.black" }}>
          Vehículo: {car.brand} {car.model} {car.color}{" "}
          {car.transmission_type === "Manual" ? "MT" : "AT"} - {car.year}{" "}
        </Typography>
        <Typography variant="body1" sx={{ color: "common.black" }}>
          Patente: {car.patent}
        </Typography>
        <Typography variant="body1" sx={{ color: "common.black" }}>
          Teléfono: {owner.phone}
        </Typography>
        <Typography variant="body1" sx={{ color: "common.black" }}>
          Fecha Ingreso:{" "}
          {repair.fechaEntradaReparacion
            ? new Date(repair.fechaEntradaReparacion).toLocaleDateString(
                "es-AR"
              )
            : "-"}
        </Typography>
        <Typography variant="body1" sx={{ color: "common.black" }}>
          Fecha Egreso:{" "}
          {repair.fechaSalidaReparacion
            ? new Date(repair.fechaSalidaReparacion).toLocaleDateString("es-AR")
            : "-"}
        </Typography>
      </Info>
    </div>
  );
}

export default CarHeader;
