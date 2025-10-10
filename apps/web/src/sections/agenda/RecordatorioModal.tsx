import FormModal from "@/components/formV2/FormModal";
import { zodResolver } from "@hookform/resolvers/zod";
import { Typography } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import {
  createAgendaSchema,
  CreateAgendaSchema,
} from "../../core/infrastructure/validation/schemas/agenda.schema";
import { RecordatorioAgenda } from "./hooks/useRecordatorios";

type Props = {
  isModalOpened: boolean;
  setIsModalOpened: (value: boolean) => void;
  currentEntity?: RecordatorioAgenda;
  onSubmit: (data: CreateAgendaSchema) => void;
};

function RecordatorioModal({
  isModalOpened,
  setIsModalOpened,
  currentEntity,
  onSubmit,
}: Props) {
  const methods = useForm<CreateAgendaSchema>({
    resolver: zodResolver(createAgendaSchema),
    defaultValues: currentEntity,
  });
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = methods;

  return (
    <FormModal open={isModalOpened} onClose={() => setIsModalOpened(false)}>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Información Del Recordatorio
          </Typography>
        </form>
      </FormProvider>
    </FormModal>
  );
}
