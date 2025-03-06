"use client";

import { CrudAction } from "@/components/formV2/constants";
import ABMPage from "@/components/pageV2/ABMPage";
import PagosAMecanicoForm, {
  schema,
} from "@/sections/pagos-a-mecanico.tsx/PagosAMecanicoForm";
import PagosAMecanicoTable from "@/sections/pagos-a-mecanico.tsx/PagosAMecanicoTable";

const PagosAMecanicoPage = () => {
  return (
    <ABMPage
      apiEndpoint="/api/pago-a-mecanico"
      table={PagosAMecanicoTable}
      form={PagosAMecanicoForm}
      crudActions={[CrudAction.EDIT]}
      schema={schema}
    />
  );
};

export default PagosAMecanicoPage;
