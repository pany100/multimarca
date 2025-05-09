"use client";

import { CrudAction } from "@/components/formV2/constants";
import ABMPage from "@/components/pageV2/ABMPage";
import { useAuth } from "@/hooks/useAuth";
import ManoDeObraExtraContent from "@/sections/mano-de-obra/ManoDeObraExtraContent";
import ManoDeObraForm, { schema } from "@/sections/mano-de-obra/ManoDeObraForm";
import ManoDeObraTable from "@/sections/mano-de-obra/ManoDeObraTable";

const ManoDeObraPage = () => {
  const { userData } = useAuth();
  const permisos = userData?.permisos || [];
  const crudActions = [CrudAction.ADD, CrudAction.DELETE];

  if (permisos.includes("EditarManoObra")) {
    crudActions.push(CrudAction.EDIT);
  }

  return (
    <>
      <ABMPage
        apiEndpoint="/api/mano-de-obra"
        extraContent={ManoDeObraExtraContent}
        table={ManoDeObraTable}
        form={ManoDeObraForm}
        crudActions={crudActions}
        schema={schema}
      />
    </>
  );
};

export default ManoDeObraPage;
