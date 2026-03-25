"use client";

import MediaMessage from "@/app/dashboard/whatsapp/components/MediaMessage";
import MessageInput from "@/app/dashboard/whatsapp/components/MessageInput";
import { useFetch } from "@/contexts/FetchContext";
import { Box, Divider, Paper, Typography } from "@mui/material";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useSocket } from "@/hooks/useSocket";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type MensajeWhatsApp = {
  id: number;
  from: string;
  to: string;
  body: string;
  tipo: string;
  timestamp: string;
  read: boolean;
  waMessageId?: string | null;
  mediaId?: string | null;
  mediaMimeType?: string | null;
  mediaCaption?: string | null;
  replyToWaId?: string | null;
  templateName?: string | null;
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
  const socket = useSocket();

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

  useEffect(() => {
    if (!socket || !clienteId) return;
    const handler = (data?: {
      clienteId?: number;
      conversacionId?: number;
    }) => {
      if (data?.clienteId !== clienteId) return;
      void (async () => {
        await fetchConversaciones();
        // Solo el webhook manda conversacionId: mensaje entrante nuevo → marcar leído si esta conversación está abierta.
        if (data?.conversacionId != null) {
          await authFetch(`/api/whatsapp/clientes/${clienteId}/marcar-leido`, {
            method: "PUT",
          });
        }
      })();
    };
    socket.on("newWhatsAppMessage", handler);
    return () => {
      socket.off("newWhatsAppMessage", handler);
    };
  }, [socket, clienteId, fetchConversaciones, authFetch]);

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

  const allMessages = useMemo(
    () => items.filter((item) => item.kind === "mensaje").map((item) => item.msg),
    [items],
  );

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

          const msg = it.msg;
          const isOutbound = msg.tipo === "outbound";
          const needsMediaRender =
            !!msg.mediaId || msg.body.startsWith("[");

          const replyMsg =
            msg.replyToWaId != null && msg.replyToWaId !== ""
              ? allMessages.find((m) => m.waMessageId === msg.replyToWaId) ??
                null
              : null;

          const replyTitle =
            replyMsg?.tipo === "outbound"
              ? "Taller"
              : replyMsg?.tipo === "inbound"
                ? "Cliente"
                : "Mensaje anterior";

          const replyPreviewText = replyMsg
            ? replyMsg.mediaId
              ? `📎 ${replyMsg.mediaCaption ?? replyMsg.body}`
              : replyMsg.body
            : "Mensaje no disponible";

          const replyStrip =
            msg.replyToWaId != null && msg.replyToWaId !== "" ? (
              <Box
                sx={{
                  bgcolor: msg.tipo === "outbound" ? "primary.dark" : "#e0e0e0",
                  borderRadius: "8px 8px 0 0",
                  borderLeft: "3px solid",
                  borderColor:
                    msg.tipo === "outbound"
                      ? "rgba(255,255,255,0.5)"
                      : "primary.main",
                  px: 1.5,
                  py: 0.75,
                  maxWidth: "70%",
                  alignSelf: msg.tipo === "outbound" ? "flex-end" : "flex-start",
                  mb: "-4px",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.7,
                    display: "block",
                    fontWeight: "bold",
                  }}
                >
                  {replyTitle}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.85,
                    display: "block",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: 220,
                  }}
                >
                  {replyPreviewText}
                </Typography>
              </Box>
            ) : null;

          return (
            <Box
              key={it.msg.id}
              sx={{
                display: "flex",
                justifyContent: isOutbound ? "flex-end" : "flex-start",
                mb: 1,
              }}
            >
              <Box
                sx={{
                  maxWidth: "70%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isOutbound ? "flex-end" : "flex-start",
                }}
              >
                {replyStrip}
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
                  {needsMediaRender ? (
                    <>
                      <MediaMessage msg={msg} />
                      <Typography
                        variant="caption"
                        sx={{
                          opacity: 0.7,
                          display: "block",
                          textAlign: "right",
                          fontSize: "0.65rem",
                        }}
                      >
                        {format(new Date(msg.timestamp), "HH:mm")}
                      </Typography>
                      {msg.sentByAi === true ? (
                        <Typography
                          variant="caption"
                          sx={{
                            opacity: 0.6,
                            display: "block",
                            fontSize: "0.6rem",
                          }}
                        >
                          IA
                        </Typography>
                      ) : null}
                    </>
                  ) : (
                    <>
                      <Typography variant="body2">{msg.body}</Typography>
                      {msg.sentByAi === true ? (
                        <Typography
                          variant="caption"
                          sx={{
                            opacity: 0.6,
                            display: "block",
                            fontSize: "0.6rem",
                          }}
                        >
                          IA
                        </Typography>
                      ) : null}
                      <Typography
                        variant="caption"
                        sx={{
                          opacity: 0.7,
                          display: "block",
                          textAlign: "right",
                          fontSize: "0.65rem",
                        }}
                      >
                        {format(new Date(msg.timestamp), "HH:mm")}
                      </Typography>
                    </>
                  )}
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

