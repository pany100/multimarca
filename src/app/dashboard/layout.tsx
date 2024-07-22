"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import MenuIcon from "@mui/icons-material/Menu";
import {
  Box,
  Container,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import Link from "next/link";
import React, { useState } from "react";
import "src/app/globals.css";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { userData } = useAuth();
  const permisos = userData?.permisos || [];
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <ProtectedRoute>
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="body2"
              component="a"
              onClick={() => window.history.back()}
              sx={{ cursor: "pointer", textDecoration: "underline" }}
            >
              Volver
            </Typography>
          </Box>
          <Box sx={{ display: "flex" }}>
            <IconButton onClick={() => setDrawerOpen(true)}>
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor="left"
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
            >
              <List>
                {permisos.includes("Usuarios") && (
                  <ListItem button component={Link} href="/dashboard/usuarios">
                    <ListItemText primary="Usuarios" />
                  </ListItem>
                )}
                {permisos.includes("Roles") && (
                  <ListItem button component={Link} href="/dashboard/roles">
                    <ListItemText primary="Roles" />
                  </ListItem>
                )}
                {permisos.includes("Clientes") && (
                  <ListItem button component={Link} href="/dashboard/clientes">
                    <ListItemText primary="Clientes" />
                  </ListItem>
                )}
                {permisos.includes("Autos") && (
                  <ListItem button component={Link} href="/dashboard/autos">
                    <ListItemText primary="Autos" />
                  </ListItem>
                )}
                {permisos.includes("Controles") && (
                  <ListItem button component={Link} href="/dashboard/controles">
                    <ListItemText primary="Controles" />
                  </ListItem>
                )}
                {permisos.includes("Trabajos") && (
                  <ListItem
                    button
                    component={Link}
                    href="/dashboard/mano-de-obra"
                  >
                    <ListItemText primary="Mano de obra" />
                  </ListItem>
                )}
                {permisos.includes("Mecanicos") && (
                  <ListItem button component={Link} href="/dashboard/mecanicos">
                    <ListItemText primary="Mecanicos" />
                  </ListItem>
                )}
                {permisos.includes("Proveedores") && (
                  <ListItem
                    button
                    component={Link}
                    href="/dashboard/proveedores"
                  >
                    <ListItemText primary="Proveedores" />
                  </ListItem>
                )}
                {permisos.includes("Stock") && (
                  <ListItem button component={Link} href="/dashboard/stock">
                    <ListItemText primary="Stock" />
                  </ListItem>
                )}
                {permisos.includes("OrdenesCompra") && (
                  <ListItem
                    button
                    component={Link}
                    href="/dashboard/orden-de-compra"
                  >
                    <ListItemText primary="OrdenesCompra" />
                  </ListItem>
                )}
                {permisos.includes("RetirosDinero") && (
                  <ListItem
                    button
                    component={Link}
                    href="/dashboard/extracciones"
                  >
                    <ListItemText primary="Extracciones" />
                  </ListItem>
                )}
                {permisos.includes("Gastos") && (
                  <ListItem button component={Link} href="/dashboard/gastos">
                    <ListItemText primary="Gastos" />
                  </ListItem>
                )}
                {permisos.includes("CategoriaGasto") && (
                  <ListItem
                    button
                    component={Link}
                    href="/dashboard/categorias-gasto"
                  >
                    <ListItemText primary="Categorias de Gasto" />
                  </ListItem>
                )}
                {permisos.includes("Ventas") && (
                  <ListItem button component={Link} href="/dashboard/ventas">
                    <ListItemText primary="Ventas" />
                  </ListItem>
                )}
              </List>
            </Drawer>
            <Box sx={{ flexGrow: 1, pl: 3 }}>{children}</Box>
          </Box>
        </Box>
      </Container>
    </ProtectedRoute>
  );
};

export default DashboardLayout;
