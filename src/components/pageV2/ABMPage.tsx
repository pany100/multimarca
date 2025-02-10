import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { MenuItem } from "@mui/material";
import React, { useState } from "react";
import { CrudAction } from "../formV2/constants";
import FormModal from "../tableV2/FormModal";

type Props = {
  table: React.ComponentType<any>;
  form: React.ComponentType<any>;
  crudActions: CrudAction[];
};

function ABMPage({ table: Table, form: Form, crudActions }: Props) {
  const shouldShowAdd = crudActions.includes(CrudAction.ADD);
  const shouldShowExtraActions =
    crudActions.includes(CrudAction.EDIT) ||
    crudActions.includes(CrudAction.DELETE);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [entity, setEntity] = useState(null);

  const extraActions = (params: any) => {
    return [
      crudActions.includes(CrudAction.EDIT) && (
        <MenuItem
          onClick={() => {
            setIsEditModalOpen(true);
            setEntity(params);
          }}
        >
          <EditIcon sx={{ mr: 1 }} />
          Editar
        </MenuItem>
      ),
      crudActions.includes(CrudAction.DELETE) && (
        <MenuItem
          onClick={() => {
            setIsDeleteModalOpen(true);
            setEntity(params);
          }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Borrar
        </MenuItem>
      ),
    ];
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
        <FormModal
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        >
          <Form
            onCancel={() => setIsEditModalOpen(false)}
            initialValues={entity}
          />
        </FormModal>
      )}
    </div>
  );
}

export default ABMPage;
