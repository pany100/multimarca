import React, { createContext, ReactNode, useContext, useState } from "react";

interface FormDataWithModalContextProps {
  currentItem: any | null;
  setCurrentItem: (item: any | null) => void;
  newItem: any | null;
  setNewItem: (item: any | null) => void;
}

const FormDataWithModalContext = createContext<
  FormDataWithModalContextProps | undefined
>(undefined);

export const FormDataWithModalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentItem, setCurrentItem] = useState<any | null>(null);
  const [newItem, setNewItem] = useState<any | null>(null);

  return (
    <FormDataWithModalContext.Provider
      value={{ currentItem, setCurrentItem, newItem, setNewItem }}
    >
      {children}
    </FormDataWithModalContext.Provider>
  );
};

export const useFormDataWithModalContext = () => {
  const context = useContext(FormDataWithModalContext);
  if (context === undefined) {
    throw new Error(
      "useFormDataWithModal must be used within a FormDataWithModalProvider"
    );
  }
  return context;
};
