"use client";

import ABMPage from "@/components/pageV2/ABMPage";
import ChequesTable from "@/sections/cheques/ChequesTable";

const ChequesPage = () => {
  return (
    <ABMPage apiEndpoint="/api/cheques" table={ChequesTable} crudActions={[]} />
  );
};

export default ChequesPage;
