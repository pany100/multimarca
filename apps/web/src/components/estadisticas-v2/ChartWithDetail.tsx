"use client";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import React from "react";

export interface TableColumn {
  key: string;
  label: string;
  align?: "left" | "right" | "center";
  format?: (value: any) => string;
  render?: (value: any, row: Record<string, any>) => React.ReactNode;
  sx?: Record<string, any>;
  headerSx?: Record<string, any>;
}

interface ChartWithDetailProps {
  title: string;
  icon?: React.ReactNode;
  chart: React.ReactNode;
  columns: TableColumn[];
  rows: Record<string, any>[];
  loading?: boolean;
  emptyMessage?: string;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(value);
}

export { formatCurrency };

export default function ChartWithDetail({
  title,
  icon,
  chart,
  columns,
  rows,
  loading = false,
  emptyMessage = "Sin datos disponibles",
}: ChartWithDetailProps) {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        {icon}
        {title}
      </Typography>

      <Box sx={{ p: 3 }}>
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height={300}
          >
            <CircularProgress />
          </Box>
        ) : rows.length === 0 ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height={200}
          >
            <Typography color="text.secondary">{emptyMessage}</Typography>
          </Box>
        ) : (
          <>
            {chart}

            <Accordion
              elevation={0}
              sx={{ mt: 2, border: "1px solid", borderColor: "divider" }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2" fontWeight={600}>
                  Ver detalle ({rows.length} registros)
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <TableContainer sx={{ maxHeight: 400 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        {columns.map((col) => (
                          <TableCell
                            key={col.key}
                            align={col.align ?? "left"}
                            sx={{ fontWeight: 700, ...col.headerSx }}
                          >
                            {col.label}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row, idx) => (
                        <TableRow key={idx} hover>
                          {columns.map((col) => (
                            <TableCell key={col.key} align={col.align ?? "left"} sx={col.sx}>
                              {col.render
                                ? col.render(row[col.key], row)
                                : col.format
                                  ? col.format(row[col.key])
                                  : row[col.key] ?? "-"}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          </>
        )}
      </Box>
    </Paper>
  );
}
