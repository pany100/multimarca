"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Divider,
  Paper,
  Typography,
} from "@mui/material";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useFetch } from "@/contexts/FetchContext";
import MessageInput from "@/app/dashboard/whatsapp/components/MessageInput";

type MensajeWhatsApp = {
  id: number;
  from: string;
  to: string;
  body: string;
  tipo: string;
  timestamp: string;
  read: boolean;
};

type ConversacionWhatsApp = {
  id: number;
  iniciada: string;
  mensajes: MensajeWhatsApp[];
  ultimoMensajeEntrante?: string | null;
};

type ChatItem =
  | { kind: "separador"; fecha: Date; conversacionId: number }
  | { kind: "mensaje"; msg: MensajeWhatsApp };

export default function ChatView(props: {
  clienteId: number;
  clienteNombre: string;
  clientePhone: string;
}) {
  const { clienteId, clienteNombre, clientePhone } = props;
  const { authFetch } = useFetch();

  const [conversaciones, setConversaciones] = useState<
    ConversacionWhatsApp[]
  >([]);

  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchConversaciones = useCallback(async () => {
    const response = await authFetch(
      `/api/whatsapp/conversaciones?clienteId=${clienteId}`
    );
    if (response.ok) {
      const data = await response.json();
      setConversaciones(data);
    }
  }, [authFetch, clienteId]);

  useEffect(() => {
    if (!clienteId) return;
    fetchConversaciones();
  }, [clienteId, fetchConversaciones]);

  const items = useMemo<ChatItem[]>(() => {
    const flat: ChatItem[] = [];
    for (const conversacion of conversaciones) {
      flat.push({
        kind: "separador",
        fecha: new Date(conversacion.iniciada),
        conversacionId: conversacion.id,
      });

      for (const msg of conversacion.mensajes ?? []) {
        flat.push({ kind: "mensaje", msg });
      }
    }
    return flat;
  }, [conversaciones]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
    });
  }, [items.length]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          px: 2,
          pt: 1,
          pb: 1,
        }}
        ref={scrollRef}
      >
        {items.map((it, idx) => {
          if (it.kind === "separador") {
            return (
              <Box
                key={`sep-${it.conversacionId}-${idx}`}
                sx={{ display: "flex", alignItems: "center", gap: 1, my: 1 }}
              >
                <Divider sx={{ flex: 1 }} />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ whiteSpace: "nowrap" }}
                >
                  Nueva conversación ·{" "}
                  {format(it.fecha, "dd/MM/yyyy", { locale: es })}
                </Typography>
                <Divider sx={{ flex: 1 }} />
              </Box>
            );
          }

          const isOutbound = it.msg.tipo === "outbound";
          return (
            <Box
              key={it.msg.id}
              sx={{
                display: "flex",
                justifyContent: isOutbound ? "flex-end" : "flex-start",
                mb: 1,
              }}
            >
              <Box sx={{ maxWidth: "70%" }}>
                <Paper
                  elevation={0}
                  sx={{
                    px: 1.5,
                    py: 1,
                    bgcolor: isOutbound ? "primary.main" : "#f0f0f0",
                    color: isOutbound ? "white" : "text.primary",
                    borderRadius: isOutbound
                      ? "18px 18px 4px 18px"
                      : "18px 18px 18px 4px",
                  }}
                >
                  <Typography variant="body2">{it.msg.body}</Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      opacity: 0.7,
                      display: "block",
                      textAlign: "right",
                      fontSize: "0.65rem",
                    }}
                  >
                    {format(new Date(it.msg.timestamp), "HH:mm")}
                  </Typography>
                </Paper>
              </Box>
            </Box>
          );
        })}
      </Box>

      <MessageInput
        conversaciones={conversaciones}
        clienteNombre={clienteNombre}
        clientePhone={clientePhone}
        onMessageSent={fetchConversaciones}
      />
    </Box>
  );
}

