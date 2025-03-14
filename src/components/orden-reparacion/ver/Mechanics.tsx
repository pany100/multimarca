"use client";
import EngineeringIcon from "@mui/icons-material/Engineering";
import { Box, List, ListItem, Typography } from "@mui/material";

function Mechanics({ ordenReparacion }: { ordenReparacion: any }) {
  return (
    <>
      <Typography variant="h6" gutterBottom>
        <EngineeringIcon sx={{ mr: 1, verticalAlign: "middle" }} />
        Mecánicos Asignados
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        <List>
          {ordenReparacion.mecanicos.map(
            (mecanico: {
              id: string;
              name: string;
              detalle: string | null;
            }) => (
              <ListItem key={mecanico.id}>
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                  • {mecanico.name}
                </Typography>
                {mecanico.detalle && (
                  <Typography key={mecanico.id} variant="body1">
                    : {mecanico.detalle}
                  </Typography>
                )}
              </ListItem>
            )
          )}
        </List>
      </Box>
    </>
  );
}

export default Mechanics;
