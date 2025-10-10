"use client";

import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import { Menu, MenuItem } from "@mui/material";
import { useAgendaUIContext } from "./contexts/AgendaUIContext";
import { useCalendarContext } from "./contexts/CalendarContext";
import { useMenuUIContext } from "./contexts/MenuUIContext";

function CalendarioCellMenu() {
  const { menuAnchorEl, setMenuAnchorEl } = useMenuUIContext();
  const { setIsModalOpen, setIsDeleteModalOpen } = useAgendaUIContext();
  const { currentRecordatorio } = useCalendarContext();

  // Handle menu close
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // Handle edit from menu
  const handleMenuEdit = () => {
    if (currentRecordatorio) {
      setIsModalOpen(true);
    }
    handleMenuClose();
  };

  // Handle delete from menu
  const handleMenuDelete = () => {
    if (currentRecordatorio) {
      setIsDeleteModalOpen(true);
    }
    handleMenuClose();
  };

  return (
    <Menu
      anchorEl={menuAnchorEl}
      open={Boolean(menuAnchorEl)}
      onClose={handleMenuClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
    >
      <MenuItem onClick={handleMenuEdit}>
        <EditIcon fontSize="small" sx={{ mr: 1 }} />
        Editar
      </MenuItem>
      <MenuItem onClick={handleMenuDelete} sx={{ color: "error.main" }}>
        <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
        Eliminar
      </MenuItem>
    </Menu>
  );
}

export default CalendarioCellMenu;
