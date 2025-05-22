import ImageIcon from "@mui/icons-material/Image";
import ReceiptIcon from "@mui/icons-material/Receipt";
import { Box, Grid, Paper, Typography, useTheme } from "@mui/material";
import Image from "next/image";

interface RecibosProps {
  ordenReparacion: any;
}

const Recibos: React.FC<RecibosProps> = ({ ordenReparacion }) => {
  const theme = useTheme();

  const recibos = ordenReparacion.recibos || [];

  // Helper function to determine if a URL is an image
  const isImageUrl = (url: string) => {
    return (
      url.toLowerCase().endsWith(".jpg") ||
      url.toLowerCase().endsWith(".jpeg") ||
      url.toLowerCase().endsWith(".png")
    );
  };

  // Helper function to get file name from URL
  const getFileName = (url: string) => {
    const parts = url.split("/");
    return parts[parts.length - 1];
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: "flex",
          alignItems: "center",
        }}
      >
        <ReceiptIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
        Recibos
      </Typography>

      {recibos.length > 0 ? (
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2}>
            {recibos.map((recibo: string, index: number) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 1,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    "&:hover": {
                      boxShadow: 3,
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 1,
                      pb: 1,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <ImageIcon
                      sx={{ mr: 1, color: theme.palette.primary.main }}
                    />
                    <Typography variant="subtitle2" noWrap>
                      {getFileName(recibo)}
                    </Typography>
                  </Box>

                  {isImageUrl(recibo) ? (
                    <Box
                      sx={{
                        position: "relative",
                        width: "100%",
                        height: 200,
                        flexGrow: 1,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Image
                        src={recibo}
                        alt={`Recibo ${index + 1}`}
                        fill
                        style={{
                          objectFit: "contain",
                          cursor: "pointer",
                        }}
                        onClick={() => window.open(recibo, "_blank")}
                      />
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flexGrow: 1,
                        p: 2,
                      }}
                      onClick={() => window.open(recibo, "_blank")}
                    >
                      <Typography
                        variant="body2"
                        color="primary"
                        sx={{
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                      >
                        Ver documento
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : (
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary">
            No hay recibos adjuntos
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Recibos;
