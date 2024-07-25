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
    <Box sx={{ marginRight: 10 }}>
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
      <Typography variant="body1" sx={{ color: "common.black", mb: 2 }}>
        Mano de obra
      </Typography>
      <Typography
        variant="body1"
        sx={{ color: "common.black", textAlign: "right" }}
      >
        $
        {repair.trabajosRealizados.reduce(
          (acc: number, curr: { precioUnitario: string }) =>
            acc + parseInt(curr.precioUnitario),
          0
        )}
      </Typography>
      <Typography variant="body1" sx={{ color: "common.black" }}>
        Importe Total:
      </Typography>
      <Typography
        variant="body1"
        sx={{ color: "common.black", textAlign: "right" }}
      >
        ${repair.montoTotalCliente}
      </Typography>
    </Box>
  );
}

export default WorkDescription;
