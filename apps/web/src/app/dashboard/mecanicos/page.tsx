"use client";

import { CrudAction } from "@/components/formV2/constants";
import ABMPage from "@/components/pageV2/ABMPage";
import { schema } from "@/sections/mecanicos/form/NewMecanicoForm";
import MecanicosTable from "@/sections/mecanicos/MecanicosTable";

const MecanicosPage = () => {
  return (
    <ABMPage
      apiEndpoint="/api/mecanicos"
      table={MecanicosTable}
      crudActions={[CrudAction.ADD, CrudAction.DELETE]}
      schema={schema}
    />
  );
};

export default MecanicosPage;
