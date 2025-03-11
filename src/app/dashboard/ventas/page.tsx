"use client";

import { CrudAction } from "@/components/formV2/constants";
import ABMPage from "@/components/pageV2/ABMPage";
import VentasForm, { schema } from "@/sections/ventas/VentasForm";
import VentasTable from "@/sections/ventas/VentasTable";

const VentasPage = () => {
  return (
    <ABMPage
      apiEndpoint="/api/ventas"
      table={VentasTable}
      form={VentasForm}
      schema={schema}
      crudActions={[CrudAction.ADD, CrudAction.EDIT, CrudAction.DELETE]}
    />
  );
};

export default VentasPage;
