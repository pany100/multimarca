import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Alert, MenuItem, Snackbar } from "@mui/material";
import React, { useState } from "react";
import { CrudAction } from "../formV2/constants";
import DeleteModal from "../formV2/DeleteModal";
import FormModal from "../formV2/FormModal";

type Props = {
  table: React.ComponentType<any>;
  form: React.ComponentType<any>;
  crudActions: CrudAction[];
  onDelete?: (entity: any) => Promise<void>;
};

function ABMPage({ table: Table, form: Form, crudActions, onDelete }: Props) {
  const shouldShowAdd = crudActions.includes(CrudAction.ADD);
  const shouldShowExtraActions =
    crudActions.includes(CrudAction.EDIT) ||
    crudActions.includes(CrudAction.DELETE);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [entity, setEntity] = useState<any>(null);

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleCloseDelete = () => {
    setIsDeleteModalOpen(false);
    setEntity(null);
  };

  const handleCloseEdit = () => {
    setIsEditModalOpen(false);
    setEntity(null);
  };

  const extraActions = (params: any) => {
    const actions = [];

    if (crudActions.includes(CrudAction.EDIT)) {
      actions.push(
        <MenuItem
          key="edit"
          onClick={() => {
            setIsEditModalOpen(true);
            setEntity(params);
          }}
        >
          <EditIcon sx={{ mr: 1 }} />
          Editar
        </MenuItem>
      );
    }

    if (crudActions.includes(CrudAction.DELETE)) {
      actions.push(
        <MenuItem
          key="delete"
          onClick={() => {
            setIsDeleteModalOpen(true);
            setEntity(params);
          }}
          sx={{ color: "error.main" }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Borrar
        </MenuItem>
      );
    }

    return actions;
  };

  const tableProps = {
    ...(shouldShowAdd && {
      ctaCb: () => {
        setIsAddModalOpen(true);
      },
    }),
    ...(shouldShowExtraActions && { extraActions }),
  };

  return (
    <div>
      <Table {...tableProps} />

      {shouldShowAdd && (
        <FormModal
          open={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        >
          <Form onCancel={() => setIsAddModalOpen(false)} />
        </FormModal>
      )}

      {crudActions.includes(CrudAction.EDIT) && (
        <FormModal open={isEditModalOpen} onClose={handleCloseEdit}>
          <Form onCancel={handleCloseEdit} initialValues={entity} />
        </FormModal>
      )}

      {crudActions.includes(CrudAction.DELETE) && (
        <DeleteModal
          open={isDeleteModalOpen}
          onClose={handleCloseDelete}
          entity={entity}
          setFeedback={setFeedback}
        />
      )}

      <Snackbar
        open={!!feedback}
        autoHideDuration={6000}
        onClose={() => setFeedback(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        {feedback ? (
          <Alert
            onClose={() => setFeedback(null)}
            severity={feedback.type}
            variant="filled"
          >
            {feedback.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </div>
  );
}

export default ABMPage;
