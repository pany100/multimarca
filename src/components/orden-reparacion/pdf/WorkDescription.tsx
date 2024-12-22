import {
  calcularManoDeObra,
  calcularTotalOrdenReparacion,
} from "@/utils/ordenHelper";
import { Typography } from "@mui/material";
import Divider from "@mui/material/Divider";
import { styled } from "@mui/material/styles";
import { Fragment } from "react";

type Props = {
  repair: any;
};

const Box = styled("div")(() => ({
  display: "grid",
  gridTemplateColumns: "80% 20%",
}));

function WorkDescription({ repair }: Props) {
  return (
    <>
      <Box sx={{ marginRight: 15, marginTop: 1 }}>
        <Typography
          variant="body1"
          sx={{
            color: "common.black",
            fontWeight: "bold",
            lineHeight: 1.1,
            mb: 1,
          }}
        >
          Repuestos utilizados
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "common.black",
            textAlign: "right",
            lineHeight: 1.1,
            mb: 1,
            fontWeight: "bold",
          }}
        >
          Importe
        </Typography>
        {repair.reparacionesDeTercero.map(
          (el: { nombre: string; precioVenta: number }) => (
            <Fragment key={el.nombre}>
              <Typography
                variant="body1"
                sx={{ color: "common.black", lineHeight: 1.1 }}
              >
                {el.nombre}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "common.black",
                  textAlign: "right",
                  lineHeight: 1.1,
                }}
              >
                ${Number(el.precioVenta).toLocaleString("es-AR")}
              </Typography>
            </Fragment>
          )
        )}
        {repair.repuestosUsados.map(
          (el: {
            stock: { id: number; name: string };
            precioVenta: number;
          }) => (
            <Fragment key={el.stock.id}>
              <Typography
                variant="body1"
                sx={{ color: "common.black", lineHeight: 1.1 }}
              >
                {el.stock.name}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "common.black",
                  textAlign: "right",
                  lineHeight: 1.1,
                }}
              >
                ${Number(el.precioVenta).toLocaleString("es-AR")}
              </Typography>
            </Fragment>
          )
        )}
      </Box>
      <Divider sx={{ borderColor: "common.gray" }} />
      <Box sx={{ marginRight: 15 }}>
        <Typography
          variant="body1"
          sx={{ color: "common.black", lineHeight: 1.1, fontWeight: "bold" }}
        >
          Mano de Obra
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: "common.black", textAlign: "right", lineHeight: 1.1 }}
        >
          $
          {calcularManoDeObra(repair.trabajosRealizados).toLocaleString(
            "es-AR"
          )}
        </Typography>

        {repair.descuento > 0 && (
          <Fragment>
            <Typography variant="body1" sx={{ mt: 2, color: "common.black" }}>
              Descuento
            </Typography>
            <Typography
              variant="body1"
              sx={{ mt: 2, color: "common.black", textAlign: "right" }}
            >
              {"- "}${Number(repair.descuento).toLocaleString("es-AR")}
            </Typography>
          </Fragment>
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
          $
          {Number(calcularTotalOrdenReparacion(repair)).toLocaleString("es-AR")}
        </Typography>
      </Box>
    </>
  );
}

export default WorkDescription;
