import React, { createContext, useContext, useState } from "react";

interface IngresoReparacionContextType {
  ingreso: any;
  setIngreso: (ingreso: any) => void;
}

const IngresoReparacionContext = createContext<
  IngresoReparacionContextType | undefined
>(undefined);

export const IngresoReparacionProvider = ({
  children,
  ingreso: initialIngreso,
}: {
  children: React.ReactNode;
  ingreso: any;
}) => {
  const [ingreso, setIngreso] = useState(initialIngreso);

  return (
    <IngresoReparacionContext.Provider value={{ ingreso, setIngreso }}>
      {children}
    </IngresoReparacionContext.Provider>
  );
};

export const useIngresoReparacion = () => {
  const context = useContext(IngresoReparacionContext);
  if (!context) {
    throw new Error(
      "useIngresoReparacion must be used within an IngresoReparacionProvider"
    );
  }
  return context;
};
