"use client";

import { Box, Typography } from "@mui/material";

export default function RolAdminPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Administrar rol
      </Typography>
      <Typography color="text.secondary">
        Admin page for role (id: {params.id})
      </Typography>
    </Box>
  );
}
