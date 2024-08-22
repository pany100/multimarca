"use client";

import { useFetch } from "@/contexts/FetchContext";
import DeleteIcon from "@mui/icons-material/Delete";
import {
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
import { useEffect, useState } from "react";

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

  const handleDeleteClick = (
    event: React.MouseEvent,
    conversacion: Conversacion
  ) => {
    event.stopPropagation();
    setConversacionToDelete(conversacion);
    setDeleteDialogOpen(true);
  };

  useEffect(() => {
    const fetchConversaciones = async () => {
      try {
        const response = await authFetch("/api/notificaciones-whatsapp");
        if (response.ok) {
          const data = await response.json();
          setConversaciones(data);
        } else {
          console.error("Error al obtener las conversaciones");
        }
      } catch (error) {
        console.error("Error al obtener las conversaciones:", error);
      }
    };

    fetchConversaciones();
  }, [authFetch]);

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

  const handleConversacionClick = (conversacion: Conversacion) => {
    setSelectedConversacion(conversacion);
    setIsModalOpen(true);
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
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={(e) => handleDeleteClick(e, conversacion)}
                >
                  <DeleteIcon />
                </IconButton>
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
          </List>
        </DialogContent>
        <DialogActions>
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
