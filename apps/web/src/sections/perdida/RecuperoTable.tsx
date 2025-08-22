"use client";

import CustomTable, {
  InheritedTableProps,
} from "@/components/tableV2/CustomTable";
import { getFormattedPrice } from "@/utils/fieldHelper";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { MenuItem, Typography } from "@mui/material";
import { useRecuperacionContext } from "./context/RecuperacionContext";

function RecuperoTable({
  extraActions,
  ctaCb,
  setRefreshTrigger,
  onEdit,
  onDelete,
  ...rest
}: InheritedTableProps & {
  onEdit?: (recupero: any) => void;
  onDelete?: (recupero: any) => void;
}) {
  const { perdidaId } = useRecuperacionContext();
  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    {
      field: "fecha",
      headerName: "Fecha",
      flex: 1,
      valueGetter: (fecha: string) =>
        new Date(fecha).toLocaleDateString("es-AR"),
    },
    {
      field: "monto",
      headerName: "Monto",
      flex: 1,
      renderCell: (params: any) => {
        const monto = params.row.monto;
        const moneda = params.row.perdida?.moneda || "Peso";
        const dolar = params.row.perdida?.dolar;

        if (moneda === "Dolar") {
          let formattedMonto = `U$D ${Number(monto).toFixed(2)}`;

          // If there's dolar info, show the equivalent in pesos
          if (dolar) {
            const pesosEquivalent = Number(monto) * Number(dolar.blue);
            formattedMonto += ` (${getFormattedPrice(pesosEquivalent)})`;
          }

          return <Typography variant="body2">{formattedMonto}</Typography>;
        }

        return (
          <Typography variant="body2">{getFormattedPrice(monto)}</Typography>
        );
      },
    },
    {
      field: "detalle",
      headerName: "Detalle",
      flex: 1.5,
      renderCell: (params: any) => (
        <div
          style={{
            whiteSpace: "normal",
            wordWrap: "break-word",
            lineHeight: "1.2em",
            padding: "10px 0",
          }}
        >
          <Typography variant="body2">{params.row.detalle || "-"}</Typography>
        </div>
      ),
    },
  ];

  const customActions = (params: any) => {
    const defaultActions = extraActions ? extraActions(params) : [];
    const customActions: React.ReactNode[] = [];

    if (onEdit) {
      customActions.push(
        <MenuItem key="edit" onClick={() => onEdit(params.row)}>
          <EditIcon sx={{ mr: 1 }} />
          Editar
        </MenuItem>
      );
    }

    if (onDelete) {
      customActions.push(
        <MenuItem key="delete" onClick={() => onDelete(params.row)}>
          <DeleteIcon sx={{ mr: 1 }} />
          Eliminar
        </MenuItem>
      );
    }

    return customActions.concat(defaultActions);
  };

  return (
    <CustomTable
      title="Recuperaciones"
      apiEndpoint={`/api/perdida/${perdidaId}/recuperacion`}
      extraActions={customActions}
      ctaCb={ctaCb}
      columns={columns}
      {...rest}
    />
  );
}

export default RecuperoTable;
