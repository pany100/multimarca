"use client";

import { createContext, useContext, useState } from "react";

interface PresupuestoContextType {
  presupuesto: any;
  setPresupuesto: (presupuesto: any) => void;
}

const PresupuestoContext = createContext<PresupuestoContextType | undefined>(
  undefined
);

export const PresupuestoProvider = ({
  children,
  presupuesto: initialPresupuesto,
}: {
  children: React.ReactNode;
  presupuesto: any;
}) => {
  const [presupuesto, setPresupuesto] = useState(initialPresupuesto);

  return (
    <PresupuestoContext.Provider value={{ presupuesto, setPresupuesto }}>
      {children}
    </PresupuestoContext.Provider>
  );
};

export const usePresupuesto = () => {
  const context = useContext(PresupuestoContext);
  return context;
};

export const usePresupuestoRequired = () => {
  const context = useContext(PresupuestoContext);
  if (context === undefined) {
    throw new Error(
      "usePresupuestoRequired must be used within a PresupuestoProvider"
    );
  }
  return context;
};
