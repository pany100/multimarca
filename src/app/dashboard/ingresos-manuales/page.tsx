"use client";

import CrudTable from "@/components/CrudTable";
import { FieldConfig } from "@/components/DynamicForm";
import { useFetch } from "@/contexts/FetchContext";
import { getFormattedPrice } from "@/utils/fieldHelper";
import { Chip } from "@mui/material";
import { useEffect, useState } from "react";
import * as yup from "yup";

interface IngresoManual {
  id: string;
  monto: number;
  fecha: string;
  descripcion: string;
  moneda: "Peso" | "Dolar";
  dolarId?: number;
  usuarioId: number;
  usuario: {
    fullName: string;
  };
  tipoExtraccion:
    | "EFECTIVO"
    | "TRANSFERENCIA"
    | "CHEQUE"
    | "DEBITO_AUTOMATICO_TARJETA_CREDITO";
}

const IngresosPage = () => {
  const [usuarios, setUsuarios] = useState<{ value: number; label: string }[]>(
    []
  );
  const { authFetch } = useFetch();

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await authFetch("/api/usuarios/admins");
        const data = await response.json();
        const customUsuarios = data.map(
          (usuario: { id: number; fullName: string }) => ({
            value: usuario.id,
            label: usuario.fullName,
          })
        );
        setUsuarios(customUsuarios);
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
      }
    };
    fetchUsuarios();
  }, [authFetch]);

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    {
      field: "monto",
      headerName: "Monto",
      width: 100,
      valueGetter: (monto: any) => getFormattedPrice(monto),
    },
    {
      field: "moneda",
      headerName: "Moneda",
      width: 100,
      renderCell: (params: any) => (
        <Chip
          label={params.value}
          color={params.value === "Dolar" ? "success" : "warning"}
          size="small"
        />
      ),
    },
    {
      field: "fecha",
      headerName: "Fecha",
      width: 100,
      renderCell: (value: any) => new Date(value.value).toLocaleDateString(),
    },
    {
      field: "usuario",
      headerName: "Usuario",
      width: 180,
      renderCell: (value: any) => value.value.fullName,
    },
    { field: "descripcion", headerName: "Descripción", width: 250 },
    {
      field: "tipoExtraccion",
      headerName: "Tipo de Operación",
      width: 180,
      renderCell: (params: any) =>
        params.value === "DEBITO_AUTOMATICO_TARJETA_CREDITO"
          ? "DEBITO AUTOMATICO"
          : params.value,
    },
  ];

  const formFields: FieldConfig[] = [
    {
      name: "monto",
      label: "Monto",
      type: "number",
      layout: {
        xs: 6,
      },
    },
    {
      name: "fecha",
      label: "Fecha",
      type: "date",
      layout: {
        xs: 6,
      },
    },
    {
      name: "moneda",
      label: "Moneda",
      type: "select",
      options: [
        { label: "Dolar", value: "Dolar" },
        { label: "Peso", value: "Peso" },
      ],
    },
    {
      name: "usuarioId",
      label: "Usuario",
      type: "select",
      options: usuarios,
      getInitialValue(item: any) {
        const usuario = usuarios.find((u) => u.value === item.usuarioId);
        return {
          value: usuario ? usuario.value : "",
          label: usuario ? usuario.label : "",
        };
      },
    },
    {
      name: "descripcion",
      label: "Descripción",
      type: "text",
    },
    {
      name: "tipoExtraccion",
      label: "Tipo de Operación",
      type: "select",
      options: [
        { label: "Efectivo", value: "EFECTIVO" },
        { label: "Transferencia", value: "TRANSFERENCIA" },
        { label: "Cheque", value: "CHEQUE" },
        {
          label: "Débito Automático tarjeta crédito",
          value: "DEBITO_AUTOMATICO_TARJETA_CREDITO",
        },
      ],
    },
  ];

  const createNewIngreso = (): IngresoManual => {
    return {
      id: "",
      monto: 0,
      fecha: new Date().toISOString().split("T")[0],
      descripcion: "",
      moneda: "Peso",
      usuarioId: 0,
      usuario: {
        fullName: "",
      },
      tipoExtraccion: "EFECTIVO",
    };
  };

  return (
    <CrudTable<IngresoManual>
      title="Ingresos Manuales"
      columns={columns}
      apiEndpoint="/api/ingresos-manuales"
      fields={formFields}
      createNewItem={createNewIngreso}
      validationSchema={yup.object({
        monto: yup
          .number()
          .required("El monto es requerido")
          .positive("El monto debe ser positivo"),
        moneda: yup.string().required("La moneda es requerida"),
        fecha: yup.date().required("La fecha es requerida"),
        descripcion: yup.string().required("La descripción es requerida"),
        usuarioId: yup.number().required("El usuario es requerido"),
        tipoExtraccion: yup
          .string()
          .oneOf(
            [
              "EFECTIVO",
              "TRANSFERENCIA",
              "CHEQUE",
              "DEBITO_AUTOMATICO_TARJETA_CREDITO",
            ],
            "Tipo de extracción inválido"
          )
          .required("El tipo de extracción es requerido"),
      })}
    />
  );
};

export default IngresosPage;
