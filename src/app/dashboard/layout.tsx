"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AssessmentIcon from "@mui/icons-material/Assessment";
import BuildIcon from "@mui/icons-material/Build";
import CalculateIcon from "@mui/icons-material/Calculate";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import DateRangeIcon from "@mui/icons-material/DateRange";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import InventoryIcon from "@mui/icons-material/Inventory";
import LockIcon from "@mui/icons-material/Lock";
import MenuIcon from "@mui/icons-material/Menu";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import PeopleIcon from "@mui/icons-material/People";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import {
  Alert,
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
  Snackbar,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import "src/app/globals.css";
// Importa los iconos necesarios
import { useFetch } from "@/contexts/FetchContext";
import { useSocket } from "@/hooks/useSocket";

import { boschColors } from "@/theme";
import AlarmIcon from "@mui/icons-material/Alarm";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { default as AttachMoneyIcon } from "@mui/icons-material/AttachMoney";
import BarChartIcon from "@mui/icons-material/BarChart";
import CategoryIcon from "@mui/icons-material/Category";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import GroupIcon from "@mui/icons-material/Group";
import HolidayVillageIcon from "@mui/icons-material/HolidayVillage";
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
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const pathname = usePathname();
  const { isLoading, authFetch } = useFetch();
  const socket = useSocket();
  const [cantidadNotificaciones, setCantidadNotificaciones] = useState(0);
  const [notificacionesWhatsappNoLeidas, setNotificacionesWhatsappNoLeidas] =
    useState(0);

  useEffect(() => {
    const fetchNotificaciones = async () => {
      try {
        const response = await authFetch(
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
  }, [authFetch]);

  const fetchWhatsappNoLeido = useCallback(async () => {
    try {
      const response = await authFetch(
        "/api/notificaciones-whatsapp/no-leidas"
      );
      if (response.ok) {
        const data = await response.json();
        setNotificacionesWhatsappNoLeidas(data.cantidadNoLeidas);
      }
    } catch (error) {
      console.error("Error al obtener notificaciones:", error);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchWhatsappNoLeido();
  }, [fetchWhatsappNoLeido]);

  useEffect(() => {
    if (socket) {
      socket.on("newNotification", (data?: { texto: string }) => {
        setCantidadNotificaciones((prev) => prev + 1);
        if (data?.texto) {
          setNotificationMessage(data.texto);
          setNotificationOpen(true);
        }
      });

      socket.on("whatsappNotification", () => {
        fetchWhatsappNoLeido();
      });

      socket.on("readNotification", () => {
        setCantidadNotificaciones((prev) => Math.max(0, prev - 1));
      });

      return () => {
        socket.off("newNotification");
        socket.off("deletedNotification");
        socket.off("whatsappNotification");
      };
    }
  }, [socket, fetchWhatsappNoLeido]);

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
        title: "Administración de Usuarios",
        icono: <PeopleIcon />,
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
        title: "Clientes",
        icono: <DirectionsCarIcon />,
        items: [
          {
            permiso: "Clientes",
            texto: "Clientes",
            icono: <PersonIcon />,
            ruta: "/dashboard/clientes",
          },
          {
            permiso: "Autos",
            texto: "Vehículos",
            icono: <DirectionsCarIcon />,
            ruta: "/dashboard/autos",
          },
        ],
      },
      {
        title: "Gestión de Taller",
        icono: <BuildIcon />,
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
            texto: "Presupuestos",
            icono: <CalculateIcon />,
            ruta: "/dashboard/presupuestos",
          },
          {
            permiso: "Reparaciones",
            texto: "Plantilla Presupuesto",
            icono: <ContentPasteIcon />,
            ruta: "/dashboard/plantilla-presupuesto",
          },
          {
            permiso: "Reparaciones",
            texto: "Órdenes de Reparación",
            icono: <AssignmentIcon />,
            ruta: "/dashboard/ordenes-reparacion",
          },
          {
            permiso: "PagosReparaciones",
            texto: "Pagos a Mecánicos",
            icono: <PaymentIcon />,
            ruta: "/dashboard/pagos-a-mecanico",
          },
          {
            permiso: "Agenda",
            texto: "Feriados",
            icono: <HolidayVillageIcon />,
            ruta: "/dashboard/feriados",
          },
          {
            permiso: "Agenda",
            texto: "Turnos",
            icono: <CalendarMonthIcon />,
            ruta: "/dashboard/turnos",
          },
          {
            permiso: "Agenda",
            texto: "Agenda",
            icono: <DateRangeIcon />,
            ruta: "/dashboard/agenda",
          },
        ],
      },
      {
        title: "Inventario y Compras",
        icono: <InventoryIcon />,
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
        icono: <AssessmentIcon />,
        items: [
          {
            permiso: "Estadisticas",
            texto: "Estadísticas Generales",
            icono: <BarChartIcon />,
            ruta: "/dashboard/estadisticas",
          },
          {
            permiso: "Estadisticas",
            texto: "Balances",
            icono: <QueryStatsIcon />,
            ruta: "/dashboard/balance",
          },
          {
            permiso: "Estadisticas",
            texto: "Mecánicos",
            icono: <BuildIcon />,
            ruta: "/dashboard/estadisticasMecanicos",
          },
        ],
      },
      {
        title: "Finanzas",
        icono: <AccountBalanceIcon />,
        items: [
          {
            permiso: "Cheques",
            texto: "Cheques",
            icono: <ReceiptLongIcon />,
            ruta: "/dashboard/cheques",
          },
          {
            permiso: "IngresoDinero",
            texto: "Ingreso Manual",
            icono: <MonetizationOnIcon />,
            ruta: "/dashboard/ingresos-manuales",
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
            permiso: "GastosExclusivos",
            texto: "Permisos de Gastos",
            icono: <LockIcon />,
            ruta: "/dashboard/permisos-gasto",
          },
          {
            permiso: "TipoDeOperacion",
            texto: "Tipo de Operación",
            icono: <ReceiptLongIcon />,
            ruta: "/dashboard/tipo-de-operacion",
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
          {
            permiso: "Ingresos",
            texto: "Pagos de ventas",
            icono: <AccountBalanceIcon />,
            ruta: "/dashboard/ingresos-ventas",
          },
          {
            permiso: "Ingresos",
            texto: "Deudores",
            icono: <RequestQuoteIcon />,
            ruta: "/dashboard/deudores",
          },
        ],
      },
      {
        title: "Comunicación y Notificaciones",
        icono:
          cantidadNotificaciones + notificacionesWhatsappNoLeidas > 0 ? (
            <Badge
              badgeContent={
                cantidadNotificaciones + notificacionesWhatsappNoLeidas
              }
              color="error"
              sx={{ ml: 1 }}
            />
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
            texto: "WhatsApp",
            icono: (
              <Badge
                badgeContent={notificacionesWhatsappNoLeidas}
                color="error"
              >
                <WhatsAppIcon />
              </Badge>
            ),
            ruta: "/dashboard/whatsapp",
          },
          {
            permiso: "NotificacionesClientes",
            texto: "Recordatorios",
            icono: <AlarmIcon />,
            ruta: "/dashboard/recordatorios",
          },
          {
            permiso: "NotificacionesClientes",
            texto: "Templates de WhatsApp",
            icono: <ContentPasteIcon />,
            ruta: "/dashboard/templates-whatsapp",
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
    [cantidadNotificaciones, notificacionesWhatsappNoLeidas]
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
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          height: 64,
        }}
      >
        {(!drawerCompressed || isMobile) && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Image
              src="/bosch-icon.svg"
              onClick={() => router.push("/dashboard")}
              alt="MT Service"
              width={40}
              height={40}
              style={{ borderRadius: "8px", cursor: "pointer" }}
            />
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  color: "primary.main",
                  lineHeight: 1.2,
                }}
              >
                MT Service
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                }}
              >
                Multimarca
              </Typography>
            </Box>
          </Box>
        )}
        {!isMobile && (
          <Tooltip
            title={drawerCompressed ? "Expandir menú" : "Comprimir menú"}
          >
            <IconButton
              onClick={handleDrawerCompress}
              sx={{
                bgcolor: "action.hover",
                "&:hover": { bgcolor: "action.selected" },
              }}
            >
              {drawerCompressed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <List
        sx={{
          flex: 1,
          px: 1,
          py: 2,
          overflowY: "auto",
          "&::-webkit-scrollbar": {
            width: "4px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(0,0,0,0.2)",
            borderRadius: "2px",
          },
        }}
      >
        {menuSections.map(
          (section, index) =>
            section.items.some((item) => permisos.includes(item.permiso)) && (
              <Box key={index}>
                <ListItem
                  button
                  onClick={() => handleSectionToggle(section.title)}
                  sx={{
                    mb: 0.5,
                    borderRadius: 1,
                    bgcolor: openSections[section.title]
                      ? "primary.main"
                      : "transparent",
                    color: openSections[section.title] ? "white" : "inherit",
                    "&:hover": {
                      bgcolor: openSections[section.title]
                        ? "primary.dark"
                        : "action.hover",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: drawerCompressed && !isMobile ? 0 : 40,
                      color: openSections[section.title] ? "white" : "inherit",
                    }}
                  >
                    {section.icono}
                  </ListItemIcon>
                  {(!drawerCompressed || isMobile) && (
                    <>
                      <ListItemText
                        primary={section.title}
                        sx={{
                          "& .MuiListItemText-primary": {
                            fontWeight: 500,
                            fontSize: "0.875rem",
                          },
                        }}
                      />
                      {openSections[section.title] ? (
                        <ExpandLess />
                      ) : (
                        <ExpandMore />
                      )}
                    </>
                  )}
                </ListItem>
                <Collapse in={openSections[section.title]} timeout="auto">
                  <List
                    component="div"
                    sx={{
                      py: 0.5,
                      pl: drawerCompressed && !isMobile ? 0 : 2,
                    }}
                  >
                    {section.items.map(
                      (item, itemIndex) =>
                        permisos.includes(item.permiso) && (
                          <ListItem
                            key={itemIndex}
                            button
                            component={Link}
                            href={item.ruta}
                            onClick={handleMenuItemClick}
                            sx={{
                              mb: 0.5,
                              borderRadius: 1,
                              pl: 2,
                              color: pathname.startsWith(item.ruta)
                                ? "primary.main"
                                : "text.primary",
                              bgcolor: pathname.startsWith(item.ruta)
                                ? "action.selected"
                                : "transparent",
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
                                    fontWeight: pathname.startsWith(item.ruta)
                                      ? 600
                                      : 400,
                                    fontSize: "0.875rem",
                                  },
                                }}
                              />
                            )}
                          </ListItem>
                        )
                    )}
                  </List>
                </Collapse>
              </Box>
            )
        )}
      </List>
    </Box>
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
          elevation={1}
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            backgroundColor: boschColors.boschBlue[100],
            borderBottom: 0,
          }}
        >
          <Toolbar sx={{ justifyContent: "space-between", height: 64 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{
                  mr: 2,
                  display: { md: "none" },
                  color: boschColors.white,
                }}
              >
                <MenuIcon />
              </IconButton>
              <Typography
                variant="h6"
                noWrap
                sx={{
                  color: boschColors.white,
                  fontWeight: 500,
                }}
              >
                {pathname === "/dashboard"
                  ? "Dashboard"
                  : menuSections
                      .flatMap((section) => section.items)
                      .find((item) => pathname.startsWith(item.ruta))?.texto ||
                    "Dashboard"}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <IconButton
                sx={{ color: boschColors.white }}
                onClick={() =>
                  router.push("/dashboard/notificaciones-internas")
                }
              >
                <Badge badgeContent={cantidadNotificaciones} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>

              <IconButton
                sx={{ color: boschColors.white }}
                onClick={() => router.push("/dashboard/whatsapp")}
              >
                <Badge
                  badgeContent={notificacionesWhatsappNoLeidas}
                  color="error"
                >
                  <WhatsAppIcon />
                </Badge>
              </IconButton>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  p: 1,
                  borderRadius: 1,
                  bgcolor: "action.hover",
                }}
              >
                <PersonIcon sx={{ color: boschColors.white }} />
                <Typography
                  variant="body2"
                  sx={{
                    color: boschColors.white,
                    fontWeight: 500,
                    display: { xs: "none", sm: "block" },
                  }}
                >
                  {userName}
                </Typography>
              </Box>

              <Tooltip title="Cerrar sesión">
                <IconButton
                  onClick={() => {
                    logout();
                    router.push("/login");
                  }}
                  sx={{
                    color: boschColors.white,
                    "&:hover": { bgcolor: "error.lighter" },
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
            minHeight: "100vh",
            backgroundColor: "background.paper",
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
          <Container>
            <Box
              sx={{
                mb: 3,
                display: "flex",
                alignItems: "center",
              }}
            >
              <Typography
                variant="body2"
                component="a"
                onClick={() => window.history.back()}
                sx={{
                  cursor: "pointer",
                  color: "text.secondary",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  textDecoration: "none",
                  "&:hover": {
                    color: "primary.main",
                    textDecoration: "none",
                  },
                  fontWeight: 500,
                  fontSize: "0.875rem",
                }}
              >
                <Box component="span" sx={{ fontSize: "1.2rem" }}>
                  ←
                </Box>
                Volver
              </Typography>
            </Box>
            {children}
          </Container>
        </Box>
      </Box>
      <Snackbar
        open={notificationOpen}
        autoHideDuration={5000}
        onClose={() => setNotificationOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ mt: "40px" }}
      >
        <Alert
          onClose={() => setNotificationOpen(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {notificationMessage}
        </Alert>
      </Snackbar>
    </ProtectedRoute>
  );
};

export default DashboardLayout;
