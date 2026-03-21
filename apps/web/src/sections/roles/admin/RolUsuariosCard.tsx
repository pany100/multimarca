"use client";

import {
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import type { RolUsuarioResumen } from "./types";

/** No listar al usuario sistema / admin principal (p. ej. vos). */
const USUARIO_OCULTO_EN_LISTA_ROL_ID = 1;

type Props = {
  usuarios: RolUsuarioResumen[];
};

export function RolUsuariosCard({ usuarios }: Props) {
  const visibles = usuarios.filter((u) => u.id !== USUARIO_OCULTO_EN_LISTA_ROL_ID);

  return (
    <Card>
      <CardContent sx={{ py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
          Usuarios con este rol
        </Typography>
        {visibles.length === 0 ? (
          <Typography color="text.secondary" variant="body2">
            Ningún usuario tiene asignado este rol.
          </Typography>
        ) : (
          <List dense disablePadding>
            {visibles.map((u) => (
              <ListItem key={u.id} disableGutters sx={{ py: 0.5 }}>
                <ListItemText
                  primary={u.fullName}
                  secondary={`${u.email} · @${u.username}`}
                  primaryTypographyProps={{ variant: "body2" }}
                  secondaryTypographyProps={{ variant: "caption" }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}
