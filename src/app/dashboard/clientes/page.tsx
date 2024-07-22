"use client";

import CrudTable from "@/components/CrudTable";

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
  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "fullName", headerName: "Nombre completo", width: 200 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "phone", headerName: "Teléfono", width: 150 },
    {
      field: "cars",
      headerName: "Vehículos",
      width: 300,
      renderCell: (params: any) => (
        <ul>
          {params.row.cars.map((car: any) => (
            <li key={car.id}>{`${car.brand} ${car.model} (${car.patent})`}</li>
          ))}
        </ul>
      ),
    },
  ];

  const formFields: FormField[] = [
    { name: "fullName", label: "Nombre completo", type: "text" },
    { name: "email", label: "Email", type: "email" },
    { name: "phone", label: "Teléfono", type: "text" },
    { name: "birthday", label: "Fecha de nacimiento", type: "date" },
    { name: "address", label: "Dirección", type: "text" },
    { name: "city", label: "Ciudad", type: "text" },
    { name: "state", label: "Estado/Provincia", type: "text" },
    { name: "postal_code", label: "Código postal", type: "text" },
    { name: "tax_status", label: "Estado fiscal", type: "text" },
    { name: "dni", label: "DNI", type: "text" },
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

  return (
    <CrudTable<Cliente>
      title="Gestión de Clientes"
      columns={columns}
      apiEndpoint="/api/clientes"
      createNewItem={createNewCliente}
      fields={formFields}
    />
  );
};

export default ClientesPage;
