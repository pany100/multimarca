import { getCookie, setCookie } from "cookies-next";
import { useEffect, useRef } from "react";

// Intervalo de refresh: cada 6 horas (en milisegundos)
const REFRESH_INTERVAL = 6 * 60 * 60 * 1000;

// También refrescar si el usuario está activo después de X tiempo de inactividad
const ACTIVITY_CHECK_INTERVAL = 30 * 60 * 1000; // 30 minutos

// Claves para sincronización entre tabs
const REFRESH_LOCK_KEY = "auth_refresh_lock";
const LAST_REFRESH_KEY = "auth_last_refresh";
const LOCK_TIMEOUT = 10000; // 10 segundos máximo para el lock

export function useTokenRefresh() {
  const lastActivityRef = useRef<number>(Date.now());
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    // Crear canal de comunicación entre tabs
    if (typeof BroadcastChannel !== "undefined") {
      broadcastChannelRef.current = new BroadcastChannel("auth_token_refresh");

      // Escuchar cuando otro tab refresca el token
      broadcastChannelRef.current.onmessage = (event) => {
        if (event.data.type === "TOKEN_REFRESHED") {
          console.log("[Auth] Otro tab refrescó el token, sincronizando...");
          // Actualizar el timestamp local
          localStorage.setItem(LAST_REFRESH_KEY, Date.now().toString());
        }
      };
    }

    // Actualizar timestamp de última actividad
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    // Escuchar eventos de actividad del usuario
    window.addEventListener("click", updateActivity);
    window.addEventListener("keypress", updateActivity);
    window.addEventListener("scroll", updateActivity);
    window.addEventListener("mousemove", updateActivity);

    // Verificar si podemos adquirir el lock para refrescar
    const acquireLock = (): boolean => {
      const lockData = localStorage.getItem(REFRESH_LOCK_KEY);
      if (lockData) {
        const lockTime = parseInt(lockData, 10);
        // Si el lock es muy viejo, lo ignoramos (el tab que lo tenía murió)
        if (Date.now() - lockTime < LOCK_TIMEOUT) {
          return false; // Otro tab está refrescando
        }
      }
      // Adquirir el lock
      localStorage.setItem(REFRESH_LOCK_KEY, Date.now().toString());
      return true;
    };

    // Liberar el lock
    const releaseLock = () => {
      localStorage.removeItem(REFRESH_LOCK_KEY);
    };

    // Función para refrescar el token
    const refreshToken = async () => {
      const token = getCookie("auth_token");
      if (!token) return;

      // Verificar si otro tab ya refrescó recientemente
      const lastRefreshStr = localStorage.getItem(LAST_REFRESH_KEY);
      if (lastRefreshStr) {
        const lastRefresh = parseInt(lastRefreshStr, 10);
        // Si se refrescó en los últimos 5 minutos, no refrescar de nuevo
        if (Date.now() - lastRefresh < 5 * 60 * 1000) {
          console.log(
            "[Auth] Token ya fue refrescado recientemente por otro tab"
          );
          return;
        }
      }

      // Intentar adquirir el lock
      if (!acquireLock()) {
        console.log("[Auth] Otro tab está refrescando el token, esperando...");
        return;
      }

      try {
        const response = await fetch("/api/auth/refresh", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCookie("auth_token", data.token, {
            maxAge: 7 * 24 * 60 * 60,
            path: "/",
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
          });

          // Guardar timestamp del último refresh
          localStorage.setItem(LAST_REFRESH_KEY, Date.now().toString());

          // Notificar a otros tabs
          if (broadcastChannelRef.current) {
            broadcastChannelRef.current.postMessage({
              type: "TOKEN_REFRESHED",
            });
          }

          console.log("[Auth] Token refrescado exitosamente");
        } else {
          console.warn("[Auth] No se pudo refrescar el token");
        }
      } catch (error) {
        console.error("[Auth] Error al refrescar token:", error);
      } finally {
        releaseLock();
      }
    };

    // Verificar periódicamente si hay que refrescar
    const checkAndRefresh = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityRef.current;

      // Verificar último refresh (global entre tabs)
      const lastRefreshStr = localStorage.getItem(LAST_REFRESH_KEY);
      const lastRefresh = lastRefreshStr ? parseInt(lastRefreshStr, 10) : 0;
      const timeSinceLastRefresh = now - lastRefresh;

      // Refrescar si:
      // 1. Pasó el intervalo de refresh Y
      // 2. El usuario estuvo activo en los últimos 30 minutos
      if (
        timeSinceLastRefresh >= REFRESH_INTERVAL &&
        timeSinceLastActivity < ACTIVITY_CHECK_INTERVAL
      ) {
        refreshToken();
      }
    };

    // Revisar cada 5 minutos
    const intervalId = setInterval(checkAndRefresh, 5 * 60 * 1000);

    // También refrescar inmediatamente si la página se vuelve visible
    // (el usuario volvió a la pestaña)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const lastRefreshStr = localStorage.getItem(LAST_REFRESH_KEY);
        const lastRefresh = lastRefreshStr ? parseInt(lastRefreshStr, 10) : 0;
        const timeSinceLastRefresh = Date.now() - lastRefresh;

        // Si pasaron más de 6 horas, refrescar
        if (timeSinceLastRefresh >= REFRESH_INTERVAL) {
          refreshToken();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Hacer un refresh inicial si el token está próximo a expirar
    // (útil cuando el usuario abre la app después de varios días)
    const token = getCookie("auth_token");
    if (token) {
      // Intentar decodificar el token para ver su expiración
      try {
        const payload = JSON.parse(atob(token.toString().split(".")[1]));
        const expiresAt = payload.exp * 1000; // convertir a ms
        const now = Date.now();
        const timeUntilExpiry = expiresAt - now;

        // Si expira en menos de 1 día, refrescar ahora
        if (timeUntilExpiry < 24 * 60 * 60 * 1000) {
          refreshToken();
        }
      } catch {
        // Si no se puede decodificar, ignorar
      }
    }

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("click", updateActivity);
      window.removeEventListener("keypress", updateActivity);
      window.removeEventListener("scroll", updateActivity);
      window.removeEventListener("mousemove", updateActivity);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
      }
    };
  }, []);
}
