"use client";

import CrudTable from "@/components/CrudTable";
import { FieldConfig } from "@/components/DynamicForm";
import { Box, Tab, Tabs } from "@mui/material";
import React, { useState } from "react";
import * as yup from "yup";

interface PagoAMecanico {
  id: string;
  ordenReparacion: {
    id: number;
    auto: {
      marca: string;
      modelo: string;
      owner: {
        nombre: string;
        apellido: string;
      };
    };
  };
  monto: number | null;
  fechaPago: string | null;
}

const PagosAMecanicoPage = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    {
      field: "ordenReparacion",
      headerName: "ID Reparación",
      width: 200,
      valueGetter: (ordenReparacion: any) =>
        `#${ordenReparacion.id} - ${ordenReparacion.auto.patent} ${
          ordenReparacion.auto.brand || ""
        } ${ordenReparacion.auto.model || ""} - ${
          ordenReparacion.auto.owner.name || ""
        } ${ordenReparacion.auto.owner.fullName || ""}`,
    },
    {
      field: "monto",
      headerName: "Monto",
      width: 120,
      valueGetter: (monto: any) => (monto ? `$${monto}` : "-"),
    },
    {
      field: "fechaPago",
      headerName: "Fecha de Pago",
      width: 150,
      valueGetter: (fechaPago: any) => fechaPago || "-",
    },
  ];

  const formFields: FieldConfig[] = [
    { name: "monto", label: "Monto", type: "number" },
    { name: "fechaPago", label: "Fecha de Pago", type: "date" },
  ];

  const createNewPagoAMecanico = (): PagoAMecanico => {
    return {
      id: "",
      ordenReparacion: {
        id: 0,
        auto: {
          marca: "",
          modelo: "",
          owner: {
            nombre: "",
            apellido: "",
          },
        },
      },
      monto: null,
      fechaPago: null,
    };
  };

  return (
    <Box>
      <Tabs value={tabValue} onChange={handleTabChange}>
        <Tab label="Pendientes" />
        <Tab label="Todos" />
      </Tabs>
      <Box mt={2}>
        {tabValue === 0 && (
          <CrudTable<PagoAMecanico>
            title="Pagos a Mecánico Pendientes"
            columns={columns}
            apiEndpoint="/api/pago-a-mecanico?onlyNullMonto=true"
            fields={formFields}
            createNewItem={createNewPagoAMecanico}
            validationSchema={yup.object({
              monto: yup.number().required("El monto es requerido"),
              fechaPago: yup.date().required("La fecha de pago es requerida"),
            })}
            shouldRenderDelete={() => false}
          />
        )}
        {tabValue === 1 && (
          <CrudTable<PagoAMecanico>
            title="Todos los Pagos a Mecánico"
            columns={columns}
            apiEndpoint="/api/pago-a-mecanico"
            fields={formFields}
            createNewItem={createNewPagoAMecanico}
            validationSchema={yup.object({
              monto: yup.number().required("El monto es requerido"),
              fechaPago: yup.date().required("La fecha de pago es requerida"),
            })}
            shouldRenderDelete={() => false}
          />
        )}
      </Box>
    </Box>
  );
};

export default PagosAMecanicoPage;
