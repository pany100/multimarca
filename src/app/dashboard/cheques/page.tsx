"use client";

import { CrudAction } from "@/components/formV2/constants";
import ABMPage from "@/components/pageV2/ABMPage";
import ChequesForm, { schema } from "@/sections/cheques/ChequesForm";
import ChequesTable from "@/sections/cheques/ChequesTable";

const ChequesPage = () => {
  return (
    <ABMPage
      apiEndpoint="/api/cheques"
      table={ChequesTable}
      form={ChequesForm}
      schema={schema}
      crudActions={[CrudAction.EDIT, CrudAction.DELETE]}
    />
  );
};

export default ChequesPage;
