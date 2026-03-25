"use client";

import { useSocket } from "@/hooks/useSocket";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  CircularProgress,
  Divider,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { useFetch } from "@/contexts/FetchContext";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

type MensajeWhatsApp = {
  id: number;
  body: string;
  tipo: string;
  timestamp: string;
  read: boolean;
};

type ConversacionResumen = {
  clienteId: number;
  cliente: { fullName: string; phone?: string | null };
  ultimoMensaje: string;
  ultimoMensajeBody: string | null;
  tieneNoLeidos: boolean;
};

function initialsFromFullName(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
}

export default function ConversacionList(props: {
  onSelect: (clienteId: number, nombre: string, phone: string) => void;
  selectedId: number | null;
}) {
  const { onSelect, selectedId } = props;
  const { authFetch } = useFetch();
  const socket = useSocket();

  const [items, setItems] = useState<ConversacionResumen[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRecientes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await authFetch(
        "/api/whatsapp/conversaciones/recientes"
      );
      if (!response.ok) return;
      const data = await response.json();

      const mapped: ConversacionResumen[] = (data ?? []).map((conv: any) => {
        const lastMsg: MensajeWhatsApp | undefined =
          conv.mensajes?.[conv.mensajes.length - 1];
        const tieneNoLeidos =
          (conv.mensajes ?? []).some(
            (m: MensajeWhatsApp) => m.tipo === "inbound" && m.read === false
          ) ?? false;

        return {
          clienteId: conv.clienteId ?? conv.cliente?.id,
          cliente: {
            fullName: conv.cliente?.fullName ?? "",
            phone: conv.cliente?.phone,
          },
          ultimoMensaje: conv.ultimoMensaje,
          ultimoMensajeBody: lastMsg?.body ?? null,
          tieneNoLeidos,
        };
      });

      setItems(mapped);
    } catch (e) {
      // Mantener silencioso; la UI muestra "sin conversaciones" si falla.
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    void loadRecientes();
  }, [loadRecientes]);

  useEffect(() => {
    if (!socket) return;
    const onRefresh = () => {
      void loadRecientes();
    };
    socket.on("newWhatsAppMessage", onRefresh);
    return () => {
      socket.off("newWhatsAppMessage", onRefresh);
    };
  }, [socket, loadRecientes]);

  const rendered = useMemo(() => {
    return items.map((item, idx) => {
      const displayTime = item.ultimoMensaje
        ? formatDistanceToNow(new Date(item.ultimoMensaje), {
            locale: es,
            addSuffix: true,
          })
        : "";

      return (
        <Box key={`${item.clienteId}-${idx}`}>
          <ListItemButton
            selected={item.clienteId === selectedId}
            onClick={() =>
              onSelect(
                item.clienteId,
                item.cliente.fullName,
                item.cliente.phone ?? ""
              )
            }
            sx={{ px: 2, py: 1.2 }}
          >
            <ListItemAvatar>
              <Avatar>{initialsFromFullName(item.cliente.fullName)}</Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography fontWeight="bold">{item.cliente.fullName}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {displayTime}
                  </Typography>
                </Box>
              }
              secondary={
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="body2"
                    noWrap
                    sx={{ maxWidth: 200 }}
                  >
                    {item.ultimoMensajeBody || "Sin mensajes"}
                  </Typography>
                  {item.tieneNoLeidos ? (
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        bgcolor: "primary.main",
                        flexShrink: 0,
                      }}
                    />
                  ) : null}
                </Box>
              }
            />
          </ListItemButton>
          {idx < items.length - 1 ? <Divider /> : null}
        </Box>
      );
    });
  }, [items, onSelect, selectedId]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <List disablePadding sx={{ pt: 0 }}>
      {rendered}
      {items.length === 0 ? (
        <Typography sx={{ p: 2 }} color="text.secondary">
          No hay conversaciones
        </Typography>
      ) : null}
    </List>
  );
}

