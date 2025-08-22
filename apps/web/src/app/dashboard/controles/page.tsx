"use client";

import { CrudAction } from "@/components/formV2/constants";
import ABMPage from "@/components/pageV2/ABMPage";
import ControlesForm, { schema } from "@/sections/controles/ControlesForm";
import ControlesTable from "@/sections/controles/ControlesTable";

const ControlesMecanicosPage = () => {
  return (
    <ABMPage
      apiEndpoint="/api/controles-mecanicos"
      table={ControlesTable}
      form={ControlesForm}
      crudActions={[CrudAction.ADD, CrudAction.EDIT, CrudAction.DELETE]}
      schema={schema}
    />
  );
};

export default ControlesMecanicosPage;
