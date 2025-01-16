"use client";
import { useFetch } from "@/contexts/FetchContext";
import { Box, TextField, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { OperacionCheque } from "@prisma/client";
import Link from "next/link";
import { useEffect, useState } from "react";

const ChequesPage = () => {
  const [cheques, setCheques] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const { authFetch } = useFetch();

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID",
      flex: 1,
      renderCell: (params) => {
        return (
          <Link
            href={`/dashboard/cheques/${params.row.id}`}
            style={{ textDecoration: "underline" }}
          >
            {params.row.id.toString()}
          </Link>
        );
      },
    },
    {
      field: "numero",
      headerName: "Número",
      flex: 1,
    },
    {
      field: "fechaEmision",
      headerName: "Fecha Emisión",
      flex: 1,
      renderCell: (params) => {
        return new Date(params.row.fechaEmision).toLocaleDateString("es-AR");
      },
    },
    {
      field: "fechaCobro",
      headerName: "Fecha Cobro",
      flex: 1,
      renderCell: (params) => {
        return new Date(params.row.fechaCobro).toLocaleDateString("es-AR");
      },
    },
    {
      field: "banco",
      headerName: "Banco",
      flex: 1,
    },
    {
      field: "importe",
      headerName: "importe",
      flex: 1,
      renderCell: (params) => {
        return params.row.importe.toLocaleString("es-AR", {
          style: "currency",
          currency: "ARS",
        });
      },
    },
    {
      field: "owner",
      headerName: "Emisor",
      flex: 1,
    },
    {
      field: "entidad",
      headerName: "Operación",
      flex: 2,
      renderCell: (params) => {
        if (params.row.operacionCheque === OperacionCheque.VENTA) {
          return `Venta a ${params.row.entidad.cliente.fullName}`;
        }

        return "Sin operación asociada";
      },
    },
  ];

  useEffect(() => {
    const fetchCheques = async () => {
      setLoading(true);
      try {
        const url = new URL("/api/cheques", window.location.origin);
        url.searchParams.append("page", paginationModel.page.toString());
        url.searchParams.append("size", paginationModel.pageSize.toString());
        if (searchTerm) url.searchParams.append("query", searchTerm);

        const response = await authFetch(url.toString());
        const data = await response.json();
        setCheques(data.items);
        setTotalItems(data.total);
      } catch (error) {
        console.error("Error al obtener cheques:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCheques();
  }, [paginationModel, authFetch, searchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Cheques
      </Typography>

      <TextField
        label="Buscar por número"
        variant="outlined"
        value={searchTerm}
        onChange={handleSearchChange}
        fullWidth
        margin="normal"
      />

      <DataGrid
        rows={cheques}
        columns={columns}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[10, 25, 50]}
        rowCount={totalItems}
        paginationMode="server"
        loading={loading}
        autoHeight
      />
    </Box>
  );
};

export default ChequesPage;
