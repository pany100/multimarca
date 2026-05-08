"use client";

import { CrudAction } from "@/components/formV2/constants";
import ABMPage from "@/components/pageV2/ABMPage";
import ExtraccionesForm, {
  schema,
} from "@/sections/extracciones/ExtraccionesForm";
import ExtraccionesTable from "@/sections/extracciones/ExtraccionesTable";
import { useRouter } from "next/navigation";

const ExtraccionesPage = () => {
  const router = useRouter();
  return (
    <ABMPage
      apiEndpoint="/api/extracciones"
      table={ExtraccionesTable}
      form={ExtraccionesForm}
      schema={schema}
      crudActions={[CrudAction.ADD, CrudAction.EDIT, CrudAction.DELETE]}
      onAddClick={() => router.push("/dashboard/extracciones/nueva")}
      onEditClick={(entity) =>
        router.push(`/dashboard/extracciones/${entity.id}/editar`)
      }
    />
  );
};

export default ExtraccionesPage;
