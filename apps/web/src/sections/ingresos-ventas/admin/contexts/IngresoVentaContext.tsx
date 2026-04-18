import React, { createContext, useContext, useState } from "react";

interface IngresoVentaContextType {
  ingreso: any;
  setIngreso: (ingreso: any) => void;
}

const IngresoVentaContext = createContext<IngresoVentaContextType | undefined>(
  undefined
);

export const IngresoVentaProvider = ({
  children,
  ingreso: initialIngreso,
}: {
  children: React.ReactNode;
  ingreso: any;
}) => {
  const [ingreso, setIngreso] = useState(initialIngreso);

  return (
    <IngresoVentaContext.Provider value={{ ingreso, setIngreso }}>
      {children}
    </IngresoVentaContext.Provider>
  );
};

export const useIngresoVenta = () => {
  const context = useContext(IngresoVentaContext);
  if (!context) {
    throw new Error(
      "useIngresoVenta must be used within an IngresoVentaProvider"
    );
  }
  return context;
};
