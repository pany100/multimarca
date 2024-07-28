"use client";

import CrudTable from "@/components/CrudTable";
import { FieldConfig } from "@/components/DynamicForm";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { IconButton, Tooltip } from "@mui/material";
import { useRouter } from "next/navigation";

import * as yup from "yup";

interface Cliente {
  id: string;
  phone: string | null;
  fullName: string;
  email: string | null;
  birthday: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  tax_status: string | null;
  dni: string | null;
  can_receive_notifications: boolean;
}

const ClientesPage = () => {
  const router = useRouter();

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "fullName", headerName: "Nombre completo", flex: 1.5 },
    { field: "email", headerName: "Email", flex: 1.5 },
    { field: "phone", headerName: "Teléfono", flex: 1 },
    {
      field: "cars",
      headerName: "Vehículos",
      flex: 3,
      renderCell: (params: any) => (
        <ul>
          {params.row.cars.map((car: any) => (
            <li key={car.id}>{`${car.brand} ${car.model} (${car.patent})`}</li>
          ))}
        </ul>
      ),
    },
  ];

  const formFields: FieldConfig[] = [
    {
      name: "fullName",
      label: "Nombre completo",
      type: "text",
      layout: {
        xs: 6,
      },
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      layout: {
        xs: 6,
      },
    },
    {
      name: "phone",
      label: "Teléfono",
      type: "text",
      layout: {
        xs: 6,
      },
    },
    {
      name: "birthday",
      label: "Fecha de nacimiento",
      type: "date",
      layout: {
        xs: 6,
      },
    },
    {
      name: "tax_status",
      label: "Estado fiscal",
      type: "text",
      layout: {
        xs: 6,
      },
    },
    {
      name: "dni",
      label: "DNI",
      type: "text",
      layout: {
        xs: 6,
      },
    },
    {
      name: "address",
      label: "Dirección",
      type: "text",
      layout: {
        xs: 6,
      },
    },
    {
      name: "city",
      label: "Ciudad",
      type: "text",
      layout: {
        xs: 6,
      },
    },
    {
      name: "state",
      label: "Estado/Provincia",
      type: "text",
      layout: {
        xs: 6,
      },
    },
    {
      name: "postal_code",
      label: "Código postal",
      type: "text",
      layout: {
        xs: 6,
      },
    },
  ];

  const createNewCliente = (): Cliente => {
    return {
      id: "",
      phone: null,
      fullName: "",
      email: null,
      birthday: null,
      address: null,
      city: null,
      state: null,
      postal_code: null,
      tax_status: null,
      dni: null,
      can_receive_notifications: true,
    };
  };

  const extraActions = (cliente: Cliente) => (
    <>
      <Tooltip title="Ver detalles">
        <IconButton
          onClick={() => router.push(`/dashboard/clientes/${cliente.id}/ver`)}
          size="small"
        >
          <VisibilityIcon />
        </IconButton>
      </Tooltip>
    </>
  );

  return (
    <CrudTable<Cliente>
      title="Clientes"
      columns={columns}
      apiEndpoint="/api/clientes"
      createNewItem={createNewCliente}
      fields={formFields}
      extraActions={extraActions}
      validationSchema={yup.object({
        fullName: yup.string().required("El nombre es requerido"),
        email: yup.string().email("El email es inválido").nullable(),
        phone: yup.string().required("El teléfono es requerido"),
        dni: yup
          .string()
          .matches(/^\d+$/, "El DNI debe contener solo números")
          .nullable(),
        birthday: yup
          .date()
          .typeError("La fecha de nacimiento debe ser una fecha válida")
          .nullable(),
        address: yup.string().nullable(),
        city: yup.string().nullable(),
        state: yup.string().nullable(),
        postal_code: yup.string().nullable(),
        tax_status: yup.string().nullable(),
      })}
    />
  );
};

export default ClientesPage;
