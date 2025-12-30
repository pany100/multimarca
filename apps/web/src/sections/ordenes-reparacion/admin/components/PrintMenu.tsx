import PrintIcon from "@mui/icons-material/Print";
import {
  Box,
  Button,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";

interface PrintMenuProps {
  isMobile: boolean;
  printMenuAnchor: HTMLElement | null;
  openPrintMenu: boolean;
  pdfPath?: string;
  handleOpenPrintMenu: (event: React.MouseEvent<HTMLButtonElement>) => void;
  handleClosePrintMenu: () => void;
  handleMechanicOrderPrint: () => void;
  handleInternClientOrderPrint: () => void;
  handleClientOrderPrint: () => void;
  handlePdfPrint: (pdfPath?: string) => void;
}

export const PrintMenu = ({
  isMobile,
  printMenuAnchor,
  openPrintMenu,
  pdfPath,
  handleOpenPrintMenu,
  handleClosePrintMenu,
  handleMechanicOrderPrint,
  handleInternClientOrderPrint,
  handleClientOrderPrint,
  handlePdfPrint,
}: PrintMenuProps) => {
  return (
    <>
      {/* Print dropdown for desktop */}
      {!isMobile ? (
        <>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<PrintIcon />}
            onClick={handleOpenPrintMenu}
            aria-label="Opciones de impresión"
            aria-controls={openPrintMenu ? "print-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={openPrintMenu ? "true" : undefined}
            sx={{ textTransform: "none" }}
          >
            Imprimir
          </Button>
          <Menu
            id="print-menu"
            anchorEl={printMenuAnchor}
            open={openPrintMenu}
            onClose={handleClosePrintMenu}
            MenuListProps={{
              "aria-labelledby": "print-button",
            }}
          >
            <MenuItem
              onClick={() => {
                handleMechanicOrderPrint();
                handleClosePrintMenu();
              }}
            >
              <ListItemIcon>
                <PrintIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText>Para mecánico</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleInternClientOrderPrint();
                handleClosePrintMenu();
              }}
            >
              <ListItemIcon>
                <PrintIcon fontSize="small" color="warning" />
              </ListItemIcon>
              <ListItemText>Orden interna</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleClientOrderPrint();
                handleClosePrintMenu();
              }}
            >
              <ListItemIcon>
                <PrintIcon fontSize="small" color="secondary" />
              </ListItemIcon>
              <ListItemText>Para cliente</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                handlePdfPrint(pdfPath);
                handleClosePrintMenu();
              }}
              disabled={!pdfPath}
            >
              <ListItemIcon>
                <PrintIcon fontSize="small" color="action" />
              </ListItemIcon>
              <ListItemText>Salida del scanner</ListItemText>
            </MenuItem>
          </Menu>
        </>
      ) : (
        // Mobile print buttons
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Imprimir para mecánico">
            <IconButton
              color="primary"
              onClick={handleMechanicOrderPrint}
              aria-label="Imprimir para mecánico"
            >
              <PrintIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Imprimir orden interna">
            <IconButton
              color="warning"
              onClick={handleInternClientOrderPrint}
              aria-label="Imprimir orden interna"
            >
              <PrintIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Imprimir para cliente">
            <IconButton
              color="secondary"
              onClick={handleClientOrderPrint}
              aria-label="Imprimir para cliente"
            >
              <PrintIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Imprimir salida de scanner">
            <span>
              <IconButton
                color="default"
                onClick={() => handlePdfPrint(pdfPath)}
                aria-label="Imprimir salida de scanner"
                disabled={!pdfPath}
              >
                <PrintIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      )}
    </>
  );
};
