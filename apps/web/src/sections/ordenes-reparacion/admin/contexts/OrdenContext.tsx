"use client";

import { createContext, useContext } from "react";

interface OrdenContextType {
  orden: any;
}

const OrdenContext = createContext<OrdenContextType | undefined>(undefined);

export const OrdenProvider = ({
  children,
  orden,
}: {
  children: React.ReactNode;
  orden: any;
}) => {
  return (
    <OrdenContext.Provider value={{ orden }}>{children}</OrdenContext.Provider>
  );
};

export const useOrden = () => {
  const context = useContext(OrdenContext);
  if (context === undefined) {
    throw new Error("useOrden must be used within an OrdenProvider");
  }
  return context;
};
