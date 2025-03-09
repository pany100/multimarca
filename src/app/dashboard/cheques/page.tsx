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
        const fechaCobro = new Date(params.row.fechaCobro);
        const hoy = new Date();
        const diferenciaDias = Math.floor(
          (fechaCobro.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
        );

        let backgroundColor = "#ADD8E6"; // celeste por defecto
        if (diferenciaDias < 3 && diferenciaDias >= 0) {
          backgroundColor = "#FF6B6B"; // rojo si faltan menos de 3 días
        } else if (diferenciaDias < 0 && diferenciaDias > -3) {
          backgroundColor = "#FFFF00"; // amarillo si pasaron menos de 3 días
        }

        return (
          <Box
            sx={{ backgroundColor, padding: "4px 8px", borderRadius: "4px" }}
          >
            {fechaCobro.toLocaleDateString("es-AR")}
          </Box>
        );
      },
    },
    {
      field: "banco",
      headerName: "Banco",
      flex: 1,
    },
    {
      field: "importe",
      headerName: "Importe",
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
        if (params.row.operacionCheque === OperacionCheque.INGRESO_MANUAL) {
          return `Ingreso manual de ${params.row.entidad?.usuario?.fullName}`;
        }
        if (params.row.operacionCheque === OperacionCheque.EXTRACCION) {
          return `Extracción de ${params.row.entidad?.usuario?.fullName}`;
        }
        if (params.row.operacionCheque === OperacionCheque.GASTO) {
          return `Gasto en ${params.row.entidad.nombre}`;
        }
        if (params.row.operacionCheque === OperacionCheque.INGRESO_REPARACION) {
          return `Ingreso por reparación de ${params.row.entidad.cliente.fullName}`;
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
        }}
      >
        <TextField
          label="Buscar por número"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          fullWidth
          margin="normal"
          sx={{
            width: 300,
            "& .MuiOutlinedInput-root": {
              backgroundColor: "background.paper",
              "&:hover fieldset": {
                borderColor: "primary.main",
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <Box component="span" sx={{ color: "text.secondary", mr: 1 }}>
                🔍
              </Box>
            ),
          }}
        />
      </Box>

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
