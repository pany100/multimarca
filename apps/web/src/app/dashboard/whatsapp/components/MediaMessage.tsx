"use client";

import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import {
  Box,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useFetch } from "@/contexts/FetchContext";

export type MediaMessageMsg = {
  id: number;
  body: string;
  tipo: string;
  mediaId?: string | null;
  mediaMimeType?: string | null;
  mediaCaption?: string | null;
  templateName?: string | null;
  sentByAi?: boolean;
  timestamp: string | Date;
};

type MediaMessageProps = {
  msg: MediaMessageMsg;
};

export default function MediaMessage({ msg }: MediaMessageProps) {
  const { authFetch } = useFetch();
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [expired, setExpired] = useState(false);
  const loadingLock = useRef(false);
  const blobUrlRef = useRef<string | null>(null);

  const revokeBlobUrl = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    revokeBlobUrl();
    setMediaUrl(null);
    setExpired(false);
    loadingLock.current = false;
  }, [msg.id, msg.mediaId, revokeBlobUrl]);

  useEffect(() => {
    return () => revokeBlobUrl();
  }, [revokeBlobUrl]);

  const loadMedia = useCallback(async (): Promise<string | null> => {
    if (loadingLock.current || expired || !msg.mediaId) return null;
    loadingLock.current = true;
    setLoading(true);
    try {
      const res = await authFetch(
        `/api/whatsapp/media/${msg.mediaId}/content`
      );
      const ct = res.headers.get("content-type") ?? "";
      if (ct.includes("application/json")) {
        const data = (await res.json()) as { expired?: boolean };
        if (data.expired) setExpired(true);
        return null;
      }
      if (!res.ok) return null;
      const blob = await res.blob();
      revokeBlobUrl();
      const objectUrl = URL.createObjectURL(blob);
      blobUrlRef.current = objectUrl;
      setMediaUrl(objectUrl);
      return objectUrl;
    } finally {
      loadingLock.current = false;
      setLoading(false);
    }
  }, [authFetch, expired, msg.mediaId, revokeBlobUrl]);

  const openMediaInNewTab = useCallback(async () => {
    if (expired) return;
    const url = mediaUrl ?? (await loadMedia());
    if (url) window.open(url, "_blank");
  }, [expired, loadMedia, mediaUrl]);

  const isAudio = msg.mediaMimeType?.startsWith("audio");
  const isImage =
    msg.mediaMimeType?.startsWith("image") &&
    !msg.mediaMimeType?.includes("webp");
  const isVideo = msg.mediaMimeType?.startsWith("video");
  const isDocument =
    msg.mediaMimeType?.includes("pdf") ||
    msg.mediaMimeType?.includes("msword") ||
    msg.mediaMimeType?.includes("spreadsheet") ||
    msg.mediaMimeType?.includes("presentation") ||
    msg.mediaMimeType?.includes("text/plain") ||
    msg.mediaMimeType?.includes("zip") ||
    (!isAudio && !isImage && !isVideo && !!msg.mediaId && !!msg.mediaMimeType);
  const isPdfTemplate =
    !!msg.templateName && !!msg.mediaId && msg.tipo === "outbound";
  const isUnsupportedMedia =
    !!msg.mediaId &&
    !isAudio &&
    !isImage &&
    !isVideo &&
    !isDocument &&
    !isPdfTemplate;

  let content: ReactNode;

  if (isPdfTemplate) {
    content = (
      <>
        <Typography variant="body2">{msg.body}</Typography>
        <Box
          sx={{
            height: 1,
            bgcolor: "rgba(255,255,255,0.3)",
            my: 0.5,
          }}
        />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mt: 0.5,
          }}
        >
          <PictureAsPdfIcon fontSize="small" sx={{ opacity: 0.8 }} />
          {expired ? (
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              Archivo no disponible — han pasado más de 30 días
            </Typography>
          ) : (
            <Typography
              variant="caption"
              sx={{
                cursor: "pointer",
                textDecoration: "underline",
                opacity: 0.9,
              }}
              onClick={openMediaInNewTab}
            >
              {loading ? "Abriendo..." : mediaUrl ? "Ver PDF" : "Ver PDF adjunto"}
            </Typography>
          )}
        </Box>
      </>
    );
  } else if (isAudio) {
    content = (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
        }}
      >
        <Typography variant="caption" sx={{ opacity: 0.7 }}>
          🎵 Mensaje de voz
        </Typography>
        {!mediaUrl && !expired ? (
          <Button
            size="small"
            variant="text"
            sx={{
              color: "inherit",
              textTransform: "none",
              p: 0,
              minWidth: 0,
            }}
            onClick={() => {
              void loadMedia();
            }}
          >
            {loading ? <CircularProgress size={14} /> : "▶ Reproducir"}
          </Button>
        ) : null}
        {mediaUrl ? (
          <Box
            component="audio"
            controls
            sx={{ width: "100%", maxWidth: 280, height: 40 }}
          >
            <source src={mediaUrl} type={msg.mediaMimeType ?? "audio/ogg"} />
          </Box>
        ) : null}
        {expired ? (
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            Audio no disponible
          </Typography>
        ) : null}
      </Box>
    );
  } else if (isImage) {
    content = (
      <Box>
        {!mediaUrl && !expired ? (
          <Box
            sx={{
              width: 200,
              height: 150,
              bgcolor: "rgba(0,0,0,0.1)",
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            onClick={() => {
              void loadMedia();
            }}
          >
            {loading ? (
              <CircularProgress size={20} />
            ) : (
              <Typography variant="caption">📷 Ver imagen</Typography>
            )}
          </Box>
        ) : null}
        {mediaUrl ? (
          <Box
            component="img"
            src={mediaUrl}
            alt=""
            sx={{
              maxWidth: 280,
              maxHeight: 300,
              borderRadius: 1,
              cursor: "pointer",
              display: "block",
            }}
            onClick={() => window.open(mediaUrl, "_blank")}
          />
        ) : null}
        {expired ? (
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            Imagen no disponible
          </Typography>
        ) : null}
        {msg.mediaCaption && mediaUrl ? (
          <Typography variant="caption" display="block" mt={0.5}>
            {msg.mediaCaption}
          </Typography>
        ) : null}
      </Box>
    );
  } else if (isVideo) {
    content = (
      <Box>
        {!mediaUrl && !expired ? (
          <Box
            sx={{
              width: 200,
              height: 150,
              bgcolor: "rgba(0,0,0,0.1)",
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            onClick={() => {
              void loadMedia();
            }}
          >
            {loading ? (
              <CircularProgress size={20} />
            ) : (
              <Typography variant="caption">🎬 Ver video</Typography>
            )}
          </Box>
        ) : null}
        {mediaUrl ? (
          <Box
            component="video"
            controls
            src={mediaUrl}
            sx={{
              maxWidth: 280,
              maxHeight: 300,
              borderRadius: 1,
              display: "block",
            }}
          />
        ) : null}
        {expired ? (
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            Video no disponible
          </Typography>
        ) : null}
      </Box>
    );
  } else if (isDocument) {
    content = (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <InsertDriveFileIcon fontSize="small" sx={{ opacity: 0.8 }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2">
            {msg.mediaCaption ?? "Documento"}
          </Typography>
          {!expired ? (
            <Typography
              variant="caption"
              sx={{
                cursor: "pointer",
                textDecoration: "underline",
                opacity: 0.8,
              }}
              onClick={openMediaInNewTab}
            >
              {loading
                ? "Abriendo..."
                : mediaUrl
                  ? "Descargar"
                  : "Ver documento"}
            </Typography>
          ) : (
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              Archivo no disponible
            </Typography>
          )}
        </Box>
      </Box>
    );
  } else if (isUnsupportedMedia) {
    content = (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <HelpOutlineIcon fontSize="small" sx={{ opacity: 0.6 }} />
        <Typography variant="caption" sx={{ opacity: 0.7 }}>
          {`Tipo de archivo no soportado (${msg.mediaMimeType ?? "desconocido"}). Revisarlo directamente en WhatsApp.`}
        </Typography>
      </Box>
    );
  } else {
    content = <Typography variant="body2">{msg.body}</Typography>;
  }

  return (
    <Box sx={{ width: "100%", px: 1.5, py: 1 }}>{content}</Box>
  );
}
