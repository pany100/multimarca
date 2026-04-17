import { useFetch } from "@/contexts/FetchContext";
import { getFormattedPrice } from "@/utils/fieldHelper";
import { Box, Grid, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { addDays, format } from "date-fns";
import Link from "next/link";
import { useEffect, useState } from "react";
import WeekPicker from "./WeekPicker";
import useWeek from "./hooks/useWeek";

type Reparacion = {
  idOrep: number;
  fecha: string;
  auto: string;
  manoDeObra: number;
  pagado: boolean;
};

type MecanicoData = {
  mecanicoId: number;
  mecanicoNombre: string;
  reparaciones: Reparacion[];
  manoDeObraTotal: number;
  manoDeObraPagada: number;
};

type ReparacionCompartida = {
  id: number;
  fecha: string;
  auto: string;
  mechanics: {
    id: number;
    name: string;
  }[];
  manoDeObraTotal: number;
  manoDeObraPagada: number;
};

/** Formatea una fecha ISO en dd/MM/yyyy usando UTC (evita que se muestre el día anterior por timezone). */
function formatFechaUTC(isoDate: string): string {
  const d = new Date(isoDate);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

function ResumenUltimaSemana() {
  const [data, setData] = useState<MecanicoData[]>([]);
  const [compartida, setCompartida] = useState<ReparacionCompartida[]>([]);
  const [totalManoObraSemana, setTotalManoObraSemana] = useState<number | null>(
    null,
  );
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
      // Enviar solo YYYY-MM-DD para que el backend use medianoche UTC y no excluya
      // órdenes por diferencia de timezone (ej. 00:00 local → 03:00 UTC en Argentina).
      const startStr = format(start, "yyyy-MM-dd");
      const endStr = format(addDays(end, 1), "yyyy-MM-dd"); // día siguiente para incluir todo el último día
      try {
        const [response, response2, responseTotal] = await Promise.all([
          authFetch(
            `/api/gastos/ultima-semana?start=${startStr}&end=${endStr}`,
          ),
          authFetch(
            `/api/gastos/ultima-semana-compartida?start=${startStr}&end=${endStr}`,
          ),
          authFetch(
            `/api/gastos/ultima-semana-total?start=${startStr}&end=${endStr}`,
          ),
        ]);
        if (!response.ok || !response2.ok || !responseTotal.ok) {
          throw new Error("Error al obtener los datos");
        }
        const result = await response.json();
        setData(result);
        const result2 = await response2.json();
        setCompartida(result2);
        const totalData = await responseTotal.json();
        setTotalManoObraSemana(
          typeof totalData.totalManoObraSemana === "number"
            ? totalData.totalManoObraSemana
            : null,
        );
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Error al cargar los datos");
        setTotalManoObraSemana(null);
      } finally {
        setLoading(false);
      }
    };

    if (dateRange.start && dateRange.end) {
      fetchData(dateRange.start, dateRange.end);
    }
  }, [authFetch, dateRange]);

  const handleWeekChange = (week: { start: Date; end: Date }) => {
    setDateRange(week);
  };

  // Prepare rows for DataGrid
  const rows = data.map((mecanico) => ({
    id: mecanico.mecanicoId,
    mecanicoNombre: mecanico.mecanicoNombre,
    mecanicoId: mecanico.mecanicoId,
    cantidadReparaciones: mecanico.reparaciones.length,
    manoDeObraTotal: mecanico.manoDeObraTotal,
    manoDeObraPagada: mecanico.manoDeObraPagada,
    pendientePago: mecanico.manoDeObraTotal - mecanico.manoDeObraPagada,
    reparaciones: mecanico.reparaciones,
  }));

  // Define columns for DataGrid
  const columns: GridColDef[] = [
    {
      field: "mecanicoNombre",
      headerName: "Mecánico",
      flex: 1,
      renderCell: (params) => {
        return (
          <Typography
            key={params.row.id}
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
            <Link href={`/dashboard/mecanicos/${params.row.mecanicoId}/ver`}>
              {params.row.mecanicoNombre}
            </Link>
          </Typography>
        );
      },
    },
    {
      field: "reparaciones",
      headerName: "Reparaciones",
      flex: 1.2,
      align: "left",
      headerAlign: "center",
      renderCell: (params) => {
        return params.row.reparaciones ? (
          <Box>
            {params.row.reparaciones.map((rep: Reparacion) => (
              <Typography
                key={rep.idOrep}
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
                <Link href={`/dashboard/ordenes-reparacion/${rep.idOrep}`}>
                  *{" "}
                  {`${rep.auto} - ${formatFechaUTC(rep.fecha)}: ${getFormattedPrice(rep.manoDeObra)}`}
                </Link>
              </Typography>
            ))}
          </Box>
        ) : (
          <Typography variant="body2">-</Typography>
        );
      },
    },
    {
      field: "manoDeObraTotal",
      headerName: "Mano de Obra Total",
      flex: 1,
      align: "right",
      headerAlign: "right",
      valueGetter: (value) => getFormattedPrice(value),
    },
    {
      field: "manoDeObraPagada",
      headerName: "Mano de Obra Pagada",
      flex: 1,
      align: "right",
      headerAlign: "right",
      valueGetter: (value) => getFormattedPrice(value),
    },
  ];

  const columnsCompartida: GridColDef[] = [
    {
      field: "reparación",
      headerName: "Reparación",
      flex: 1.5,
      renderCell: (params) => {
        return (
          <Typography
            key={params.row.id}
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
            <Link href={`/dashboard/ordenes-reparacion/${params.row.id}`}>
              * {`${params.row.auto} - ${formatFechaUTC(params.row.fecha)}`}
            </Link>
          </Typography>
        );
      },
    },
    {
      field: "mechanics",
      headerName: "Mecánicos",
      flex: 2,
      align: "left",
      headerAlign: "center",
      renderCell: (params) => {
        return params.row.mechanics ? (
          <Box>
            {params.row.mechanics.map((mechanic: any) => (
              <Typography
                key={mechanic.id}
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
                <Link href={`/dashboard/mecanicos/${mechanic.id}/ver`}>
                  * {mechanic.name}
                </Link>
              </Typography>
            ))}
          </Box>
        ) : (
          <Typography variant="body2">-</Typography>
        );
      },
    },
    {
      field: "manoDeObraTotal",
      headerName: "Mano de Obra Total",
      flex: 1,
      align: "right",
      headerAlign: "right",
      valueGetter: (value) => getFormattedPrice(value),
    },
    {
      field: "manoDeObraPagada",
      headerName: "Mano de Obra Pagada",
      flex: 1,
      align: "right",
      headerAlign: "right",
      valueGetter: (value) => getFormattedPrice(value),
    },
  ];

  return (
    <Box sx={{ width: "100%", mb: 8 }}>
      <Grid container alignItems="center">
        <Grid item xs={12} md={6}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            Resumen semanal por mecánico
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <WeekPicker onWeekChange={handleWeekChange} />
        </Grid>
      </Grid>
      {!loading && totalManoObraSemana !== null && (
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          Mano de obra total de la semana:{" "}
          {getFormattedPrice(totalManoObraSemana)}
        </Typography>
      )}
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
        Reparaciones por mecánico
      </Typography>
      <Box sx={{ width: "100%", mt: 2 }}>
        <DataGrid
          rows={rows}
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
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, mt: 4 }}>
        Reparaciones compartidas entre varios mecánicos
      </Typography>
      <Box sx={{ width: "100%", mt: 2 }}>
        <DataGrid
          rows={compartida}
          columns={columnsCompartida}
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
    </Box>
  );
}

export default ResumenUltimaSemana;
