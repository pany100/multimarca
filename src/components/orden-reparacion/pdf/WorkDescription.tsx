import { calcularTotalOrdenReparacion } from "@/utils/ordenHelper";
import { Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Fragment } from "react";

type Props = {
  repair: any;
};

const Box = styled("div")(() => ({
  display: "grid",
  gridTemplateColumns: "80% 20%",
  marginTop: 10,
}));

function WorkDescription({ repair }: Props) {
  return (
    <Box sx={{ marginRight: 15 }}>
      <Typography variant="body1" sx={{ color: "common.black" }}>
        Descripción
      </Typography>
      <Typography
        variant="body1"
        sx={{ color: "common.black", textAlign: "right" }}
      >
        Importe
      </Typography>
      {repair.reparacionesDeTercero.map(
        (el: { nombre: string; precioVenta: number }) => (
          <Fragment key={el.nombre}>
            <Typography variant="body1" sx={{ color: "common.black" }}>
              {el.nombre}
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "common.black", textAlign: "right" }}
            >
              ${el.precioVenta}
            </Typography>
          </Fragment>
        )
      )}
      {repair.repuestosUsados.map(
        (el: { stock: { id: number; name: string }; precioVenta: number }) => (
          <Fragment key={el.stock.id}>
            <Typography variant="body1" sx={{ color: "common.black" }}>
              {el.stock.name}
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "common.black", textAlign: "right" }}
            >
              ${el.precioVenta}
            </Typography>
          </Fragment>
        )
      )}
      {repair.trabajosRealizados.map(
        (el: { descripcion: string; precioUnitario: string }) => (
          <Fragment key={el.descripcion}>
            <Typography variant="body1" sx={{ color: "common.black" }}>
              {el.descripcion}
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "common.black", textAlign: "right" }}
            >
              ${el.precioUnitario}
            </Typography>
          </Fragment>
        )
      )}
      <Typography
        variant="body1"
        sx={{ mt: 2, fontWeight: "bold", color: "common.black" }}
      >
        Importe Total:
      </Typography>
      <Typography
        variant="body1"
        sx={{
          mt: 2,
          fontWeight: "bold",
          color: "common.black",
          textAlign: "right",
        }}
      >
        ${calcularTotalOrdenReparacion(repair)}
      </Typography>
    </Box>
  );
}

export default WorkDescription;
