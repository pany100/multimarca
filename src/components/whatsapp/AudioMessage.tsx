import { Box, Typography } from "@mui/material";

type WhatsAppMessage = {
  from: string;
  body: string;
  timestamp: string;
};

type Props = {
  mensaje: WhatsAppMessage;
};

const AudioMessage = ({ mensaje }: Props) => {
  const audioId = mensaje.body;
  console.log(audioId);
  return (
    <Box
      sx={{
        bgcolor: mensaje.from === "me" ? "primary.light" : "grey.200",
        p: 1,
        borderRadius: 1,
        maxWidth: "80%",
      }}
    >
      <audio controls>
        <source
          src={`/api/notificaciones-whatsapp/media/${audioId}`}
          type="audio/ogg"
        />
        Tu navegador no soporta el elemento de audio.
      </audio>
      <Typography variant="caption" color="text.secondary">
        {new Date(mensaje.timestamp).toLocaleString()}
      </Typography>
    </Box>
  );
};

export default AudioMessage;
