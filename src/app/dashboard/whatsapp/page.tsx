"use client";

import { useFetch } from "@/contexts/FetchContext";
import { useSocket } from "@/hooks/useSocket";
import DeleteIcon from "@mui/icons-material/Delete";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SendIcon from "@mui/icons-material/Send";
import {
  Badge,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import DialogContentText from "@mui/material/DialogContentText";
import IconButton from "@mui/material/IconButton";
import { useCallback, useEffect, useRef, useState } from "react";

interface Mensaje {
  id: number;
  from: string;
  to: string;
  body: string;
  tipo: string;
  timestamp: string;
  read: boolean;
}

interface Cliente {
  id: number;
  phone: string;
  fullName: string;
}

interface Conversacion {
  id: number;
  cliente: Cliente;
  mensajes: Mensaje[];
  ultimoMensaje: string;
}

function WhatsAppPage() {
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [selectedConversacion, setSelectedConversacion] =
    useState<Conversacion | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { authFetch } = useFetch();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversacionToDelete, setConversacionToDelete] =
    useState<Conversacion | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const handleDeleteClick = (
    event: React.MouseEvent,
    conversacion: Conversacion
  ) => {
    event.stopPropagation();
    setConversacionToDelete(conversacion);
    setDeleteDialogOpen(true);
  };
  const socket = useSocket();

  const fetchConversaciones = useCallback(async () => {
    try {
      const response = await authFetch("/api/notificaciones-whatsapp");
      if (response.ok) {
        const data = await response.json();
        setConversaciones(data);
        return data;
      } else {
        console.error("Error al obtener las conversaciones");
      }
    } catch (error) {
      console.error("Error al obtener las conversaciones:", error);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchConversaciones();
  }, [fetchConversaciones]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (selectedConversacion) {
      setTimeout(scrollToBottom, 100);
    }
  }, [selectedConversacion, scrollToBottom]);

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on("whatsappNotification", async () => {
        const updatedConversaciones: Conversacion[] =
          await fetchConversaciones();
        if (updatedConversaciones && selectedConversacion) {
          const updatedConversacion = updatedConversaciones.find(
            (conv) => conv.id === selectedConversacion.id
          );
          if (updatedConversacion) {
            setSelectedConversacion(updatedConversacion);
          }
        }
      });

      return () => {
        socket.off("whatsappNotification");
      };
    }
  }, [socket, fetchConversaciones, selectedConversacion, conversaciones]);

  const handleSendMessage = async () => {
    if (!selectedConversacion || !replyMessage.trim()) return;

    try {
      const response = await authFetch(
        `/api/notificaciones-whatsapp/${selectedConversacion.id}`,
        {
          method: "PUT",
          body: JSON.stringify({ mensaje: replyMessage }),
        }
      );

      if (response.ok) {
        const updatedConversacion = await response.json();
        setSelectedConversacion(updatedConversacion);
        setReplyMessage("");
        setTimeout(scrollToBottom, 100);
      } else {
        console.error("Error al enviar el mensaje");
      }
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (conversacionToDelete) {
      try {
        const response = await authFetch(
          `/api/notificaciones-whatsapp/${conversacionToDelete.id}`,
          {
            method: "DELETE",
          }
        );
        if (response.ok) {
          setConversaciones(
            conversaciones.filter((c) => c.id !== conversacionToDelete.id)
          );
        } else {
          console.error("Error al eliminar la conversación");
        }
      } catch (error) {
        console.error("Error al eliminar la conversación:", error);
      }
    }
    setDeleteDialogOpen(false);
    setConversacionToDelete(null);
  };

  const handleConversacionClick = async (conversacion: Conversacion) => {
    setSelectedConversacion(conversacion);
    setIsModalOpen(true);

    try {
      const response = await authFetch(
        `/api/notificaciones-whatsapp/${conversacion.id}/marcar-leido`,
        {
          method: "PUT",
        }
      );

      if (!response.ok) {
        console.error("Error al marcar la conversación como leída");
      }
    } catch (error) {
      console.error("Error al llamar a la API:", error);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Conversaciones de WhatsApp
      </Typography>
      {conversaciones.length === 0 ? (
        <Typography variant="body1" sx={{ textAlign: "center", mt: 4 }}>
          No hay conversaciones disponibles.
        </Typography>
      ) : (
        <List>
          {conversaciones.map((conversacion) => (
            <ListItem
              key={conversacion.id}
              button
              onClick={() => handleConversacionClick(conversacion)}
              sx={{ bgcolor: "background.paper", mb: 1, borderRadius: 1 }}
              secondaryAction={
                <>
                  {conversacion.mensajes.reduce((acc, mensaje) => {
                    return acc + (mensaje.read === false ? 1 : 0);
                  }, 0) > 0 && (
                    <Badge
                      badgeContent={conversacion.mensajes.reduce(
                        (acc, mensaje) => {
                          return acc + (mensaje.read === false ? 1 : 0);
                        },
                        0
                      )}
                      color="error"
                      sx={{ mr: 2 }}
                    >
                      <NotificationsIcon color="action" />
                    </Badge>
                  )}
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={(e) => handleDeleteClick(e, conversacion)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </>
              }
            >
              <ListItemText
                primary={`${conversacion.cliente.fullName}`}
                secondary={
                  <>
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.primary"
                    >
                      {conversacion.cliente.phone}
                    </Typography>
                    {" — " +
                      conversacion.mensajes[0]?.body.substring(0, 50) +
                      "..."}
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Conversación con {selectedConversacion?.cliente.fullName}
        </DialogTitle>
        <DialogContent dividers>
          <List
            sx={{
              maxHeight: "60vh",
              overflow: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {selectedConversacion?.mensajes.map((mensaje) => (
              <ListItem
                key={mensaje.id}
                sx={{
                  flexDirection: "column",
                  alignItems: mensaje.from === "me" ? "flex-end" : "flex-start",
                }}
              >
                <Box
                  sx={{
                    bgcolor:
                      mensaje.from === "me" ? "primary.light" : "grey.200",
                    p: 1,
                    borderRadius: 1,
                    maxWidth: "80%",
                  }}
                >
                  <Typography variant="body1">{mensaje.body}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(mensaje.timestamp).toLocaleString()}
                  </Typography>
                </Box>
              </ListItem>
            ))}
            <div ref={messagesEndRef} />
          </List>
        </DialogContent>
        <DialogActions
          sx={{ flexDirection: "column", alignItems: "stretch", padding: 2 }}
        >
          <Box sx={{ display: "flex", width: "100%", mb: 1 }}>
            <input
              type="text"
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              style={{
                flexGrow: 1,
                marginRight: "8px",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
              placeholder="Escribe un mensaje..."
            />
            <Button
              onClick={handleSendMessage}
              variant="contained"
              endIcon={<SendIcon />}
              sx={{
                bgcolor: "green",
                color: "white",
                "&:hover": {
                  bgcolor: "darkgreen",
                },
              }}
            >
              Enviar
            </Button>
          </Box>
          <Button onClick={() => setIsModalOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que quieres eliminar esta conversación?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default WhatsAppPage;
