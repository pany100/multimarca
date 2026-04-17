"use client";

import { useOrdenDeCompraContext } from "@/sections/orden-de-compra/admin/contexts/OrdenDeCompraContext";
import { Box } from "@mui/material";
import { OrdenDeCompraInfo } from "./OrdenDeCompraInfo";
import { useOrdenDeCompraSticky } from "./useOrdenDeCompraSticky";

function OrdenDeCompraHeader() {
  const { orden } = useOrdenDeCompraContext();
  const isSticky = useOrdenDeCompraSticky();

  return (
    <>
      {isSticky && <Box sx={{ height: 80 }} />}

      <Box
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
          transition: "all 0.2s ease",
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
          <OrdenDeCompraInfo orden={orden} isSticky={isSticky} />
        </Box>
      </Box>
    </>
  );
}

export default OrdenDeCompraHeader;
