"use client";

import { CrudAction } from "@/components/formV2/constants";
import ABMPage from "@/components/pageV2/ABMPage";
import IngresosVentasTable from "@/sections/ingresos-ventas/IngresosVentasTable";
import { useRouter } from "next/navigation";

const IngresosPorVentasPage = () => {
  const router = useRouter();

  return (
    <ABMPage
      apiEndpoint="/api/ingresos-ventas"
      table={IngresosVentasTable}
      crudActions={[CrudAction.ADD, CrudAction.DELETE]}
      onAddClick={() => router.push("/dashboard/ingresos-ventas/nueva")}
    />
  );
};

export default IngresosPorVentasPage;
