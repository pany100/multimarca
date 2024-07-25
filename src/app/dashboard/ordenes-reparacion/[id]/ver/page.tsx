import authFetch from "@/utils/authFetch";
import { Box, Checkbox, Grid, Paper, Typography } from "@mui/material";
import { notFound } from "next/navigation";

async function getOrdenReparacion(id: string) {
  const response = await authFetch(`/api/orden-reparacion/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch orden de reparación");
  }

  return response.json();
}

export default async function VerOrdenReparacion({
  params,
}: {
  params: { id: string };
}) {
  const ordenReparacion = await getOrdenReparacion(params.id);
  console.log(JSON.stringify(ordenReparacion));
  if (!ordenReparacion) {
    notFound();
  }

  return (
    <Paper elevation={3} sx={{ p: 3, m: 2 }}>
      <Typography variant="h4" gutterBottom>
        Orden de Reparación #{ordenReparacion.id}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6">Información del Auto</Typography>
          <Box>
            <Typography>Marca: {ordenReparacion.auto.brand}</Typography>
            <Typography>Modelo: {ordenReparacion.auto.model}</Typography>
            <Typography>Año: {ordenReparacion.auto.year}</Typography>
            <Typography>Patente: {ordenReparacion.auto.patent}</Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h6">Información del Cliente</Typography>
          <Box>
            <Typography>
              Nombre: {ordenReparacion.auto.owner.fullName}
            </Typography>
            <Typography>
              Teléfono: {ordenReparacion.auto.owner.phone}
            </Typography>
            <Typography>Email: {ordenReparacion.auto.owner.email}</Typography>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6">Detalles de la Reparación</Typography>
          <Box>
            <Typography>Estado: {ordenReparacion.estado}</Typography>
            <Typography>
              Fecha de Entrada:{" "}
              {new Date(
                ordenReparacion.fechaEntradaReparacion
              ).toLocaleDateString()}
            </Typography>
            <Typography>
              Fecha de Salida:{" "}
              {ordenReparacion.fechaSalidaReparacion
                ? new Date(
                    ordenReparacion.fechaSalidaReparacion
                  ).toLocaleDateString()
                : "N/A"}
            </Typography>
            <Typography>Kilómetros: {ordenReparacion.kilometros}</Typography>
            <Typography>
              Observaciones del Cliente: {ordenReparacion.observacionesCliente}
            </Typography>
            <Typography>
              Observaciones de Entrada: {ordenReparacion.observacionesEntrada}
            </Typography>
            <Typography>
              Observaciones de Salida: {ordenReparacion.observacionesSalida}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6">Mecánicos Asignados</Typography>
          <Box>
            {ordenReparacion.mecanicos.map(
              (mecanico: { id: string; name: string }) => (
                <Typography key={mecanico.id}>{mecanico.name}</Typography>
              )
            )}
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6">Repuestos Usados</Typography>
          <Box>
            {ordenReparacion.repuestosUsados.map(
              (repuesto: {
                id: string;
                stock: { name: string };
                unidadesConsumidas: number;
              }) => (
                <Typography key={repuesto.id}>
                  {repuesto.stock.name} - Cantidad:{" "}
                  {repuesto.unidadesConsumidas}
                </Typography>
              )
            )}
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6">Reparaciones de Terceros</Typography>
          <Box>
            {ordenReparacion.reparacionesDeTercero.map(
              (reparacion: {
                id: string;
                nombre: string;
                proveedor: { name: string };
              }) => (
                <Typography key={reparacion.id}>
                  {reparacion.nombre} - Proveedor: {reparacion.proveedor.name}
                </Typography>
              )
            )}
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6">Trabajos Realizados</Typography>
          <Box>
            {ordenReparacion.trabajosRealizados.map(
              (trabajo: {
                id: string;
                descripcion: string;
                precioUnitario: number;
              }) => (
                <Typography key={trabajo.id}>
                  {trabajo.descripcion} - Precio: ${trabajo.precioUnitario}
                </Typography>
              )
            )}
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6">Controles en Reparación</Typography>
          <Box>
            {ordenReparacion.controlesEnReparacion.map(
              (control: {
                id: string;
                controlMecanico: { name: string; type: string };
                valor: string;
              }) => (
                <Box key={control.id} display="flex" alignItems="center">
                  <Typography>{control.controlMecanico.name}:</Typography>
                  {control.controlMecanico.type === "checkbox" ? (
                    <Checkbox
                      checked={Boolean(control.valor === "true")}
                      disabled
                      sx={{ ml: 1 }}
                    />
                  ) : (
                    <Typography sx={{ ml: 1 }}>{control.valor}</Typography>
                  )}
                </Box>
              )
            )}
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6">Monto Total para el Cliente</Typography>
          <Typography>${ordenReparacion.montoTotalCliente}</Typography>
        </Grid>
      </Grid>
    </Paper>
  );
}
