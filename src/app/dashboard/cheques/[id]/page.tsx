"use client";
import { useFetch } from "@/contexts/FetchContext";
import { Box, Paper, Typography } from "@mui/material";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const ChequePage = () => {
  const [cheque, setCheque] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const { authFetch } = useFetch();

  useEffect(() => {
    const fetchCheque = async () => {
      try {
        const response = await authFetch(`/api/cheques/${id}`);
        const data = await response.json();
        setCheque(data);
      } catch (error) {
        console.error("Error al cargar el cheque:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCheque();
  }, [id, authFetch]);

  if (loading) {
    return <Typography>Cargando...</Typography>;
  }

  if (!cheque) {
    return <Typography>No se encontró el cheque</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Detalles del Cheque
      </Typography>

      <Paper sx={{ p: 3, mt: 2 }}>
        <Box sx={{ display: "grid", gap: 2 }}>
          <Typography>
            <strong>Número:</strong> {cheque.numero}
          </Typography>
          <Typography>
            <strong>Fecha de Emisión:</strong>{" "}
            {new Date(cheque.fechaEmision).toLocaleDateString("es-AR")}
          </Typography>
          <Typography>
            <strong>Fecha de Cobro:</strong>{" "}
            {new Date(cheque.fechaCobro).toLocaleDateString("es-AR")}
          </Typography>
          <Typography>
            <strong>Banco:</strong> {cheque.banco}
          </Typography>
          <Typography>
            <strong>Monto:</strong>{" "}
            {cheque.monto.toLocaleString("es-AR", {
              style: "currency",
              currency: "ARS",
            })}
          </Typography>
          <Typography>
            <strong>Emisor:</strong> {cheque.owner}
          </Typography>
          <Typography>
            <strong>Imagen:</strong>{" "}
            {cheque.picturePath ? (
              <Box sx={{ mt: 2 }}>
                <img
                  src={cheque.picturePath}
                  alt="Foto del cheque"
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                    borderRadius: "4px",
                  }}
                />
              </Box>
            ) : (
              "No hay foto disponible"
            )}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default ChequePage;
