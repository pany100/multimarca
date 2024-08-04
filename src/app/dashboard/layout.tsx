"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import MenuIcon from "@mui/icons-material/Menu";
import {
  AppBar,
  Badge,
  Box,
  Collapse,
  Container,
  Drawer,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import "src/app/globals.css";

// Importa los iconos necesarios
import { useFetch } from "@/contexts/FetchContext";
import { useSocket } from "@/hooks/useSocket";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import BarChartIcon from "@mui/icons-material/BarChart";
import BuildIcon from "@mui/icons-material/Build";
import CategoryIcon from "@mui/icons-material/Category";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DescriptionIcon from "@mui/icons-material/Description";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import GroupIcon from "@mui/icons-material/Group";
import InventoryIcon from "@mui/icons-material/Inventory";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import LogoutIcon from "@mui/icons-material/Logout";
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
  const userName = userData?.fullName || "Usuario";
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerCompressed, setDrawerCompressed] = useState(false);
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>(
    {}
  );
  const pathname = usePathname();
  const { isLoading } = useFetch();
  const socket = useSocket();
  const [cantidadNotificaciones, setCantidadNotificaciones] = useState(0);

  useEffect(() => {
    const fetchNotificaciones = async () => {
      try {
        const response = await fetch(
          "/api/notificaciones-internas/cant-no-leidas"
        );
        if (response.ok) {
          const data = await response.json();
          setCantidadNotificaciones(data.cantidadNoLeidas);
        }
      } catch (error) {
        console.error("Error al obtener notificaciones:", error);
      }
    };

    fetchNotificaciones();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("newNotification", () => {
        setCantidadNotificaciones((prev) => prev + 1);
      });

      socket.on("readNotification", () => {
        setCantidadNotificaciones((prev) => Math.max(0, prev - 1));
      });

      return () => {
        socket.off("newNotification");
        socket.off("deletedNotification");
      };
    }
  }, [socket]);

  useEffect(() => {
    if (socket) {
    }
  }, [socket]);

  useEffect(() => {
    setDrawerOpen(!isMobile);
  }, [isMobile]);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleDrawerCompress = () => {
    if (!isMobile) {
      setDrawerCompressed(!drawerCompressed);
    }
  };

  const handleSectionToggle = (title: string) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const handleMenuItemClick = () => {
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const menuSections = useMemo(
    () => [
      {
        title: "Gestión de Personal",
        items: [
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
            permiso: "Mecanicos",
            texto: "Mecánicos",
            icono: <BuildIcon />,
            ruta: "/dashboard/mecanicos",
          },
        ],
      },
      {
        title: "Clientes y Vehículos",
        items: [
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
        ],
      },
      {
        title: "Operaciones del Taller",
        items: [
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
            permiso: "Reparaciones",
            texto: "Órdenes de Reparación",
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
            texto: "Pagos a Mecánicos",
            icono: <PaymentIcon />,
            ruta: "/dashboard/pagos-a-mecanico",
          },
        ],
      },
      {
        title: "Inventario y Compras",
        items: [
          {
            permiso: "Stock",
            texto: "Stock",
            icono: <InventoryIcon />,
            ruta: "/dashboard/stock",
          },
          {
            permiso: "Proveedores",
            texto: "Proveedores",
            icono: <LocalShippingIcon />,
            ruta: "/dashboard/proveedores",
          },
          {
            permiso: "OrdenesCompra",
            texto: "Órdenes de Compra",
            icono: <ReceiptIcon />,
            ruta: "/dashboard/orden-de-compra",
          },
          {
            permiso: "Ventas",
            texto: "Ventas",
            icono: <ShoppingCartIcon />,
            ruta: "/dashboard/ventas",
          },
        ],
      },
      {
        title: "Estadísticas y Reportes",
        items: [
          {
            permiso: "Estadisticas",
            texto: "Estadísticas Generales",
            icono: <BarChartIcon />,
            ruta: "/dashboard/estadisticas",
          },
        ],
      },
      {
        title: "Finanzas",
        items: [
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
            texto: "Categorías de Gasto",
            icono: <CategoryIcon />,
            ruta: "/dashboard/categorias-gasto",
          },
          {
            permiso: "Ingresos",
            texto: "Pagos de reparación",
            icono: <AccountBalanceIcon />,
            ruta: "/dashboard/ingresos-reparacion",
          },
        ],
      },
      {
        title: "Comunicación y Notificaciones",
        icono:
          cantidadNotificaciones > 0 ? (
            <Badge badgeContent={cantidadNotificaciones} color="error" />
          ) : null,
        items: [
          {
            permiso: "Notificaciones",
            texto: "Notificaciones Internas",
            icono: (
              <Badge badgeContent={cantidadNotificaciones} color="error">
                <NotificationsIcon />
              </Badge>
            ),
            ruta: "/dashboard/notificaciones-internas",
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
        ],
      },
    ],
    [cantidadNotificaciones]
  );

  useEffect(() => {
    const newOpenSections = menuSections.reduce((acc, section) => {
      const isOpen = section.items.some((item) =>
        pathname.startsWith(item.ruta)
      );
      return { ...acc, [section.title]: isOpen };
    }, {});
    setOpenSections(newOpenSections);
  }, [pathname, menuSections]);

  const drawer = (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          p: 2,
          justifyContent: "space-between",
        }}
      >
        {(!drawerCompressed || isMobile) && (
          <>
            <Image
              src="/mtservice-icon.png"
              alt="MT Service"
              width={40}
              height={40}
            />
            <Typography variant="h6" noWrap sx={{ flexGrow: 1, ml: 2 }}>
              MT Service Multimarca
            </Typography>
          </>
        )}
        {!isMobile && (
          <IconButton onClick={handleDrawerCompress}>
            {drawerCompressed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        )}
      </Box>
      <List>
        {menuSections.map(
          (section, index) =>
            section.items.some((item) => permisos.includes(item.permiso)) && (
              <React.Fragment key={index}>
                <ListItem
                  button
                  onClick={() => handleSectionToggle(section.title)}
                  sx={{
                    bgcolor: openSections[section.title]
                      ? "action.selected"
                      : "inherit",
                  }}
                >
                  {section.icono && (
                    <ListItemIcon
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        margin: "8px",
                      }}
                    >
                      {section.icono}
                    </ListItemIcon>
                  )}
                  <Tooltip key={index} title={section.title} placement="right">
                    <ListItemText
                      primary={section.title}
                      sx={{
                        "& .MuiListItemText-primary": {
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontWeight: openSections[section.title]
                            ? "bold"
                            : "normal",
                        },
                      }}
                    />
                  </Tooltip>
                  {openSections[section.title] ? (
                    <ExpandLess />
                  ) : (
                    <ExpandMore />
                  )}
                </ListItem>
                <Collapse
                  in={openSections[section.title]}
                  timeout="auto"
                  unmountOnExit
                >
                  <List component="div" disablePadding>
                    {section.items.map(
                      (item, itemIndex) =>
                        permisos.includes(item.permiso) && (
                          <Tooltip
                            key={itemIndex}
                            title={item.texto}
                            placement="right"
                          >
                            <ListItem
                              button
                              component={Link}
                              href={item.ruta}
                              onClick={handleMenuItemClick}
                              sx={{
                                pl: 4,
                                justifyContent:
                                  drawerCompressed && !isMobile
                                    ? "center"
                                    : "flex-start",
                                bgcolor: pathname.startsWith(item.ruta)
                                  ? "action.selected"
                                  : "inherit",
                                "&:hover": {
                                  bgcolor: "action.hover",
                                },
                              }}
                            >
                              <ListItemIcon
                                sx={{
                                  minWidth:
                                    drawerCompressed && !isMobile ? 0 : 40,
                                  color: pathname.startsWith(item.ruta)
                                    ? "primary.main"
                                    : "inherit",
                                }}
                              >
                                {item.icono}
                              </ListItemIcon>
                              {(!drawerCompressed || isMobile) && (
                                <ListItemText
                                  primary={item.texto}
                                  sx={{
                                    "& .MuiListItemText-primary": {
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      fontWeight: pathname.startsWith(item.ruta)
                                        ? "bold"
                                        : "normal",
                                      color: pathname.startsWith(item.ruta)
                                        ? "primary.main"
                                        : "inherit",
                                    },
                                  }}
                                />
                              )}
                            </ListItem>
                          </Tooltip>
                        )
                    )}
                  </List>
                </Collapse>
              </React.Fragment>
            )
        )}
      </List>
    </>
  );

  return (
    <ProtectedRoute>
      {isLoading && (
        <LinearProgress
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
          }}
        />
      )}
      <Box sx={{ display: "flex" }}>
        <AppBar
          position="fixed"
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            backgroundColor: theme.palette.grey[800],
          }}
        >
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2, display: { md: "none" } }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" noWrap component="div">
                Dashboard
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="body1" sx={{ mr: 2 }}>
                {userName}
              </Typography>
              <Tooltip title="Cerrar sesión">
                <IconButton
                  color="inherit"
                  onClick={() => {
                    logout();
                    router.push("/login");
                  }}
                >
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Toolbar>
        </AppBar>
        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={drawerOpen}
          onClose={handleDrawerToggle}
          sx={{
            width: drawerCompressed && !isMobile ? 60 : 240,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerCompressed && !isMobile ? 60 : 240,
              boxSizing: "border-box",
              overflowX: "hidden",
              transition: theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }}
        >
          <Toolbar />
          {drawer}
        </Drawer>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: "100%", // Cambiado para usar todo el ancho disponible
            overflowX: "auto", // Permite desplazamiento horizontal si es necesario
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
          <Toolbar />
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
            </Box>
            {children}
          </Container>
        </Box>
      </Box>
    </ProtectedRoute>
  );
};

export default DashboardLayout;
