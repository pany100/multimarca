"use client";

import { CrudAction } from "@/components/formV2/constants";
import ABMPage from "@/components/pageV2/ABMPage";
import IngresosReparacionForm, {
  schema,
} from "@/sections/ingresos-reparacion/IngresosReparacionForm";
import IngresosReparacionTable from "@/sections/ingresos-reparacion/IngresosReparacionTable";
import { useRouter } from "next/navigation";

const IngresosPorReparacionPage = () => {
  const router = useRouter();

  return (
    <ABMPage
      apiEndpoint="/api/ingresos-reparacion"
      table={IngresosReparacionTable}
      form={IngresosReparacionForm}
      schema={schema}
      crudActions={[CrudAction.ADD, CrudAction.DELETE]}
      onAddClick={() => router.push("/dashboard/ingresos-reparacion/nueva")}
    />
  );
};

export default IngresosPorReparacionPage;
