"use client";

import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useFetch } from "@/contexts/FetchContext";
import TemplateConfirmModal from "@/app/dashboard/whatsapp/components/TemplateConfirmModal";

type MensajeWhatsApp = {
  id: number;
  tipo: string;
  read: boolean;
  timestamp: string;
};

type ConversacionWhatsApp = {
  id: number;
  ultimoMensajeEntrante?: string | null;
};

export default function MessageInput(props: {
  conversaciones: any[];
  clienteNombre: string;
  clientePhone: string;
  onMessageSent: () => void;
}) {
  const { conversaciones, clienteNombre, clientePhone, onMessageSent } = props;
  const { authFetch } = useFetch();

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ultimaConversacion = conversaciones[conversaciones.length - 1] as
    | ConversacionWhatsApp
    | undefined;
  const conversacionId = ultimaConversacion?.id ?? null;

  const ultimoMensajeEntrante = ultimaConversacion?.ultimoMensajeEntrante;
  const isWindowOpen =
    ultimoMensajeEntrante != null &&
    Date.now() - new Date(ultimoMensajeEntrante).getTime() <
      24 * 60 * 60 * 1000;

  const handleSubmit = async () => {
    if (!text.trim() || !conversacionId) return;

    setError(null);

    if (isWindowOpen) {
      setSending(true);
      try {
        const response = await authFetch("/api/whatsapp/mensajes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversacionId,
            to: clientePhone,
            type: "text",
            body: text,
          }),
        });

        if (response.ok) {
          setText("");
          onMessageSent();
        } else {
          setError("No se pudo enviar el mensaje. Intentá de nuevo.");
        }
      } catch (e) {
        setError("No se pudo enviar el mensaje. Intentá de nuevo.");
      } finally {
        setSending(false);
      }
      return;
    }

    setShowModal(true);
  };

  return (
    <Box
      sx={{
        borderTop: "1px solid #e0e0e0",
        p: 1,
      }}
    >
      {!isWindowOpen ? (
        <Box sx={{ px: 1, pb: 0.5 }}>
          <Typography variant="caption" color="warning.main">
            ⚠ Ventana cerrada — el mensaje se enviará como template de
            WhatsApp
          </Typography>
        </Box>
      ) : null}

      {error ? (
        <Alert severity="error" sx={{ mb: 1 }}>
          {error}
        </Alert>
      ) : null}

      <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          size="small"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            isWindowOpen ? "Escribí un mensaje..." : "Escribí el mensaje para el template..."
          }
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          disabled={sending}
        />
        <IconButton
          onClick={handleSubmit}
          disabled={sending || !text.trim()}
          color="primary"
          sx={{ mb: 0.5 }}
        >
          <SendIcon />
        </IconButton>
      </Box>

      <TemplateConfirmModal
        open={showModal}
        clienteNombre={clienteNombre}
        messageBody={text}
        conversacionId={conversacionId}
        clientePhone={clientePhone}
        onClose={() => setShowModal(false)}
        onSent={() => {
          setShowModal(false);
          setText("");
          onMessageSent();
        }}
      />
    </Box>
  );
}

