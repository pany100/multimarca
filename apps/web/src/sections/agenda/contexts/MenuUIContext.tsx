import React from "react";

type MenuUIContextType = {
  menuAnchorEl: null | HTMLElement;
  setMenuAnchorEl: React.Dispatch<React.SetStateAction<null | HTMLElement>>;
};

const MenuUIContext = React.createContext<MenuUIContextType | null>(null);

export const MenuUIProvider = ({ children }: { children: React.ReactNode }) => {
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(
    null
  );

  return (
    <MenuUIContext.Provider
      value={{
        menuAnchorEl,
        setMenuAnchorEl,
      }}
    >
      {children}
    </MenuUIContext.Provider>
  );
};

export const useMenuUIContext = () => {
  const context = React.useContext(MenuUIContext);
  if (!context) {
    throw new Error("useMenuUIContext must be used within a MenuUIProvider");
  }
  return context;
};
