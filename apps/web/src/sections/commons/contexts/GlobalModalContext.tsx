"use client";

import { createContext, ReactNode, useContext, useState } from "react";

interface GlobalModalContextType {
  isOpen: boolean;
  showModal: () => void;
  hideModal: () => void;
}

const GlobalModalContext = createContext<GlobalModalContextType | undefined>(
  undefined
);

export const GlobalModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const showModal = () => setIsOpen(true);
  const hideModal = () => setIsOpen(false);

  return (
    <GlobalModalContext.Provider value={{ isOpen, showModal, hideModal }}>
      {children}
    </GlobalModalContext.Provider>
  );
};

export const useGlobalModal = () => {
  const context = useContext(GlobalModalContext);
  if (context === undefined) {
    throw new Error("useGlobalModal must be used within a GlobalModalProvider");
  }
  return context;
};
