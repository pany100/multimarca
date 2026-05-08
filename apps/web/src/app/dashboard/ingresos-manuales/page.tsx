"use client";

import { CrudAction } from "@/components/formV2/constants";
import ABMPage from "@/components/pageV2/ABMPage";
import IngresosManualesForm, {
  schema,
} from "@/sections/ingresos-manuales/IngresosManualesForm";
import IngresosManualesTable from "@/sections/ingresos-manuales/IngresosManualesTable";
import { useRouter } from "next/navigation";

const IngresosPage = () => {
  const router = useRouter();
  return (
    <ABMPage
      apiEndpoint="/api/ingresos-manuales"
      table={IngresosManualesTable}
      form={IngresosManualesForm}
      crudActions={[CrudAction.ADD, CrudAction.EDIT, CrudAction.DELETE]}
      schema={schema}
      onAddClick={() => router.push("/dashboard/ingresos-manuales/nuevo")}
      onEditClick={(entity) =>
        router.push(`/dashboard/ingresos-manuales/${entity.id}/editar`)
      }
    />
  );
};

export default IngresosPage;
