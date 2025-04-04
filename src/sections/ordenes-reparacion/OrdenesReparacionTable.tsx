import CustomTable, {
  InheritedTableProps,
} from "@/components/tableV2/CustomTable";
import { getFormattedPrice } from "@/utils/fieldHelper";
import { calcularTotalOrdenReparacion } from "@/utils/ordenHelper";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Box, Chip, MenuItem, Tab, Tabs, Typography } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { EstadoOrdenReparacion } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

const estadosDisplay: Record<EstadoOrdenReparacion, string> = {
  [EstadoOrdenReparacion.Presupuestado]: "Presupuestado",
  [EstadoOrdenReparacion.Aceptado]: "Aceptado",
  [EstadoOrdenReparacion.EnProgreso]: "En Progreso",
  [EstadoOrdenReparacion.Terminado]: "Terminado",
};

const estadoColors = {
  [EstadoOrdenReparacion.Presupuestado]: "#FFA500",
  [EstadoOrdenReparacion.Aceptado]: "#FFD700",
  [EstadoOrdenReparacion.EnProgreso]: "#4169E1",
  [EstadoOrdenReparacion.Terminado]: "#32CD32",
};

const estados = [
  "TODOS",
  EstadoOrdenReparacion.Presupuestado,
  EstadoOrdenReparacion.Aceptado,
  EstadoOrdenReparacion.EnProgreso,
  EstadoOrdenReparacion.Terminado,
];

interface OrdenesReparacionTableProps {
  onEditClick?: (id: string) => void;
}

const OrdenesReparacionTable = ({
  extraActions,
  ctaCb,
  setRefreshTrigger,
  ...rest
}: InheritedTableProps) => {
  const router = useRouter();

  const [tabValue, setTabValue] = useState(0);
  const [estadoActual, setEstadoActual] = useState<
    EstadoOrdenReparacion | string | null
  >(null);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setEstadoActual(newValue === 0 ? null : estados[newValue]);
  };

  const getQueryParams = useCallback(() => {
    const params: Record<string, string> = {};
    if (estadoActual) {
      params.estado = estadoActual;
    }
    return params;
  }, [estadoActual]);

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", flex: 0.3 },
    {
      field: "fechaEntradaReparacion",
      headerName: "Fecha Entrada a Taller",
      flex: 1,
      valueGetter: (date) => {
        return date
          ? new Date(date).toLocaleDateString("es-AR")
          : "No ingresado";
      },
    },
    {
      field: "vehículo",
      headerName: "Auto",
      flex: 2,
      renderCell: (params: any) => (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <Typography variant="body2">
            {params.row.auto.brand} {params.row.auto.model}
          </Typography>
          <Typography>{params.row.auto.patent}</Typography>
        </Box>
      ),
    },
    {
      field: "estado",
      headerName: "Estado",
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={
            estadosDisplay[params.value as EstadoOrdenReparacion] ||
            params.value
          }
          sx={{
            backgroundColor:
              estadoColors[params.value as EstadoOrdenReparacion] ||
              "transparent",
            color: "white",
            fontWeight: "bold",
          }}
        />
      ),
    },
    {
      field: "cliente",
      headerName: "Cliente",
      flex: 1,
      renderCell: (params: any) => params.row.auto.owner.fullName,
    },
    {
      field: "totalAPagar",
      headerName: "Total a Pagar",
      flex: 1,
      renderCell: (params: any) =>
        getFormattedPrice(calcularTotalOrdenReparacion(params.row)),
    },
    {
      field: "totalPagado",
      headerName: "Total Pagado",
      flex: 1,
      renderCell: (params: any) =>
        getFormattedPrice(
          params.row.ingresos.reduce((sum: number, ingreso: any) => {
            if (ingreso.moneda === "Dolar") {
              return sum + Number(ingreso.monto) * Number(ingreso.dolar.blue);
            }
            return sum + Number(ingreso.monto);
          }, 0)
        ),
    },
  ];

  const customActions = (params: any) => {
    const defaultActions = extraActions ? extraActions(params) : [];
    const customActions: React.ReactNode[] = [
      <MenuItem
        key="edit"
        onClick={() =>
          router.push(`/dashboard/ordenes-reparacion/${params.id}/editar`)
        }
      >
        <EditIcon sx={{ mr: 1 }} />
        Editar
      </MenuItem>,
      <MenuItem
        key="view"
        onClick={() =>
          router.push(`/dashboard/ordenes-reparacion/${params.id}/ver`)
        }
      >
        <VisibilityIcon sx={{ mr: 1 }} />
        Ver
      </MenuItem>,
    ];
    return customActions.concat(defaultActions);
  };

  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          {estados.map((estado, index) => (
            <Tab
              key={estado}
              label={
                estado === "TODOS"
                  ? estado
                  : estadosDisplay[estado as EstadoOrdenReparacion]
              }
            />
          ))}
        </Tabs>
      </Box>
      <Box mt={2}>
        {estadoActual === null && (
          <CustomTable
            title="Ordenes de reparación"
            apiEndpoint="/api/orden-reparacion"
            extraActions={customActions}
            ctaCb={() => router.push("/dashboard/ordenes-reparacion/nueva")}
            columns={columns}
            {...rest}
          />
        )}
        {estadoActual === EstadoOrdenReparacion.Presupuestado && (
          <CustomTable
            title="Orden de reparación"
            apiEndpoint="/api/orden-reparacion?estado=Presupuestado"
            extraActions={customActions}
            ctaCb={() => router.push("/dashboard/ordenes-reparacion/nueva")}
            columns={columns}
            {...rest}
          />
        )}
        {estadoActual === EstadoOrdenReparacion.Aceptado && (
          <CustomTable
            title="Orden de reparación"
            apiEndpoint="/api/orden-reparacion?estado=Aceptado"
            extraActions={customActions}
            ctaCb={() => router.push("/dashboard/ordenes-reparacion/nueva")}
            columns={columns}
            {...rest}
          />
        )}
        {estadoActual === EstadoOrdenReparacion.EnProgreso && (
          <CustomTable
            title="Orden de reparación"
            apiEndpoint="/api/orden-reparacion?estado=EnProgreso"
            extraActions={customActions}
            ctaCb={() => router.push("/dashboard/ordenes-reparacion/nueva")}
            columns={columns}
            {...rest}
          />
        )}
        {estadoActual === EstadoOrdenReparacion.Terminado && (
          <CustomTable
            title="Orden de reparación"
            apiEndpoint="/api/orden-reparacion?estado=Terminado"
            extraActions={customActions}
            ctaCb={() => router.push("/dashboard/ordenes-reparacion/nueva")}
            columns={columns}
            {...rest}
          />
        )}
      </Box>
    </>
  );
};

export default OrdenesReparacionTable;
