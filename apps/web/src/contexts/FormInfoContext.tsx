import { createContext, ReactNode, useContext } from "react";

interface FormInfoContextType {
  isEditing: boolean;
}

const FormInfoContext = createContext<FormInfoContextType | undefined>(
  undefined
);

interface FormInfoProviderProps {
  children: ReactNode;
  isEditing: boolean;
}

export function FormInfoProvider({
  children,
  isEditing,
}: FormInfoProviderProps) {
  return (
    <FormInfoContext.Provider value={{ isEditing }}>
      {children}
    </FormInfoContext.Provider>
  );
}

export function useFormInfo() {
  const context = useContext(FormInfoContext);
  if (context === undefined) {
    throw new Error("useFormInfo must be used within a FormInfoProvider");
  }
  return context;
}

export default FormInfoProvider;
