"use client";

import { CrudAction } from "@/components/formV2/constants";
import ABMPage from "@/components/pageV2/ABMPage";
import RolesForm, { schema } from "@/sections/roles/RolesForm";
import RolesTable from "@/sections/roles/RolesTable";

const RolesPage = () => {
  return (
    <ABMPage
      apiEndpoint="/api/roles"
      table={RolesTable}
      form={RolesForm}
      crudActions={[CrudAction.ADD, CrudAction.EDIT, CrudAction.DELETE]}
      schema={schema}
    />
  );
};

export default RolesPage;
