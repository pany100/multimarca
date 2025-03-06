"use client";

import { CrudAction } from "@/components/formV2/constants";
import ABMPage from "@/components/pageV2/ABMPage";
import AutosForm, { schema } from "@/sections/autos/AutosForm";
import AutosTable from "@/sections/autos/AutosTable";

const AutosPage = () => {
  return (
    <ABMPage
      apiEndpoint="/api/autos"
      table={AutosTable}
      form={AutosForm}
      crudActions={[CrudAction.ADD, CrudAction.EDIT, CrudAction.DELETE]}
      schema={schema}
    />
  );
};

export default AutosPage;
