"use client";

import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Box, IconButton, Typography } from "@mui/material";
import { useState } from "react";

type SensitiveFieldProps = {
  value: string | null | undefined;
  placeholder?: string;
};

function SensitiveField({
  value,
  placeholder = "No especificado",
}: SensitiveFieldProps) {
  const [visible, setVisible] = useState(false);

  if (!value) {
    return <Typography>{placeholder}</Typography>;
  }

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <Typography>{visible ? value : "••••••••"}</Typography>
      <IconButton
        size="small"
        onClick={() => setVisible((prev) => !prev)}
        sx={{ p: 0.25 }}
      >
        {visible ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
      </IconButton>
    </Box>
  );
}

export default SensitiveField;
