"use client";

import { useSnackbarContext } from "@/contexts/SnackbarContext";
import useRecibo from "@/hooks/useRecibo";
import RecibosModal from "@/sections/ingresos-reparacion/RecibosModal";
import { getFormattedDate, getFormattedPrice } from "@/utils/fieldHelper";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Link as MuiLink,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useIngresoReparacion } from "./contexts/IngresoReparacionContext";

function useHeaderSticky() {
  const [isSticky, setIsSticky] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef(false);

  const measure = useCallback(() => {
    if (headerRef.current && !stickyRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      if (!stickyRef.current && scrollTop > 120) {
        stickyRef.current = true;
        setIsSticky(true);
      } else if (stickyRef.current && scrollTop < 40) {
        stickyRef.current = false;
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return { isSticky, headerHeight, headerRef };
}

function IngresoReparacionHeader() {
  const { ingreso } = useIngresoReparacion();
  const { setSnackbar } = useSnackbarContext();
  const { generateRecibo } = useRecibo();
  const { isSticky, headerHeight, headerRef } = useHeaderSticky();

  const [pdfUrl, setPdfUrl] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIngreso, setSelectedIngreso] = useState<{
    id: string;
  } | null>(null);
  const [reciboLoading, setReciboLoading] = useState(false);
  const [reciboSnackbar, setReciboSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const handleSendRecibo = async () => {
    setReciboLoading(true);
    try {
      const url = await generateRecibo({ id: ingreso.id.toString() });
      setSelectedIngreso({ id: ingreso.id.toString() });
      setPdfUrl(`${url}#zoom=100`);
      setModalOpen(true);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error al generar el recibo",
        severity: "error",
      });
    } finally {
      setReciboLoading(false);
    }
  };

  const clienteNombre = ingreso.cliente?.fullName || "Sin cliente";

  const orden = ingreso.ordenReparacion;
  const ordenId = orden?.id;
  const autoLabel = orden?.auto
    ? [orden.auto.patent, orden.auto.brand, orden.auto.model]
        .filter(Boolean)
        .join(" ")
    : "";

  return (
    <>
      {isSticky && <Box sx={{ height: headerHeight }} />}

      <Box
        ref={headerRef}
        sx={{
          position: isSticky ? "fixed" : "relative",
          top: isSticky ? 64 : "auto",
          left: isSticky ? { xs: 0, sm: 240 } : "auto",
          right: isSticky ? 0 : "auto",
          zIndex: isSticky ? 1000 : "auto",
          backgroundColor: "background.default",
          borderBottom: "1px solid",
          borderColor: "divider",
          py: isSticky ? 1 : 2,
          mb: isSticky ? 0 : 3,
          px: isSticky ? 3 : 0,
          transition: isSticky ? "none" : "padding 0.2s ease",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: isSticky ? 1 : 2,
            px: isSticky ? 0 : 2,
          }}
        >
          {/* Info */}
          <Box
            sx={{
              display: "flex",
              alignItems: isSticky ? "center" : "flex-start",
              gap: isSticky ? 2 : 0,
              flexDirection: isSticky ? "row" : "column",
            }}
          >
            <Typography
              variant={isSticky ? "h6" : "h4"}
              component="h1"
              sx={{
                fontWeight: 600,
                fontSize: isSticky
                  ? "1rem"
                  : { xs: "1.5rem", md: "2rem" },
                whiteSpace: isSticky ? "nowrap" : "normal",
              }}
            >
              Ingreso #{ingreso.id}
              {isSticky
                ? ` - ${autoLabel.split(" ")[0] || clienteNombre.split(" ")[0]}`
                : ` - ${autoLabel}`}
            </Typography>

            {!isSticky && (
              <>
                <Typography variant="body2" color="text.secondary">
                  Fecha: {getFormattedDate(ingreso.fecha)} — OdR{" "}
                  <Link
                    href={`/dashboard/ordenes-reparacion/${ordenId}`}
                    style={{ textDecoration: "underline" }}
                  >
                    #{ordenId}
                  </Link>
                  {" — "}
                  {clienteNombre}
                </Typography>
                <Box sx={{ display: "flex", gap: 3, mt: 1 }}>
                  <Typography variant="body1" fontWeight="medium">
                    Monto:{" "}
                    <Typography component="span" fontWeight="bold">
                      {getFormattedPrice(ingreso.monto)}
                    </Typography>
                  </Typography>
                  {ingreso.ordenReparacion?.deuda !== undefined && (
                    <Typography
                      variant="body1"
                      fontWeight="medium"
                      color={
                        ingreso.ordenReparacion.deuda > 0
                          ? "error"
                          : "success.main"
                      }
                    >
                      Deuda OdR:{" "}
                      <Typography
                        component="span"
                        fontWeight="bold"
                        color={
                          ingreso.ordenReparacion.deuda > 0
                            ? "error"
                            : "success.main"
                        }
                      >
                        {getFormattedPrice(ingreso.ordenReparacion.deuda)}
                      </Typography>
                    </Typography>
                  )}
                </Box>
                <Link
                  href="/dashboard/ingresos-reparacion"
                  passHref
                  legacyBehavior
                >
                  <MuiLink
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.5,
                      fontSize: "0.875rem",
                      mt: 0.5,
                      textDecoration: "none",
                      color: "primary.main",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    <ArrowBackIcon sx={{ fontSize: 16 }} />
                    Volver a ingresos
                  </MuiLink>
                </Link>
              </>
            )}

            {isSticky && (
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <Typography variant="body2" fontWeight="medium">
                  Monto:{" "}
                  <Typography
                    component="span"
                    fontWeight="bold"
                    variant="body2"
                  >
                    {getFormattedPrice(ingreso.monto)}
                  </Typography>
                </Typography>
              </Box>
            )}
          </Box>

          {/* Actions */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: isSticky ? 0.5 : 1,
            }}
          >
            <Chip
              label={
                ingreso.reciboEnviado ? "Recibo Enviado" : "Recibo Pendiente"
              }
              color={ingreso.reciboEnviado ? "success" : "default"}
              size={isSticky ? "small" : "medium"}
              sx={{ fontWeight: 500 }}
            />
            <Chip
              label={ingreso.moneda}
              color={ingreso.moneda === "Dolar" ? "success" : "warning"}
              size={isSticky ? "small" : "medium"}
              variant="outlined"
            />
            <Button
              variant="outlined"
              size={isSticky ? "small" : "medium"}
              startIcon={
                !isSticky &&
                (reciboLoading ? (
                  <CircularProgress size={20} />
                ) : (
                  <SendIcon />
                ))
              }
              onClick={handleSendRecibo}
              disabled={reciboLoading}
              sx={{ textTransform: "none" }}
            >
              {isSticky ? (
                reciboLoading ? (
                  <CircularProgress size={16} />
                ) : (
                  <SendIcon fontSize="small" />
                )
              ) : (
                "Generar Recibo"
              )}
            </Button>
          </Box>
        </Box>
      </Box>

      {selectedIngreso && (
        <RecibosModal
          modalOpen={modalOpen}
          setModalOpen={setModalOpen}
          pdfUrl={pdfUrl}
          selectedIngreso={selectedIngreso}
          setSnackbar={setReciboSnackbar}
        />
      )}
    </>
  );
}

export default IngresoReparacionHeader;
