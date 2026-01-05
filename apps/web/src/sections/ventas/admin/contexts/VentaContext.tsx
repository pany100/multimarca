import React, { createContext, useContext, useState } from "react";

interface VentaContextType {
  venta: any;
  setVenta: (venta: any) => void;
}

const VentaContext = createContext<VentaContextType | undefined>(undefined);

export const VentaProvider = ({
  children,
  venta: initialVenta,
}: {
  children: React.ReactNode;
  venta: any;
}) => {
  const [venta, setVenta] = useState(initialVenta);

  return (
    <VentaContext.Provider value={{ venta, setVenta }}>
      {children}
    </VentaContext.Provider>
  );
};

export const useVenta = () => {
  const context = useContext(VentaContext);
  if (!context) {
    throw new Error("useVenta must be used within a VentaProvider");
  }
  return context;
};
