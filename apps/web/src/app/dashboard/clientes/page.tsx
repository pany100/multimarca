"use client";

import { CrudAction } from "@/components/formV2/constants";
import ABMPage from "@/components/pageV2/ABMPage";
import ClientesForm, { schema } from "@/sections/clientes/ClientesForm";
import ClientesTable from "@/sections/clientes/ClientesTable";

const ClientesPage = () => {
  return (
    <ABMPage
      apiEndpoint="/api/clientes"
      table={ClientesTable}
      form={ClientesForm}
      crudActions={[CrudAction.ADD, CrudAction.EDIT, CrudAction.DELETE]}
      schema={schema}
    />
  );
};

export default ClientesPage;
