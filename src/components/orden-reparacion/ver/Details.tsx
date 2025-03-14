"use client";
import { getFormattedPrice } from "@/utils/fieldHelper";
import BuildIcon from "@mui/icons-material/Build";
import CommentIcon from "@mui/icons-material/Comment";
import EngineeringIcon from "@mui/icons-material/Engineering";
import InventoryIcon from "@mui/icons-material/Inventory";
import {
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useState } from "react";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function Details({ ordenReparacion }: { ordenReparacion: any }) {
  const [tabValue, setTabValue] = useState(0);
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Detalles de la Reparación
      </Typography>
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        aria-label="detalles de reparación tabs"
      >
        <Tab icon={<BuildIcon />} label="Trabajos Realizados" />
        <Tab icon={<InventoryIcon />} label="Repuestos Utilizados" />
        <Tab
          icon={<EngineeringIcon />}
          label="Reparación / Repuestos de terceros"
        />
        <Tab icon={<CommentIcon />} label="Observaciones" />
      </Tabs>
      <TabPanel value={tabValue} index={0}>
        <List>
          {ordenReparacion.trabajosRealizados.map(
            (trabajo: {
              id: string;
              descripcion: string;
              precioUnitario: number;
            }) => (
              <ListItem key={trabajo.id}>
                <ListItemText
                  primary={trabajo.descripcion}
                  secondary={`Precio: ${getFormattedPrice(
                    trabajo.precioUnitario
                  )}`}
                />
              </ListItem>
            )
          )}
        </List>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <List>
          {ordenReparacion.repuestosUsados.map(
            (repuesto: {
              id: string;
              stock: { name: string };
              unidadesConsumidas: number;
              precioVenta: number;
            }) => (
              <ListItem key={repuesto.id}>
                <ListItemText
                  primary={repuesto.stock.name}
                  secondary={`Cantidad: ${
                    repuesto.unidadesConsumidas
                  } - Precio: ${getFormattedPrice(repuesto.precioVenta)}`}
                />
              </ListItem>
            )
          )}
        </List>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <List>
          {ordenReparacion.reparacionesDeTercero.map(
            (reparacion: {
              id: string;
              nombre: string;
              proveedor: { name: string };
              precioCompra: string;
              precioVenta: string;
              recibo: string;
            }) => (
              <ListItem key={reparacion.id}>
                <ListItemText
                  primary={`${reparacion.nombre} - Proveedor: ${reparacion.proveedor.name}`}
                  secondary={`Precio de compra: ${getFormattedPrice(
                    reparacion.precioCompra
                  )} - Precio de venta: ${getFormattedPrice(
                    reparacion.precioVenta
                  )}`}
                />
                {reparacion.recibo && (
                  <Box sx={{ mr: 5 }}>
                    <Link href={reparacion.recibo} target="_blank">
                      <Button size="small" color="primary">
                        Ver recibo
                      </Button>
                    </Link>
                  </Box>
                )}
              </ListItem>
            )
          )}
        </List>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Typography variant="subtitle2" gutterBottom>
          Observaciones del Cliente:
        </Typography>
        <Typography paragraph>
          {ordenReparacion.observacionesCliente || "-"}
        </Typography>

        <Typography variant="subtitle2" gutterBottom>
          Observaciones de Entrada:
        </Typography>
        <Typography paragraph>
          {JSON.parse(ordenReparacion.observacionesEntrada || "[]").join(
            ", "
          ) || "-"}
        </Typography>

        <Typography variant="subtitle2" gutterBottom>
          Observaciones de Salida:
        </Typography>
        <Typography paragraph>
          {JSON.parse(ordenReparacion.observacionesSalida || "[]").join(", ") ||
            "-"}
        </Typography>
      </TabPanel>
    </Box>
  );
}

export default Details;
