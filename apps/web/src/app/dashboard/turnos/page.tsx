"use client";

import { CrudAction } from "@/components/formV2/constants";
import ABMPage from "@/components/pageV2/ABMPage";
import TurnosExtraContent from "@/sections/turnos/TurnosExtraContent";
import TurnosForm, { schema } from "@/sections/turnos/TurnosForm";
import TurnosTable from "@/sections/turnos/TurnosTable";

const TurnosPage = () => {
  return (
    <ABMPage
      apiEndpoint="/api/turnos"
      extraContent={TurnosExtraContent}
      table={TurnosTable}
      form={TurnosForm}
      crudActions={[CrudAction.EDIT, CrudAction.ADD, CrudAction.DELETE]}
      schema={schema}
    />
  );
};

export default TurnosPage;
