import { useGeneratePdf } from "@/hooks/orden-reparacion/useGeneratePdf";
import { useMediaQuery, useTheme } from "@mui/material";
import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";

export const usePrintHandlers = (
  ordenId: number,
  onError: (message: string) => void
) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Refs for printing
  const mechanicOrderRef = useRef(null);
  const internClientOrderRef = useRef(null);

  // State for print menu
  const [printMenuAnchor, setPrintMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const openPrintMenu = Boolean(printMenuAnchor);

  const { generatePdf } = useGeneratePdf({
    onError: () => {
      onError("Error al generar el PDF del cliente");
    },
    printDirectly: true,
  });

  // Print handlers
  const handleMechanicOrderPrint = useReactToPrint({
    content: () => mechanicOrderRef.current,
  });

  const handleClientOrderPrint = async () => {
    await generatePdf(`/api/orden-reparacion/${ordenId}/pdf-completo`);
  };

  const handleInternClientOrderPrint = useReactToPrint({
    content: () => internClientOrderRef.current,
  });

  const handlePdfPrint = (pdfPath?: string) => {
    if (pdfPath) {
      window.open(pdfPath, "_blank");
    }
  };

  // Menu handlers
  const handleOpenPrintMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setPrintMenuAnchor(event.currentTarget);
  };

  const handleClosePrintMenu = () => {
    setPrintMenuAnchor(null);
  };

  return {
    isMobile,
    mechanicOrderRef,
    internClientOrderRef,
    printMenuAnchor,
    openPrintMenu,
    handleMechanicOrderPrint,
    handleClientOrderPrint,
    handleInternClientOrderPrint,
    handlePdfPrint,
    handleOpenPrintMenu,
    handleClosePrintMenu,
  };
};
