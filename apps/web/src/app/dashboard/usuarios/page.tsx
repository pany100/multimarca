"use client";

import { CrudAction } from "@/components/formV2/constants";
import ABMPage from "@/components/pageV2/ABMPage";
import UsuariosForm, { schema } from "@/sections/usuarios/UsuariosForm";
import UsuariosTable from "@/sections/usuarios/UsuariosTable";

const UsuariosPage = () => {
  return (
    <ABMPage
      apiEndpoint="/api/usuarios"
      table={UsuariosTable}
      form={UsuariosForm}
      crudActions={[CrudAction.ADD, CrudAction.EDIT, CrudAction.DELETE]}
      schema={schema}
    />
  );
};

export default UsuariosPage;
