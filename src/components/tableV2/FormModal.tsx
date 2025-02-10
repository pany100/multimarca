import { Box, Modal } from "@mui/material";

type Props = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

function FormModal({ open, onClose, children }: Props) {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
        }}
      >
        {children}
      </Box>
    </Modal>
  );
}

export default FormModal;
