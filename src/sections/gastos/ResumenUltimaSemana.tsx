import { useFetch } from "@/contexts/FetchContext";
import { getFormattedPrice } from "@/utils/fieldHelper";
import { Box, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { format, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { useEffect, useState } from "react";

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

function ResumenUltimaSemana() {
  const [data, setData] = useState<MecanicoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { authFetch } = useFetch();

  // Calculate the date range (last Sunday to today)
  const today = new Date();
  const lastSunday = new Date(today);
  const currentDay = today.getDay();
  lastSunday.setDate(today.getDate() - currentDay);
  const startDate = startOfDay(lastSunday);

  const dateRangeText = `${format(startDate, "d 'de' MMMM", {
    locale: es,
  })} - ${format(today, "d 'de' MMMM", { locale: es })}`;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await authFetch(
          `/api/gastos/ultima-semana?start=${startDate.toISOString()}&end=${today.toISOString()}`
        );
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

    fetchData();
  }, [authFetch]);

  // If loading or error, return null
  if (loading) return null;
  if (error) return null;
  if (!data || data.length === 0) return null;

  // Prepare rows for DataGrid
  const rows = data.map((mecanico) => ({
    id: mecanico.mecanicoId,
    mecanicoNombre: mecanico.mecanicoNombre,
    cantidadReparaciones: mecanico.reparaciones.length,
    manoDeObraTotal: mecanico.manoDeObraTotal,
    manoDeObraPagada: mecanico.manoDeObraPagada,
    pendientePago: mecanico.manoDeObraTotal - mecanico.manoDeObraPagada,
    reparaciones: mecanico.reparaciones,
  }));

  // Define columns for DataGrid
  const columns: GridColDef[] = [
    { field: "mecanicoNombre", headerName: "Mecánico", flex: 1 },
    {
      field: "reparaciones",
      headerName: "Reparaciones",
      flex: 2,
      align: "left",
      headerAlign: "center",
      renderCell: (params) => {
        return params.row.reparaciones ? (
          <Box>
            {params.row.reparaciones.map((rep: Reparacion) => (
              <Typography key={rep.idOrep} variant="body2">
                <Link href={`/dashboard/ordenes-reparacion/${rep.idOrep}/ver`}>
                  {`${rep.auto} - ${format(new Date(rep.fecha), "dd/MM/yyyy")}`}
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
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
        Resumen Ultima Semana ({dateRangeText})
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
          sx={{
            "& .MuiDataGrid-cell": {
              fontSize: "0.875rem",
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
