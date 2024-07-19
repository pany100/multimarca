"use client";
import Link from "next/link";
import React, { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Container, Typography, Box } from "@mui/material";
import { useAuth } from "@/hooks/useAuth";
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

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
                  <ListItem button>
                    <ListItemText primary="Roles" />
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
