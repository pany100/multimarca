import { useFetch } from "@/contexts/FetchContext";
import { getFormattedPrice } from "@/utils/fieldHelper";
import { Box, Chip, Grid, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { addDays, format } from "date-fns";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import WeekPicker from "./WeekPicker";
import useWeek from "./hooks/useWeek";

type Trabajo = {
  idOrep: number;
  fecha: string;
  auto: string;
  manoDeObra: number;
  tipo?: "odr" | "venta";
  compartida?: boolean;
  otrosMecanicos?: string[];
};

type MecanicoData = {
  mecanicoId: number;
  mecanicoNombre: string;
  reparaciones: Trabajo[];
  manoDeObraTotal: number;
};

type ReparacionCompartida = {
  id: number;
  fecha: string;
  auto: string;
  mechanics: { id: number; name: string }[];
  manoDeObraTotal: number;
  tipo?: "odr" | "venta";
};

function formatFechaUTC(isoDate: string): string {
  const d = new Date(isoDate);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

function TipoChip({ tipo }: { tipo?: "odr" | "venta" }) {
  if (tipo === "venta") {
    return (
      <Chip
        label="Venta"
        size="small"
        color="secondary"
        variant="outlined"
        sx={{ fontSize: "0.7rem", height: 20, mr: 0.5 }}
      />
    );
  }
  return (
    <Chip
      label="OdR"
      size="small"
      color="primary"
      variant="outlined"
      sx={{ fontSize: "0.7rem", height: 20, mr: 0.5 }}
    />
  );
}

function getTrabajoLink(item: { idOrep: number; tipo?: "odr" | "venta" }) {
  if (item.tipo === "venta") {
    return `/dashboard/ventas/${item.idOrep}`;
  }
  return `/dashboard/ordenes-reparacion/${item.idOrep}`;
}

const linkSx = {
  "& a": {
    textDecoration: "none",
    color: "inherit",
    "&:hover": {
      textDecoration: "underline",
      color: "primary.main",
    },
  },
};

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
      const startStr = format(start, "yyyy-MM-dd");
      const endStr = format(addDays(end, 1), "yyyy-MM-dd");
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
        setData(await response.json());
        setCompartida(await response2.json());
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

  // Merge individual + shared data into a single per-mechanic list
  const rows = useMemo(() => {
    const mecanicoMap = new Map<
      number,
      { mecanicoId: number; mecanicoNombre: string; trabajos: Trabajo[] }
    >();

    // Seed with individual data
    for (const m of data) {
      mecanicoMap.set(m.mecanicoId, {
        mecanicoId: m.mecanicoId,
        mecanicoNombre: m.mecanicoNombre,
        trabajos: m.reparaciones.map((r) => ({ ...r, compartida: false })),
      });
    }

    // Distribute shared items to each mechanic involved
    for (const rep of compartida) {
      for (const mec of rep.mechanics) {
        const otrosMecanicos = rep.mechanics
          .filter((m) => m.id !== mec.id)
          .map((m) => m.name);

        const trabajo: Trabajo = {
          idOrep: rep.id,
          fecha: rep.fecha,
          auto: rep.auto,
          manoDeObra: rep.manoDeObraTotal,
          tipo: rep.tipo,
          compartida: true,
          otrosMecanicos,
        };

        const existing = mecanicoMap.get(mec.id);
        if (existing) {
          existing.trabajos.push(trabajo);
        } else {
          mecanicoMap.set(mec.id, {
            mecanicoId: mec.id,
            mecanicoNombre: mec.name,
            trabajos: [trabajo],
          });
        }
      }
    }

    return Array.from(mecanicoMap.values())
      .map((m) => ({
        id: m.mecanicoId,
        mecanicoId: m.mecanicoId,
        mecanicoNombre: m.mecanicoNombre,
        trabajos: m.trabajos,
        manoDeObraTotal: m.trabajos.reduce((s, t) => s + t.manoDeObra, 0),
      }))
      .sort((a, b) => b.manoDeObraTotal - a.manoDeObraTotal);
  }, [data, compartida]);

  const hayDatos = rows.some((r) => r.trabajos.length > 0);

  const columns: GridColDef[] = [
    {
      field: "mecanicoNombre",
      headerName: "Mecánico",
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2" sx={linkSx}>
          <Link href={`/dashboard/mecanicos/${params.row.mecanicoId}/ver`}>
            {params.row.mecanicoNombre}
          </Link>
        </Typography>
      ),
    },
    {
      field: "trabajos",
      headerName: "Trabajos",
      flex: 2,
      align: "left",
      headerAlign: "center",
      renderCell: (params) => {
        const trabajos: Trabajo[] = params.row.trabajos;
        if (!trabajos || trabajos.length === 0) {
          return (
            <Typography variant="body2" color="text.secondary">
              -
            </Typography>
          );
        }
        return (
          <Box>
            {trabajos.map((t) => (
              <Typography
                key={`${t.tipo}-${t.idOrep}-${t.compartida}`}
                variant="body2"
                sx={linkSx}
              >
                <Link href={getTrabajoLink(t)}>
                  <TipoChip tipo={t.tipo} />
                  {t.compartida && (
                    <Chip
                      label="Compartida"
                      size="small"
                      variant="outlined"
                      sx={{
                        fontSize: "0.7rem",
                        height: 20,
                        mr: 0.5,
                        borderColor: "warning.main",
                        color: "warning.main",
                      }}
                    />
                  )}
                  {`${t.auto} - ${formatFechaUTC(t.fecha)}: ${getFormattedPrice(t.manoDeObra)}`}
                </Link>
                {t.compartida && t.otrosMecanicos && t.otrosMecanicos.length > 0 && (
                  <Typography
                    component="span"
                    variant="caption"
                    color="text.secondary"
                    sx={{ ml: 0.5 }}
                  >
                    (con {t.otrosMecanicos.join(", ")})
                  </Typography>
                )}
              </Typography>
            ))}
          </Box>
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

      {!loading && !hayDatos ? (
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mt: 2 }}
        >
          No hay órdenes registradas en este período.
        </Typography>
      ) : (
        <Box sx={{ width: "100%", mt: 2 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
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
      )}
    </Box>
  );
}

export default ResumenUltimaSemana;
