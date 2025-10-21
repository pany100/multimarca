import { ChipProps } from "@mui/material";

function getStatusColor(estado: string): ChipProps["color"] {
  switch (estado.toLowerCase()) {
    case "enprogreso":
      return "primary";
    case "terminado":
      return "success";
    case "aceptado":
      return "warning";
    case "presupuestado":
      return "error";
    default:
      return "default";
  }
}

export { getStatusColor };
