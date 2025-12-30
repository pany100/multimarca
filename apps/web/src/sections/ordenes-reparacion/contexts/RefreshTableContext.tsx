"use client";

import { createContext, ReactNode, useContext } from "react";

interface RefreshTableContextType {
  refreshTable: () => void;
}

const RefreshTableContext = createContext<RefreshTableContextType | undefined>(
  undefined
);

export const RefreshTableProvider = ({
  children,
  onRefresh,
}: {
  children: ReactNode;
  onRefresh: () => void;
}) => {
  return (
    <RefreshTableContext.Provider value={{ refreshTable: onRefresh }}>
      {children}
    </RefreshTableContext.Provider>
  );
};

export const useRefreshTable = () => {
  const context = useContext(RefreshTableContext);
  if (context === undefined) {
    throw new Error(
      "useRefreshTable must be used within a RefreshTableProvider"
    );
  }
  return context;
};
