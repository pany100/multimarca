import { useFetch } from "@/contexts/FetchContext";
import { getFormattedPrice } from "@/utils/fieldHelper";
import { Box, Grid, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { EstadoOrdenReparacion } from "@prisma/client";
import { format } from "date-fns";
import Link from "next/link";
import { useEffect, useState } from "react";
import WeekPicker from "../gastos/WeekPicker";
import useWeek from "../gastos/hooks/useWeek";

type Mecanico = {
  id: number;
  nombre: string;
};

type Reparacion = {
  id: number;
  fecha: string;
  auto: string;
  manoDeObra: number;
  pagado: boolean;
  cantidadMecanicos: number;
  mecanicos: {
    id: number;
    nombre: string;
  }[];
  compartida: boolean;
};

type ReparacionesResponse = {
  mecanico: Mecanico;
  periodo: {
    desde: string;
    hasta: string;
  };
  filtros: {
    estado: EstadoOrdenReparacion;
    compartidas: boolean | null;
  };
  reparaciones: Reparacion[];
  estadisticas: {
    cantidadReparaciones: number;
    manoDeObraTotal: number;
    manoDeObraPagada: number;
    porcentajePagado: number;
  };
};

type UltimaSemanaProps = {
  mecanicoId: number;
  enProgreso: boolean;
  compartidas: boolean;
  title: string;
};

function UltimaSemana({
  mecanicoId,
  enProgreso,
  compartidas,
  title,
}: UltimaSemanaProps) {
  const [data, setData] = useState<ReparacionesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { authFetch } = useFetch();
  const { startDate, endDate } = useWeek();
  const [dateRange, setDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: startDate,
    end: endDate,
  });

  useEffect(() => {
    const fetchData = async (start: Date, end: Date) => {
      setLoading(true);
      try {
        const url = `/api/mecanicos/${mecanicoId}/reparaciones?from=${start.toISOString()}&to=${end.toISOString()}`;

        const response = await authFetch(url);

        if (!response.ok) {
          throw new Error("Error al obtener los datos");
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };

    if (dateRange.start && dateRange.end) {
      fetchData(dateRange.start, dateRange.end);
    }
  }, [authFetch, dateRange, mecanicoId, enProgreso, compartidas]);

  const handleWeekChange = (week: { start: Date; end: Date }) => {
    setDateRange(week);
  };

  // Define columns for DataGrid
  const columns: GridColDef[] = [
    {
      field: "fecha",
      headerName: "Fecha",
      flex: 1,
      valueFormatter: (value) =>
        format(new Date(value as string), "dd/MM/yyyy"),
    },
    {
      field: "auto",
      headerName: "Auto",
      flex: 1.5,
      renderCell: (params) => {
        return (
          <Typography
            variant="body2"
            sx={{
              "& a": {
                textDecoration: "none",
                color: "inherit",
                "&:hover": {
                  textDecoration: "underline",
                  color: "primary.main",
                },
              },
            }}
          >
            <Link href={`/dashboard/ordenes-reparacion/${params.row.id}/ver`}>
              {params.row.auto}
            </Link>
          </Typography>
        );
      },
    },
    {
      field: "manoDeObra",
      headerName: "Mano de Obra",
      flex: 1,
      align: "right",
      headerAlign: "right",
      valueFormatter: (value) => getFormattedPrice(value as number),
    },
    {
      field: "pagado",
      headerName: "Estado de Pago",
      flex: 1,
      align: "center",
      headerAlign: "center",
      valueFormatter: (value) => (value ? "Pagado" : "Pendiente"),
    },
    {
      field: "mecanicos",
      headerName: "Mecánicos",
      flex: 2,
      align: "left",
      headerAlign: "left",
      renderCell: (params) => {
        const mecanicos = params.value as { id: number; nombre: string }[];
        return mecanicos.length > 1 ? (
          <Box>
            {mecanicos.map((mecanico) => (
              <Typography
                key={mecanico.id}
                variant="body2"
                sx={{
                  "& a": {
                    textDecoration: "none",
                    color: "inherit",
                    "&:hover": {
                      textDecoration: "underline",
                      color: "primary.main",
                    },
                  },
                }}
              >
                <Link href={`/dashboard/mecanicos/${mecanico.id}/ver`}>
                  * {mecanico.nombre}
                </Link>
              </Typography>
            ))}
          </Box>
        ) : (
          <Typography variant="body2">Solo este mecánico</Typography>
        );
      },
    },
  ];

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box sx={{ width: "100%", mb: 8 }}>
      <Grid container alignItems="center" spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            {title}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <WeekPicker onWeekChange={handleWeekChange} />
        </Grid>
      </Grid>

      {data && (
        <>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6">Resumen</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2">
                  Cantidad de reparaciones:{" "}
                  {data.estadisticas.cantidadReparaciones}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2">
                  Mano de obra total:{" "}
                  {getFormattedPrice(data.estadisticas.manoDeObraTotal)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2">
                  Mano de obra pagada:{" "}
                  {getFormattedPrice(data.estadisticas.manoDeObraPagada)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2">
                  Porcentaje pagado:{" "}
                  {data.estadisticas.porcentajePagado.toFixed(2)}%
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ width: "100%", mt: 2 }}>
            <DataGrid
              rows={data.reparaciones}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 },
                },
              }}
              pageSizeOptions={[5, 10, 25]}
              disableRowSelectionOnClick
              autoHeight
              getRowHeight={() => "auto"}
              sx={{
                "& .MuiDataGrid-cell": {
                  fontSize: "0.875rem",
                  whiteSpace: "normal",
                  padding: "8px",
                },
                "& .MuiDataGrid-row": {
                  alignItems: "flex-start",
                },
                backgroundColor: "background.paper",
                borderRadius: 1,
                boxShadow: 1,
              }}
            />
          </Box>
        </>
      )}
    </Box>
  );
}

export default UltimaSemana;
