"use client";

import { CrudAction } from "@/components/formV2/constants";
import ABMPage from "@/components/pageV2/ABMPage";
import PerdidaForm, { schema } from "@/sections/perdida/PerdidaForm";
import PerdidaTable from "@/sections/perdida/PerdidaTable";

const PerdidaPage = () => {
  return (
    <ABMPage
      apiEndpoint="/api/perdida"
      table={PerdidaTable}
      form={PerdidaForm}
      crudActions={[CrudAction.EDIT, CrudAction.ADD, CrudAction.DELETE]}
      schema={schema}
    />
  );
};

export default PerdidaPage;
