"use client";

import ABMPage from "@/components/pageV2/ABMPage";
import DeudoresTable from "@/sections/deudores/DeudoresTable";

const DeudoresPage = () => {
  return (
    <ABMPage
      apiEndpoint="/api/deudores"
      table={DeudoresTable}
      crudActions={[]} // Read-only table, no CRUD actions
    />
  );
};

export default DeudoresPage;
