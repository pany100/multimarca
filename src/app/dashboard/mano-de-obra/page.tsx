"use client";

import { CrudAction } from "@/components/formV2/constants";
import ABMPage from "@/components/pageV2/ABMPage";
import ManoDeObraForm, { schema } from "@/sections/mano-de-obra/ManoDeObraForm";
import ManoDeObraTable from "@/sections/mano-de-obra/ManoDeObraTable";
import PreciosModal from "@/sections/mano-de-obra/PreciosModal";

const ManoDeObraPage = () => {
  return (
    <>
      <ABMPage
        apiEndpoint="/api/mano-de-obra"
        extraContent={PreciosModal}
        table={ManoDeObraTable}
        form={ManoDeObraForm}
        crudActions={[CrudAction.ADD, CrudAction.EDIT, CrudAction.DELETE]}
        schema={schema}
      />
    </>
  );
};

export default ManoDeObraPage;
