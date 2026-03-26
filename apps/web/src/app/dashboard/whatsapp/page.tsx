"use client";

import { Box, Typography } from "@mui/material";
import ConversacionList from "./components/ConversacionList";
import ChatView from "./components/ChatView";
import { useEffect, useState } from "react";
import { useWhatsAppNotifications } from "@/contexts/WhatsAppNotificationsContext";

export default function WhatasppPage() {
  const { refresh } = useWhatsAppNotifications();
  const [selectedClienteId, setSelectedClienteId] = useState<number | null>(
    null
  );
  const [selectedClienteNombre, setSelectedClienteNombre] = useState("");
  const [selectedClientePhone, setSelectedClientePhone] = useState("");

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <Box sx={{ display: "flex", height: "calc(100vh - 64px)" }}>
      <Box
        sx={{
          width: 360,
          borderRight: "1px solid #e0e0e0",
          overflow: "auto",
        }}
      >
        <ConversacionList
          selectedId={selectedClienteId}
          onSelect={(id, nombre, phone) => {
            setSelectedClienteId(id);
            setSelectedClienteNombre(nombre);
            setSelectedClientePhone(phone);
          }}
        />
      </Box>

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {selectedClienteId ? (
          <ChatView
            clienteId={selectedClienteId}
            clienteNombre={selectedClienteNombre}
            clientePhone={selectedClientePhone}
          />
        ) : (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              px: 2,
            }}
          >
            <Typography color="text.secondary">
              Seleccioná una conversación
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
