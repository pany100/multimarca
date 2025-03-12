import { useFetch } from "@/contexts/FetchContext";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Alert, MenuItem, Snackbar } from "@mui/material";
import React, { useState } from "react";
import * as yup from "yup";
import { CrudAction } from "../formV2/constants";
import CustomForm from "../formV2/CustomForm";
import DeleteModal from "../formV2/DeleteModal";
import FormModal from "../formV2/FormModal";

type Props = {
  apiEndpoint: string;
  extraContent?: React.ComponentType<any>;
  table: React.ComponentType<any>;
  form?: React.ComponentType<any>;
  crudActions: CrudAction[];
  schema?: yup.ObjectSchema<any>;
};

function ABMPage({
  apiEndpoint,
  extraContent: ExtraContent,
  table: Table,
  form: Form,
  crudActions,
  schema,
}: Props) {
  const { authFetch } = useFetch();

  const shouldShowAdd = crudActions.includes(CrudAction.ADD);
  const shouldShowExtraActions =
    crudActions.includes(CrudAction.EDIT) ||
    crudActions.includes(CrudAction.DELETE);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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

  const handleAddSubmit = async (data: any) => {
    try {
      const url = new URL(apiEndpoint, window.location.origin);
      const baseUrl = `${url.origin}${url.pathname}`;

      const response = await authFetch(baseUrl, {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setFeedback({
          message: "Elemento creado con éxito",
          type: "success",
        });
        setRefreshTrigger((prev) => prev + 1);
      } else {
        const errorMessage = await response.json();
        setFeedback({
          message: `Error al crear elemento: ${errorMessage.error}`,
          type: "error",
        });
      }
    } catch (error) {
      console.error(`Error al crear elemento:`, error);
      setFeedback({
        message: `Error al realizar la solicitud de creación`,
        type: "error",
      });
    } finally {
      setIsAddModalOpen(false);
    }
  };

  const handleEditSubmit = async (data: any) => {
    try {
      const url = new URL(apiEndpoint, window.location.origin);
      const baseUrl = `${url.origin}${url.pathname}`;

      const response = await authFetch(`${baseUrl}/${data.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      if (response.ok) {
        const updatedItem = await response.json();
        setFeedback({
          message: "Elemento actualizado con éxito",
          type: "success",
        });
        setRefreshTrigger((prev) => prev + 1);
      } else {
        const errorMessage = await response.json();
        setFeedback({
          message: `Error al actualizar elemento: ${errorMessage.error}`,
          type: "error",
        });
      }
    } catch (error) {
      console.error(`Error al actualizar elemento:`, error);
      setFeedback({
        message: `Error al realizar la solicitud de actualización`,
        type: "error",
      });
    } finally {
      setIsEditModalOpen(false);
      setEntity(null);
    }
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
    refreshTrigger,
    setRefreshTrigger,
  };

  return (
    <div>
      {ExtraContent && <ExtraContent setRefreshTrigger={setRefreshTrigger} />}

      <Table {...tableProps} />

      {shouldShowAdd && Form && schema && (
        <FormModal
          open={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        >
          <CustomForm
            onCancel={() => setIsAddModalOpen(false)}
            onSubmit={handleAddSubmit}
            schema={schema}
            formDefinition={Form}
          />
        </FormModal>
      )}

      {Form && schema && crudActions.includes(CrudAction.EDIT) && (
        <FormModal open={isEditModalOpen} onClose={handleCloseEdit}>
          <CustomForm
            onCancel={handleCloseEdit}
            initialValues={entity}
            onSubmit={handleEditSubmit}
            schema={schema}
            formDefinition={Form}
          />
        </FormModal>
      )}

      {crudActions.includes(CrudAction.DELETE) && (
        <DeleteModal
          apiEndpoint={apiEndpoint}
          open={isDeleteModalOpen}
          onClose={handleCloseDelete}
          entity={entity}
          setFeedback={setFeedback}
          onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
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
