import React, { createContext, useContext, useState } from "react";

interface OrdenDeCompraContextType {
  orden: any;
  setOrden: (orden: any) => void;
}

const OrdenDeCompraContext = createContext<
  OrdenDeCompraContextType | undefined
>(undefined);

export const OrdenDeCompraProvider = ({
  children,
  orden: initialOrden,
}: {
  children: React.ReactNode;
  orden: any;
}) => {
  const [orden, setOrden] = useState(initialOrden);

  return (
    <OrdenDeCompraContext.Provider value={{ orden, setOrden }}>
      {children}
    </OrdenDeCompraContext.Provider>
  );
};

export const useOrdenDeCompraContext = () => {
  const context = useContext(OrdenDeCompraContext);
  if (!context) {
    throw new Error(
      "useOrdenDeCompraContext must be used within an OrdenDeCompraProvider",
    );
  }
  return context;
};
