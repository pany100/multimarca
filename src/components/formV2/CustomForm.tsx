import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Button, CircularProgress } from "@mui/material";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";

interface CustomFormProps {
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  initialValues?: any;
  schema: yup.ObjectSchema<any>;
  formDefinition: React.ComponentType<any>;
}

const CustomForm = ({
  onSubmit,
  onCancel,
  initialValues,
  schema,
  formDefinition: FormDefinition,
}: CustomFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    }
  }, [initialValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormDefinition control={control} errors={errors} />
      <Box sx={{ mt: 2, display: "flex", gap: 2, justifyContent: "flex-end" }}>
        {onCancel && (
          <Button variant="outlined" onClick={onCancel} type="button">
            Cancelar
          </Button>
        )}
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? <CircularProgress size={24} /> : "Guardar"}
        </Button>
      </Box>
    </form>
  );
};

export default CustomForm;
