"use client";

import { useEffect, useRef } from "react";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { Alert, Snackbar } from "@mui/material";
import { useRouter } from "next/navigation";
import { useWhatsAppNotifications } from "@/contexts/WhatsAppNotificationsContext";

export function WhatsAppNotificationSnackbar() {
  const { lastNotification, clearNotification } =
    useWhatsAppNotifications();
  const router = useRouter();
  const lastPlayedAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (!lastNotification) return;

    const playedAt = lastNotification.timestamp.getTime();
    if (lastPlayedAtRef.current === playedAt) return;
    lastPlayedAtRef.current = playedAt;

    // Sonido corto ("beep") para alertar al usuario.
    try {
      const AudioCtx =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = 880; // La
      gain.gain.value = 0.05;

      oscillator.connect(gain);
      gain.connect(ctx.destination);

      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        try {
          void ctx.close?.();
        } catch {
          // ignore
        }
      }, 130);
    } catch (e) {
      // No hacemos nada si el navegador bloquea autoplay.
      console.warn("[WhatsApp Snackbar] No se pudo reproducir el sonido", e);
    }
  }, [lastNotification]);

  return (
    <Snackbar
      open={!!lastNotification}
      autoHideDuration={8000}
      onClose={clearNotification}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert
        onClose={clearNotification}
        severity="warning"
        icon={<WhatsAppIcon />}
        sx={{ width: "100%", cursor: "pointer" }}
        onClick={() => {
          router.push("/dashboard/whatsapp");
          clearNotification();
        }}
      >
        Nueva consulta de WhatsApp requiere atención
      </Alert>
    </Snackbar>
  );
}

