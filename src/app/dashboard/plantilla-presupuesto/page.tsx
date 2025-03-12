"use client";

import { CrudAction } from "@/components/formV2/constants";
import ABMPage from "@/components/pageV2/ABMPage";
import PlantillaPresupuestoTable from "@/sections/plantilla-presupuesto/PlantillaPresupuestoTable";

const PlantillaPresupuestoPage = () => {
  return (
    <ABMPage
      apiEndpoint="/api/plantilla-presupuesto"
      table={PlantillaPresupuestoTable}
      crudActions={[CrudAction.ADD, CrudAction.DELETE]}
    />
  );
};

export default PlantillaPresupuestoPage;
