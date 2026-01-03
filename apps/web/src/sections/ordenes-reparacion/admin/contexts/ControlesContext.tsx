"use client";

import {
  ControlEnReparacion,
  ControlMecanico,
} from "@/hooks/orden-reparacion/useControles";
import { createContext, useContext, useState } from "react";
import { useOrden } from "./OrdenContext";

interface ControlesContextType {
  itemsEdited: ControlMecanico[];
  updateControl: (control: ControlMecanico, valor: string) => void;
  isChecked: (controlId: number) => boolean;
  reset: () => void;
}

const ControlesContext = createContext<ControlesContextType | undefined>(
  undefined
);

export const ControlesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { orden } = useOrden();
  const [itemsEdited, setItemsEdited] = useState<ControlMecanico[]>(
    orden.controlesEnReparacion.map(
      (controlEnReparacion: ControlEnReparacion) => ({
        valor: controlEnReparacion.valor,
        id: controlEnReparacion.controlMecanicoId,
      })
    ) || []
  );

  const updateControl = (control: ControlMecanico, valor: string) => {
    setItemsEdited((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => item.id === control.id
      );

      if (existingIndex !== -1) {
        return prevItems.map((item) =>
          item.id === control.id ? { ...item, valor } : item
        );
      } else {
        return [...prevItems, { ...control, valor }];
      }
    });
  };

  const isChecked = (controlId: number): boolean => {
    const control = itemsEdited.find((item) => item.id === controlId);
    return control?.valor === "true";
  };

  const reset = () => {
    orden.controlesEnReparacion.map(
      (controlEnReparacion: ControlEnReparacion) => ({
        valor: controlEnReparacion.valor,
        id: controlEnReparacion.controlMecanicoId,
      })
    ) || [];
  };

  return (
    <ControlesContext.Provider
      value={{ itemsEdited, updateControl, isChecked, reset }}
    >
      {children}
    </ControlesContext.Provider>
  );
};

export const useControlesContext = () => {
  const context = useContext(ControlesContext);
  if (context === undefined) {
    throw new Error(
      "useControlesContext must be used within a ControlesProvider"
    );
  }
  return context;
};
