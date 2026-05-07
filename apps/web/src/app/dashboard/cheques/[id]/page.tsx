"use client";
import { useFetch } from "@/contexts/FetchContext";
import { getFormattedPrice } from "@/utils/fieldHelper";
import { Box, Button, Paper, Typography } from "@mui/material";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const getFileExtension = (path: string) => {
  const clean = path.split("?")[0].split("#")[0];
  const dot = clean.lastIndexOf(".");
  return dot >= 0 ? clean.slice(dot + 1).toLowerCase() : "";
};

const ChequeFilePreview = ({ path }: { path: string }) => {
  const ext = getFileExtension(path);
  const isImage = ["jpg", "jpeg", "png", "webp", "gif", "bmp"].includes(ext);
  const isPdf = ext === "pdf";

  return (
    <Box sx={{ mt: 2 }}>
      {isImage && (
        <img
          src={path}
          alt="Foto del cheque"
          style={{
            maxWidth: "100%",
            height: "auto",
            borderRadius: "4px",
          }}
        />
      )}
      {isPdf && (
        <Box
          sx={{
            width: "100%",
            maxWidth: 600,
            height: 500,
            border: "1px solid #ddd",
            borderRadius: 1,
            overflow: "hidden",
          }}
        >
          <iframe
            src={path}
            width="100%"
            height="100%"
            style={{ border: "none" }}
            title="Foto del cheque"
          />
        </Box>
      )}
      {!isImage && !isPdf && (
        <Typography variant="body2" color="text.secondary">
          Archivo adjunto ({ext || "desconocido"}). No se puede previsualizar.
        </Typography>
      )}
      <Box sx={{ mt: 1 }}>
        <Button
          variant="outlined"
          size="small"
          onClick={() => window.open(path, "_blank")}
        >
          Abrir en nueva pestaña
        </Button>
      </Box>
    </Box>
  );
};

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
            <strong>Importe:</strong> {getFormattedPrice(cheque.importe)}
          </Typography>
          <Typography>
            <strong>Emisor:</strong> {cheque.owner}
          </Typography>
          <Box>
            <Typography component="span">
              <strong>Imagen:</strong>
            </Typography>
            {cheque.picturePath ? (
              <ChequeFilePreview path={cheque.picturePath} />
            ) : (
              <Typography component="span"> No hay foto disponible</Typography>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ChequePage;
