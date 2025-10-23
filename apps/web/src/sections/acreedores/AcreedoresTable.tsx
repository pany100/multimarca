"use client";

import CustomTable, {
  InheritedTableProps,
} from "@/components/tableV2/CustomTable";
import { getFormattedPrice } from "@/utils/fieldHelper";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { MenuItem, Typography } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { useRouter } from "next/navigation";

function AcreedoresTable({
  extraActions,
  ctaCb,
  setRefreshTrigger,
  ...rest
}: InheritedTableProps) {
  const router = useRouter();

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID",
      flex: 0.5,
    },
    {
      field: "patente",
      headerName: "Patente",
      flex: 1,
    },

    {
      field: "cliente_nombre",
      headerName: "Cliente",
      flex: 1.5,
    },
    {
      field: "cliente_phone",
      headerName: "Teléfono",
      flex: 1,
      valueGetter: (phone) => phone || "-",
    },
    {
      field: "credito_total",
      headerName: "Crédito Total",
      flex: 1,
      renderCell: (params) => {
        return (
          <Typography
            sx={{
              fontWeight: "bold",
              color: params.row.credito_total > 50000 ? "success.main" : "inherit",
            }}
          >
            {getFormattedPrice(params.row.credito_total)}
          </Typography>
        );
      },
    },
  ];

  const customActions = (params: any) => {
    const defaultActions = extraActions ? extraActions(params) : [];
    const customActions: React.ReactNode[] = [
      <MenuItem
        key="edit"
        onClick={() => router.push(`/dashboard/clientes/${params.id}/ver`)}
      >
        <VisibilityIcon sx={{ mr: 1 }} />
        Ver Cliente
      </MenuItem>,
      ,
    ];
    return customActions.concat(defaultActions);
  };

  return (
    <CustomTable
      title="Acreedores"
      apiEndpoint="/api/acreedores"
      extraActions={customActions}
      ctaCb={ctaCb}
      columns={columns}
      {...rest}
    />
  );
}

export default AcreedoresTable;
