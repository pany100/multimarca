"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useFetch } from "@/contexts/FetchContext";

export default function TemplateConfirmModal(props: {
  open: boolean;
  clienteNombre: string;
  messageBody: string;
  conversacionId: number | null;
  clientePhone: string;
  onClose: () => void;
  onSent: () => void;
}) {
  const {
    open,
    clienteNombre,
    messageBody,
    conversacionId,
    clientePhone,
    onClose,
    onSent,
  } = props;

  const { authFetch } = useFetch();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewText = `Hola ${clienteNombre}, te escribimos desde MT Service Multimarca para informarte que ${messageBody}.\nSi tenés alguna consulta, podés responder a este mensaje.\nMuchas gracias`;

  const handleSend = async () => {
    if (!conversacionId) return;

    setSending(true);
    setError(null);
    try {
      const response = await authFetch("/api/whatsapp/mensajes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversacionId,
          to: clientePhone,
          type: "template",
          templateName: "inicio_de_conversacion",
          languageCode: "es",
          templateParams: [
            {
              type: "body",
              parameters: [
                { type: "text", text: clienteNombre },
                { type: "text", text: "MT Service Multimarca" },
                { type: "text", text: messageBody },
              ],
            },
          ],
        }),
      });

      if (response.ok) {
        onSent();
      } else {
        setError("No se pudo enviar el mensaje. Intentá de nuevo.");
      }
    } catch (e) {
      setError("No se pudo enviar el mensaje. Intentá de nuevo.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Confirmar envío</DialogTitle>
      <DialogContent>
        <Typography sx={{ mb: 2 }}>
          La conversación está inactiva (más de 24hs sin respuesta del
          cliente). El mensaje se enviará con este formato:
        </Typography>

        <Box
          sx={{
            bgcolor: "#f5f5f5",
            borderRadius: 2,
            p: 2,
            mb: 2,
            borderLeft: "4px solid #25D366",
          }}
        >
          <Typography
            variant="body2"
            sx={{ whiteSpace: "pre-line" }}
          >
            {previewText}
          </Typography>
        </Box>

        <DialogContentText>
          <Typography variant="caption" color="text.secondary">
            Una vez que el cliente responda, podrás enviar mensajes de texto
            libre por 24 horas.
          </Typography>
        </DialogContentText>

        {error ? (
          <Alert severity="error" sx={{ mt: 1 }}>
            {error}
          </Alert>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={sending}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={sending}
        >
          {sending ? (
            <>
              <CircularProgress size={16} sx={{ mr: 1 }} />
              Enviando...
            </>
          ) : (
            "Confirmar envío"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

