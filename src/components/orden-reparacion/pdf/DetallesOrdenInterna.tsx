import { Typography } from "@mui/material";
import CompleteLine from "./CompleteLine";

function DetallesOrdenInterna() {
  return (
    <>
      <Typography variant="h6" fontWeight="bold" mb={1}>
        Detalles:
      </Typography>
      {[...Array(18)].map((el, index) => (
        <CompleteLine key={index} />
      ))}
    </>
  );
}

export default DetallesOrdenInterna;
