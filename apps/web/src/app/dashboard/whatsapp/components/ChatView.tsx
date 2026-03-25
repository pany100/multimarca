"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Divider,
  Paper,
  Typography,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
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
  mediaId?: string;
  sentByAi?: boolean;
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

  const [mediaStates, setMediaStates] = useState<
    Record<
      number,
      {
        loading: boolean;
        url: string | null;
        expired: boolean;
      }
    >
  >({});

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

  const handleOpenPdf = useCallback(
    async (messageId: number, mediaId: string) => {
      const current = mediaStates[messageId];
      if (current?.url) {
        window.open(current.url, "_blank");
        return;
      }
      if (current?.loading) return;

      setMediaStates((prev) => ({
        ...prev,
        [messageId]: { loading: true, url: null, expired: false },
      }));

      const res = await authFetch(`/api/whatsapp/media/${mediaId}`);
      const data = await res.json();

      if (data?.expired) {
        setMediaStates((prev) => ({
          ...prev,
          [messageId]: { loading: false, url: null, expired: true },
        }));
        return;
      }

      if (data?.url) {
        setMediaStates((prev) => ({
          ...prev,
          [messageId]: { loading: false, url: data.url, expired: false },
        }));
        window.open(data.url, "_blank");
      } else {
        setMediaStates((prev) => ({
          ...prev,
          [messageId]: { loading: false, url: null, expired: true },
        }));
      }
    },
    [authFetch, mediaStates]
  );

  useEffect(() => {
    if (!clienteId) return;
    fetchConversaciones();
  }, [clienteId, fetchConversaciones]);

  useEffect(() => {
    if (!clienteId) return;
    authFetch(`/api/whatsapp/clientes/${clienteId}/marcar-leido`, {
      method: "PUT",
    }).catch(() => {});
  }, [authFetch, clienteId]);

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
          const mediaState = it.msg.mediaId ? mediaStates[it.msg.id] : undefined;
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
                  {it.msg.mediaId ? (
                    <>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <PictureAsPdfIcon fontSize="small" />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight="medium">
                            {it.msg.body}
                          </Typography>

                          {mediaState?.expired ? (
                            <Typography
                              variant="caption"
                              sx={{ opacity: 0.7, color: "warning.light" }}
                            >
                              Archivo no disponible — han pasado más de 30 días
                            </Typography>
                          ) : (
                            <Typography
                              variant="caption"
                              sx={{
                                opacity: 0.8,
                                cursor: "pointer",
                                textDecoration: "underline",
                              }}
                              onClick={() =>
                                handleOpenPdf(it.msg.id, it.msg.mediaId!)
                              }
                            >
                              {mediaState?.loading
                                ? "Abriendo..."
                                : mediaState?.url
                                  ? "Abrir de nuevo"
                                  : "Ver archivo"}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </>
                  ) : (
                    <>
                      <Typography variant="body2">{it.msg.body}</Typography>
                      {it.msg.sentByAi === true ? (
                        <Typography
                          variant="caption"
                          sx={{ opacity: 0.6, display: "block", fontSize: "0.6rem" }}
                        >
                          IA
                        </Typography>
                      ) : null}
                    </>
                  )}
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

