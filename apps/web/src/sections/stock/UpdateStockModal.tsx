import CustomForm from "@/components/formV2/CustomForm";
import CustomInputBoolean from "@/components/formV2/CustomInputBoolean";
import CustomInputText from "@/components/formV2/CustomInputText";
import FormModal from "@/components/formV2/FormModal";
import { useFetch } from "@/contexts/FetchContext";
import FormInfoProvider from "@/contexts/FormInfoContext";
import { Grid, Typography } from "@mui/material";
import { unitsSchema } from "./StockForm";

type Props = {
  isEditModalOpen: boolean;
  handleCloseEdit: () => void;
  handleEditSuccess: (data: any) => void;
  handleEditError: (error: string) => void;
  entity: any;
};

function UnitsForm() {
  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Información del Stock
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={12}>
          <CustomInputText name="units" label="Unidades" type="number" />
        </Grid>
        <Grid item xs={12}>
          <CustomInputBoolean
            name="fraccionable"
            label="Fraccionable (Para litros)"
          />
        </Grid>
      </Grid>
    </>
  );
}

function UpdateStockModal({
  isEditModalOpen,
  handleCloseEdit,
  handleEditSuccess,
  handleEditError,
  entity,
}: Props) {
  const { authFetch } = useFetch();
  const handleEditSubmit = async (data: any) => {
    try {
      const url = new URL("/api/stock", window.location.origin);
      const baseUrl = `${url.origin}${url.pathname}`;

      const response = await authFetch(`${baseUrl}/${data.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      if (response.ok) {
        const updatedItem = await response.json();
        handleEditSuccess(updatedItem);
      } else {
        const errorMessage = await response.json();
        handleEditError("Error al actualizar elemento");
      }
    } catch (error) {
      handleEditError("Error al realizar la solicitud de actualización");
    } finally {
      handleCloseEdit();
    }
  };

  return (
    <>
      <FormModal open={isEditModalOpen} onClose={handleCloseEdit}>
        <FormInfoProvider isEditing={true}>
          <CustomForm
            onCancel={handleCloseEdit}
            initialValues={entity}
            onSubmit={handleEditSubmit}
            schema={unitsSchema}
            formDefinition={UnitsForm}
          />
        </FormInfoProvider>
      </FormModal>
    </>
  );
}

export default UpdateStockModal;
