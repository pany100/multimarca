"use client";

import type { Dispatch, SetStateAction } from "react";
import { CrudAction } from "@/components/formV2/constants";
import ABMPage from "@/components/pageV2/ABMPage";
import { GlobalModalProvider, useGlobalModal } from "@/sections/commons/contexts/GlobalModalContext";
import NuevoRolModal from "@/sections/roles/NuevoRolModal";
import RolesTable from "@/sections/roles/RolesTable";

const ExtraContentWrapper = ({
  setRefreshTrigger,
}: {
  setRefreshTrigger: Dispatch<SetStateAction<number>>;
}) => {
  return (
    <NuevoRolModal
      onCreated={() => setRefreshTrigger((prev) => prev + 1)}
    />
  );
};

const RolesPageContent = () => {
  const { showModal } = useGlobalModal();

  return (
    <ABMPage
      apiEndpoint="/api/roles"
      table={RolesTable}
      crudActions={[CrudAction.ADD, CrudAction.DELETE]}
      extraContent={ExtraContentWrapper}
      onAddClick={showModal}
    />
  );
};

const RolesPage = () => {
  return (
    <GlobalModalProvider>
      <RolesPageContent />
    </GlobalModalProvider>
  );
};

export default RolesPage;
