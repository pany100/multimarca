"use client";

import { CrudAction } from "@/components/formV2/constants";
import ABMPage from "@/components/pageV2/ABMPage";
import FeriadosForm, { schema } from "@/sections/feriados/FeriadosForm";
import FeriadosTable from "@/sections/feriados/FeriadosTable";

const FeriadosPage = () => {
  return (
    <ABMPage
      apiEndpoint="/api/feriados"
      table={FeriadosTable}
      form={FeriadosForm}
      schema={schema}
      crudActions={[CrudAction.ADD, CrudAction.EDIT, CrudAction.DELETE]}
    />
  );
};

export default FeriadosPage;
