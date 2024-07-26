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
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import "src/app/globals.css";

// Importa los iconos necesarios
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import BuildIcon from "@mui/icons-material/Build";
import CategoryIcon from "@mui/icons-material/Category";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DescriptionIcon from "@mui/icons-material/Description";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import GroupIcon from "@mui/icons-material/Group";
import InventoryIcon from "@mui/icons-material/Inventory";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PaymentIcon from "@mui/icons-material/Payment";
import PersonIcon from "@mui/icons-material/Person";
import ReceiptIcon from "@mui/icons-material/Receipt";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import WorkIcon from "@mui/icons-material/Work";
import { Tooltip } from "@mui/material";
import Image from "next/image";
import "src/app/globals.css";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { userData, logout } = useAuth();
  const permisos = userData?.permisos || [];
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerCompressed, setDrawerCompressed] = useState(false);
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleDrawerCompress = () => {
    setDrawerCompressed(!drawerCompressed);
  };

  // Definir las opciones del menú con sus respectivos iconos
  const menuOptions = [
    {
      permiso: "Usuarios",
      texto: "Usuarios",
      icono: <PersonIcon />,
      ruta: "/dashboard/usuarios",
    },
    {
      permiso: "Roles",
      texto: "Roles",
      icono: <GroupIcon />,
      ruta: "/dashboard/roles",
    },
    {
      permiso: "Clientes",
      texto: "Clientes",
      icono: <PersonIcon />,
      ruta: "/dashboard/clientes",
    },
    {
      permiso: "Autos",
      texto: "Autos",
      icono: <DirectionsCarIcon />,
      ruta: "/dashboard/autos",
    },
    {
      permiso: "Controles",
      texto: "Controles",
      icono: <BuildIcon />,
      ruta: "/dashboard/controles",
    },
    {
      permiso: "Trabajos",
      texto: "Mano de obra",
      icono: <WorkIcon />,
      ruta: "/dashboard/mano-de-obra",
    },
    {
      permiso: "Mecanicos",
      texto: "Mecanicos",
      icono: <BuildIcon />,
      ruta: "/dashboard/mecanicos",
    },
    {
      permiso: "Proveedores",
      texto: "Proveedores",
      icono: <LocalShippingIcon />,
      ruta: "/dashboard/proveedores",
    },
    {
      permiso: "Stock",
      texto: "Stock",
      icono: <InventoryIcon />,
      ruta: "/dashboard/stock",
    },
    {
      permiso: "OrdenesCompra",
      texto: "OrdenesCompra",
      icono: <ReceiptIcon />,
      ruta: "/dashboard/orden-de-compra",
    },
    {
      permiso: "RetirosDinero",
      texto: "Extracciones",
      icono: <MoneyOffIcon />,
      ruta: "/dashboard/extracciones",
    },
    {
      permiso: "Gastos",
      texto: "Gastos",
      icono: <AttachMoneyIcon />,
      ruta: "/dashboard/gastos",
    },
    {
      permiso: "CategoriaGasto",
      texto: "Categorias de Gasto",
      icono: <CategoryIcon />,
      ruta: "/dashboard/categorias-gasto",
    },
    {
      permiso: "Ventas",
      texto: "Ventas",
      icono: <ShoppingCartIcon />,
      ruta: "/dashboard/ventas",
    },
    {
      permiso: "NotificacionesClientes",
      texto: "Notificaciones WhatsApp",
      icono: <WhatsAppIcon />,
      ruta: "/dashboard/notificaciones-whatsapp",
    },
    {
      permiso: "NotificacionesClientes",
      texto: "Administrador Notificaciones",
      icono: <NotificationsIcon />,
      ruta: "/dashboard/admin-notificaciones",
    },
    {
      permiso: "Reparaciones",
      texto: "Ordenes de Reparación",
      icono: <AssignmentIcon />,
      ruta: "/dashboard/ordenes-reparacion",
    },
    {
      permiso: "Reparaciones",
      texto: "Presupuestos",
      icono: <DescriptionIcon />,
      ruta: "/dashboard/presupuestos",
    },
    {
      permiso: "PagosReparaciones",
      texto: "PagosReparaciones",
      icono: <PaymentIcon />,
      ruta: "/dashboard/pagos-a-mecanico",
    },
    {
      permiso: "Ingresos",
      texto: "Ingresos",
      icono: <AccountBalanceIcon />,
      ruta: "/dashboard/ingresos-reparacion",
    },
  ];

  return (
    <ProtectedRoute>
      <Box sx={{ display: "flex" }}>
        <Drawer
          variant={isMobile ? "temporary" : "persistent"}
          open={isMobile ? drawerOpen : true}
          onClose={handleDrawerToggle}
          sx={{
            width: drawerCompressed ? 60 : 240,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerCompressed ? 60 : 240,
              boxSizing: "border-box",
              overflowX: "hidden",
              transition: theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              p: 2,
              justifyContent: "space-between",
              transition: theme.transitions.create("padding", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            }}
          >
            {!drawerCompressed && (
              <>
                <Image
                  src="/mtservice-icon.png"
                  alt="MT Service"
                  width={40}
                  height={40}
                />
                <Typography
                  variant="h6"
                  noWrap
                  sx={{
                    flexGrow: 1,
                    ml: 2,
                    transition: theme.transitions.create(
                      ["margin", "opacity"],
                      {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                      }
                    ),
                    opacity: drawerCompressed ? 0 : 1,
                  }}
                >
                  MT Service Multimarca
                </Typography>
              </>
            )}
            <IconButton onClick={handleDrawerCompress}>
              {drawerCompressed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </Box>
          <List>
            {menuOptions.map(
              (option, index) =>
                permisos.includes(option.permiso) && (
                  <Tooltip
                    key={index}
                    title={drawerCompressed ? option.texto : ""}
                    placement="right"
                  >
                    <ListItem
                      button
                      component={Link}
                      href={option.ruta}
                      sx={{
                        justifyContent: drawerCompressed
                          ? "center"
                          : "flex-start",
                        px: drawerCompressed ? 0 : 2,
                        transition: theme.transitions.create(
                          ["padding", "justify-content"],
                          {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.enteringScreen,
                          }
                        ),
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: drawerCompressed ? 0 : 40,
                          mr: drawerCompressed ? 0 : 2,
                          justifyContent: "center",
                          transition: theme.transitions.create(
                            ["min-width", "margin-right"],
                            {
                              easing: theme.transitions.easing.sharp,
                              duration:
                                theme.transitions.duration.enteringScreen,
                            }
                          ),
                        }}
                      >
                        {option.icono}
                      </ListItemIcon>
                      <ListItemText
                        primary={option.texto}
                        sx={{
                          opacity: drawerCompressed ? 0 : 1,
                          display: drawerCompressed ? "none" : "block",
                          transition: theme.transitions.create(
                            ["opacity", "display"],
                            {
                              easing: theme.transitions.easing.sharp,
                              duration:
                                theme.transitions.duration.enteringScreen,
                            }
                          ),
                        }}
                      />
                    </ListItem>
                  </Tooltip>
                )
            )}
          </List>
        </Drawer>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - ${drawerCompressed ? 60 : 240}px)` },
            transition: theme.transitions.create(["margin", "width"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }}
        >
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, ...(drawerOpen && { display: "none" }) }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Container maxWidth="lg">
            <Typography variant="h4" component="h1" gutterBottom>
              Dashboard
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="body2"
                component="a"
                onClick={() => window.history.back()}
                sx={{ cursor: "pointer", textDecoration: "underline", mr: 2 }}
              >
                Volver
              </Typography>
              <Typography
                variant="body2"
                component="a"
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
                sx={{ cursor: "pointer", textDecoration: "underline" }}
              >
                Logout
              </Typography>
            </Box>
            {children}
          </Container>
        </Box>
      </Box>
    </ProtectedRoute>
  );
};

export default DashboardLayout;
