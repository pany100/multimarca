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

function ThirdPartyRepairList({ repair }: Props) {
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
    </Box>
  );
}

export default ThirdPartyRepairList;
