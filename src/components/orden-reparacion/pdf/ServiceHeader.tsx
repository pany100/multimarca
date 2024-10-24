import { Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { EstadoOrdenReparacion } from "@prisma/client";

type Props = {
  repair: {
    id: number;
    fechaEntradaReparacion: string;
    kilometros: number;
    fechaSalidaReparacion: string;
    estado: string;
  };
};

const HeaderBox = styled("div")(() => ({
  display: "grid",
  gridTemplateColumns: "30% 70%",
}));

const Info = styled("div")(() => ({
  display: "grid",
  gridTemplateRows: "auto auto",
  gridTemplateColumns: "50% 50%",
  gridAutoFlow: "column",
}));

function ServiceHeader({ repair }: Props) {
  return (
    <HeaderBox>
      <Typography variant="h5" sx={{ color: "common.black" }}>
        {repair.estado === EstadoOrdenReparacion.Presupuestado
          ? "Presupuesto Nro: "
          : "Orden Reparación Nro: "}
        {repair.id}
      </Typography>
      <Info>
        <Typography variant="body1" sx={{ color: "common.black" }}>
          Fecha Ingreso{" "}
          {new Date(repair.fechaEntradaReparacion).toLocaleDateString("es-AR")}
        </Typography>
        <Typography variant="body1" sx={{ color: "common.black" }}>
          Kilometraje {repair.kilometros}
        </Typography>
        <Typography variant="body1" sx={{ color: "common.black" }}>
          Fecha Egreso{" "}
          {new Date(repair.fechaSalidaReparacion).toLocaleDateString("es-AR")}
        </Typography>
      </Info>
    </HeaderBox>
  );
}

export default ServiceHeader;
