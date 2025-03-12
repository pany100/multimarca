"use client";

import { CrudAction } from "@/components/formV2/constants";
import ABMPage from "@/components/pageV2/ABMPage";
import PresupuestosTable from "@/sections/presupuestos/PresupuestosTable";

const PresupuestosPage = () => {
  return (
    <>
      <ABMPage
        apiEndpoint="/api/orden-reparacion"
        getDeleteEndpoint={(entity: any) => {
          const isBorrador = entity?.ingresos === undefined;
          if (isBorrador) {
            return "/api/borradores";
          }
          return "/api/orden-reparacion";
        }}
        table={PresupuestosTable}
        crudActions={[CrudAction.ADD, CrudAction.DELETE]}
      />
    </>
  );
};

export default PresupuestosPage;
