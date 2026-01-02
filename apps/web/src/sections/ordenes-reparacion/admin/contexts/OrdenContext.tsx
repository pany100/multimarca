"use client";

import { createContext, useContext, useState } from "react";

interface OrdenContextType {
  orden: any;
  setOrden: (orden: any) => void;
}

const OrdenContext = createContext<OrdenContextType | undefined>(undefined);

export const OrdenProvider = ({
  children,
  orden: initialOrden,
}: {
  children: React.ReactNode;
  orden: any;
}) => {
  const [orden, setOrden] = useState(initialOrden);

  return (
    <OrdenContext.Provider value={{ orden, setOrden }}>
      {children}
    </OrdenContext.Provider>
  );
};

export const useOrden = () => {
  const context = useContext(OrdenContext);
  if (context === undefined) {
    throw new Error("useOrden must be used within an OrdenProvider");
  }
  return context;
};
