import { Box, Typography } from "@mui/material";

type WhatsAppMessage = {
  from: string;
  body: string;
  timestamp: string;
};

type Props = {
  mensaje: WhatsAppMessage;
};

function TextMessage({ mensaje }: Props) {
  return (
    <Box
      sx={{
        bgcolor: mensaje.from === "me" ? "primary.light" : "grey.200",
        p: 1,
        borderRadius: 1,
        maxWidth: "80%",
      }}
    >
      <Typography variant="body1">{mensaje.body}</Typography>
      <Typography variant="caption" color="text.secondary">
        {new Date(mensaje.timestamp).toLocaleString()}
      </Typography>
    </Box>
  );
}

export default TextMessage;
