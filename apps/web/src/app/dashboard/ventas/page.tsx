"use client";

import { CrudAction } from "@/components/formV2/constants";
import ABMPage from "@/components/pageV2/ABMPage";
import { schema } from "@/sections/ventas/VentasForm";
import VentasTable from "@/sections/ventas/VentasTable";

const VentasPage = () => {
  return (
    <ABMPage
      apiEndpoint="/api/ventas"
      table={VentasTable}
      schema={schema}
      crudActions={[CrudAction.ADD, CrudAction.DELETE]}
    />
  );
};

export default VentasPage;
