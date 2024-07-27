"use client";

import CrudTable from "@/components/CrudTable";
import { FieldConfig } from "@/components/DynamicForm";
import { Box, Tab, Tabs } from "@mui/material";
import { GridRowParams } from "@mui/x-data-grid";
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
    { field: "id", headerName: "ID", flex: 0.5 },
    {
      field: "ordenReparacion",
      headerName: "ID Reparación",
      valueGetter: (ordenReparacion: any) =>
        `#${ordenReparacion.id} - ${ordenReparacion.auto.patent} ${
          ordenReparacion.auto.brand || ""
        } ${ordenReparacion.auto.model || ""}
        - ${ordenReparacion.auto.owner.name || ""} ${
          ordenReparacion.auto.owner.fullName || ""
        } - ${
          ordenReparacion.fechaEntradaReparacion
            ? new Date(
                ordenReparacion.fechaEntradaReparacion
              ).toLocaleDateString("es-AR")
            : "sin fecha de ingreso"
        }`,
      flex: 4,
    },
    {
      field: "mecanico",
      headerName: "Mecánico",
      renderCell: (params: any) => {
        const mecanicos = params.row.ordenReparacion?.mecanicos || [];
        return mecanicos.length > 0
          ? mecanicos.map((m: any) => `${m.name}`).join(", ")
          : "NO ASIGNADO";
      },
      flex: 2,
    },
    {
      field: "monto",
      headerName: "Monto",
      flex: 1,
      valueGetter: (monto: any) => (monto ? `$${monto}` : "NO PAGADO"),
    },
    {
      field: "fechaPago",
      headerName: "Fecha de Pago",
      flex: 1,
      valueGetter: (fechaPago: any) =>
        fechaPago ? new Date(fechaPago).toLocaleDateString() : "NO PAGADO",
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

  const getRowClassName = (params: GridRowParams) => {
    if (params.row.monto === null) {
      return "low-stock-row";
    }
    return "";
  };

  return (
    <Box>
      <Tabs value={tabValue} onChange={handleTabChange}>
        <Tab label="Todos" />
        <Tab label="Pendientes" />
      </Tabs>
      <Box mt={2}>
        {tabValue === 1 && (
          <CrudTable<PagoAMecanico>
            title="Mecánico Pendientes"
            columns={columns}
            apiEndpoint="/api/pago-a-mecanico?onlyNullMonto=true"
            fields={formFields}
            getRowClassName={getRowClassName}
            validationSchema={yup.object({
              monto: yup.number().required("El monto es requerido"),
              fechaPago: yup.date().required("La fecha de pago es requerida"),
            })}
            shouldRenderDelete={() => false}
          />
        )}
        {tabValue === 0 && (
          <CrudTable<PagoAMecanico>
            title="Pagos a Mecánico"
            columns={columns}
            apiEndpoint="/api/pago-a-mecanico"
            fields={formFields}
            getRowClassName={getRowClassName}
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
