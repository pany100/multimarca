"use client";

import { CrudAction } from "@/components/formV2/constants";
import ABMPage from "@/components/pageV2/ABMPage";
import ManoDeObraExtraContent from "@/sections/mano-de-obra/ManoDeObraExtraContent";
import ManoDeObraForm, { schema } from "@/sections/mano-de-obra/ManoDeObraForm";
import ManoDeObraTable from "@/sections/mano-de-obra/ManoDeObraTable";

const ManoDeObraPage = () => {
  return (
    <>
      <ABMPage
        apiEndpoint="/api/mano-de-obra"
        extraContent={ManoDeObraExtraContent}
        table={ManoDeObraTable}
        form={ManoDeObraForm}
        crudActions={[CrudAction.ADD, CrudAction.EDIT, CrudAction.DELETE]}
        schema={schema}
      />
    </>
  );
};

export default ManoDeObraPage;
