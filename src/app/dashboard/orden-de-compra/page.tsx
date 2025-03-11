"use client";

import { CrudAction } from "@/components/formV2/constants";
import ABMPage from "@/components/pageV2/ABMPage";
import OrdenDeCompraForm, {
  schema,
} from "@/sections/orden-de-compra/OrdenDeCompraForm";
import OrdenDeCompraTable from "@/sections/orden-de-compra/OrdenDeCompraTable";

const OrdenDeCompraPage = () => {
  return (
    <ABMPage
      apiEndpoint="/api/orden-de-compra"
      table={OrdenDeCompraTable}
      form={OrdenDeCompraForm}
      schema={schema}
      crudActions={[CrudAction.ADD, CrudAction.EDIT, CrudAction.DELETE]}
    />
  );
};

export default OrdenDeCompraPage;
