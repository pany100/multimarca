"use client";

import { useFetch } from "@/contexts/FetchContext";
import { getFormattedPrice } from "@/utils/fieldHelper";
import { Box, Chip, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useCallback, useEffect, useState } from "react";

function VerPage({ params }: { params: { id: string } }) {
  const [datos, setDatos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [estadoDeuda, setEstadoDeuda] = useState(0);
  const [nombreProveedor, setNombreProveedor] = useState("");
  const { authFetch } = useFetch();

  const columns: GridColDef[] = [
    {
      field: "fecha",
      headerName: "Fecha",
      flex: 1,
      renderCell: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: "tipo",
      headerName: "Tipo",
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === "Deuda" ? "error" : "success"}
          size="small"
        />
      ),
    },
    {
      field: "descripcion",
      headerName: "Descripción",
      flex: 3,
      renderCell: (params) => (
        <Box
          sx={{
            whiteSpace: "normal",
            wordWrap: "break-word",
            lineHeight: "1.2",
            py: 1,
          }}
        >
          <a href={params.row.ref} style={{ textDecoration: "underline" }}>
            {params.value}
          </a>
        </Box>
      ),
    },
    {
      field: "monto",
      headerName: "Monto",
      flex: 1,
      renderCell: (params) =>
        `$${params.value.toLocaleString("es-AR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
    },
  ];

  const obtenerDatos = useCallback(async () => {
    setCargando(true);
    try {
      const url = new URL(
        `/api/proveedores/${params.id}`,
        window.location.origin
      );
      url.searchParams.append("page", (page + 1).toString());
      url.searchParams.append("pageSize", pageSize.toString());

      const respuesta = await authFetch(url.toString());
      const data = await respuesta.json();

      setDatos(data.items);
      setTotalRows(data.total);
      setEstadoDeuda(data.saldoTotal);
      setNombreProveedor(data.nombreProveedor);
    } catch (error) {
      console.error("Error al obtener datos:", error);
    } finally {
      setCargando(false);
    }
  }, [authFetch, params.id, page, pageSize]);

  useEffect(() => {
    obtenerDatos();
  }, [obtenerDatos]);

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      {nombreProveedor && (
        <>
          <Typography variant="h5" gutterBottom>
            Estado de cuenta de: {nombreProveedor}
          </Typography>
          <Typography variant="h6" gutterBottom>
            {estadoDeuda > 0 ? "Crédito: " : "Deuda: "}
            {estadoDeuda && getFormattedPrice(estadoDeuda)}
          </Typography>
        </>
      )}
      <DataGrid
        rows={datos}
        columns={columns}
        loading={cargando}
        rowCount={totalRows}
        pageSizeOptions={[5, 10, 25]}
        paginationMode="server"
        paginationModel={{
          page,
          pageSize,
        }}
        onPaginationModelChange={(model) => {
          setPage(model.page);
          setPageSize(model.pageSize);
        }}
        disableRowSelectionOnClick
        getRowId={(row) => row.fecha + row.tipo + row.monto}
        autoHeight
      />
    </Box>
  );
}

export default VerPage;
