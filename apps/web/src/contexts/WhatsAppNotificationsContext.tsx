"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

type WhatsAppNotificationsContextType = {
  pendingCount: number;
  lastNotification: { conversacionId: number; timestamp: Date } | null;
  clearNotification: () => void;
  refresh: () => Promise<void>;
};

const Context = createContext<WhatsAppNotificationsContextType | null>(null);

export function WhatsAppNotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pendingCount, setPendingCount] = useState(0);
  const [lastNotification, setLastNotification] = useState<{
    conversacionId: number;
    timestamp: Date;
  } | null>(null);

  const refresh = useCallback(async () => {
    try {
      const r = await fetch("/api/whatsapp/inbox", { credentials: "include" });
      const data = await r.json();
      if (Array.isArray(data)) setPendingCount(data.length);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    void refresh();

    const socket = io({
      // Debe coincidir con el path del servidor Socket.IO.
      path: "/api/socket/io",
      transports: ["websocket"],
    });

    socket.on(
      "newWhatsAppMessage",
      (data: { conversacionId?: number; requiresHuman?: boolean }) => {
        if (data?.requiresHuman && typeof data.conversacionId === "number") {
          setPendingCount((prev) => prev + 1);
          setLastNotification({
            conversacionId: data.conversacionId,
            timestamp: new Date(),
          });
        } else {
          // Si el evento no trae requiresHuman (por ejemplo, payload histórico),
          // resincemos con el servidor para que el badge sea correcto.
          void refresh();
        }
      }
    );

    return () => {
      socket.disconnect();
    };
  }, [refresh]);

  const clearNotification = () => setLastNotification(null);

  return (
    <Context.Provider
      value={{ pendingCount, lastNotification, clearNotification, refresh }}
    >
      {children}
    </Context.Provider>
  );
}

export function useWhatsAppNotifications() {
  const ctx = useContext(Context);
  if (!ctx)
    throw new Error(
      "useWhatsAppNotifications debe usarse dentro de WhatsAppNotificationsProvider"
    );
  return ctx;
}

