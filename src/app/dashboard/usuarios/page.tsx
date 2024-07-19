"use client";

import React, { useState } from "react";
import { IconButton } from "@mui/material";
import {
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";
import {
  Box,
  TextField,
  Modal,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";

import authFetch from "@/utils/authFetch";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

interface Usuario {
  id: string;
  fullName: string;
  email: string;
  username: string;
  avatar: string;
  rol: string;
}

interface EditUserFormData {
  id?: string; // Añade esta línea
  fullName: string;
  username: string;
  email: string;
  rolId: number;
  avatar: string;
}

interface UsuariosTableProps {
  usuarios: any[];
  handleEdit: (id: string) => void;
  handleDelete: (id: string) => void;
}

async function getUsuarios() {
  const res = await authFetch("/api/usuarios", { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Error al obtener usuarios");
  }
  return res.json();
}

function UsuariosTable({
  usuarios,
  handleEdit,
  handleDelete,
}: UsuariosTableProps) {
  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "fullName", headerName: "Nombre completo", width: 200 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "username", headerName: "Usuario", width: 150 },
    { field: "rol", headerName: "Rol", width: 150 },
    {
      field: "acciones",
      headerName: "Acciones",
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <IconButton onClick={() => handleEdit(params.row.id)} size="small">
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row.id)} size="small">
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ height: 400, width: "100%" }}>
      <DataGrid
        rows={usuarios}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 5 },
          },
        }}
        pageSizeOptions={[5, 10]}
      />
    </Box>
  );
}

const UsuariosPage = () => {
  const [usuarios, setUsuarios] = React.useState<Usuario[]>([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<EditUserFormData | null>(null);
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);

  const handleDeleteClick = (id: string) => {
    setUserToDelete(id);
    setDeleteConfirmOpen(true);
  };

  React.useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const data = await getUsuarios();
        setUsuarios(data);
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
      }
    };
    fetchUsuarios();
    const fetchRoles = async () => {
      try {
        const rolesData = await authFetch("/api/roles");
        setRoles(await rolesData.json());
      } catch (error) {
        console.error("Error al obtener roles:", error);
      }
    };
    fetchRoles();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      const response = await authFetch(`/api/usuarios/${userToDelete}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setUsuarios((prevUsuarios) =>
          prevUsuarios.filter((usuario) => usuario.id !== userToDelete)
        );
        setSnackbarMessage("Usuario eliminado con éxito");
        setSnackbarSeverity("success");
      } else {
        setSnackbarMessage("Error al eliminar el usuario");
        setSnackbarSeverity("error");
      }
    } catch (error) {
      setSnackbarMessage("Error al realizar la solicitud DELETE");
      setSnackbarSeverity("error");
    } finally {
      setOpenSnackbar(true);
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
    }
  };

  const handleEditClick = async (id: string) => {
    try {
      const response = await authFetch(`/api/usuarios/${id}`);
      const userData = await response.json();
      setEditingUser({
        id,
        fullName: userData.fullName,
        username: userData.username,
        email: userData.email,
        rolId: userData.rol.id,
        avatar: userData.avatar,
      });
      setEditModalOpen(true);
    } catch (error) {
      console.error("Error al obtener datos del usuario:", error);
      setSnackbarMessage("Error al cargar datos del usuario");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const response = await authFetch(`/api/usuarios/${editingUser.id}`, {
        method: "PUT",
        body: JSON.stringify(editingUser),
      });

      if (response.ok) {
        setSnackbarMessage("Usuario actualizado con éxito");
        setSnackbarSeverity("success");
        const updatedUser = await response.json();
        setUsuarios((prevUsuarios) =>
          prevUsuarios.map((user) =>
            user.id === editingUser.id ? updatedUser : user
          )
        );
      } else {
        setSnackbarMessage("Error al actualizar el usuario");
        setSnackbarSeverity("error");
      }
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      setSnackbarMessage("Error al realizar la solicitud de actualización");
      setSnackbarSeverity("error");
    } finally {
      setOpenSnackbar(true);
      setEditModalOpen(false);
      setEditingUser(null);
    }
  };

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Gestión de Usuarios
      </Typography>
      <UsuariosTable
        usuarios={usuarios}
        handleEdit={handleEditClick}
        handleDelete={handleDeleteClick}
      />
      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" component="h2">
            Editar Usuario
          </Typography>
          <Box component="form" onSubmit={handleEditSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              margin="normal"
              label="Nombre completo"
              value={editingUser?.fullName || ""}
              onChange={(e) =>
                setEditingUser((prev) => ({
                  ...prev!,
                  fullName: e.target.value,
                }))
              }
            />
            <TextField
              fullWidth
              margin="normal"
              label="Nombre de usuario"
              value={editingUser?.username || ""}
              onChange={(e) =>
                setEditingUser((prev) => ({
                  ...prev!,
                  username: e.target.value,
                }))
              }
            />
            <TextField
              fullWidth
              margin="normal"
              label="Email"
              type="email"
              value={editingUser?.email || ""}
              onChange={(e) =>
                setEditingUser((prev) => ({ ...prev!, email: e.target.value }))
              }
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Rol</InputLabel>
              <Select
                value={editingUser?.rolId || ""}
                onChange={(e) =>
                  setEditingUser((prev) => ({
                    ...prev!,
                    rolId: e.target.value as number,
                  }))
                }
              >
                {roles.map((rol) => (
                  <MenuItem key={rol.id} value={rol.id}>
                    {rol.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              margin="normal"
              label="Avatar URL"
              value={editingUser?.avatar || ""}
              onChange={(e) =>
                setEditingUser((prev) => ({ ...prev!, avatar: e.target.value }))
              }
            />
            <Button type="submit" variant="contained" sx={{ mt: 2 }}>
              Guardar cambios
            </Button>
          </Box>
        </Box>
      </Modal>
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que quieres eliminar este usuario?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UsuariosPage;
